#!/usr/bin/env node
/**
 * 紙上模擬交易（paper trading）
 * =================================
 * 累積模擬帳戶（自 START_DATE 起）：不會每日歸零；asOf 前進才追加買賣／更新標記。
 * 成交價＝當日 latest.json 標的 price；下單即成交（無掛單、無部分成交）。
 * 台股／美股兩本帳分開，不做匯率混算。非真實券商成交。
 *
 * 執行：npm run paper   或   node scripts/paper-trade.mjs
 *       逐日補帳：node scripts/paper-trade.mjs --input public/data/2026-10-05.json
 *       （--input 指定某一天存下的掃描快照；預設 public/data/latest.json。只換輸入檔，買賣數學不變）
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
 *   2. 部位大小（新開倉）——實際上永遠是「單檔 8% 上限」比較小，風險公式算出來的股數不會成為限制：
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
 * 【賣出】每天先檢查持股（用 latest 的報價；掃描沒有的持股用 paper-quotes/<日期>.json 的同時段收盤價；
 *        兩邊都沒有就沿用上次標記價計算權益，但當天不對它做任何賣出，避免用舊價格成交）：
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
import { avgCostAfterBuy, realizedPnl, roundHalfAway, positionSizeShares, unrealizedReturn, bookMarkValue, unrealizedPnlOf, windowPerformance, paperExitAction, limitUpStyleFlag, addOnRoom } from "./math-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
function cliInput() {
  const i = process.argv.indexOf("--input");
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return process.env.PAPER_INPUT || null;
}
const INPUT_ARG = cliInput();
const LATEST_PATH = INPUT_ARG
  ? (INPUT_ARG.startsWith("/") ? INPUT_ARG : join(process.cwd(), INPUT_ARG))
  : join(ROOT, "public/data/latest.json");
const DERIV_PATH = join(ROOT, "public/data/paper-derivatives.json");
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
const EXIT_RULES = { stopLossRet: STOP_LOSS_RET, takeProfitRet: TAKE_PROFIT_RET, momentumDayPct: MOMENTUM_DAY_PCT, limitUpChaseDrop: LIMIT_UP_CHASE_DROP };
const EXIT_TEXT = {
  stop: "停損：未實現報酬 ≤ −3%",
  "limit-up-chase": "漲停追價隔日急殺：買進時近漲停，今日日漲跌 ≤ −5%",
  "momentum-break": "動能轉弱：未站上 SMA20 且當日跌超過 2%",
  "off-list": "離開當日名單且未實現虧損",
  "take-profit": "停利：未實現報酬 ≥ +12%（賣一半或全數）",
};
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
    "每檔最多放帳本總值的 8%，再看現金夠不夠（台指期保證金、選擇權權利金占用的錢不能拿來買股票）。",
    "台股只買整張（1000 股），買不起一張就跳過；美股可買 1 股起。",
    "台股休市日（含颱風停市）不買也不賣，只更新市價；休市後第一個交易日早上也不成交，要等休市後第一個真實交易日收盤的價格出來（隔天早上）才重新判斷。",
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
  // sign-symmetric half-away-from-zero (losses round like gains); see math-core roundHalfAway
  const r = roundHalfAway(n, digits);
  if (r == null) {
    console.warn(`[paper] roundMoney got non-finite ${n}; using 0`);
    return 0;
  }
  return r;
}

/** asOf ISO → 台北曆日 YYYY-MM-DD */
function taipeiDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
  } catch {
    return String(iso).slice(0, 10);
  }
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
  // dayPct ≥ 9.5 or text mentions 漲停 — guarded in math-core limitUpStyleFlag
  return limitUpStyleFlag(stock.dayPct, `${stock.risk || ""} ${stock.why || ""}`, LIMIT_UP_DAY_PCT);
}

/**
 * 合併 top5 + us + tw，給持倉標記市價用。
 * 掃描沒有、但仍持有的股票：用 paper-held-quotes 存下的同時段公開收盤價補（同一份 asOf 才採用）。
 */
