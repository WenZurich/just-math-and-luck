#!/usr/bin/env node
/**
 * Build 台指期 desk snapshot → public/data/txf-desk.json (+ docs/data when present).
 *
 * Sources (official / public only — never invent prices, OI, dates, or institutional numbers):
 *   - TAIFEX OpenAPI DailyMarketReportFut (TX / MTX / TMF last, settle, volume, OI)
 *   - TAIFEX OpenAPI 三大法人 DetailsOfFuturesContractsBytheDate
 *   - TAIFEX OpenAPI IndexFuturesAndOptionsMargining
 *   - TAIFEX OpenAPI PutCallRatio (臺指選擇權彙總)
 *   - TAIFEX OpenAPI FinalSettlementPriceIndexFutures (recent settlement)
 *   - TWSE MI_INDEX (發行量加權股價指數 spot)
 *
 * Contract multipliers (TX 200 / MTX 50 / TMF 10 TWD per point) are published TAIFEX
 * contract constants; last trading day for monthly TX/MTX/TMF = third Wednesday of the
 * delivery month (official rule). Computed dates are labeled; holiday shifts follow TAIFEX notices.
 *
 * Manual: npm run fetch-txf
 * Optional with daily-scan: FETCH_TXF=1 node scripts/daily-scan.mjs
 *
 * On fetch failure: keep last-good JSON and exit non-zero.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { futuresBasis, thirdWednesdayYmd } from "./math-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public/data/txf-desk.json");
const OUT_DOCS = path.join(ROOT, "docs/data/txf-desk.json");

const UA =
  "Mozilla/5.0 (compatible; JustMathAndLuck/1.0; +https://github.com/WenZurich/Just-Math-and-Luck)";
const TZ = "Asia/Taipei";

const TAIFEX_V1 = "https://openapi.taifex.com.tw/v1";
const URL_DAILY_FUT = `${TAIFEX_V1}/DailyMarketReportFut`;
const URL_INST =
  `${TAIFEX_V1}/MarketDataOfMajorInstitutionalTradersDetailsOfFuturesContractsBytheDate`;
const URL_MARGIN = `${TAIFEX_V1}/IndexFuturesAndOptionsMargining`;
const URL_PCR = `${TAIFEX_V1}/PutCallRatio`;
const URL_FSP = `${TAIFEX_V1}/FinalSettlementPriceIndexFutures`;
const URL_TWSE_MI =
  "https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?response=json&type=IND";
const URL_MARGIN_PAGE = "https://www.taifex.com.tw/cht/5/indexMarging";
const URL_INST_PAGE = "https://www.taifex.com.tw/cht/3/futContractsDate";
const URL_OPENAPI = "https://openapi.taifex.com.tw/";

/** Official TAIFEX published contract multipliers (TWD per index point). */
const MULTIPLIERS = {
  TX: {
    code: "TX",
    nameZh: "臺股期貨",
    nameEn: "TAIEX Futures",
    multiplierTwdPerPoint: 200,
    tickSizePoints: 1,
    currency: "TWD",
    settlement: "cash",
    noteZh: "官方契約規格常數：每點新臺幣 200 元",
  },
  MTX: {
    code: "MTX",
    nameZh: "小型臺指期貨",
    nameEn: "Mini-TAIEX Futures",
    multiplierTwdPerPoint: 50,
    tickSizePoints: 1,
    currency: "TWD",
    settlement: "cash",
    noteZh: "官方契約規格常數：每點新臺幣 50 元（約為 TX 的 1/4）",
  },
  TMF: {
    code: "TMF",
    nameZh: "微型臺指期貨",
    nameEn: "Micro-TAIEX Futures",
    multiplierTwdPerPoint: 10,
    tickSizePoints: 1,
    currency: "TWD",
    settlement: "cash",
    noteZh: "官方契約規格常數：每點新臺幣 10 元（約為 TX 的 1/20）",
  },
};

const INST_NAME = {
  臺股期貨: "TX",
  小型臺指期貨: "MTX",
  微型臺指期貨: "TMF",
};

