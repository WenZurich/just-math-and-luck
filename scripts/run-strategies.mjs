#!/usr/bin/env node
/**
 * XQ-style multi-strategy logic screener (public data only).
 * Never invents PE / margins / institutional nets.
 *
 * Usage: node scripts/run-strategies.mjs
 * Writes: public/data/strategy-screener.json (+ docs/data/ if present)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTwFundamentalBundle, codeOfTicker } from "./tw-fundamentals.mjs";
import { sma, rsiLast2, volumeRatioVsPrev, priceShapeMetrics } from "./math-core.mjs";
import { buildAllMasters } from "./master-strategies.mjs";
import { buildAllGooayePacks, gooayeUniverseBoost } from "./gooaye-strategies.mjs";
// Peter Lynch now lives in master-strategies (TW MOPS, skip-if-missing).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public/data/strategy-screener.json");
const OUT_DOCS = path.join(ROOT, "docs/data/strategy-screener.json");
const LATEST = path.join(ROOT, "public/data/latest.json");

const UA =
  "Mozilla/5.0 (compatible; JustMathAndLuck/1.0; +https://github.com/WenZurich/Just-Math-and-Luck)";
const TW_LIQUID_ZHANG = 300; // 張
const TW_SHARES_PER_ZHANG = 1000;
const TW_MIN_AVG_VOL_SHARES = TW_LIQUID_ZHANG * TW_SHARES_PER_ZHANG; // 300,000 shares
const US_MIN_AVG_VOL = 500_000;
const CONCURRENCY = 6;
const YAHOO_RANGE = "6mo";

// —— helpers ——
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function taipeiYmd(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function barYmdTaipei(tsSec) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(tsSec * 1000));
}

function ymdToTwse(ymd) {
  return ymd.replace(/-/g, "");
}

function ymdToRocSlash(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y - 1911}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
}

function addDaysYmd(ymd, delta) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function parseNum(s) {
  if (s == null) return null;
  const t = String(s).replace(/,/g, "").replace(/%/g, "").trim();
  if (!t || t === "--" || t === "-" || t === "—") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// SMA / Wilder RSI live in math-core (guarded by math-guards: legacy oracle, bounds, invariances).

// —— Yahoo cookie/crumb ——
let yahooCookie = "";
let yahooCrumb = "";

async function ensureYahooCrumb() {
  if (yahooCrumb) return;
  try {
    const r1 = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": UA },
      redirect: "manual",
    });
    const set = r1.headers.getSetCookie?.() || [];
    yahooCookie = set.map((c) => c.split(";")[0]).join("; ");
    const r2 = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": UA, Cookie: yahooCookie },
    });
    if (r2.ok) yahooCrumb = (await r2.text()).trim();
  } catch (e) {
    console.warn("Yahoo crumb failed:", e.message);
  }
}

async function yahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&range=${YAHOO_RANGE}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r?.timestamp?.length) return null;
  const q = r.indicators?.quote?.[0] || {};
  const bars = [];
  for (let i = 0; i < r.timestamp.length; i++) {
    const c = q.close?.[i];
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const v = q.volume?.[i];
    if (c == null || v == null) continue;
    bars.push({
      t: r.timestamp[i],
      o: o ?? c,
      h: h ?? c,
      l: l ?? c,
      c,
      v,
    });
  }
  if (bars.length < 65) return null;
  return {
    symbol,
    name: r.meta?.shortName || r.meta?.longName || symbol,
    currency: r.meta?.currency || null,
    price: r.meta?.regularMarketPrice ?? bars[bars.length - 1].c,
    bars,
  };
}

async function yahooFundamentals(symbol) {
  await ensureYahooCrumb();
  if (!yahooCrumb) return null;
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
    symbol
  )}?modules=defaultKeyStatistics,financialData,incomeStatementHistoryQuarterly&crumb=${encodeURIComponent(
    yahooCrumb
  )}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Cookie: yahooCookie },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const block = json?.quoteSummary?.result?.[0];
  if (!block) return null;
  const raw = (x) => (x && typeof x === "object" && "raw" in x ? x.raw : x ?? null);
  const ks = block.defaultKeyStatistics || {};
  const fd = block.financialData || {};
  const iq = block.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
  const quarters = iq.map((s) => ({
    end: raw(s.endDate),
    revenue: raw(s.totalRevenue),
    operatingIncome: raw(s.operatingIncome),
    grossProfit: raw(s.grossProfit),
  }));
  return {
    trailingPE: raw(ks.trailingPE),
    forwardPE: raw(ks.forwardPE),
    debtToEquity: raw(fd.debtToEquity),
    revenueGrowth: raw(fd.revenueGrowth),
    earningsGrowth: raw(fd.earningsGrowth),
    grossMargins: raw(fd.grossMargins),
    operatingMargins: raw(fd.operatingMargins),
    quarters,
  };
}

// —— TWSE / TPEX ——
function decodeTwCsv(buf) {
  const asUtf = buf.toString("utf8");
  if (asUtf.includes("證券代號") || asUtf.includes("很抱歉")) return asUtf;
  try {
    return new TextDecoder("big5").decode(buf);
  } catch {
    return asUtf;
  }
}

async function fetchTwseMiIndex(ymd) {
  const date = ymdToTwse(ymd);
  const url = `https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?response=csv&date=${date}&type=ALLBUT0999`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const text = decodeTwCsv(buf);
  if (!text.includes("證券代號")) return null;
  const lines = text.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("證券代號") && lines[i].includes("本益比")) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  const rows = [];
  for (let i = start + 1; i < lines.length; i++) {
    let L = lines[i].trim();
    if (!L) {
      if (rows.length) break;
      continue;
    }
    if (L.startsWith("說明") || L.startsWith('"說明')) break;
    L = L.replace(/^=/, "");
    // naive CSV split respecting quotes
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let j = 0; j < L.length; j++) {
      const ch = L[j];
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === "," && !inQ) {
        cols.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    cols.push(cur);
    if (cols.length < 16) continue;
    const code = cols[0].trim();
    if (!/^\d{4}$/.test(code)) continue;
    if (code.startsWith("00")) continue; // ETF/ETN-ish
    const name = cols[1].trim();
    const volShares = parseNum(cols[2]);
    const close = parseNum(cols[8]);
    const pe = parseNum(cols[15]);
    rows.push({
      code,
      ticker: `${code}.TW`,
      name,
      volShares,
      close,
      pe: pe != null && pe > 0 ? pe : null,
      market: "TW",
    });
  }
  return rows;
}

async function fetchTwseT86(ymd) {
  const date = ymdToTwse(ymd);
  const url = `https://www.twse.com.tw/rwd/zh/fund/T86?response=csv&date=${date}&selectType=ALLBUT0999`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const text = decodeTwCsv(buf);
  if (!text.includes("證券代號") || text.includes("很抱歉")) return null;
  const lines = text.split(/\r?\n/);
  const map = new Map();
  for (const L0 of lines) {
    let L = L0.trim().replace(/^=/, "");
    if (!L || L.includes("證券代號") || L.startsWith("說明") || L.startsWith('"說明')) continue;
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let j = 0; j < L.length; j++) {
      const ch = L[j];
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === "," && !inQ) {
        cols.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    cols.push(cur);
    if (cols.length < 19) continue;
    const code = cols[0].trim();
    if (!/^\d{4}$/.test(code)) continue;
    // columns: 外陸資買賣超(2), 投信買賣超(10), 自營商買賣超(11), 三大法人合計(18)
    const foreign = parseNum(cols[4]); // 外陸資買賣超股數
    const trust = parseNum(cols[10]); // 投信買賣超
    const dealer = parseNum(cols[11]); // 自營商買賣超股數
    const total = parseNum(cols[18]);
    map.set(code, { foreign, trust, dealer, total, name: cols[1]?.trim() });
  }
  return map.size ? map : null;
}

async function fetchTpexInst(ymd) {
  const d = ymdToRocSlash(ymd);
  const url = `https://www.tpex.org.tw/web/stock/3insti/daily_trade/3itrade_hedge_result.php?l=zh-tw&d=${encodeURIComponent(
    d
  )}&se=EW&o=json`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.tables?.[0]?.data;
    if (!Array.isArray(data) || !data.length) return null;
    const map = new Map();
    for (const row of data) {
      const code = String(row[0] || "").trim();
      if (!/^\d{4}$/.test(code)) continue;
      // fields vary; typical: 代號 名稱 外資買/賣/超 投信買/賣/超 自營商...
      // Use last column as 三大法人合計 if present
      const total = parseNum(row[row.length - 1]);
      const foreign = parseNum(row[4]);
      const trust = parseNum(row[7]);
      const dealer = parseNum(row[10]);
      map.set(code, {
        foreign,
        trust,
        dealer,
        total,
        name: String(row[1] || "").trim(),
        board: "TPEX",
      });
    }
    return map.size ? map : null;
  } catch {
    return null;
  }
}

async function findLatestTwseSession(fromYmd, maxBack = 12) {
  let ymd = fromYmd;
  for (let i = 0; i < maxBack; i++) {
    const rows = await fetchTwseMiIndex(ymd);
    if (rows?.length) return { ymd, rows };
    ymd = addDaysYmd(ymd, -1);
    await sleep(200);
  }
  return null;
}

async function collectInstDays(endYmd, needDays = 5) {
  const days = [];
  let ymd = endYmd;
  for (let i = 0; i < 14 && days.length < needDays; i++) {
    const tw = await fetchTwseT86(ymd);
    const otc = await fetchTpexInst(ymd);
    if (tw || otc) {
      days.push({ ymd, tw: tw || new Map(), otc: otc || new Map() });
    }
    ymd = addDaysYmd(ymd, -1);
    await sleep(250);
  }
  return days;
}

function mergeInstDay(days, code) {
  // days[0] = most recent
  const one = days[0];
  const d0 = one.tw.get(code) || one.otc.get(code) || null;
  let f5 = 0,
    t5 = 0,
    dl5 = 0,
    tot5 = 0,
    n = 0;
  for (const day of days) {
    const x = day.tw.get(code) || day.otc.get(code);
    if (!x) continue;
    n++;
    f5 += x.foreign ?? 0;
    t5 += x.trust ?? 0;
    dl5 += x.dealer ?? 0;
    tot5 += x.total ?? 0;
  }
  return {
    d1: d0,
    sum5: n ? { foreign: f5, trust: t5, dealer: dl5, total: tot5, days: n } : null,
  };
}

// —— metrics from OHLCV ——
function techMetrics(bars) {
  const closes = bars.map((b) => b.c);
  const vols = bars.map((b) => b.v);
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const s5 = sma(closes, 5);
  const s10 = sma(closes, 10);
  const s20 = sma(closes, 20);
  const s60 = sma(closes, 60);
  const avg5Vol = sma(vols, 5);
  const volRatioYday = volumeRatioVsPrev(last.v, prev.v);
  const { prev: rsiPrev, cur: rsiCur } = rsiLast2(closes, 14);
  // price-shape % metrics live in guarded math-core (2026-10-21): positive-price domain, NaN ⇒ null
  const shape = priceShapeMetrics(bars, { s5, s10, s20 });
  const { fiveDayHigh, is5dHigh, ampPct, pct5d, high20, is20dHigh, distHigh20Pct, roc10, smaSpreadPct, aboveMaxSma } = shape;
  return {
    price: last.c,
    sma5: s5,
    sma10: s10,
    sma20: s20,
    sma60: s60,
    avgVol5: avg5Vol,
    volToday: last.v,
    volYday: prev.v,
    volRatioYday,
    is5dHigh,
    fiveDayHigh,
    ampPct,
    rsi: rsiCur,
    rsiPrev,
    pct5d,
    dayPct: shape.dayPct,
    high20,
    is20dHigh,
    distHigh20Pct,
    roc10,
    smaSpreadPct,
    aboveMaxSma,
  };
}

function sharesToZhang(shares) {
  if (shares == null) return null;
  return shares / TW_SHARES_PER_ZHANG;
}

function marginRelGrowth(cur, prev) {
  if (cur == null || prev == null) return null;
  if (!(Math.abs(prev) > 1e-9)) return null;
  return (cur - prev) / Math.abs(prev);
}

// —— strategies ——
function cond(text, status = "pass") {
  return { text, status };
}

function buildPeterLynch() {
  // Moved to master-strategies.mjs (TW-only MOPS calibration).
  return null;
}

function buildMarginGrowth(universe, fundMap, twMarginByCode) {
  const growthOkSeries = (arr) => {
    // QoQ fallback disabled for XQ calibration — prefer honest YoY pairing only
    return false;
  };

  const consecutiveYoyOk = (series) => {
    // Require last TWO consecutive seasons each to have YoY (same season prior year) OM or GM growth >10%
    if (!series?.length) return null;
    const byKey = new Map(series.map((s) => [`${s.year}-${s.season}`, s]));
    const chron = [...series].filter((s) => s.year != null && s.season != null);
    if (chron.length < 2) return null;
    const last = chron[chron.length - 1];
    const prevSeason = chron[chron.length - 2];
    // Must be consecutive seasons (e.g. 115Q1 then 115Q2, or 114Q4 then 115Q1)
    const consecutive =
      (last.year === prevSeason.year && last.season === prevSeason.season + 1) ||
      (last.year === prevSeason.year + 1 && last.season === 1 && prevSeason.season === 4);
    if (!consecutive) return null;

    const pairYoy = (s) => {
      const yoyBase = byKey.get(`${s.year - 1}-${s.season}`);
      if (!yoyBase) return null;
      return {
        label: s.label,
        gGm: marginRelGrowth(s.gm, yoyBase.gm),
        gOm: marginRelGrowth(s.om, yoyBase.om),
        baseLabel: yoyBase.label,
      };
    };
    const a = pairYoy(prevSeason);
    const b = pairYoy(last);
    if (!a || !b) return null;
    const yoyGm =
      a.gGm != null && b.gGm != null && a.gGm > 0.1 && b.gGm > 0.1;
    const yoyOm =
      a.gOm != null && b.gOm != null && a.gOm > 0.1 && b.gOm > 0.1;
    if (!(yoyGm || yoyOm)) return null;
    return {
      yoyGm,
      yoyOm,
      gmYoy: [a.gGm, b.gGm].map((x) => (x != null ? round(x * 100, 1) : null)),
      omYoy: [a.gOm, b.gOm].map((x) => (x != null ? round(x * 100, 1) : null)),
      pairLabels: [
        `${prevSeason.label} vs ${a.baseLabel}`,
        `${last.label} vs ${b.baseLabel}`,
      ],
    };
  };

  const hits = [];
  let usableSeries = 0;
  let twSeriesNames = 0;

  for (const u of universe) {
    if (u.market !== "TW") continue; // financial master/財務：台股 only
    let series = null;
    let source = null;

    const code = codeOfTicker(u.ticker);
    const raw = twMarginByCode?.get(code);
    if (raw?.length) {
      twSeriesNames++;
      series = raw.map((q) => ({
        label: `${q.year}Q${q.season}`,
        year: q.year,
        season: q.season,
        gm: q.grossMargin,
        om: q.operatingMargin,
        name: q.name,
      }));
      source = raw[raw.length - 1]?.source || "mops";
    }

    if (!series?.length) continue;
    const gmArr = series.map((s) => s.gm);
    const omArr = series.map((s) => s.om);
    const usable =
      gmArr.filter((x) => x != null).length >= 2 ||
      omArr.filter((x) => x != null).length >= 2;
    if (!usable) continue;
    usableSeries++;

    const yoy = consecutiveYoyOk(series);
    if (!yoy) continue;

    hits.push({
      ticker: u.ticker,
      name: u.name || series[series.length - 1]?.name || u.ticker,
      market: "TW",
      currency: "TWD",
      metrics: {
        opMargins: omArr.map((x) => (x != null ? round(x * 100, 2) : null)),
        grossMargins: gmArr.map((x) => (x != null ? round(x * 100, 2) : null)),
        seasons: series.map((s) => s.label),
        mode: "YoY",
        yoyGmPct: yoy.gmYoy,
        yoyOmPct: yoy.omYoy,
        yoyPairs: yoy.pairLabels,
        source,
      },
    });
  }

  hits.sort((a, b) => {
    const am = a.metrics.opMargins?.filter((x) => x != null).at(-1) ?? -999;
    const bm = b.metrics.opMargins?.filter((x) => x != null).at(-1) ?? -999;
    return bm - am;
  });

  if (usableSeries === 0) {
    return {
      id: "margin-up",
      name: "公司獲利遞增",
      category: "基本",
      categoryGroup: "基本",
      xqTags: ["基本", "財務"],
      description: "目標：連續 2 季 YoY 營益率或毛利率成長 >10%。今日公開資料不足。",
      conditions: [
        cond("連續 2 季 YoY 營益率或毛利率成長 >10%", "skip"),
      ],
      hits: [],
      blockers: [
        "公開季報毛利率／營益率序列不足（MOPS 綜合損益），無法計算連續 YoY 成長。",
      ],
      incomplete: true,
      incompleteLabel: "資料不足",
      dataCoverage: { twSeriesNames, usableSeries },
      calibrationNotes: {
        matchedXq: ["連續2季 YoY 營益率或毛利率成長>10%"],
        stillDiffers: ["QoQ 路徑已關閉以避免誤標"],
      },
    };
  }

  return {
    id: "margin-up",
    name: "公司獲利遞增",
    category: "基本",
    categoryGroup: "基本",
    xqTags: ["基本", "財務"],
    description:
      "僅台股。連續兩個相鄰季別，各自相對「去年同季」營益率或毛利率成長 >10%（單季毛利／營益推算；缺序列則略過）。",
    conditions: [
      cond(
        "連續 2 季 YoY（對去年同季）營益率或毛利率成長 >10%",
        hits.length ? "pass" : "fail"
      ),
    ],
    hits: hits.slice(0, 80),
    blockers: hits.length
      ? []
      : ["有抓到可用毛利／營益序列，但宇宙內無標的滿足連續 2 季 YoY 成長 >10%"],
    notes: [
      `台股序列來源：MOPS 綜合損益單季拆解；宇宙內 ${twSeriesNames} 檔有序列、可用 ${usableSeries}。`,
      "創見等高營益率經 MOPS 營業利益÷營業收入核對；記憶體景氣高峰可出現極端值，非錯欄。",
    ],
    incomplete: false,
    dataCoverage: { twSeriesNames, usableSeries, hits: hits.length },
    calibrationNotes: {
      matchedXq: ["連續2季 YoY 營益率或毛利率相對成長>10%", "僅台股"],
      stillDiffers: [
        "已關閉 QoQ OR 路徑（先前易膨脹命中）",
        "毛利率／營益率用單季金額推算，非 t163sb06 官方％表（缺該表時較穩）",
      ],
      yoyPairing: "last two consecutive seasons each vs same season prior year (e.g. 115Q1 vs 114Q1, 115Q2 vs 114Q2)",
    },
  };
}

function buildMaBull(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue; // keep TW/US hit lists unmixed; US technical would be a separate strategy
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (m.sma5 == null || m.sma10 == null || m.sma20 == null || m.sma60 == null) continue;
    if (!(m.sma5 > m.sma10 && m.sma10 > m.sma20 && m.sma20 > m.sma60)) continue;
    if (!m.is5dHigh) continue;
    if (m.volRatioYday == null || !(m.volRatioYday > 2)) continue;
    hits.push({
      ticker: u.ticker,
      name: u.name || chart.name,
      market: u.market,
      currency: u.market === "TW" ? "TWD" : "USD",
      metrics: {
        price: round(m.price, 2),
        dayPct: round(m.dayPct, 2),
        sma5: round(m.sma5, 2),
        sma10: round(m.sma10, 2),
        sma20: round(m.sma20, 2),
        sma60: round(m.sma60, 2),
        volRatioYday: round(m.volRatioYday, 2),
        volToday: Math.round(m.volToday),
        volYday: Math.round(m.volYday),
        volTodayZhang:
          u.market === "TW" ? round(sharesToZhang(m.volToday), 1) : null,
        is5dHigh: true,
        pct5d: round(m.pct5d, 2),
      },
    });
  }
  hits.sort((a, b) => (b.metrics.volRatioYday ?? 0) - (a.metrics.volRatioYday ?? 0));
  return {
    id: "ma-bull",
    name: "均線多頭排列",
    category: "技術",
    categoryGroup: "技術",
    xqTags: ["技術", "價量"],
    description: "SMA5>SMA10>SMA20>SMA60，創新高＋量能放大。完全由 OHLCV 計算。",
    conditions: [
      cond("SMA5 > SMA10 > SMA20 > SMA60"),
      cond("最新K棒創近 5 日高（最高價或收盤價 ≥ 前 5 日最高；非宣稱「今日」若 bar 為前一交易日）"),
      cond("成交量 > 昨日成交量 × 2"),
    ],
    hits,
    blockers: [],
    incomplete: false,
    calibrationNotes: {
      matchedXq: ["SMA5>10>20>60", "近5日高", "量>昨×2"],
      stillDiffers: ["條件用最新可用 K 棒，不宣稱今日若 bar 為前一交易日"],
    },
  };
}

function buildInstSync(instDays, universe) {
  if (!instDays?.length) {
    return {
      id: "inst-sync",
      name: "法人同步做多",
      category: "籌碼",
      categoryGroup: "籌碼",
      xqTags: ["籌碼"],
      description: "外資／投信／自營商同步淨買超（僅台股公開三大法人）。",
      conditions: [
        cond("外資近 1 日淨買超 > 0", "skip"),
        cond("投信近 1 日淨買超 > 0", "skip"),
        cond("自營商近 1 日淨買超 > 0", "skip"),
        cond("三大法人近 5 日合計淨買超 > 0", "skip"),
      ],
      hits: [],
      blockers: ["公開籌碼接口今日無法取得"],
      incomplete: true,
      incompleteLabel: "公開籌碼接口今日無法取得",
    };
  }
  const hits = [];
  const twUniverse = universe.filter((u) => u.market === "TW");
  for (const u of twUniverse) {
    const code = u.ticker.replace(/\.TW$/, "").replace(/\.TWO$/, "");
    const { d1, sum5 } = mergeInstDay(instDays, code);
    if (!d1 || !sum5) continue;
    const f1 = d1.foreign ?? 0;
    const t1 = d1.trust ?? 0;
    const dlr1 = d1.dealer ?? 0;
    // XQ-calibrated 張 thresholds (1 張 = 1,000 股). US never included.
    const ZHANG = 1000;
    if (!(f1 > 100 * ZHANG && t1 > 100 * ZHANG && dlr1 > 100 * ZHANG)) continue;
    if (
      !(
        sum5.foreign > 500 * ZHANG &&
        sum5.trust > 300 * ZHANG &&
        sum5.dealer > 300 * ZHANG
      )
    )
      continue;
    hits.push({
      ticker: u.ticker,
      name: u.name || d1.name,
      market: "TW",
      currency: "TWD",
      metrics: {
        foreignNet1dShares: f1,
        foreignNet1dZhang: round(sharesToZhang(f1), 1),
        trustNet1dShares: t1,
        trustNet1dZhang: round(sharesToZhang(t1), 1),
        dealerNet1dShares: dlr1,
        dealerNet1dZhang: round(sharesToZhang(dlr1), 1),
        foreignNet5dZhang: round(sharesToZhang(sum5.foreign), 1),
        trustNet5dZhang: round(sharesToZhang(sum5.trust), 1),
        dealerNet5dZhang: round(sharesToZhang(sum5.dealer), 1),
        instNet5dShares: sum5.total,
        instNet5dZhang: round(sharesToZhang(sum5.total), 1),
        instDaysCovered: sum5.days,
      },
    });
  }
  hits.sort((a, b) => (b.metrics.instNet5dShares ?? 0) - (a.metrics.instNet5dShares ?? 0));
  return {
    id: "inst-sync",
    name: "法人同步做多",
    category: "籌碼",
    categoryGroup: "籌碼",
    xqTags: ["籌碼"],
    description:
      "僅台股。XQ 校準：1日外資／投信／自營各＞100張；5日外資＞500、投信＞300、自營＞300。公開證交所／櫃買三大法人，非券商專有庫。",
    conditions: [
      cond("外資近 1 日淨買超 > 100 張", hits.length ? "pass" : "fail"),
      cond("投信近 1 日淨買超 > 100 張", hits.length ? "pass" : "fail"),
      cond("自營商近 1 日淨買超 > 100 張", hits.length ? "pass" : "fail"),
      cond("外資近 5 日合計淨買超 > 500 張", hits.length ? "pass" : "fail"),
      cond("投信近 5 日合計淨買超 > 300 張", hits.length ? "pass" : "fail"),
      cond("自營商近 5 日合計淨買超 > 300 張", hits.length ? "pass" : "fail"),
    ],
    hits: hits.slice(0, 80),
    blockers: hits.length
      ? []
      : [
          "本 session 無標的同時通過 1d 各>100張 且 5d 外資>500／投信>300／自營>300（門檻已對齊 XQ，寧可空清單不放寬）",
        ],
    incomplete: false,
    notes: [
      `籌碼交易日樣本：${instDays.map((d) => d.ymd).join(", ")}`,
      "單位：公開資料為股；1 張 = 1,000 股。",
    ],
    calibrationNotes: {
      matchedXq: [
        "1d 外資>100張、投信>100張、自營>100張",
        "5d 外資>500、投信>300、自營>300",
        "僅台股、不含美股",
      ],
      stillDiffers: [
        "XQ 畫面可能另含成交值／排除處置股等；此處未複製全部濾網",
        "自營商欄位含避險與否依證交所 T86／櫃買欄位解析，可能與 XQ 自營定義略有差異",
        "近5日自營合計>300張在實務上很少與三法人1日同步同時成立，故命中常為0属預期",
      ],
      dataAsOfHint: "sessionDate + inst day sample in notes",
    },
  };
}

function buildUltraShort(universe, ohlcvMap) {
  const hits = [];
  const unchecked = [
    "融資餘額／增減（無公開穩定接口 → 未檢查，不算通過）",
    "融券餘額／增減（無公開穩定接口 → 未檢查，不算通過）",
  ];
  for (const u of universe) {
    if (u.market !== "TW") continue; // XQ 超短線作多為台股籌碼／價量綜合；美股另開技術策略
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (!(m.price > 10)) continue;
    if (!(m.avgVol5 != null && m.avgVol5 > TW_MIN_AVG_VOL_SHARES)) continue;
    if (m.rsi == null || m.rsiPrev == null) continue;
    // RSI rising while below 50 (golden-cross proxy)
    const rsiRisingBelow50 = m.rsi > m.rsiPrev && m.rsi < 50;
    if (!rsiRisingBelow50) continue;
    if (m.ampPct == null || !(m.ampPct > 3)) continue;
    hits.push({
      ticker: u.ticker,
      name: u.name || chart.name,
      market: "TW",
      currency: "TWD",
      metrics: {
        price: round(m.price, 2),
        dayPct: round(m.dayPct, 2),
        rsi: round(m.rsi, 2),
        rsiPrev: round(m.rsiPrev, 2),
        ampPct: round(m.ampPct, 2),
        avgVol5Shares: Math.round(m.avgVol5),
        avgVol5Zhang: round(sharesToZhang(m.avgVol5), 1),
        pct5d: round(m.pct5d, 2),
      },
    });
  }
  hits.sort((a, b) => (b.metrics.ampPct ?? 0) - (a.metrics.ampPct ?? 0));
  return {
    id: "ultra-short",
    name: "超短線作多",
    category: "技術",
    categoryGroup: "技術",
    xqTags: ["技術", "超短線"],
    description:
      "僅台股。價＞10、5日均量＞300張、RSI(14)＜50且較昨上升、振幅＞3%。融資／融券未取得公開穩定資料 → 標為未檢查（略過），不視為通過。",
    conditions: [
      cond("股價 > 10"),
      cond(`5 日均量 > ${TW_LIQUID_ZHANG} 張`),
      cond("RSI(14) 在 50 以下且較前一日上升（黃金交叉代理）"),
      cond("當日振幅（高−低）／昨收 > 3%"),
      cond("融資條件（未檢查）", "skip"),
      cond("融券條件（未檢查）", "skip"),
    ],
    hits,
    blockers: [],
    unchecked,
    incomplete: false,
    incompleteFilters: ["融資", "融券"],
    calibrationNotes: {
      matchedXq: ["價>10", "5日均量>300張", "RSI<50拐頭向上代理", "振幅>3%", "僅台股"],
      stillDiffers: [
        "融資／融券增減未檢查（略過／incomplete filter，非通過）",
        "XQ RSI 黃金交叉定義可能用不同週期或交叉點，此為代理",
      ],
    },
  };
}


function twHitBase(u, chart, m, extra = {}) {
  return {
    ticker: u.ticker,
    name: u.name || chart.name,
    market: "TW",
    currency: "TWD",
    metrics: {
      price: round(m.price, 2),
      dayPct: round(m.dayPct, 2),
      pct5d: round(m.pct5d, 2),
      avgVol5Zhang: m.avgVol5 != null ? round(sharesToZhang(m.avgVol5), 1) : null,
      volRatioYday: m.volRatioYday != null ? round(m.volRatioYday, 2) : null,
      ...extra,
    },
  };
}

function buildMaTangleBreak(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (m.smaSpreadPct == null || !(m.smaSpreadPct < 1.5)) continue;
    if (!m.aboveMaxSma) continue;
    if (m.volRatioYday == null || !(m.volRatioYday > 1.5)) continue;
    if (!(m.dayPct != null && m.dayPct > 0)) continue;
    hits.push(
      twHitBase(u, chart, m, {
        smaSpreadPct: round(m.smaSpreadPct, 2),
        sma5: round(m.sma5, 2),
        sma10: round(m.sma10, 2),
        sma20: round(m.sma20, 2),
      })
    );
  }
  hits.sort((a, b) => (b.metrics.volRatioYday ?? 0) - (a.metrics.volRatioYday ?? 0));
  return {
    id: "ma-tangle-break",
    name: "帶量突破均線糾結近似",
    category: "技術",
    categoryGroup: "技術",
    xqTags: ["技術", "價量"],
    description:
      "SMA5/10/20 糾結（最大−最小）／中價 < 1.5%，收盤站上最高均線，量>昨×1.5，日漲>0。公開 OHLCV 近似，非券商專有「糾結突破」定義。",
    conditions: [
      cond("SMA5／10／20 糾結幅度 < 1.5%"),
      cond("收盤 ≥ max(SMA5,SMA10,SMA20)"),
      cond("成交量 > 昨日 × 1.5"),
      cond("日漲幅 > 0"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
    calibrationNotes: {
      matchedXq: ["均線糾結＋帶量突破（近似）"],
      stillDiffers: ["XQ 糾結參數／量能定義可能不同"],
    },
  };
}

function buildNewHighMomentum(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (!m.is20dHigh) continue;
    if (m.pct5d == null || !(m.pct5d > 3)) continue;
    if (m.volRatioYday == null || !(m.volRatioYday > 1.2)) continue;
    hits.push(
      twHitBase(u, chart, m, {
        high20: round(m.high20, 2),
        distHigh20Pct: round(m.distHigh20Pct, 2),
        is20dHigh: true,
      })
    );
  }
  hits.sort((a, b) => (b.metrics.pct5d ?? 0) - (a.metrics.pct5d ?? 0));
  return {
    id: "new-high-momentum",
    name: "創新高動能",
    category: "技術",
    categoryGroup: "技術",
    xqTags: ["技術"],
    description: "收盤創近20日高（含當日），5日漲幅>3%，量>昨×1.2。",
    conditions: [
      cond("收盤或最高價創近 20 日高"),
      cond("5 日漲幅 > 3%"),
      cond("成交量 > 昨日 × 1.2"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
  };
}

function buildShortRoc(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (!(m.price > 10)) continue;
    if (!(m.avgVol5 != null && m.avgVol5 > TW_MIN_AVG_VOL_SHARES)) continue;
    if (m.roc10 == null || !(m.roc10 > 8)) continue;
    hits.push(
      twHitBase(u, chart, m, {
        roc10: round(m.roc10, 2),
      })
    );
  }
  hits.sort((a, b) => (b.metrics.roc10 ?? 0) - (a.metrics.roc10 ?? 0));
  return {
    id: "short-roc",
    name: "短線動能（ROC）",
    category: "技術",
    categoryGroup: "技術",
    xqTags: ["技術"],
    description: "ROC(10)>8% 作 MTM／動能代理；價>10、5日均量>300張。",
    conditions: [
      cond("股價 > 10"),
      cond(`5 日均量 > ${TW_LIQUID_ZHANG} 張`),
      cond("ROC(10) > 8%（MTM 代理）"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
    calibrationNotes: {
      matchedXq: ["短線動能／ROC 近似"],
      stillDiffers: ["XQ 可能用 MTM 或不同週期"],
    },
  };
}

function buildDayUp5(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (m.dayPct == null || !(m.dayPct > 5)) continue;
    if (!(m.avgVol5 != null && m.avgVol5 > TW_MIN_AVG_VOL_SHARES)) continue;
    hits.push(twHitBase(u, chart, m));
  }
  hits.sort((a, b) => (b.metrics.dayPct ?? 0) - (a.metrics.dayPct ?? 0));
  return {
    id: "day-up-5",
    name: "單日漲幅>5%",
    category: "綜合",
    categoryGroup: "綜合",
    xqTags: ["綜合", "價量"],
    description: "日漲幅>5% 且 5日均量>300張（台股）。",
    conditions: [cond("日漲幅 > 5%"), cond(`5 日均量 > ${TW_LIQUID_ZHANG} 張`)],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
  };
}

function buildPct5d10(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (m.pct5d == null || !(m.pct5d > 10)) continue;
    if (!(m.avgVol5 != null && m.avgVol5 > TW_MIN_AVG_VOL_SHARES)) continue;
    hits.push(twHitBase(u, chart, m));
  }
  hits.sort((a, b) => (b.metrics.pct5d ?? 0) - (a.metrics.pct5d ?? 0));
  return {
    id: "pct5d-10",
    name: "5日漲幅>10%",
    category: "綜合",
    categoryGroup: "綜合",
    xqTags: ["綜合", "價量"],
    description: "近5日漲幅>10% 且 5日均量>300張（台股）。",
    conditions: [cond("5 日漲幅 > 10%"), cond(`5 日均量 > ${TW_LIQUID_ZHANG} 張`)],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
  };
}

function buildNearHigh(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (m.distHigh20Pct == null || !(m.distHigh20Pct >= -1 && m.distHigh20Pct <= 0.05)) continue;
    if (!(m.dayPct != null && m.dayPct >= 0)) continue;
    hits.push(
      twHitBase(u, chart, m, {
        high20: round(m.high20, 2),
        distHigh20Pct: round(m.distHigh20Pct, 2),
      })
    );
  }
  hits.sort((a, b) => (b.metrics.dayPct ?? 0) - (a.metrics.dayPct ?? 0));
  return {
    id: "near-high",
    name: "創近高",
    category: "綜合",
    categoryGroup: "綜合",
    xqTags: ["綜合", "價量"],
    description: "收盤距20日高 ≤ 1%（含略創新高），且日漲≥0。",
    conditions: [
      cond("收盤距 20 日高 ≤ 1%"),
      cond("日漲幅 ≥ 0"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
  };
}

function buildEarningsSteady(universe, twMarginByCode) {
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const code = u.ticker.replace(/\.TW$/, "").replace(/\.TWO$/, "");
    const series = twMarginByCode.get(code);
    if (!series || series.length < 2) continue;
    const last2 = series.slice(-2);
    const oms = last2.map((s) => s.operatingMargin);
    if (oms.some((x) => x == null || !(x > 0.08))) continue;
    hits.push({
      ticker: u.ticker,
      name: u.name || last2.at(-1)?.name || code,
      market: "TW",
      currency: "TWD",
      metrics: {
        opMargins: series.slice(-4).map((s) => (s.operatingMargin != null ? round(s.operatingMargin * 100, 2) : null)),
        yoyOmPct: null,
        source: last2.at(-1)?.source || "mops",
      },
    });
  }
  hits.sort((a, b) => (b.metrics.opMargins?.at(-1) ?? 0) - (a.metrics.opMargins?.at(-1) ?? 0));
  return {
    id: "earnings-steady",
    name: "公司獲利穩健",
    category: "基本",
    categoryGroup: "基本",
    xqTags: ["基本", "財務"],
    description: "最近連續2季營益率皆 > 8%（公開季報）。較「獲利遞增」寬鬆的穩健篩。",
    conditions: [cond("最近連續 2 季營益率皆 > 8%")],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
  };
}

function buildLowPeSmall(universe, ohlcvMap, peMap) {
  const hits = [];
  let peCovered = 0;
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const pe = peMap.get(u.ticker);
    if (pe != null) peCovered++;
    const chart = ohlcvMap.get(u.ticker);
    if (!chart) continue;
    const m = techMetrics(chart.bars);
    if (pe == null || !(pe > 0 && pe < 15)) continue;
    if (!(m.price > 0 && m.price < 50)) continue;
    if (!(m.avgVol5 != null && m.avgVol5 > TW_MIN_AVG_VOL_SHARES)) continue;
    hits.push(
      twHitBase(u, chart, m, {
        pe: round(pe, 2),
        marketCapHint: "股價<50 代理小型（無完整市值則不宣稱市值）",
      })
    );
  }
  hits.sort((a, b) => (a.metrics.pe ?? 99) - (b.metrics.pe ?? 99));
  const incomplete = peCovered < 50;
  return {
    id: "low-pe-small",
    name: "低PE小型",
    category: "基本",
    categoryGroup: "基本",
    xqTags: ["基本", "財務"],
    description:
      "PE<15 且股價<50（市值公開不全時以股價代理小型，條件中標示代理）。5日均量>300張。",
    conditions: [
      cond("本益比 PE < 15"),
      cond("股價 < 50（小型代理，非市值）"),
      cond(`5 日均量 > ${TW_LIQUID_ZHANG} 張`),
    ],
    hits: hits.slice(0, 80),
    blockers: incomplete
      ? ["本益比覆蓋偏低或市值缺欄；已用股價代理小型，請勿當成完整市值篩"]
      : ["市值缺公開完整欄位 → 以股價<50 代理小型"],
    incomplete: false,
    notes: ["市值無穩定公開欄位時不以捏造市值篩選；股價代理已標示"],
  };
}

/** TDCC 集保戶股權分散表（公開週資料）— 分級 12–15 視為大戶代理 */
async function fetchTdccLargeHolders() {
  const url = "https://smart.tdcc.com.tw/opendata/getOD.ashx?id=1-5";
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.includes("證券代號") && !text.includes("持股分級")) return null;
    const lines = text.split(/\r?\n/);
    const byCode = new Map();
    for (const L0 of lines.slice(1)) {
      const L = L0.trim();
      if (!L) continue;
      const cols = L.split(",");
      if (cols.length < 6) continue;
      const ymdRaw = String(cols[0] || "").trim();
      const code = String(cols[1] || "").trim();
      const level = Number(cols[2]);
      const holders = Number(String(cols[3] || "").replace(/,/g, ""));
      const shares = Number(String(cols[4] || "").replace(/,/g, ""));
      const pct = Number(String(cols[5] || "").replace(/,/g, ""));
      if (!/^\d{4,6}$/.test(code)) continue;
      if (!(level >= 1 && level <= 15)) continue;
      const key = code.length > 4 ? code.replace(/^0+/, "").padStart(4, "0").slice(-4) : code;
      if (!/^\d{4}$/.test(key)) continue;
      if (!byCode.has(key)) {
        byCode.set(key, {
          asOf: /^\d{8}$/.test(ymdRaw)
            ? `${ymdRaw.slice(0, 4)}-${ymdRaw.slice(4, 6)}-${ymdRaw.slice(6, 8)}`
            : ymdRaw,
          megaPct: 0,
          megaHolders: 0,
          largePct: 0,
          largeHolders: 0,
        });
      }
      const rec = byCode.get(key);
      if (!Number.isFinite(pct)) continue;
      if (level === 15) {
        rec.megaPct += pct;
        if (Number.isFinite(holders)) rec.megaHolders += holders;
      }
      if (level >= 12 && level <= 15) {
        rec.largePct += pct;
        if (Number.isFinite(holders)) rec.largeHolders += holders;
      }
      void shares;
    }
    return byCode.size ? byCode : null;
  } catch {
    return null;
  }
}

