#!/usr/bin/env node
/**
 * 紙上模擬交易（paper trading）
 * =================================
 * 累積模擬帳戶（自 START_DATE 起）：不會每日歸零；asOf 前進才追加買賣／更新標記。
 * 成交價＝當日 latest.json 標的 price；下單即成交（無掛單、無部分成交）。
 * 台股／美股兩本帳分開，不做匯率混算。非真實券商成交。
 *
 * 執行：npm run paper   或   node scripts/paper-trade.mjs
 *
 * 輸入：
 *   public/data/latest.json
 *   public/data/paper-portfolio.json（沒有就新建、用 startDate 當第一天開倉）
 * 輸出：
 *   覆寫 public/data/paper-portfolio.json
 *   若 docs/data/ 存在也同步一份
 *
 * 冪等：若 lastProcessedAsOf === latest.asOf，什麼都不改（同一份快照不重複下單）。
 *
 * ---------- 買賣規則（與網站「模擬交易績效」說明一致）----------
 *
 * 【本金】
 *   台股帳 TW：新台幣 3,000,000 元
 *   美股帳 US：美元 100,000 元
 *
 * 【買進】每個交易日（latest.json 更新、asOf 改變）在賣出規則跑完後執行：
 *   1. 宇宙 = 當日 us[] 或 tw[] 篩選名單。
 *      - 若 screens 只有 "observe"（觀察），盡量不買。
 *      - 排序：先當日 Top5 裡屬於這個市場的名字，再名單其餘股票（維持原名單順序）。
 *   2. 風險部位（新開倉）：
 *      - RiskPct = 帳本「目前權益」的 1% → RiskCash
 *      - StopDist 代理：股價 × 1.5%；若量比 volRatio >= 3（視為非常高）改用 2.5%
 *      - 股數 = floor(RiskCash / StopDist)
 *      - 單一股票市值上限 = 權益的 8%（新買與加碼都受此限）
 *      - 現金不夠買 1 股就跳過
 *      - 台股：有能力買 1 張（1000 股）才買整張；買不起 1 張就跳過，不改買零股
 *      - 美股：可以買 1 股以上
 *   3. 「持續買進」：已經持有、今天仍在買進名單、且部位市值 < 8% 權益，
 *      同一天最多再加碼一次（用同一套風險公式，再受剩餘空間限制）。
 *      當天已經賣過這檔，就不再加碼，避免停利後又立刻買回。
 *   4. 成交價 = latest.json 裡該檔的 price。沒有價格就不買。
 *   5. 若買進當天接近漲停（日漲跌 >= 9.5% 或風險文字含「漲停」），標記 limitUpStyle，
 *      供隔日「漲停追價隔日急殺」規則使用。
 *
 * 【賣出】每天先檢查持股（用 latest 能找到的報價更新市價；找不到就沿用上次標記價）：
 *   優先順序（先匹配先賣，停損優先於停利）：
 *   1. stop            停損：未實現報酬 <= -3%（相對平均成本）→ 全賣
 *   2. limit-up-chase  漲停追價：當初是漲停風格、且「不是買進當天」、當日 dayPct <= -5% → 全賣
 *   3. momentum-break  動能轉弱：沒站上 SMA20 且 dayPct < -2% → 全賣
 *   4. off-list        離開名單弱勢：今天 us/tw 名單都沒有它，且未實現 < 0 → 全賣
 *   5. take-profit     停利：未實現報酬 >= +12% → 賣一半
 *                      （美股剩 1 股或台股只剩 1 張這種「很小」的部位就全賣；
 *                       台股賣一半會再往下取整到 1000 股）
 *
 * 【權益曲線與績效】
 *   每天結束寫一筆 dailyEquity { date, equity, cash, positionsValue }（同一日覆寫）。
 *   總損益 = 目前權益 − 起始本金
 *   週／月／季／年：對最後一筆快照往回 7／30／90／365 曆日找基準；
 *   歷史不夠長就用成立日當基準，並標「成立以來」。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { avgCostAfterBuy } from "./math-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LATEST_PATH = join(ROOT, "public/data/latest.json");
const PORTFOLIO_PATH = join(ROOT, "public/data/paper-portfolio.json");
const DOCS_DATA = join(ROOT, "docs/data");

// —— 規則常數（改這裡請同步改網站說明）——
const START_DATE = "2026-09-15";
const START_CASH = { TW: 3_000_000, US: 100_000 };
const RISK_PCT = 0.01; // 每檔新倉用權益 1% 當風險金額
const MAX_POS_PCT = 0.08; // 單一股票最多約 8% 權益
const STOP_PCT = 0.015; // 停距代理：1.5% 股價
const STOP_PCT_HIGH_VOL = 0.025; // 量比非常高時 2.5%
const VOL_RATIO_HIGH = 3; // 量比 >= 3 視為非常高
const TW_LOT = 1000;
const STOP_LOSS_RET = -0.03; // 未實現 <= -3% 停損
const TAKE_PROFIT_RET = 0.12; // 未實現 >= +12% 停利
const MOMENTUM_DAY_PCT = -2; // 未站上 SMA20 且日漲跌 < -2%
const LIMIT_UP_DAY_PCT = 9.5; // 接近漲停
const LIMIT_UP_CHASE_DROP = -5; // 隔日急殺
const MAX_TRADES = 400;
const WINDOWS = [
  { key: "week", days: 7, title: "週" },
  { key: "month", days: 30, title: "月" },
  { key: "quarter", days: 90, title: "季" },
  { key: "year", days: 365, title: "年" },
];

const RULES_ZH = {
  title: "紙上模擬規則",
  note: "累積模擬帳戶（自 2026-09-15 起），不會每日歸零。成交價＝當日 latest 標的價，下單即成交。兩本帳分開，非真實券商單。",
  account: [
    "累積帳戶：檔案存在則只追加交易／更新市價；禁止因換日重建空帳本。",
    "startDate 固定 2026-09-15；現金與持股跨日保留。",
    "同一 asOf 冪等（不重複下單）；asOf 前進才處理。",
    "成交價＝latest.json 該標的 price；買進／賣出即成交。",
  ],
  buy: [
    "宇宙＝當日 us[]／tw[]；純 observe 不買；先 Top5 再其餘。",
    "新倉：風險＝權益×1%；停距≈價×1.5%（量比≥3→2.5%）；股數＝floor(風險÷停距)。",
    "單檔上限＝權益×8%。台股需買得起 1 張（1000股）。",
    "加碼：仍在名單且未滿 8%，同日最多一次（當日已賣則不加）。",
  ],
  sell: [
    "停損：未實現 ≤ −3% → 全賣",
    "漲停追價：近漲停開倉且非當日、dayPct ≤ −5% → 全賣",
    "動能轉弱：未站上 SMA20 且 dayPct < −2% → 全賣",
    "離名單且未實現 < 0 → 全賣",
    "停利：未實現 ≥ +12% → 賣一半（極小部位全賣）",
  ],
};

function roundMoney(n, digits = 2) {
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/** asOf ISO → 台北曆日 YYYY-MM-DD */
function taipeiDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
  } catch {
    return String(iso).slice(0, 10);
  }
}