const MARGIN_NAME = {
  臺股期貨: "TX",
  小型臺指: "MTX",
  微型臺指期貨: "TMF",
};

function round(n, d = 4) {
  if (n == null || !Number.isFinite(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function num(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(/,/g, "");
  if (!s || s === "-" || s === "NULL" || s === "null") return null;
  const n = Number(s.replace(/%/g, ""));
  return Number.isFinite(n) ? n : null;
}

function ymdDash(yyyymmdd) {
  const s = String(yyyymmdd || "").replace(/\D/g, "");
  if (s.length !== 8) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function taipeiNowIso() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+08:00`;
}

/** Third Wednesday of calendar month (official TX monthly last-trading-day rule) — single source in math-core. */
function thirdWednesday(year, month) {
  return thirdWednesdayYmd(year, month);
}

function lastTradingDayForMonthToken(monthToken) {
  // Monthly: YYYYMM ; weekly like 202610W1 → omit computed monthly LTD
  const s = String(monthToken || "");
  if (!/^\d{6}$/.test(s)) {
    return {
      lastTradingDay: null,
      lastTradingDayBasis: null,
      lastTradingDayNoteZh:
        "非標準月契約（含週選／價差）；最後交易日請以期交所該契約公告為準",
    };
  }
  const year = Number(s.slice(0, 4));
  const month = Number(s.slice(4, 6));
  return {
    lastTradingDay: thirdWednesday(year, month),
    lastTradingDayBasis: "third_wednesday_of_delivery_month",
    lastTradingDayNoteZh:
      "依臺股期貨／小台／微台官方契約規格：交割月份之第三個星期三。若遇假日則依期交所公告調整。",
  };
}

async function fetchJson(url, { timeoutMs = 45000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "application/json,text/plain,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const data = JSON.parse(text);
    return { ok: true, data, url };
  } catch (e) {
    return { ok: false, error: `${url}: ${e.message || e}`, url };
  } finally {
    clearTimeout(t);
  }
}

function parseFutRows(rows, code) {
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (const r of rows) {
    if (r?.Contract !== code) continue;
    if (r?.TradingSession && r.TradingSession !== "一般") continue;
    const month = String(r["ContractMonth(Week)"] || "");
    if (!month || month.includes("/")) continue; // skip spreads
    const ltd = lastTradingDayForMonthToken(month);
    out.push({
      month,
      open: num(r.Open),
      high: num(r.High),
      low: num(r.Low),
      last: num(r.Last),
      change: num(r.Change),
      changePct: num(r["%"]),
      volume: num(r.Volume),
      settle: num(r.SettlementPrice),
      openInterest: num(r.OpenInterest),
      bestBid: num(r.BestBid),
      bestAsk: num(r.BestAsk),
      tradingSession: r.TradingSession || null,
      ...ltd,
    });
  }
  // Prefer monthly (YYYYMM) ahead of weeklies; then by month ascending
  out.sort((a, b) => {
    const am = /^\d{6}$/.test(a.month) ? 0 : 1;
    const bm = /^\d{6}$/.test(b.month) ? 0 : 1;
    if (am !== bm) return am - bm;
    return a.month.localeCompare(b.month);
  });
  return out;
}

function pickNearNext(contracts) {
  const monthly = contracts.filter((c) => /^\d{6}$/.test(c.month));
  const near = monthly[0] || contracts[0] || null;
  const next = monthly[1] || null;
  return { near, next, all: contracts };
}

function parseSpot(mi) {
  if (!mi || mi.stat !== "OK") return null;
  const tables = Array.isArray(mi.tables) ? mi.tables : [];
  for (const t of tables) {
    const data = t.data || [];
    for (const row of data) {
      if (!Array.isArray(row)) continue;
      if (row[0] === "發行量加權股價指數") {
        const last = num(row[1]);
        let change = num(row[3]);
        let changePct = num(row[4]);
        // TWSE MI_INDEX: change magnitude in col3; direction in HTML color (green=-) or signed % in col4
        const dirHtml = String(row[2] || "");
        if (change != null && changePct != null && changePct < 0 && change > 0) change = -Math.abs(change);
        else if (change != null && /color:\s*green/i.test(dirHtml) && change > 0) change = -Math.abs(change);
        else if (change != null && /color:\s*red/i.test(dirHtml) && change < 0) change = Math.abs(change);
        return {
          nameZh: "發行量加權股價指數（TAIEX）",
          nameEn: "TAIEX",
          last,
          change,
          changePct,
          sessionDate: ymdDash(mi.date),
          source: URL_TWSE_MI,
        };
      }
    }
  }
  return null;
}

function parseInstitutional(rows) {
  if (!Array.isArray(rows)) return null;
  const byCode = { TX: [], MTX: [], TMF: [] };
  let date = null;
  for (const r of rows) {
    const code = INST_NAME[r.ContractCode];
    if (!code) continue;
    date = date || ymdDash(r.Date) || r.Date;
    byCode[code].push({
      partyZh: r.Item,
      tradingVolumeLong: num(r["TradingVolume(Long)"]),
      tradingVolumeShort: num(r["TradingVolume(Short)"]),
      tradingVolumeNet: num(r["TradingVolume(Net)"]),
      openInterestLong: num(r["OpenInterest(Long)"]),
      openInterestShort: num(r["OpenInterest(Short)"]),
      openInterestNet: num(r["OpenInterest(Net)"]),
    });
  }
  if (!byCode.TX.length && !byCode.MTX.length) return null;
  return { asOf: date, byContract: byCode, source: URL_INST, sourcePage: URL_INST_PAGE };
}

function parseMargins(rows) {
  if (!Array.isArray(rows)) return null;
  const byCode = {};
  let date = null;
  for (const r of rows) {
    const code = MARGIN_NAME[r.Contract];
    if (!code) continue;
    date = date || ymdDash(r.Date) || r.Date;
    byCode[code] = {
      clearing: num(r.ClearingMargin),
      maintenance: num(r.MaintenanceMargin),
      initial: num(r.InitialMargin),
      currency: "TWD",
    };
  }
  if (!Object.keys(byCode).length) return null;
  return { asOf: date, byContract: byCode, source: URL_MARGIN, sourcePage: URL_MARGIN_PAGE };
}

function parsePcr(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const sorted = [...rows].sort((a, b) => String(b.Date).localeCompare(String(a.Date)));
  const r = sorted[0];
  return {
    asOf: ymdDash(r.Date) || r.Date,
    putVolume: num(r.PutVolume),
    callVolume: num(r.CallVolume),
    putCallVolumeRatioPct: num(r["PutCallVolumeRatio%"]),
    putOI: num(r.PutOI),
    callOI: num(r.CallOI),
    putCallOIRatioPct: num(r["PutCallOIRatio%"]),
    source: URL_PCR,
    noteZh: "期交所公告之臺指選擇權 Put/Call 彙總（非個別履約價）",
  };
}

function parseRecentSettlement(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  // Prefer TX/MTX/TMF monthly or weekly settlements
  const hits = rows.filter((r) => /TX|MTX|TMF|臺股/.test(String(r.Contract || "") + String(r.ContractName || "")));
  const list = (hits.length ? hits : rows)
    .map((r) => ({
      finalSettlementDay: ymdDash(r.TheFinalSettlementDay) || r.TheFinalSettlementDay,
      contract: r.Contract,
      contractName: r.ContractName,
      deliveryMonth: r.ContractDeliveryMonth || r.DeliveryMonth || null,
      finalSettlementPrice: num(r.TheFinalSettlementPrice),
    }))
    .filter((x) => x.finalSettlementPrice != null);
  list.sort((a, b) => String(b.finalSettlementDay).localeCompare(String(a.finalSettlementDay)));
  return list[0] || null;
}

function buildContractBlock(code, futRows, margins) {
  const meta = MULTIPLIERS[code];
  const picked = pickNearNext(futRows);
  const margin = margins?.byContract?.[code] || null;
  return {
    ...meta,
    near: picked.near,
    next: picked.next,
    listed: picked.all,
    margin,
  };
}

function loadLastGood() {
  for (const p of [OUT_PUBLIC, OUT_DOCS]) {
    if (fs.existsSync(p)) {
      try {
        return { path: p, data: JSON.parse(fs.readFileSync(p, "utf8")) };
      } catch {
        /* continue */
      }
    }
  }
  return null;
}

function writeBoth(payload) {
  const json = JSON.stringify(payload, null, 2) + "\n";
  fs.mkdirSync(path.dirname(OUT_PUBLIC), { recursive: true });
  fs.writeFileSync(OUT_PUBLIC, json);
  console.log("Wrote", OUT_PUBLIC);
  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    fs.mkdirSync(path.dirname(OUT_DOCS), { recursive: true });
    fs.writeFileSync(OUT_DOCS, json);
    console.log("Wrote", OUT_DOCS);
  }
}

async function main() {
  const blockers = [];
  const sourcesUsed = [];

  const [dailyFut, inst, margin, pcr, fsp, twse] = await Promise.all([
    fetchJson(URL_DAILY_FUT),
    fetchJson(URL_INST),
    fetchJson(URL_MARGIN),
    fetchJson(URL_PCR),
    fetchJson(URL_FSP),
    fetchJson(URL_TWSE_MI, { timeoutMs: 30000 }),
  ]);

  if (!dailyFut.ok) blockers.push(dailyFut.error);
  else sourcesUsed.push(URL_DAILY_FUT);
  if (!inst.ok) blockers.push(inst.error);
  else sourcesUsed.push(URL_INST);
  if (!margin.ok) blockers.push(margin.error);
  else sourcesUsed.push(URL_MARGIN);
  if (!pcr.ok) blockers.push(pcr.error);
  else sourcesUsed.push(URL_PCR);
  if (!fsp.ok) blockers.push(fsp.error);
  else sourcesUsed.push(URL_FSP);
  if (!twse.ok) blockers.push(twse.error);
  else sourcesUsed.push(URL_TWSE_MI);

  const txRows = dailyFut.ok ? parseFutRows(dailyFut.data, "TX") : [];
  const mtxRows = dailyFut.ok ? parseFutRows(dailyFut.data, "MTX") : [];
  const tmfRows = dailyFut.ok ? parseFutRows(dailyFut.data, "TMF") : [];
  const spot = twse.ok ? parseSpot(twse.data) : null;
  const institutional = inst.ok ? parseInstitutional(inst.data) : null;
  const margins = margin.ok ? parseMargins(margin.data) : null;
  const putCallRatio = pcr.ok ? parsePcr(pcr.data) : null;
  const recentSettlement = fsp.ok ? parseRecentSettlement(fsp.data) : null;

  const sessionDate =
    (txRows[0] && ymdDash(dailyFut.data?.find?.((r) => r.Contract === "TX")?.Date)) ||
    (Array.isArray(dailyFut.data) &&
      ymdDash(dailyFut.data.find((r) => r.Contract === "TX" && r.TradingSession === "一般")?.Date)) ||
    spot?.sessionDate ||
    null;

  if (!txRows.length || txRows[0]?.last == null) {
    const prev = loadLastGood();
    console.error("TX near-month quote missing from TAIFEX DailyMarketReportFut");
    if (prev?.data) {
      console.error("Keeping last-good at", prev.path);
      process.exit(1);
    }
    throw new Error("No TX data and no last-good snapshot");
  }

  const TX = buildContractBlock("TX", txRows, margins);
  const MTX = buildContractBlock("MTX", mtxRows, margins);
  const TMF = buildContractBlock("TMF", tmfRows, margins);

  const near = TX.near;
  const spotLast = spot?.last ?? null;
  const futLast = near?.last ?? near?.settle ?? null;
  let basis = null;
  if (spotLast != null && futLast != null) {
    const fb = futuresBasis(futLast, spotLast);
    const basisPoints = fb ? fb.basisPoints : null;
    const basisPct = fb ? fb.basisPct : null;
    basis = {
      nearMonth: near.month,
      futuresLast: futLast,
      futuresSettle: near.settle,
      spotLast,
      basisPoints,
      basisPct,
      noteZh: "基差 = 近月期貨最新價 − 現貨加權指數（正值＝期貨相對現貨溢價）",
    };
  }

  sourcesUsed.push(URL_MARGIN_PAGE);
  sourcesUsed.push(URL_OPENAPI);

  const payload = {
    market: "TW",
    desk: "txf",
    titleZh: "台指期",
    asOf: taipeiNowIso(),
    sessionDate,
    spot,
    basis,
    contracts: { TX, MTX, TMF },
    institutional,
    putCallRatio,
    calendar: {
      recentSettlement,
      nextNearLastTradingDay: near?.lastTradingDay || null,
      nextNearLastTradingDayBasis: near?.lastTradingDayBasis || null,
      nextNearMonth: near?.month || null,
      nextNextLastTradingDay: TX.next?.lastTradingDay || null,
      nextNextMonth: TX.next?.month || null,
      ruleZh:
        "月契約最後交易日＝該交割月份之第三個星期三（官方契約規格；假日調整以期交所公告為準）",
    },
    paperTrading: {
      market: "TW",
      books: "TW-only — do not mix with US paper book",
      pnlTwdFormula: "pointsDelta × multiplierTwdPerPoint × contracts",
      markPreference: ["settle", "last"],
      multipliers: {
        TX: MULTIPLIERS.TX.multiplierTwdPerPoint,
        MTX: MULTIPLIERS.MTX.multiplierTwdPerPoint,
        TMF: MULTIPLIERS.TMF.multiplierTwdPerPoint,
      },
      marginsAsOf: margins?.asOf || null,
      currency: "TWD",
      settlement: "cash",
      noteZh:
        "模擬／紙上交易可用：點數差 × 契約乘數 × 口數＝損益（新臺幣）；保證金用 official initial／maintenance。數字皆來自公開來源快照，非即時成交。",
    },
    disclaimers: [
      "投資涉及風險，資訊僅供參考，非投資建議。",
      "報價、未平倉、三大法人與保證金皆來自臺灣期貨交易所／證交所公開資料；缺欄不捏造。",
      "最後交易日若依規則推算，遇假日仍須對照期交所公告。",
      "美股與台股／台指期分欄；本區僅台灣指數期貨。",
    ],
    sources: sourcesUsed,
    sourcesDetail: [
      { id: "taifex-daily-fut", url: URL_DAILY_FUT, label: "TAIFEX 期貨每日交易行情" },
      { id: "taifex-inst", url: URL_INST, label: "TAIFEX 三大法人（各期貨契約）" },
      { id: "taifex-inst-page", url: URL_INST_PAGE, label: "TAIFEX 三大法人查詢頁" },
      { id: "taifex-margin", url: URL_MARGIN, label: "TAIFEX 指數期貨保證金 OpenAPI" },
      { id: "taifex-margin-page", url: URL_MARGIN_PAGE, label: "TAIFEX 保證金一覽表" },
      { id: "taifex-pcr", url: URL_PCR, label: "TAIFEX Put/Call Ratio" },
      { id: "taifex-fsp", url: URL_FSP, label: "TAIFEX 指數期貨最後結算價" },
      { id: "twse-mi", url: URL_TWSE_MI, label: "TWSE 發行量加權股價指數" },
    ],
    blockers,
  };

  writeBoth(payload);
  console.log(
    `TXF near ${near.month} last=${near.last} settle=${near.settle} OI=${near.openInterest}; spot=${spotLast}; basis=${basis?.basisPoints}; session=${sessionDate}; blockers=${blockers.length}`
  );
  if (blockers.length) {
    console.warn("Partial blockers:", blockers);
  }
}

main().catch((e) => {
  console.error(e);
  const prev = loadLastGood();
  if (prev?.data) console.error("Last-good retained at", prev.path);
  process.exit(1);
});