/** TWSE 持股逾 10% 大股東名單（公開；僅名稱／家數，無持股％） */
async function fetchTwseMajorShareholders() {
  try {
    const res = await fetch("https://openapi.twse.com.tw/v1/opendata/t187ap02_L", {
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows)) return null;
    const map = new Map();
    for (const r of rows) {
      const code = String(r["公司代號"] || "").trim();
      if (!/^\d{4}$/.test(code)) continue;
      const name = String(r["大股東名稱"] || "").trim();
      if (!map.has(code)) map.set(code, { name: String(r["公司名稱"] || "").trim(), majors: [] });
      if (name) map.get(code).majors.push(name);
    }
    return map.size ? map : null;
  } catch {
    return null;
  }
}

function foreignBuyStreak(instDays, code) {
  let streak = 0;
  for (const day of instDays) {
    const x = day.tw.get(code) || day.otc.get(code);
    if (!x || !(x.foreign > 0)) break;
    streak++;
  }
  return streak;
}

function buildChipMainForce(instDays, universe) {
  // 公開「法人買賣超動能」— 誠實標籤，非券商主力分點
  if (!instDays?.length) return null;
  const ZHANG = 1000;
  const hits = [];
  for (const u of universe.filter((x) => x.market === "TW")) {
    const code = u.ticker.replace(/\.TW$/, "").replace(/\.TWO$/, "");
    const { d1, sum5 } = mergeInstDay(instDays.slice(0, 5), code);
    if (!d1 || !sum5 || sum5.days < 3) continue;
    const tot1 = d1.total ?? 0;
    const tot5 = sum5.total ?? 0;
    const f5 = sum5.foreign ?? 0;
    // 動能：近1日合計買超 + 近5日合計買超 + 外資5日買超
    if (!(tot1 > 300 * ZHANG && tot5 > 1500 * ZHANG && f5 > 800 * ZHANG)) continue;
    hits.push({
      ticker: u.ticker,
      name: u.name || d1.name,
      market: "TW",
      currency: "TWD",
      metrics: {
        instNet1dZhang: round(sharesToZhang(tot1), 1),
        instNet5dZhang: round(sharesToZhang(tot5), 1),
        foreignNet5dZhang: round(sharesToZhang(f5), 1),
        trustNet5dZhang: round(sharesToZhang(sum5.trust), 1),
        dealerNet5dZhang: round(sharesToZhang(sum5.dealer), 1),
        instDaysCovered: sum5.days,
      },
    });
  }
  hits.sort((a, b) => (b.metrics.instNet5dZhang ?? 0) - (a.metrics.instNet5dZhang ?? 0));
  return {
    id: "chip-main-force",
    name: "法人買賣超動能",
    category: "籌碼",
    categoryGroup: "籌碼",
    xqTags: ["籌碼", "法人"],
    description:
      "公開證交所／櫃買三大法人多日買賣超動能（非券商「主力分點」）。1日合計＞300張、5日合計＞1500張、外資5日＞800張。",
    conditions: [
      cond("三大法人近 1 日合計淨買超 > 300 張", hits.length ? "pass" : "fail"),
      cond("三大法人近 5 日合計淨買超 > 1500 張", hits.length ? "pass" : "fail"),
      cond("外資近 5 日合計淨買超 > 800 張", hits.length ? "pass" : "fail"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
    notes: [
      `籌碼交易日樣本：${instDays.slice(0, 5).map((d) => d.ymd).join(", ")}`,
      "標籤刻意用「法人買賣超」；不做假「主力分點」。",
    ],
    calibrationNotes: {
      matchedXq: ["公開法人買賣超多日動能"],
      stillDiffers: ["非 XQ／券商主力分點庫；門檻為公開代理"],
      dataAsOfHint: "inst day sample in notes",
    },
  };
}

function buildChipForeignStreak(instDays, universe) {
  // 原 chip-branch 占位 → 外資連買（非分點）
  if (!instDays?.length) return null;
  const ZHANG = 1000;
  const hits = [];
  for (const u of universe.filter((x) => x.market === "TW")) {
    const code = u.ticker.replace(/\.TW$/, "").replace(/\.TWO$/, "");
    const streak = foreignBuyStreak(instDays, code);
    if (streak < 3) continue;
    const { d1, sum5 } = mergeInstDay(instDays.slice(0, 5), code);
    if (!sum5 || !(sum5.foreign > 500 * ZHANG)) continue;
    hits.push({
      ticker: u.ticker,
      name: u.name || d1?.name,
      market: "TW",
      currency: "TWD",
      metrics: {
        foreignBuyStreakDays: streak,
        foreignNet1dZhang: round(sharesToZhang(d1?.foreign ?? 0), 1),
        foreignNet5dZhang: round(sharesToZhang(sum5.foreign), 1),
        instNet5dZhang: round(sharesToZhang(sum5.total), 1),
        instDaysCovered: sum5.days,
      },
    });
  }
  hits.sort(
    (a, b) =>
      (b.metrics.foreignBuyStreakDays ?? 0) - (a.metrics.foreignBuyStreakDays ?? 0) ||
      (b.metrics.foreignNet5dZhang ?? 0) - (a.metrics.foreignNet5dZhang ?? 0)
  );
  return {
    id: "chip-branch",
    name: "外資連買",
    category: "籌碼",
    categoryGroup: "籌碼",
    xqTags: ["籌碼", "外資"],
    description:
      "公開外資連續淨買超（非券商分點庫）。連買 ≥3 日且近 5 日外資合計＞500 張。",
    conditions: [
      cond("外資連續淨買超 ≥ 3 個交易日", hits.length ? "pass" : "fail"),
      cond("外資近 5 日合計淨買超 > 500 張", hits.length ? "pass" : "fail"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
    notes: [
      `連買樣本最長可回溯 ${instDays.length} 日：${instDays.map((d) => d.ymd).join(", ")}`,
      "原「分點籌碼」占位已改為公開外資連買；不做假分點。",
    ],
    calibrationNotes: {
      matchedXq: ["外資連買日數公開代理"],
      stillDiffers: ["非券商營業員分點彙總"],
    },
  };
}

function buildChipLargeHolders(tdccMap, majorsMap, universe) {
  if (!tdccMap?.size) return null;
  const hits = [];
  let asOfHint = null;
  for (const u of universe.filter((x) => x.market === "TW")) {
    const code = u.ticker.replace(/\.TW$/, "").replace(/\.TWO$/, "");
    const d = tdccMap.get(code);
    if (!d) continue;
    asOfHint = asOfHint || d.asOf;
    // 大戶集中：分級 12–15 合計佔比 ≥55% 且 >100 萬股級（15）≥40%
    if (!(d.largePct >= 55 && d.megaPct >= 40)) continue;
    const maj = majorsMap?.get(code);
    hits.push({
      ticker: u.ticker,
      name: u.name || maj?.name || code,
      market: "TW",
      currency: "TWD",
      metrics: {
        tdccAsOf: d.asOf,
        largeHolderPct: round(d.largePct, 2),
        megaHolderPct: round(d.megaPct, 2),
        largeHolderCount: d.largeHolders,
        megaHolderCount: d.megaHolders,
        major10pctCount: maj ? maj.majors.length : null,
      },
    });
  }
  hits.sort((a, b) => (b.metrics.megaHolderPct ?? 0) - (a.metrics.megaHolderPct ?? 0));
  return {
    id: "chip-large-holders",
    name: "集保大戶集中",
    category: "籌碼",
    categoryGroup: "籌碼",
    xqTags: ["籌碼", "集保"],
    description:
      "集保戶股權分散表（TDCC 公開週資料）：持股分級 12–15 合計佔比≥55%、分級15（>100萬股）≥40%。非即時「增減」；有公開週快照才入選。",
    conditions: [
      cond("集保分級 12–15 合計佔比 ≥ 55%", hits.length ? "pass" : "fail"),
      cond("集保分級 15（>100 萬股）佔比 ≥ 40%", hits.length ? "pass" : "fail"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
    notes: [
      asOfHint ? `TDCC 資料日期：${asOfHint}` : "TDCC 最新週快照",
      majorsMap?.size
        ? `另附證交所持股逾10%大股東家數（openapi t187ap02_L，僅家數非持股％）`
        : "大股東名單本日未併入",
      "不做假「大戶增減」；無週對週歷史時只標集中度。",
    ],
    calibrationNotes: {
      matchedXq: ["集保持股分級公開集中度"],
      stillDiffers: ["XQ 大戶增減常用週差；此處為單週集中度快照"],
    },
  };
}

async function buildPublicChipPacks(instDays, universe) {
  const packs = [];
  const main = buildChipMainForce(instDays, universe);
  if (main) packs.push(main);
  const foreign = buildChipForeignStreak(instDays, universe);
  if (foreign) packs.push(foreign);
  console.log("Fetching TDCC 集保戶股權分散表…");
  const tdcc = await fetchTdccLargeHolders();
  console.log("TDCC codes", tdcc?.size ?? 0);
  let majors = null;
  try {
    majors = await fetchTwseMajorShareholders();
    console.log("TWSE major-shareholder names", majors?.size ?? 0);
  } catch {
    majors = null;
  }
  const large = buildChipLargeHolders(tdcc, majors, universe);
  if (large) packs.push(large);
  else console.warn("chip-large-holders omitted — TDCC unavailable (no incomplete placeholder)");
  return packs;
}


function round(n, d) {
  if (n == null || Number.isNaN(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

// —— main ——
async function main() {
  console.log("▶ run-strategies: start");
  let latest = {};
  try {
    latest = JSON.parse(fs.readFileSync(LATEST, "utf8"));
  } catch {
    console.warn("latest.json missing — continuing with empty lists");
  }

  const todayTP = taipeiYmd();
  // If before ~09:00 Taipei market open, prefer previous calendar day walk
  const session = await findLatestTwseSession(todayTP);
  if (!session) {
    console.error("Could not load TWSE MI_INDEX — aborting technical still possible via Yahoo only");
  }
  const asOfYmd = session?.ymd || todayTP;
  console.log("TW session", asOfYmd, "MI rows", session?.rows?.length ?? 0);

  // Universe TW: top volume + existing picks
  const existingTw = [...(latest.tw || []), ...(latest.top5 || []).filter((x) => x.market === "TW")];
  const peMap = new Map();
  const nameMap = new Map();
  let twCandidates = [];
  if (session?.rows?.length) {
    const sorted = [...session.rows].sort((a, b) => (b.volShares || 0) - (a.volShares || 0));
    twCandidates = sorted.slice(0, 380);
    for (const r of session.rows) {
      if (r.pe != null) peMap.set(r.ticker, r.pe);
      nameMap.set(r.ticker, r.name);
    }
  }
  const twSet = new Map();
  for (const r of twCandidates) {
    twSet.set(r.ticker, {
      ticker: r.ticker,
      name: r.name,
      market: "TW",
      close: r.close,
    });
  }
  for (const s of existingTw) {
    const t = s.ticker.endsWith(".TW") || s.ticker.endsWith(".TWO") ? s.ticker : `${s.ticker}.TW`;
    if (!twSet.has(t)) {
      twSet.set(t, { ticker: t, name: s.name || nameMap.get(t) || t, market: "TW" });
    } else if (s.name) twSet.get(t).name = s.name;
  }
  // Extra liquid anchors
  for (const code of [
    "2330",
    "2317",
    "2308",
    "2454",
    "2382",
    "2303",
    "2881",
    "2882",
    "2891",
    "2886",
    "2002",
    "1301",
    "1303",
    "2412",
    "3008",
    "6669",
    "3037",
    "3711",
    "2376",
    "2357",
  ]) {
    const t = `${code}.TW`;
    if (!twSet.has(t))
      twSet.set(t, { ticker: t, name: nameMap.get(t) || t, market: "TW" });
  }

  // Placeholder for masterCandidateBoost — filled after fundamentals load
  let masterCandidateBoost = [];

  const existingUs = [...(latest.us || []), ...(latest.top5 || []).filter((x) => x.market === "US")];
  const usSet = new Map();
  for (const s of existingUs) {
    usSet.set(s.ticker, { ticker: s.ticker, name: s.name || s.ticker, market: "US" });
  }
  // ensure top5 US covered
  for (const t of ["AAPL", "NVDA", "MSFT", "META", "AMD", "CRWD", "ZS", "ARM", "LLY", "PANW"]) {
    if (!usSet.has(t)) usSet.set(t, { ticker: t, name: t, market: "US" });
  }

  const universe = [...twSet.values(), ...usSet.values()];
  console.log("Universe TW", twSet.size, "US", usSet.size, "total", universe.length);

  // Institutional 5d
  console.log("Fetching institutional days…");
  const instDays = await collectInstDays(asOfYmd, 10);
  console.log(
    "Inst days",
    instDays.length,
    instDays.map((d) => d.ymd).join(",")
  );

  // OHLCV
  console.log("Fetching Yahoo OHLCV…");
  const ohlcvMap = new Map();
  let ok = 0;
  let fail = 0;
  await mapPool(universe, CONCURRENCY, async (u) => {
    try {
      const c = await yahooChart(u.ticker);
      if (c) {
        ohlcvMap.set(u.ticker, c);
        if (!u.name || u.name === u.ticker) u.name = c.name;
        ok++;
      } else fail++;
    } catch {
      fail++;
    }
    await sleep(80);
  });
  console.log("OHLCV ok", ok, "fail", fail);

  // Fundamentals for PE growth (sample liquid + US) — rate limited
  console.log("Fetching Yahoo fundamentals (subset)…");
  await ensureYahooCrumb();
  const fundMap = new Map();
  const fundTargets = [
    ...[...twSet.values()].slice(0, 60),
    ...usSet.values(),
  ];
  await mapPool(fundTargets, 3, async (u) => {
    try {
      const f = await yahooFundamentals(u.ticker);
      if (f) {
        fundMap.set(u.ticker, f);
        if (f.trailingPE != null && !peMap.has(u.ticker)) peMap.set(u.ticker, f.trailingPE);
      }
    } catch {
      /* ignore */
    }
    await sleep(120);
  });
  console.log("Fundamentals", fundMap.size, "PE map", peMap.size);

  console.log("Fetching TW fundamentals (MOPS + openapi) for 大師／財務…");
  const twFund = await buildTwFundamentalBundle({ annualYears: 6, quarterCount: 8 });
  for (const u of twSet.values()) {
    const code = codeOfTicker(u.ticker);
    const pe = twFund.pe.get(code);
    if (pe != null && !peMap.has(u.ticker)) peMap.set(u.ticker, pe);
  }

  // Gooaye curated mega-cap / semi lists into OHLCV universe (+ fetch bars)
  {
    const gooayeNew = [];
    for (const g of gooayeUniverseBoost()) {
      if (g.market === "TW" && !twSet.has(g.ticker)) {
        twSet.set(g.ticker, { ticker: g.ticker, name: g.name, market: "TW" });
        gooayeNew.push(twSet.get(g.ticker));
      } else if (g.market === "US" && !usSet.has(g.ticker)) {
        usSet.set(g.ticker, { ticker: g.ticker, name: g.name, market: "US" });
        gooayeNew.push(usSet.get(g.ticker));
      } else if (!ohlcvMap.has(g.ticker)) {
        const u =
          g.market === "TW" ? twSet.get(g.ticker) : usSet.get(g.ticker);
        if (u) gooayeNew.push(u);
      }
    }
    if (gooayeNew.length) {
      console.log("Gooaye OHLCV boost", gooayeNew.length);
      await mapPool(gooayeNew, CONCURRENCY, async (u) => {
        try {
          const c = await yahooChart(u.ticker);
          if (c) {
            ohlcvMap.set(u.ticker, c);
            if (!u.name || u.name === u.ticker) u.name = c.name;
            ok++;
          } else fail++;
        } catch {
          fail++;
        }
        await sleep(80);
      });
    }
  }

  // Pull extra master-candidate names into OHLCV universe so hit counts aren't universe-starved
  {
    const already = new Set(twSet.keys());
    const priority = [];
    const rest = [];
    const seen = new Set();
    const push = (code, list) => {
      if (seen.has(code)) return;
      seen.add(code);
      list.push(code);
    };
    // 1) Growth / ROE masters first (馬克約克奇等)
    for (const [code, fund] of twFund.byCode) {
      const pe = twFund.pe.get(code);
      const debt = twFund.debtRatio.get(code);
      if (pe == null || debt == null || !(pe < 25) || !(debt < 0.35)) continue;
      const qs = (fund.quarters || []).filter((q) => q.roe != null);
      const roe4 = qs.length >= 4 ? qs.slice(-4).reduce((a, q) => a + q.roe, 0) : null;
      const gs = (fund.revGrowthYoY || []).slice(-3);
      const growthOk = gs.length >= 3 && gs.every((x) => x.g > 0.03);
      if (growthOk || (roe4 != null && roe4 > 0.12)) push(code, priority);
    }
    // 2) Value / Michael Price style
    for (const [code, pb] of twFund.pb) if (pb < 1.15) push(code, rest);
    for (const [code, d] of twFund.directorPct) if (d > 0.35) push(code, rest);
    for (const code of [...priority, ...rest]) {
      if (masterCandidateBoost.length >= 250) break;
      // Prefer .TW; also try .TWO later via yahooChart fallback below
      let t = `${code}.TW`;
      if (already.has(t)) continue;
      const name = twFund.byCode.get(code)?.name || nameMap.get(t) || code;
      twSet.set(t, { ticker: t, name, market: "TW" });
      already.add(t);
      masterCandidateBoost.push(t);
    }
    if (masterCandidateBoost.length) {
      console.log(
        "Master candidate OHLCV boost",
        masterCandidateBoost.length,
        "(priority growth",
        priority.length + ")"
      );
      await mapPool(
        masterCandidateBoost.map((t) => twSet.get(t)),
        CONCURRENCY,
        async (u) => {
          try {
            let c = await yahooChart(u.ticker);
            if (!c && u.ticker.endsWith(".TW")) {
              const alt = u.ticker.replace(/\.TW$/, ".TWO");
              c = await yahooChart(alt);
              if (c) {
                // Retarget ticker to OTC Yahoo symbol
                ohlcvMap.delete(u.ticker);
                twSet.delete(u.ticker);
                u.ticker = alt;
                twSet.set(alt, u);
                ohlcvMap.set(alt, c);
                if (!u.name || u.name === u.ticker) u.name = c.name;
                ok++;
                return;
              }
            }
            if (c) {
              ohlcvMap.set(u.ticker, c);
              if (!u.name || u.name === u.ticker) u.name = c.name;
              ok++;
            } else fail++;
          } catch {
            fail++;
          }
          await sleep(70);
        }
      );
    }
  }

  const twMarginByCode = new Map();
  for (const [code, rec] of twFund.byCode) {
    const series = [];
    for (const q of rec.quarters || []) {
      // Prefer single-quarter margins (ratio). Fall back to fields already on q.
      const gm = q.grossMargin != null
        ? q.grossMargin
        : q.grossProfit != null && q.revenue > 0
          ? q.grossProfit / q.revenue
          : null;
      const om = q.operatingMargin;
      if (gm == null && om == null) continue;
      series.push({
        year: q.year,
        season: q.season,
        grossMargin: gm,
        operatingMargin: om,
        revenue: q.revenue,
        name: rec.name,
        source: "mops-income-sq",
      });
    }
    if (series.length) twMarginByCode.set(code, series);
  }

  let twUniverseWithSeries = 0;
  for (const u of twSet.values()) {
    if (twMarginByCode.get(codeOfTicker(u.ticker))?.length) twUniverseWithSeries++;
  }
  console.log(
    "TW universe with margin series",
    twUniverseWithSeries,
    "/",
    twSet.size,
    "fund names",
    twFund.byCode.size
  );

  const masterStrategies = buildAllMasters(
    [...twSet.values()],
    ohlcvMap,
    techMetrics,
    twFund
  );

  const strategies = [
    buildMaBull(universe, ohlcvMap),
    buildUltraShort(universe, ohlcvMap),
    buildMaTangleBreak(universe, ohlcvMap),
    buildNewHighMomentum(universe, ohlcvMap),
    buildShortRoc(universe, ohlcvMap),
    buildDayUp5(universe, ohlcvMap),
    buildPct5d10(universe, ohlcvMap),
    buildNearHigh(universe, ohlcvMap),
    buildInstSync(instDays.slice(0, 5), [...twSet.values()]),
    ...(await buildPublicChipPacks(instDays, [...twSet.values()])),
    buildMarginGrowth(universe, fundMap, twMarginByCode),
    buildEarningsSteady(universe, twMarginByCode),
    buildLowPeSmall(universe, ohlcvMap, peMap),
    ...masterStrategies, // includes 彼得林區 (TW MOPS) + other masters; no US mix
  ];

  // Gooaye（股癌）packs — US/TW separate; no invented chip/branch data
  {
    let gooayeRateCtx = {};
    try {
      if (fs.existsSync(LATEST)) {
        const latest = JSON.parse(fs.readFileSync(LATEST, "utf8"));
        const usR = latest.marketRegime?.us;
        gooayeRateCtx = {
          liquidityBias: usR?.liquidityBias ?? null,
          dUs10Y_20d: usR?.features?.d_US10Y_20d ?? usR?.features?.dUs10Y_20d ?? null,
        };
      }
    } catch (e) {
      console.warn("gooaye rateCtx:", e.message);
    }
    const gooayeUniverse = [...twSet.values(), ...usSet.values()];
    const gooayePacks = buildAllGooayePacks({ universe: gooayeUniverse, ohlcvMap, rateCtx: gooayeRateCtx });
    strategies.push(...gooayePacks);
    console.log("Gooaye packs", gooayePacks.map((p) => `${p.id}:${p.hits.length}`).join(", "));
  }

  // Attach latest OHLCV bar date (Asia/Taipei) — never claim「今日」if bar is prior session
  const allBarDates = [];
  for (const s of strategies) {
    const dates = [];
    for (const h of s.hits || []) {
      const ch = ohlcvMap.get(h.ticker);
      if (!ch?.bars?.length) continue;
      const last = ch.bars[ch.bars.length - 1];
      const ymd = barYmdTaipei(last.t);
      h.ohlcvBarDate = ymd;
      dates.push(ymd);
      allBarDates.push(ymd);
    }
    if (dates.length) {
      const uniq = [...new Set(dates)].sort();
      s.ohlcvBarDates = uniq;
      const lagNote =
        uniq.length === 1 && uniq[0] !== asOfYmd
          ? `技術欄位 OHLCV 最後一根日K：${uniq[0]}（證交所 session ${asOfYmd}；非「今日」若不同日）`
          : `技術欄位 OHLCV 最後一根日K：${uniq.join(", ")}（證交所 session ${asOfYmd}）`;
      s.notes = [...(s.notes || []), lagNote];
      if (s.calibrationNotes && typeof s.calibrationNotes === "object") {
        s.calibrationNotes.dataAsOf = {
          sessionDate: asOfYmd,
          ohlcvBarDates: uniq,
          generatedAt: new Date().toISOString(),
        };
      }
    }
  }
  // Mode bar date across hits
  let ohlcvBarDate = null;
  if (allBarDates.length) {
    const freq = new Map();
    for (const d of allBarDates) freq.set(d, (freq.get(d) || 0) + 1);
    ohlcvBarDate = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  // XQ-like category order for UI
  const categoryOrder = ["大師", "基本", "籌碼", "技術", "綜合", "週期"];

  const payload = {
    asOf: new Date().toISOString(),
    sessionDate: asOfYmd,
    ohlcvBarDate,
    timezone: "Asia/Taipei",
    disclaimer:
      "本策略選股依公開行情／證交所公開資料做邏輯篩選，不是投資建議；非 XQ／券商專有資料庫，不保證與商業軟體結果一致。",
    universe: {
      tw: twSet.size,
      us: usSet.size,
      ohlcvOk: ok,
      ohlcvFail: fail,
      twMarginSeries: twUniverseWithSeries,
      twMarginSeriesAllMarket: twMarginByCode.size,
      twFundamentals: twFund.meta,
    },
    categoryOrder,
    strategies,
    glossaryHint:
      "名詞（本益比、營益率、毛利率、外資、投信、自營商、均線多頭、RSI、振幅、張）見站內名詞小辭典。",
    exportNote: "可複製本 JSON（strategy-screener.json）自行回測；站內不提供券商下單。",
  };

  // Preserve Gooaye packs if a partial rewrite dropped them
  try {
    if (fs.existsSync(OUT_PUBLIC)) {
      const prev = JSON.parse(fs.readFileSync(OUT_PUBLIC, "utf8"));
      for (const id of [
        "gooaye-tw-semicon-chain",
        "gooaye-us-risk-on",
        "gooaye-tw-vol-breakout",
        "gooaye-us-fomo-filter",
      ]) {
        if (!strategies.some((s) => s.id === id)) {
          const prevPack = (prev.strategies || []).find((s) => s.id === id);
          if (prevPack) {
            strategies.push(prevPack);
            payload.strategies = strategies;
            console.log("Preserved", id, "from prior screener");
          }
        }
      }
    }
  } catch (e) {
    console.warn("gooaye preserve skipped:", e.message);
  }

  // Preserve 週期 pack if daily-scan / prior run attached kostolany
  try {
    if (fs.existsSync(OUT_PUBLIC)) {
      const prev = JSON.parse(fs.readFileSync(OUT_PUBLIC, "utf8"));
      const kosto = (prev.strategies || []).find((s) => s.id === "kostolany-cycle");
      if (kosto && !strategies.some((s) => s.id === "kostolany-cycle")) {
        strategies.push(kosto);
        payload.strategies = strategies;
        if (prev.kostolanyRegimeAsOf) payload.kostolanyRegimeAsOf = prev.kostolanyRegimeAsOf;
        console.log("Preserved kostolany-cycle from prior screener");
      }
    }
  } catch (e) {
    console.warn("kostolany preserve skipped:", e.message);
  }

  fs.mkdirSync(path.dirname(OUT_PUBLIC), { recursive: true });
  fs.writeFileSync(OUT_PUBLIC, JSON.stringify(payload, null, 2));
  console.log("Wrote", OUT_PUBLIC);
  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    fs.writeFileSync(OUT_DOCS, JSON.stringify(payload, null, 2));
    console.log("Wrote", OUT_DOCS);
  }

  for (const s of strategies) {
    console.log(
      `  ${s.name}: hits=${s.hits.length}` +
        (s.incomplete ? ` [${s.incompleteLabel || "incomplete"}]` : "")
    );
  }
  console.log("▶ done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