function parseYmd(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function addDaysYmd(ymd, days) {
  const t = parseYmd(ymd) + days * 86400000;
  const dt = new Date(t);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function emptyBook(market) {
  const startCash = START_CASH[market];
  return {
    market,
    currency: market === "TW" ? "TWD" : "USD",
    startDate: START_DATE,
    startCash,
    cash: startCash,
    equity: startCash,
    positionsValue: 0,
    realizedPnl: 0,
    positions: [],
    trades: [],
    dailyEquity: [],
  };
}

function emptyPortfolio() {
  return {
    asOf: null,
    lastProcessedAsOf: null,
    startDate: START_DATE,
    fillPolicy: "immediate",
    cumulative: true,
    disclaimer:
      "累積模擬帳戶（自 2026-09-15 起）。成交價＝當日 latest 標的價，下單即成交；不會每日歸零。非真實券商委託。兩本帳分開計價。",
    rules: RULES_ZH,
    books: {
      TW: emptyBook("TW"),
      US: emptyBook("US"),
    },
    metrics: {},
  };
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isObserveOnly(stock) {
  const screens = stock?.screens;
  if (!Array.isArray(screens) || screens.length === 0) return false;
  return screens.every((s) => String(s) === "observe");
}

function isLimitUpStyle(stock) {
  if (!stock) return false;
  if (typeof stock.dayPct === "number" && stock.dayPct >= LIMIT_UP_DAY_PCT) return true;
  const blob = `${stock.risk || ""} ${stock.why || ""}`;
  return blob.includes("漲停");
}

/** 合併 top5 + us + tw，給持倉標記市價用 */
function quoteMap(latest) {
  const map = new Map();
  for (const list of [latest.top5 || [], latest.us || [], latest.tw || []]) {
    for (const s of list) {
      if (s?.ticker && typeof s.price === "number") map.set(s.ticker, s);
    }
  }
  return map;
}

function listTickers(latest, market) {
  const list = market === "TW" ? latest.tw || [] : latest.us || [];
  return new Set(list.map((s) => s.ticker));
}

/**
 * 買進宇宙：排除純觀察，Top5（同市場）優先，再接名單其餘。
 */
function buyUniverse(latest, market) {
  const list = (market === "TW" ? latest.tw : latest.us) || [];
  const filtered = list.filter((s) => s && s.ticker && typeof s.price === "number" && !isObserveOnly(s));
  const byTicker = new Map(filtered.map((s) => [s.ticker, s]));

  const top = (latest.top5 || []).filter((s) => {
    if (!s?.ticker) return false;
    if (isObserveOnly(s)) return false;
    if (s.market) return s.market === market;
    if (market === "TW") return /\.(TW|TWO)$/i.test(s.ticker);
    return !/\.(TW|TWO)$/i.test(s.ticker);
  });

  const out = [];
  const seen = new Set();
  for (const t of top) {
    const full = byTicker.get(t.ticker) || t;
    if (!full || typeof full.price !== "number") continue;
    if (seen.has(full.ticker)) continue;
    seen.add(full.ticker);
    out.push(full);
  }
  for (const s of filtered) {
    if (seen.has(s.ticker)) continue;
    seen.add(s.ticker);
    out.push(s);
  }
  return out;
}

function bookEquity(book) {
  const pv = (book.positions || []).reduce((sum, p) => sum + p.qty * p.mark, 0);
  return { positionsValue: roundMoney(pv), equity: roundMoney(book.cash + pv) };
}

function markPositions(book, quotes) {
  for (const p of book.positions) {
    const q = quotes.get(p.ticker);
    if (q && typeof q.price === "number") {
      p.mark = q.price;
      p.name = q.name || p.name;
      p.dayPct = q.dayPct;
      p.aboveSma20 = q.aboveSma20;
      p.volRatio = q.volRatio;
    }
  }
  const { positionsValue, equity } = bookEquity(book);
  book.positionsValue = positionsValue;
  book.equity = equity;
}

function unrealizedRet(pos) {
  if (!pos.avgCost || pos.avgCost === 0) return 0;
  return (pos.mark - pos.avgCost) / pos.avgCost;
}

function unrealizedPnl(pos) {
  return (pos.mark - pos.avgCost) * pos.qty;
}

function trimTrades(book) {
  if (book.trades.length > MAX_TRADES) {
    book.trades = book.trades.slice(-MAX_TRADES);
  }
}

function recordTrade(book, trade) {
  book.trades.push(trade);
  trimTrades(book);
}

function sellPosition(book, pos, qty, price, reason, reasonText, date, asOf) {
  const sellQty = Math.min(qty, pos.qty);
  if (sellQty <= 0) return null;
  const proceeds = sellQty * price;
  const realized = (price - pos.avgCost) * sellQty;
  pos.qty -= sellQty;
  book.cash = roundMoney(book.cash + proceeds);
  book.realizedPnl = roundMoney(book.realizedPnl + realized);
  const trade = {
    date,
    asOf,
    side: "SELL",
    ticker: pos.ticker,
    name: pos.name || "",
    qty: sellQty,
    price,
    avgCostAtSale: roundMoney(pos.avgCost),
    reason,
    reasonText,
    realizedPnl: roundMoney(realized),
  };
  recordTrade(book, trade);
  return trade;
}

function applySells(book, latest, market, quotes) {
  const date = taipeiDate(latest.asOf);
  const inList = listTickers(latest, market);
  const soldTickers = new Set();
  const remaining = [];

  for (const pos of book.positions) {
    const q = quotes.get(pos.ticker) || null;
    const mark = q && typeof q.price === "number" ? q.price : pos.mark;
    pos.mark = mark;
    const ret = unrealizedRet(pos);
    const dayPct = q && typeof q.dayPct === "number" ? q.dayPct : pos.dayPct;
    const aboveSma20 = q && typeof q.aboveSma20 === "boolean" ? q.aboveSma20 : pos.aboveSma20;
    const tinyAll = (qty) => {
      if (market === "TW") return qty <= TW_LOT;
      return qty <= 1;
    };

    let action = null;
    // 1 停損
    if (ret <= STOP_LOSS_RET) {
      action = { reason: "stop", text: "停損：未實現報酬 ≤ −3%", qty: pos.qty };
    }
    // 2 漲停追價隔日急殺
    else if (
      pos.limitUpStyle &&
      pos.openedOn &&
      pos.openedOn < date &&
      typeof dayPct === "number" &&
      dayPct <= LIMIT_UP_CHASE_DROP
    ) {
      action = {
        reason: "limit-up-chase",
        text: "漲停追價隔日急殺：買進時近漲停，今日日漲跌 ≤ −5%",
        qty: pos.qty,
      };
    }
    // 3 動能轉弱（需要當日報價的 aboveSma20 / dayPct）
    else if (aboveSma20 === false && typeof dayPct === "number" && dayPct < MOMENTUM_DAY_PCT) {
      action = {
        reason: "momentum-break",
        text: "動能轉弱：未站上 SMA20 且當日跌超過 2%",
        qty: pos.qty,
      };
    }
    // 4 離開名單且虧損
    else if (!inList.has(pos.ticker) && unrealizedPnl(pos) < 0) {
      action = {
        reason: "off-list",
        text: "離開當日名單且未實現虧損",
        qty: pos.qty,
      };
    }
    // 5 停利賣一半
    else if (ret >= TAKE_PROFIT_RET) {
      let qty;
      if (tinyAll(pos.qty)) {
        qty = pos.qty;
      } else if (market === "TW") {
        qty = Math.floor(pos.qty / 2 / TW_LOT) * TW_LOT;
        if (qty < TW_LOT) qty = pos.qty;
      } else {
        qty = Math.floor(pos.qty / 2);
        if (qty < 1) qty = pos.qty;
      }
      action = { reason: "take-profit", text: "停利：未實現報酬 ≥ +12%（賣一半或全數）", qty };
    }

    if (action) {
      sellPosition(book, pos, action.qty, mark, action.reason, action.text, date, latest.asOf);
      soldTickers.add(pos.ticker);
    }
    if (pos.qty > 0) remaining.push(pos);
  }

  book.positions = remaining;
  const { positionsValue, equity } = bookEquity(book);
  book.positionsValue = positionsValue;
  book.equity = equity;
  return soldTickers;
}

function stopDist(price, volRatio) {
  const pct = typeof volRatio === "number" && volRatio >= VOL_RATIO_HIGH ? STOP_PCT_HIGH_VOL : STOP_PCT;
  return price * pct;
}

function sizeShares({ market, price, equity, cash, volRatio, existingQty }) {
  if (!(price > 0) || !(equity > 0)) return 0;
  const riskCash = equity * RISK_PCT;
  const dist = stopDist(price, volRatio);
  if (!(dist > 0)) return 0;
  let shares = Math.floor(riskCash / dist);

  const existingVal = (existingQty || 0) * price;
  const maxVal = equity * MAX_POS_PCT;
  const room = maxVal - existingVal;
  if (room <= 0) return 0;
  const capShares = Math.floor(room / price);
  shares = Math.min(shares, capShares);

  if (market === "TW") {
    shares = Math.floor(shares / TW_LOT) * TW_LOT;
    if (shares < TW_LOT) return 0;
    while (shares >= TW_LOT && shares * price > cash + 1e-9) shares -= TW_LOT;
    if (shares < TW_LOT) return 0;
  } else {
    if (shares < 1) return 0;
    while (shares >= 1 && shares * price > cash + 1e-9) shares -= 1;
    if (shares < 1) return 0;
  }
  return shares;
}

function buyFill(book, stock, qty, reason, reasonText, date, asOf) {
  const cost = qty * stock.price;
  if (cost > book.cash + 1e-9 || qty <= 0) return null;
  let pos = book.positions.find((p) => p.ticker === stock.ticker);
  // Blend cost via guarded math-core before touching cash; refuse the fill off-domain.
  const blendedAvg = pos ? avgCostAfterBuy(pos.qty, pos.avgCost, qty, stock.price) : null;
  if (pos && blendedAvg == null) return null;
  book.cash = roundMoney(book.cash - cost);
  const limitUp = isLimitUpStyle(stock);
  if (!pos) {
    pos = {
      ticker: stock.ticker,
      name: stock.name || "",
      qty,
      avgCost: stock.price,
      mark: stock.price,
      currency: book.currency,
      openedOn: date,
      lastAddDate: date,
      limitUpStyle: limitUp,
    };
    book.positions.push(pos);
  } else {
    const newQty = pos.qty + qty;
    pos.avgCost = blendedAvg;
    pos.qty = newQty;
    pos.mark = stock.price;
    pos.lastAddDate = date;
    pos.name = stock.name || pos.name;
    if (limitUp) pos.limitUpStyle = true;
  }
  const trade = {
    date,
    asOf,
    side: "BUY",
    ticker: stock.ticker,
    name: stock.name || "",
    qty,
    price: stock.price,
    reason,
    reasonText,
    realizedPnl: 0,
  };
  recordTrade(book, trade);
  return trade;
}

function applyBuys(book, latest, market, soldToday) {
  const date = taipeiDate(latest.asOf);
  const universe = buyUniverse(latest, market);
  const { equity } = bookEquity(book);

  for (const stock of universe) {
    const pos = book.positions.find((p) => p.ticker === stock.ticker);
    if (pos) {
      // 持續買進：仍在名單、未滿 8%、今天還沒加過、今天沒賣過
      if (soldToday.has(stock.ticker)) continue;
      if (pos.lastAddDate === date) continue;
      const roomVal = equity * MAX_POS_PCT - pos.qty * pos.mark;
      if (roomVal <= 0) continue;
      const qty = sizeShares({
        market,
        price: stock.price,
        equity,
        cash: book.cash,
        volRatio: stock.volRatio,
        existingQty: pos.qty,
      });
      if (qty <= 0) continue;
      buyFill(book, stock, qty, "add", "持續買進：仍在名單且未滿 8% 權益上限", date, latest.asOf);
    } else {
      const qty = sizeShares({
        market,
        price: stock.price,
        equity,
        cash: book.cash,
        volRatio: stock.volRatio,
        existingQty: 0,
      });
      if (qty <= 0) continue;
      buyFill(book, stock, qty, "screen-buy", "名單新開倉（風險 1%、上限 8%）", date, latest.asOf);
    }
  }

  const snap = bookEquity(book);
  book.positionsValue = snap.positionsValue;
  book.equity = snap.equity;
}

function upsertDailyEquity(book, date) {
  const { positionsValue, equity } = bookEquity(book);
  book.positionsValue = positionsValue;
  book.equity = equity;
  const row = {
    date,
    equity: roundMoney(equity),
    cash: roundMoney(book.cash),
    positionsValue: roundMoney(positionsValue),
  };
  const i = book.dailyEquity.findIndex((s) => s.date === date);
  if (i >= 0) book.dailyEquity[i] = row;
  else book.dailyEquity.push(row);
  book.dailyEquity.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function windowPerf(dailyEquity, days) {
  if (!dailyEquity.length) {
    return { pct: 0, pnl: 0, label: "成立以來", sinceInception: true, days };
  }
  const last = dailyEquity[dailyEquity.length - 1];
  const target = addDaysYmd(last.date, -days);
  let base = dailyEquity[0];
  let found = false;
  for (const s of dailyEquity) {
    if (s.date <= target) {
      base = s;
      found = true;
    }
  }
  const firstDate = dailyEquity[0].date;
  const sinceInception = !found || firstDate > target;
  const pnl = roundMoney(last.equity - base.equity);
  const pct = base.equity ? roundMoney((last.equity / base.equity - 1) * 100, 4) : 0;
  return {
    pct,
    pnl,
    label: sinceInception ? "成立以來" : `${days}日`,
    sinceInception,
    days,
    fromDate: base.date,
    toDate: last.date,
  };
}

function computeBookMetrics(book) {
  const totalPnl = roundMoney(book.equity - book.startCash);
  const totalPnlPct = book.startCash ? roundMoney((totalPnl / book.startCash) * 100, 4) : 0;
  const metrics = {
    totalPnl,
    totalPnlPct,
    realizedPnl: roundMoney(book.realizedPnl),
    unrealizedPnl: roundMoney(
      (book.positions || []).reduce((s, p) => s + unrealizedPnl(p), 0)
    ),
  };
  for (const w of WINDOWS) {
    metrics[w.key] = windowPerf(book.dailyEquity, w.days);
  }
  return metrics;
}

function processBook(book, latest, market, quotes) {
  markPositions(book, quotes);
  const soldToday = applySells(book, latest, market, quotes);
  applyBuys(book, latest, market, soldToday);
  upsertDailyEquity(book, taipeiDate(latest.asOf));
  return soldToday;
}

function fmt(n, digits = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function printBookSummary(id, book, metrics, date) {
  const todayTrades = (book.trades || []).filter((t) => t.date === date);
  const buys = todayTrades.filter((t) => t.side === "BUY");
  const sells = todayTrades.filter((t) => t.side === "SELL");
  const cur = book.currency === "TWD" ? "NT$" : "US$";
  console.log(`\n=== ${id} ${book.currency} ===`);
  console.log(`  cash=${cur}${fmt(book.cash)}  equity=${cur}${fmt(book.equity)}  posValue=${cur}${fmt(book.positionsValue)}`);
  console.log(`  totalPnl=${cur}${fmt(metrics.totalPnl)} (${metrics.totalPnlPct.toFixed(2)}%)  realized=${cur}${fmt(metrics.realizedPnl)}`);
  for (const w of WINDOWS) {
    const m = metrics[w.key];
    console.log(`  ${w.title}: ${m.label} ${m.pct >= 0 ? "+" : ""}${m.pct.toFixed(2)}%`);
  }
  console.log(`  positions (${book.positions.length}):`);
  for (const p of book.positions) {
    const u = unrealizedPnl(p);
    const r = unrealizedRet(p) * 100;
    console.log(
      `    ${p.ticker} qty=${p.qty} avg=${p.avgCost} mark=${p.mark} uPnL=${fmt(u)} (${r.toFixed(2)}%)`
    );
  }
  console.log(`  today BUY ${buys.length} / SELL ${sells.length}`);
  for (const t of todayTrades) {
    console.log(`    ${t.side} ${t.ticker} x${t.qty} @ ${t.price} [${t.reason}] ${t.reasonText}`);
  }
}

function main() {
  if (!existsSync(LATEST_PATH)) {
    console.error(`FAIL: missing ${LATEST_PATH}`);
    process.exit(1);
  }
  const latest = loadJson(LATEST_PATH);
  if (!latest.asOf) {
    console.error("FAIL: latest.json missing asOf");
    process.exit(1);
  }

  // 檔案存在就必須沿用既有帳本——禁止換日／缺欄位時重建空倉（會抹掉累積部位）
  let portfolio;
  if (existsSync(PORTFOLIO_PATH)) {
    portfolio = loadJson(PORTFOLIO_PATH);
    if (!portfolio || typeof portfolio !== "object") {
      console.error("FAIL: paper-portfolio.json unreadable; refusing to wipe");
      process.exit(1);
    }
    if (!portfolio.books) portfolio.books = {};
    // 只補缺的那一本，絕不整份 emptyPortfolio()
    if (!portfolio.books.TW) {
      console.warn("WARN: missing TW book — seeding empty TW book only");
      portfolio.books.TW = emptyBook("TW");
    }
    if (!portfolio.books.US) {
      console.warn("WARN: missing US book — seeding empty US book only");
      portfolio.books.US = emptyBook("US");
    }
  } else {
    portfolio = emptyPortfolio();
    console.log(`NEW: creating portfolio at ${PORTFOLIO_PATH} (startDate=${START_DATE})`);
  }
  // startDate 只補缺，從不覆寫既有值
  if (!portfolio.startDate) portfolio.startDate = START_DATE;
  portfolio.rules = RULES_ZH;
  portfolio.disclaimer =
    "累積模擬帳戶（自 2026-09-15 起）。成交價＝當日 latest 標的價，下單即成交；不會每日歸零。非真實券商委託。兩本帳分開計價。";
  for (const m of ["TW", "US"]) {
    const b = portfolio.books[m];
    if (typeof b.startCash !== "number") b.startCash = START_CASH[m];
    if (!b.startDate) b.startDate = portfolio.startDate || START_DATE;
    if (!Array.isArray(b.positions)) b.positions = [];
    if (!Array.isArray(b.trades)) b.trades = [];
    if (!Array.isArray(b.dailyEquity)) b.dailyEquity = [];
    if (typeof b.cash !== "number") b.cash = b.startCash;
    b.market = m;
    b.currency = m === "TW" ? "TWD" : "USD";
  }

  if (portfolio.lastProcessedAsOf === latest.asOf) {
    console.log(`NO-OP: lastProcessedAsOf === latest.asOf (${latest.asOf})`);
    const date = taipeiDate(latest.asOf);
    portfolio.metrics = {
      TW: computeBookMetrics(portfolio.books.TW),
      US: computeBookMetrics(portfolio.books.US),
      combinedNote: "台股帳與美股帳完全獨立；不做匯率加總。",
    };
    printBookSummary("TW", portfolio.books.TW, portfolio.metrics.TW, date);
    printBookSummary("US", portfolio.books.US, portfolio.metrics.US, date);
    return;
  }

  const quotes = quoteMap(latest);
  processBook(portfolio.books.TW, latest, "TW", quotes);
  processBook(portfolio.books.US, latest, "US", quotes);

  portfolio.asOf = latest.asOf;
  portfolio.lastProcessedAsOf = latest.asOf;
  portfolio.metrics = {
    TW: computeBookMetrics(portfolio.books.TW),
    US: computeBookMetrics(portfolio.books.US),
    combinedNote: "台股帳與美股帳完全獨立；不做匯率加總。",
  };

  const json = JSON.stringify(portfolio, null, 2) + "\n";
  writeFileSync(PORTFOLIO_PATH, json);
  if (existsSync(DOCS_DATA) || existsSync(join(ROOT, "docs"))) {
    mkdirSync(DOCS_DATA, { recursive: true });
    writeFileSync(join(DOCS_DATA, "paper-portfolio.json"), json);
  }

  const date = taipeiDate(latest.asOf);
  console.log(`OK: processed asOf=${latest.asOf} date=${date}`);
  console.log(`Wrote ${PORTFOLIO_PATH}`);
  printBookSummary("TW", portfolio.books.TW, portfolio.metrics.TW, date);
  printBookSummary("US", portfolio.books.US, portfolio.metrics.US, date);
}

main();