function quoteMap(latest) {
  const map = new Map();
  for (const list of [latest.top5 || [], latest.us || [], latest.tw || []]) {
    for (const s of list) {
      if (s?.ticker && typeof s.price === "number") map.set(s.ticker, s);
    }
  }
  const heldPath = join(ROOT, "public/data/paper-quotes", `${taipeiDate(latest.asOf)}.json`);
  if (existsSync(heldPath)) {
    try {
      const held = loadJson(heldPath);
      if (held.scanAsOf === latest.asOf) {
        for (const q of held.quotes || []) {
          if (q?.ticker && typeof q.price === "number" && q.price > 0 && !map.has(q.ticker)) map.set(q.ticker, { ...q, heldQuote: true });
        }
      }
    } catch (e) {
      console.warn(`[paper] unreadable ${heldPath}: ${e.message}`);
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

/** cash + Σ qty·mark via math-core; junk qty/mark/cash aborts the run (never publishes NaN→0 equity). */
function bookEquity(book) {
  const v = bookMarkValue(book.positions, book.cash);
  if (!v) throw new Error(`[paper] ${book.market}: non-finite cash/qty/mark — refusing to value the book`);
  return { positionsValue: roundMoney(v.positionsValue), equity: roundMoney(v.equity) };
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

/** (mark − avgCost) / avgCost via math-core; null when mark or cost is missing / ≤ 0 (no return-based action). */
function unrealizedRet(pos) {
  return unrealizedReturn(pos.mark, pos.avgCost);
}

function lotSizeOf(market) {
  return market === "TW" ? TW_LOT : 1;
}

/** (mark − avgCost)·qty via math-core; NaN (not a fake 0) on junk so `< 0` checks stay false and sums abort. */
function unrealizedPnl(pos) {
  const u = unrealizedPnlOf(pos.mark, pos.avgCost, pos.qty);
  return u == null ? NaN : u;
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
  const realized = realizedPnl(price, pos.avgCost, sellQty);
  if (realized == null) {
    // never book a sale on a missing/garbage quote or cost: that would show a fake P&L
    console.warn(`[paper] refuse SELL ${pos.ticker}: price=${price} avgCost=${pos.avgCost} qty=${sellQty}`);
    return null;
  }
  const proceeds = sellQty * price;
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
    avgCostAtSale: roundMoney(pos.avgCost, 6), // 6 位：讓「(成交價 − 成本) × 股數 = 實現損益」對得起來（加碼後成本常有很多位小數）
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
    if (!q || typeof q.price !== "number") {
      // 當天沒有這檔的真實報價：不拿舊標記價成交，今天先不動它（資料缺口，不是訊號）
      console.warn(`[paper] ${market} ${pos.ticker}: no same-day quote; holding, no sell rule applied`);
      remaining.push(pos);
      continue;
    }
    const mark = q.price;
    pos.mark = mark;
    const dayPct = q && typeof q.dayPct === "number" ? q.dayPct : pos.dayPct;
    const aboveSma20 = q && typeof q.aboveSma20 === "boolean" ? q.aboveSma20 : pos.aboveSma20;

    // rule chain stop → limit-up-chase → momentum-break → off-list → take-profit — guarded in math-core paperExitAction
    const exit = paperExitAction(
      {
        mark,
        avgCost: pos.avgCost,
        qty: pos.qty,
        dayPct,
        aboveSma20,
        limitUpStyle: pos.limitUpStyle === true,
        openedOn: pos.openedOn,
        date,
        inList: inList.has(pos.ticker),
        lotSize: lotSizeOf(market),
      },
      EXIT_RULES
    );
    const action = exit ? { reason: exit.reason, text: EXIT_TEXT[exit.reason], qty: exit.qty } : null;

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

/** 股數：風險 1%／停距 1.5%（量比≥3→2.5%）、單檔上限 8%、台股整張、現金足夠 — guarded in math-core positionSizeShares */
function sizeShares({ market, price, equity, cash, volRatio, existingQty }) {
  return positionSizeShares({
    lotSize: lotSizeOf(market),
    price,
    equity,
    cash,
    volRatio,
    existingQty: existingQty || 0,
    riskPct: RISK_PCT,
    maxPosPct: MAX_POS_PCT,
    stopPct: STOP_PCT,
    stopPctHighVol: STOP_PCT_HIGH_VOL,
    volRatioHigh: VOL_RATIO_HIGH,
  });
}

function buyFill(book, stock, qty, reason, reasonText, date, asOf, reserve = 0) {
  const cost = qty * stock.price;
  if (cost > book.cash - reserve + 1e-9 || qty <= 0) return null;
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

/**
 * 衍生品（台指期保證金、選擇權權利金）占用的同一本帳現金：股票買進不能動用這筆錢。
 * reserve = marginHold − cashAdj（只算已在該日之前成交的衍生品帳；沒有檔案就是 0）。
 */
function derivativesReserve(market, date) {
  if (!existsSync(DERIV_PATH)) return 0;
  try {
    const d = loadJson(DERIV_PATH);
    const m = d?.[market];
    if (!m) return 0;
    const opened = (m.positions || []).map((p) => p.openedOn).filter(Boolean).sort();
    if (opened.length && opened[0] > date) return 0;
    const r = (Number(m.marginHold) || 0) - (Number(m.cashAdj) || 0);
    return r > 0 ? r : 0;
  } catch {
    return 0;
  }
}

function applyBuys(book, latest, market, soldToday) {
  const date = taipeiDate(latest.asOf);
  const reserve = derivativesReserve(market, date);
  const universe = buyUniverse(latest, market);
  const { equity } = bookEquity(book);

  for (const stock of universe) {
    const pos = book.positions.find((p) => p.ticker === stock.ticker);
    if (pos) {
      // 持續買進：仍在名單、未滿 8%、今天還沒加過、今天沒賣過
      if (soldToday.has(stock.ticker)) continue;
      if (pos.lastAddDate === date) continue;
      const roomVal = addOnRoom(equity, MAX_POS_PCT, pos.qty, pos.mark); // equity·8% − qty·mark; null on junk ⇒ skip
      if (roomVal == null || roomVal <= 0) continue;
      const qty = sizeShares({
        market,
        price: stock.price,
        equity,
        cash: Math.max(0, book.cash - reserve),
        volRatio: stock.volRatio,
        existingQty: pos.qty,
      });
      if (qty <= 0) continue;
      buyFill(book, stock, qty, "add", "持續買進：仍在名單且未滿 8% 權益上限", date, latest.asOf, reserve);
    } else {
      const qty = sizeShares({
        market,
        price: stock.price,
        equity,
        cash: Math.max(0, book.cash - reserve),
        volRatio: stock.volRatio,
        existingQty: 0,
      });
      if (qty <= 0) continue;
      buyFill(book, stock, qty, "screen-buy", "名單新開倉（單檔上限 8%）", date, latest.asOf, reserve);
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

/** Trailing-window P&L via math-core windowPerformance; junk series aborts instead of publishing 0. */
function windowPerf(dailyEquity, days) {
  const w = windowPerformance(dailyEquity, days);
  if (!w) throw new Error(`[paper] dailyEquity unsorted/duplicate/non-finite — refusing ${days}d window`);
  return w;
}

function computeBookMetrics(book) {
  const totalPnl = roundMoney(book.equity - book.startCash);
  const totalPnlPct = book.startCash ? roundMoney((totalPnl / book.startCash) * 100, 4) : 0;
  const metrics = {
    totalPnl,
    totalPnlPct,
    realizedPnl: roundMoney(book.realizedPnl),
    unrealizedPnl: (() => {
      const u = (book.positions || []).reduce((s, p) => s + unrealizedPnl(p), 0);
      if (!Number.isFinite(u)) throw new Error(`[paper] ${book.market}: non-finite unrealized P&L`);
      return roundMoney(u);
    })(),
  };
  for (const w of WINDOWS) {
    metrics[w.key] = windowPerf(book.dailyEquity, w.days);
  }
  return metrics;
}

/**
 * 台股臨時停市／補假（官方公告），固定寫在這裡，逐日補帳時不會因為 tw-macro-calendar.json
 * 只放「今天以後」的休市日而忘記。颱風停市不在 TWSE 年度休市表裡，一定要列在這。
 */
const TWSE_KNOWN_CLOSURES = {
  "2026-10-23": {
    eventName: "台股休市 · 薔琵（CHAMPI）颱風停止上班，證交所全日停止交易",
    officialUrl: "https://www.twse.com.tw/staticFiles/news/news/tsecnews/8a8216d6a0fa351b01a16385573a0204.pdf",
  },
  "2026-10-26": {
    eventName: "台股休市 · 臺灣光復暨金門古寧頭大捷紀念日補假",
    officialUrl: "https://www.twse.com.tw/zh/trading/holiday.html",
  },
};
/** 「休市後第一個交易日早上不成交」從這天起生效（之前已公布的成交不回頭改）。 */
const TW_STALE_CLOSE_RULE_FROM = "2026-10-23";
/**
 * 使用者 2026-10-27 同意回溯套用的日子（只有這些，其他更早的歷史不動）：
 *   2026-10-12：10/09 國慶補假休市，10/12 早上的價格還是 10/08 收盤 → 不成交。
 */
const TW_STALE_CLOSE_RULE_RETRO = new Set(["2026-10-12"]);

/**
 * 台股休市日（TWSE 官方休市表 tw-macro-calendar.json ＋ 上面的臨時停市表）不下單：
 * 市場沒開就沒有成交，不能拿前一個交易日的收盤價假裝成交。只更新標記與權益。
 */
function twseHolidayOn(date) {
  if (TWSE_KNOWN_CLOSURES[date]) return { dayTw: date, ...TWSE_KNOWN_CLOSURES[date] };
  const path = join(ROOT, "public/data/tw-macro-calendar.json");
  if (!existsSync(path)) return null;
  const cal = loadJson(path);
  const events = Array.isArray(cal?.events) ? cal.events : [];
  return events.find((e) => e && e.eventKey === "twseHoliday" && e.dayTw === date) || null;
}

/** 掃描檔裡的台股收盤日：優先 twCloseDate 欄位，否則讀 timezoneNote「台股為 YYYY-MM-DD 收盤」。 */
function twCloseDateOf(latest) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(latest?.twCloseDate || "")) return latest.twCloseDate;
  const m = /台股為 (\d{4}-\d{2}-\d{2}) 收盤/.exec(latest?.timezoneNote || "");
  return m ? m[1] : null;
}

/**
 * 台股收盤價「隔了休市」：收盤日與成交日之間夾著平日（週一～五），代表中間有休市（或資料沒更新），
 * 這個收盤價已經放了好幾天，不能拿來在休市後第一天早上成交。回傳夾在中間的平日清單（空＝正常）。
 */
function weekdaysBetween(fromYmd, toYmd) {
  const out = [];
  const d = new Date(fromYmd + "T00:00:00Z");
  const end = new Date(toYmd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  while (d < end) {
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function processBook(book, latest, market, quotes) {
  markPositions(book, quotes);
  if (market === "TW") {
    const date = taipeiDate(latest.asOf);
    const holiday = twseHolidayOn(date);
    if (holiday) {
      console.log(`TW ${date}: ${holiday.eventName} — market closed, no fills (mark only)`);
      upsertDailyEquity(book, date);
      return new Set();
    }
    const closeDate = twCloseDateOf(latest);
    if (closeDate && (date >= TW_STALE_CLOSE_RULE_FROM || TW_STALE_CLOSE_RULE_RETRO.has(date))) {
      const gap = weekdaysBetween(closeDate, date);
      if (gap.length) {
        console.log(`TW ${date}: prices are the ${closeDate} close and the market was closed on ${gap.join(", ")} — first morning after a closure, no fills (mark only)`);
        upsertDailyEquity(book, date);
        return new Set();
      }
    }
  }
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
    const r = (unrealizedRet(p) ?? 0) * 100;
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
    // Only a brand-new book may start from startCash. A book that already holds positions or trades
    // with missing/non-finite cash (e.g. NaN serialized as null) is corrupt: refilling it with fresh
    // startCash would silently create money (equity jumps by startCash). Refuse instead.
    if (typeof b.cash !== "number" || !Number.isFinite(b.cash)) {
      if (b.positions.length || b.trades.length) {
        throw new Error(`[paper] ${m}: cash is ${JSON.stringify(b.cash)} on a book with ${b.positions.length} positions / ${b.trades.length} trades — refusing to reset it to startCash`);
      }
      b.cash = b.startCash;
    }
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

  if (portfolio.lastProcessedAsOf && latest.asOf < portfolio.lastProcessedAsOf) {
    console.error(`FAIL: input asOf ${latest.asOf} is older than lastProcessedAsOf ${portfolio.lastProcessedAsOf}; replay must go forward in order`);
    process.exit(1);
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
