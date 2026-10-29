#!/usr/bin/env node
/**
 * Fetch US Magnificent 7 + high-attention earnings digest (Yahoo public APIs only).
 * Writes public/data/earnings-digest.json (+ docs/data/ when present).
 *
 * Manual: npm run fetch-earnings
 * Weekday routine: run with 每日數學選股 / after daily-scan (see daily-scan note).
 *
 * Never invents numbers — missing fields stay null and UI shows 資料不足.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveEpsPair,
  surprisePct,
  isGaapValue,
  siblingOf,
  sameQuarter,
  SUSPECT_SURPRISE_PCT,
  SHARE_CLASS_SIBLINGS,
  SRC_NASDAQ,
  SRC_YAHOO,
} from "./eps-basis.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public/data/earnings-digest.json");
const OUT_DOCS = path.join(ROOT, "docs/data/earnings-digest.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SLEEP_MS = 350;
const WATCHLIST_TARGET = 14;
const WINDOW_PRIMARY_DAYS = 14;
const WINDOW_RECENT_DAYS = 7;
const WINDOW_FALLBACK_DAYS = 45;

/** Mag7 — GOOGL primary Class A; GOOG Class C same company */
const MAG7 = [
  { ticker: "AAPL", nameHint: "Apple" },
  { ticker: "MSFT", nameHint: "Microsoft" },
  { ticker: "NVDA", nameHint: "NVIDIA" },
  { ticker: "AMZN", nameHint: "Amazon" },
  { ticker: "GOOGL", nameHint: "Alphabet (Class A)" },
  { ticker: "GOOG", nameHint: "Alphabet (Class C)" },
  { ticker: "META", nameHint: "Meta Platforms" },
  { ticker: "TSLA", nameHint: "Tesla" },
];

/** Mega-cap calendar pool (ex Mag7) for high-attention earnings */
const MEGA_CAPS = [
  "BRK-B",
  "AVGO",
  "JPM",
  "LLY",
  "V",
  "WMT",
  "XOM",
  "MA",
  "ORCL",
  "COST",
  "HD",
  "PG",
  "JNJ",
  "BAC",
  "ABBV",
  "CRM",
  "KO",
  "NFLX",
  "AMD",
  "PEP",
  "CSCO",
  "TMO",
  "DIS",
  "INTC",
  "QCOM",
  "IBM",
  "GE",
  "CAT",
  "GS",
  "MS",
  "MU",
  "AMAT",
  "LRCX",
  "KLAC",
  "SNPS",
  "CDNS",
  "NOW",
  "SNOW",
  "UBER",
  "SHOP",
  "PLTR",
  "COIN",
  "BA",
  "NKE",
  "SBUX",
  "PYPL",
  "SQ",
  "BLOCK",
];

const SELECTION_RULE =
  "Primary: non-Mag7 mega-caps with nextEarningsDate within next 14 calendar days, sorted by marketCap desc. " +
  "Also: Yahoo most_actives with earnings in next 14d OR reported in last 7d. " +
  "Fallback fill: nearest upcoming mega-cap earnings within 45d (tagged calendar_highlight). Cap 8. " +
  "Sources: Yahoo Finance public quoteSummary + screener only; null fields omitted in UI.";

const MODULES = [
  "calendarEvents",
  "earningsHistory",
  "defaultKeyStatistics",
  "summaryDetail",
  "summaryProfile",
  "financialData",
  "price",
  "incomeStatementHistoryQuarterly",
].join(",");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function round(n, d = 4) {
  if (n == null || !Number.isFinite(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function raw(obj) {
  if (obj == null) return null;
  if (typeof obj === "number") return Number.isFinite(obj) ? obj : null;
  if (typeof obj === "object" && "raw" in obj) {
    const n = obj.raw;
    return typeof n === "number" && Number.isFinite(n) ? n : null;
  }
  return null;
}

function fmtDate(unixOrObj) {
  if (unixOrObj == null) return null;
  if (typeof unixOrObj === "object" && unixOrObj.fmt) return unixOrObj.fmt;
  const n = typeof unixOrObj === "number" ? unixOrObj : raw(unixOrObj);
  if (n == null) return null;
  // Yahoo sometimes returns seconds
  const ms = n > 1e12 ? n : n * 1000;
  try {
    return new Date(ms).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function truncatePlain(text, max = 220) {
  if (!text || typeof text !== "string") return null;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("。"));
  if (lastStop > 80) return cut.slice(0, lastStop + 1).trim();
  return cut.trim() + "…";
}

async function yahooSession() {
  const warm = await fetch("https://fc.yahoo.com", {
    headers: { "User-Agent": UA },
    redirect: "manual",
  });
  const cookies = (warm.headers.getSetCookie?.() || [])
    .map((c) => c.split(";")[0])
    .join("; ");
  const crumbRes = await fetch(
    "https://query1.finance.yahoo.com/v1/test/getcrumb",
    { headers: { "User-Agent": UA, Cookie: cookies } }
  );
  if (!crumbRes.ok) {
    return { ok: false, error: `crumb HTTP ${crumbRes.status}`, cookies: "", crumb: "" };
  }
  const crumb = (await crumbRes.text()).trim();
  if (!crumb || crumb.includes("{")) {
    return { ok: false, error: "crumb parse failed", cookies, crumb: "" };
  }
  return { ok: true, cookies, crumb };
}

async function yahooJson(session, urlPath) {
  const sep = urlPath.includes("?") ? "&" : "?";
  const url = `https://query1.finance.yahoo.com${urlPath}${sep}crumb=${encodeURIComponent(session.crumb)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Cookie: session.cookies,
      Accept: "application/json",
    },
  });
  if (!res.ok) return { ok: false, status: res.status, data: null };
  try {
    return { ok: true, status: res.status, data: await res.json() };
  } catch {
    return { ok: false, status: res.status, data: null };
  }
}

function yoyFromQuarters(series) {
  if (!Array.isArray(series) || series.length < 4) {
    return { pct: null, incomplete: true };
  }
  const latest = series[0];
  const yearAgo = series[3];
  if (latest == null || yearAgo == null || yearAgo === 0) {
    return { pct: null, incomplete: true };
  }
  return {
    pct: round(((latest - yearAgo) / Math.abs(yearAgo)) * 100, 2),
    incomplete: false,
  };
}

function pickLastReport(history) {
  if (!Array.isArray(history) || !history.length) return null;
  // Yahoo: -1q is most recent; list may be oldest-first
  const sorted = [...history].sort((a, b) => {
    const pa = String(a.period || "");
    const pb = String(b.period || "");
    // -1q > -2q > ...
    const na = Number(pa.replace(/[^0-9-]/g, "")) || 0;
    const nb = Number(pb.replace(/[^0-9-]/g, "")) || 0;
    return nb - na; // -1 before -4
  });
  // Prefer period === '-1q'
  const last = history.find((h) => h.period === "-1q") || sorted[sorted.length - 1] || history[history.length - 1];
  if (!last) return null;
  // Raw provider pair (actual + estimate from the SAME Yahoo row). Basis is resolved by eps-basis.mjs.
  return {
    period: last.period || null,
    quarter: last.quarter?.fmt || fmtDate(last.quarter) || null,
    epsActual: round(raw(last.epsActual), 4),
    epsEstimate: round(raw(last.epsEstimate), 4),
    currency: last.currency || "USD",
    source: SRC_YAHOO,
  };
}

/** GAAP diluted EPS for one quarter: Yahoo timeseries field (exact) or net income ÷ diluted shares (approx, check only). */
async function fetchGaapEps(session, ticker, quarter, incomeHist) {
  if (!quarter) return null;
  const p2 = Math.floor(Date.now() / 1000);
  const p1 = p2 - 86400 * 400;
  const res = await yahooJson(
    session,
    `/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(ticker)}?type=quarterlyDilutedEPS,quarterlyDilutedAverageShares&period1=${p1}&period2=${p2}`
  );
  const series = {};
  for (const s of res.data?.timeseries?.result || []) {
    const k = s?.meta?.type?.[0];
    if (k) series[k] = (s[k] || []).filter(Boolean);
  }
  const exact = (series.quarterlyDilutedEPS || []).find((x) => x.asOfDate === quarter);
  if (exact && raw(exact.reportedValue) != null) {
    return { value: raw(exact.reportedValue), approx: false, source: "Yahoo timeseries quarterlyDilutedEPS (GAAP)" };
  }
  const ni = (incomeHist || []).find((h) => (h.endDate?.fmt || fmtDate(h.endDate)) === quarter);
  const shares = (series.quarterlyDilutedAverageShares || []).map((x) => raw(x.reportedValue)).filter((x) => x > 0).pop();
  const net = raw(ni?.netIncome);
  if (net != null && shares) {
    return { value: net / shares, approx: true, source: "Yahoo net income ÷ latest diluted shares (GAAP check only)" };
  }
  return null;
}

/** Nasdaq/Zacks earnings-surprise: same-provider (actual, consensus) pairs. */
async function fetchNasdaqSurprise(ticker) {
  try {
    const res = await fetch(`https://api.nasdaq.com/api/company/${encodeURIComponent(ticker)}/earnings-surprise`, {
      headers: { Accept: "application/json", "User-Agent": UA },
    });
    if (!res.ok) return [];
    const j = await res.json();
    return (j?.data?.earningsSurpriseTable?.rows || [])
      .map((r) => ({
        quarter: r.fiscalQtrEnd,
        epsActual: Number(r.eps),
        epsEstimate: parseEpsForecast(r.consensusForecast),
        source: SRC_NASDAQ,
      }))
      .filter((r) => Number.isFinite(r.epsActual) && Number.isFinite(r.epsEstimate));
  } catch {
    return [];
  }
}

function isSuspect(primary, gaap) {
  const pct = surprisePct(primary?.epsActual, primary?.epsEstimate);
  return pct != null && Math.abs(pct) > SUSPECT_SURPRISE_PCT && isGaapValue(primary.epsActual, gaap);
}

/** Re-resolve share-class siblings (GOOGL/GOOG) with each other's pair as an alternative; drop helper fields. */
function finalizeEps(rows) {
  const byT = new Map(rows.filter((r) => r?._eps).map((r) => [r.ticker, r]));
  for (const group of SHARE_CLASS_SIBLINGS) {
    for (const t of group) {
      const row = byT.get(t);
      if (!row) continue;
      const alts = [];
      for (const sib of siblingOf(t)) {
        const sr = byT.get(sib);
        if (sr?._eps?.primary && sameQuarter(sr._eps.primary.quarter, row._eps.primary.quarter)) {
          alts.push({ ...sr._eps.primary, via: sib });
        }
      }
      alts.push(...(row._eps.nasdaq || []));
      row.lastReport = resolveEpsPair({ primary: row._eps.primary, gaap: row._eps.gaap, alts });
    }
    // One company: show the GAAP figure on every class when one class's provider row carried it.
    const lrs = group.map((t) => byT.get(t)?.lastReport).filter(Boolean);
    const withG = lrs.find((l) => l.epsGaap != null);
    for (const l of lrs) {
      if (l.epsGaap == null && withG && sameQuarter(l.quarter, withG.quarter)) {
        l.epsGaap = withG.epsGaap;
        l.epsGaapSource = withG.epsGaapSource;
      }
    }
  }
  for (const r of rows) {
    if (!r?._eps) continue;
    delete r._eps;
    r.notes = buildNotes(r);
    r.whatToWatch = whatToWatch(r);
  }
}

function buildNotes(row) {
  const notes = [];
  if (row.ticker === "GOOG") {
    notes.push("Alphabet Class C；與 GOOGL 同一公司，財報日通常一致");
  }
  if (row.ticker === "GOOGL") {
    notes.push("Alphabet Class A；GOOG 為 Class C");
  }
  if (row.nextEarningsDate) {
    const est = row.nextEarningsDateIsEstimate ? "（預估日）" : "";
    notes.push(`下次財報約 ${row.nextEarningsDate}${est}`);
  } else {
    notes.push("下次財報日：資料不足");
  }
  if (row.lastReport?.quarter) {
    const e = row.lastReport.epsActual != null ? `EPS ${row.lastReport.epsActual}` : "EPS 資料不足";
    notes.push(`最近一季（${row.lastReport.quarter}）：${e}`);
  }
  if (row.consensusEpsNext != null) {
    notes.push(`市場預估下次 EPS 約 ${row.consensusEpsNext}（Yahoo）`);
  }
  if (row.missingFields?.length) {
    notes.push(`缺欄：${row.missingFields.join(", ")}`);
  }
  return notes;
}

function whatToWatch(row) {
  const bits = [];
  if (row.nextEarningsDate) {
    bits.push(`關注 ${row.nextEarningsDate} 前後的營收與 EPS 是否達預估`);
  } else {
    bits.push("財報日未定時，先核對官方 IR 行事曆");
  }
  if (row.revenueYoYPct != null) {
    bits.push(
      row.revenueYoYPct >= 0
        ? `近期營收 YoY 約 +${row.revenueYoYPct}%（Yahoo）`
        : `近期營收 YoY 約 ${row.revenueYoYPct}%（Yahoo）`
    );
  }
  if (row.epsYoYPct != null) {
    bits.push(
      row.epsYoYPct >= 0
        ? `獲利成長約 +${row.epsYoYPct}%（Yahoo earningsGrowth）`
        : `獲利成長約 ${row.epsYoYPct}%（Yahoo earningsGrowth）`
    );
  }
  if (row.pe == null) bits.push("本益比暫缺，勿硬套估值");
  return bits.join("；") || "等待公開財報更新";
}

async function fetchTicker(session, ticker, nameHint) {
  const res = await yahooJson(
    session,
    `/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${MODULES}`
  );
  if (!res.ok) {
    return {
      ticker,
      name: nameHint || ticker,
      ok: false,
      blocker: `Yahoo quoteSummary HTTP ${res.status}`,
      nextEarningsDate: null,
      nextEarningsDateIsEstimate: null,
      lastReport: null,
      revenueYoYPct: null,
      epsYoYPct: null,
      pe: null,
      forwardPe: null,
      marketCap: null,
      whatItDoes: null,
      whatToWatch: "資料不足",
      notes: ["資料不足"],
      missingFields: ["all"],
      sources: ["Yahoo Finance quoteSummary"],
    };
  }
  const block = res.data?.quoteSummary?.result?.[0];
  if (!block) {
    return {
      ticker,
      name: nameHint || ticker,
      ok: false,
      blocker: "Yahoo quoteSummary empty",
      nextEarningsDate: null,
      nextEarningsDateIsEstimate: null,
      lastReport: null,
      revenueYoYPct: null,
      epsYoYPct: null,
      pe: null,
      forwardPe: null,
      marketCap: null,
      whatItDoes: null,
      whatToWatch: "資料不足",
      notes: ["資料不足"],
      missingFields: ["all"],
      sources: ["Yahoo Finance quoteSummary"],
    };
  }

  const cal = block.calendarEvents?.earnings || {};
  const dates = Array.isArray(cal.earningsDate) ? cal.earningsDate : [];
  const nextEarningsDate = dates.length ? fmtDate(dates[0]) : null;
  const nextEarningsDateIsEstimate =
    typeof cal.isEarningsDateEstimate === "boolean" ? cal.isEarningsDateEstimate : null;

  const ks = block.defaultKeyStatistics || {};
  const sd = block.summaryDetail || {};
  const fd = block.financialData || {};
  const price = block.price || {};
  const hist = block.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
  const revs = hist.map((h) => raw(h.totalRevenue));
  const revYoyQ = yoyFromQuarters(revs);

  // Prefer Yahoo financialData growth (documented as YoY); else quarterly revenue YoY
  const revenueYoYPct =
    raw(fd.revenueGrowth) != null
      ? round(raw(fd.revenueGrowth) * 100, 2)
      : revYoyQ.pct;
  const epsYoYPct =
    raw(fd.earningsGrowth) != null ? round(raw(fd.earningsGrowth) * 100, 2) : null;

  const pe = round(raw(sd.trailingPE) ?? raw(ks.trailingPE), 2);
  const forwardPe = round(raw(sd.forwardPE) ?? raw(ks.forwardPE), 2);
  const marketCap = raw(sd.marketCap) ?? raw(price.marketCap) ?? null;
  const name =
    price.shortName || price.longName || nameHint || ticker;
  const whatItDoes = truncatePlain(block.summaryProfile?.longBusinessSummary);

  const epsPrimary = pickLastReport(block.earningsHistory?.history || []);
  let gaap = null;
  let nasdaq = [];
  if (epsPrimary?.quarter && epsPrimary.epsActual != null) {
    gaap = await fetchGaapEps(session, ticker, epsPrimary.quarter, hist);
    if (isSuspect(epsPrimary, gaap)) nasdaq = await fetchNasdaqSurprise(ticker);
  }
  const lastReport = epsPrimary ? resolveEpsPair({ primary: epsPrimary, gaap, alts: nasdaq }) : null;
  const consensusEpsNext = round(raw(cal.earningsAverage), 4);
  const consensusRevNext = raw(cal.revenueAverage);

  const missingFields = [];
  if (!nextEarningsDate) missingFields.push("nextEarningsDate");
  if (!lastReport) missingFields.push("lastReport");
  else {
    if (lastReport.epsActual == null) missingFields.push("lastReport.epsActual");
  }
  if (revenueYoYPct == null) missingFields.push("revenueYoYPct");
  if (epsYoYPct == null) missingFields.push("epsYoYPct");
  if (pe == null) missingFields.push("pe");
  if (!whatItDoes) missingFields.push("whatItDoes");
  if (marketCap == null) missingFields.push("marketCap");

  const row = {
    ticker,
    name,
    ok: true,
    blocker: null,
    nextEarningsDate,
    nextEarningsDateIsEstimate,
    lastReport,
    revenueYoYPct,
    revenueYoYSource:
      raw(fd.revenueGrowth) != null
        ? "Yahoo financialData.revenueGrowth"
        : revYoyQ.incomplete
          ? null
          : "quarterly incomeStatement YoY (q0 vs q3)",
    epsYoYPct,
    epsYoYSource:
      epsYoYPct != null ? "Yahoo financialData.earningsGrowth" : null,
    pe,
    forwardPe,
    marketCap,
    consensusEpsNext,
    consensusRevNext,
    whatItDoes,
    missingFields,
    sources: [
      "Yahoo Finance quoteSummary (calendarEvents, earningsHistory, financialData, summaryDetail, summaryProfile)",
      "EPS basis check: Yahoo timeseries GAAP diluted EPS; Nasdaq earnings-surprise only when the Yahoo pair looks GAAP-vs-adjusted",
    ],
  };
  row.notes = buildNotes(row);
  row.whatToWatch = whatToWatch(row);
  if (epsPrimary) row._eps = { primary: epsPrimary, gaap, nasdaq };
  return row;
}

function daysFrom(asOfDate, ymd) {
  if (!ymd) return null;
  const a = Date.UTC(asOfDate.getUTCFullYear(), asOfDate.getUTCMonth(), asOfDate.getUTCDate());
  const parts = ymd.split("-").map(Number);
  if (parts.length !== 3 || parts.some((x) => !Number.isFinite(x))) return null;
  const b = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  return Math.round((b - a) / 86400000);
}

async function fetchMostActives(session) {
  const res = await yahooJson(
    session,
    `/v1/finance/screener/predefined/saved?formatted=false&lang=en-US&region=US&scrIds=most_actives&count=25`
  );
  if (!res.ok) return { ok: false, tickers: [], error: `most_actives HTTP ${res.status}` };
  const quotes = res.data?.finance?.result?.[0]?.quotes || [];
  return {
    ok: true,
    tickers: quotes
      .map((q) => ({
        ticker: String(q.symbol || "").toUpperCase(),
        marketCap: q.marketCap ?? null,
        name: q.shortName || q.longName || q.symbol,
      }))
      .filter((q) => q.ticker && /^[A-Z][A-Z0-9.-]{0,11}$/.test(q.ticker)),
    error: null,
  };
}


function parseUsdMoney(s) {
  if (s == null || s === "") return null;
  const t = String(s).trim().replace(/[$,]/g, "");
  if (!t || t === "N/A" || t === "--") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function parseEpsForecast(s) {
  if (s == null || s === "") return null;
  const t = String(s).trim();
  if (!t || t === "N/A" || t === "--") return null;
  const neg = t.includes("(") && t.includes(")");
  const n = Number(t.replace(/[$,()]/g, ""));
  if (!Number.isFinite(n)) return null;
  return neg ? -n : n;
}

/** Nasdaq public earnings calendar (no API key). Scans [start, start+days]. */
async function nasdaqEarningsWindow(startYmd, days = 90, symbols = null) {
  const want = symbols ? new Set([...symbols].map((s) => String(s).toUpperCase())) : null;
  const bySym = new Map();
  const start = new Date(`${startYmd}T00:00:00Z`);
  for (let i = 0; i <= days; i++) {
    const dt = new Date(start.getTime() + i * 86400000);
    const iso = dt.toISOString().slice(0, 10);
    let res;
    try {
      res = await fetch(`https://api.nasdaq.com/api/calendar/earnings?date=${iso}`, {
        headers: { Accept: "application/json", "User-Agent": UA },
      });
    } catch {
      await sleep(120);
      continue;
    }
    if (!res.ok) {
      await sleep(120);
      continue;
    }
    let j;
    try {
      j = await res.json();
    } catch {
      await sleep(120);
      continue;
    }
    for (const row of j?.data?.rows || []) {
      const sym = String(row.symbol || "").toUpperCase();
      if (!sym) continue;
      if (want && !want.has(sym)) continue;
      if (bySym.has(sym)) continue; // first upcoming date wins
      bySym.set(sym, {
        ticker: sym,
        name: (row.name || sym).trim(),
        nextEarningsDate: iso,
        nextEarningsDateIsEstimate: true,
        consensusEpsNext: parseEpsForecast(row.epsForecast),
        marketCap: parseUsdMoney(row.marketCap),
        fiscalQuarterEnding: row.fiscalQuarterEnding || null,
        lastYearEps: row.lastYearEPS || null,
        lastYearRptDt: row.lastYearRptDt || null,
        sources: ["Nasdaq API calendar/earnings (public)"],
      });
    }
    await sleep(120);
  }
  return bySym;
}

function rowFromNasdaq(ns, nameHint) {
  const missingFields = [];
  if (!ns?.nextEarningsDate) missingFields.push("nextEarningsDate");
  missingFields.push("revenueYoYPct", "epsYoYPct", "pe", "lastReport", "whatItDoes");
  const row = {
    ticker: ns.ticker,
    name: nameHint || ns.name,
    ok: Boolean(ns.nextEarningsDate),
    blocker: ns.nextEarningsDate ? null : "Nasdaq calendar: no upcoming date in scan window",
    nextEarningsDate: ns.nextEarningsDate || null,
    nextEarningsDateIsEstimate: ns.nextEarningsDateIsEstimate ?? null,
    lastReport: null,
    revenueYoYPct: null,
    epsYoYPct: null,
    pe: null,
    forwardPe: null,
    marketCap: ns.marketCap ?? null,
    consensusEpsNext: ns.consensusEpsNext ?? null,
    consensusRevNext: null,
    whatItDoes: null,
    missingFields,
    sources: ns.sources || ["Nasdaq API calendar/earnings (public)"],
    fiscalQuarterEnding: ns.fiscalQuarterEnding || null,
  };
  row.notes = buildNotes(row);
  if (ns.fiscalQuarterEnding) row.notes.push(`財季截止約 ${ns.fiscalQuarterEnding}（Nasdaq）`);
  row.whatToWatch = whatToWatch(row);
  return row;
}

async function main() {
  const asOf = new Date().toISOString();
  const asOfDate = new Date(asOf);
  const session = await yahooSession();
  let sessionBlocker = null;
  if (!session.ok) {
    sessionBlocker = session.error || "Yahoo session failed";
    console.warn("Yahoo session blocker:", sessionBlocker);
  }

  const mag7 = [];
  const mag7Set = new Set(MAG7.map((m) => m.ticker));
  let nasdaqMap = null;
  let sourceLabel =
    "Yahoo Finance public quoteSummary + most_actives screener (crumb session)";

  // When Yahoo crumb/session is blocked, fill Mag7 + watchlist from Nasdaq public calendar.
  if (!session.ok) {
    console.log("▶ Nasdaq calendar fallback (Yahoo session unavailable)…");
    const startYmd = asOf.slice(0, 10);
    const pool = [...mag7Set, ...MEGA_CAPS];
    nasdaqMap = await nasdaqEarningsWindow(startYmd, WINDOW_FALLBACK_DAYS + 45, pool);
    console.log("Nasdaq hits", nasdaqMap.size);
    sourceLabel =
      "Nasdaq API calendar/earnings (public fallback; Yahoo crumb/session blocked)";
  }

  for (const m of MAG7) {
    if (!session.ok) {
      const ns = nasdaqMap?.get(m.ticker);
      if (ns) {
        console.log("mag7 nasdaq", m.ticker, ns.nextEarningsDate);
        mag7.push(rowFromNasdaq(ns, m.nameHint));
      } else {
        mag7.push({
          ticker: m.ticker,
          name: m.nameHint,
          ok: false,
          blocker: sessionBlocker + "; Nasdaq calendar: no date in scan window",
          nextEarningsDate: null,
          nextEarningsDateIsEstimate: null,
          lastReport: null,
          revenueYoYPct: null,
          epsYoYPct: null,
          pe: null,
          forwardPe: null,
          marketCap: null,
          whatItDoes: null,
          whatToWatch: "財報日未出現在 Nasdaq 未來掃描窗；請核對公司 IR",
          notes: ["下次財報日：Nasdaq 掃描窗內無資料（未捏造）"],
          missingFields: ["session", "nextEarningsDate", "revenueYoYPct", "epsYoYPct", "pe", "lastReport", "whatItDoes"],
          sources: ["Nasdaq API calendar/earnings (public)", "Yahoo session blocked"],
        });
      }
      continue;
    }
    console.log("mag7", m.ticker);
    const row = await fetchTicker(session, m.ticker, m.nameHint);
    mag7.push(row);
    await sleep(SLEEP_MS);
  }

  finalizeEps(mag7);

  // —— watchlistHot ——
  const watchlistHot = [];
  const seen = new Set(mag7Set);
  let actives = { ok: false, tickers: [], error: null };

  if (!session.ok && nasdaqMap) {
    const candidates = [];
    for (const t of MEGA_CAPS) {
      if (mag7Set.has(t)) continue;
      const ns = nasdaqMap.get(t);
      if (!ns) continue;
      const row = rowFromNasdaq(ns, ns.name);
      row._daysToEarnings = daysFrom(asOfDate, row.nextEarningsDate);
      row._meta = { reasonPool: "mega_cap", nasdaq: true };
      candidates.push(row);
    }
    const primary = candidates
      .filter((c) => c._daysToEarnings != null && c._daysToEarnings >= 0 && c._daysToEarnings <= WINDOW_PRIMARY_DAYS)
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    const fallback = candidates
      .filter(
        (c) =>
          c._daysToEarnings != null &&
          c._daysToEarnings > WINDOW_PRIMARY_DAYS &&
          c._daysToEarnings <= WINDOW_FALLBACK_DAYS
      )
      .sort((a, b) => a._daysToEarnings - b._daysToEarnings || (b.marketCap || 0) - (a.marketCap || 0));
    const pick = (list, tag) => {
      for (const c of list) {
        if (watchlistHot.length >= WATCHLIST_TARGET) break;
        if (seen.has(c.ticker)) continue;
        seen.add(c.ticker);
        const { _daysToEarnings, _meta, ...rest } = c;
        watchlistHot.push({
          ...rest,
          selectionTag: tag,
          daysToEarnings: _daysToEarnings,
          pool: _meta?.reasonPool || null,
        });
      }
    };
    pick(primary, "nasdaq_mega_cap_earnings_next_14d");
    pick(fallback, "nasdaq_calendar_highlight_within_45d");
  }

  if (session.ok) {
    actives = await fetchMostActives(session);
    await sleep(SLEEP_MS);

    const candidates = [];
    const poolTickers = new Map();
    for (const t of MEGA_CAPS) {
      if (!mag7Set.has(t)) poolTickers.set(t, { ticker: t, reasonPool: "mega_cap" });
    }
    for (const a of actives.tickers || []) {
      if (!mag7Set.has(a.ticker)) {
        const prev = poolTickers.get(a.ticker);
        poolTickers.set(a.ticker, {
          ticker: a.ticker,
          nameHint: a.name,
          marketCapHint: a.marketCap,
          reasonPool: prev ? "mega_cap+most_actives" : "most_actives",
        });
      }
    }

    for (const [ticker, meta] of poolTickers) {
      console.log("watch-cand", ticker);
      const row = await fetchTicker(session, ticker, meta.nameHint);
      finalizeEps([row]);
      const days = daysFrom(asOfDate, row.nextEarningsDate);
      let lastReportDaysAgo = null;
      if (row.lastReport?.quarter) {
        // approximate: quarter end may be weeks before report; use earnings call if we only have quarter end — skip strict recent unless we have date
        lastReportDaysAgo = null;
      }
      row._daysToEarnings = days;
      row._meta = meta;
      candidates.push(row);
      await sleep(SLEEP_MS);
    }

    const primary = candidates
      .filter((c) => c._daysToEarnings != null && c._daysToEarnings >= 0 && c._daysToEarnings <= WINDOW_PRIMARY_DAYS)
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    const fromActivesUpcoming = candidates
      .filter(
        (c) =>
          c._meta?.reasonPool?.includes("most_actives") &&
          c._daysToEarnings != null &&
          c._daysToEarnings >= 0 &&
          c._daysToEarnings <= WINDOW_PRIMARY_DAYS
      )
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    // Recently reported: lastReport exists and next earnings is far / just passed (days negative small)
    const recentlyReported = candidates
      .filter((c) => {
        if (!c.lastReport?.quarter) return false;
        if (c._daysToEarnings == null) return true; // reported, no next date yet
        return c._daysToEarnings < 0 && c._daysToEarnings >= -WINDOW_RECENT_DAYS;
      })
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    const fallback = candidates
      .filter(
        (c) =>
          c._daysToEarnings != null &&
          c._daysToEarnings > WINDOW_PRIMARY_DAYS &&
          c._daysToEarnings <= WINDOW_FALLBACK_DAYS
      )
      .sort((a, b) => a._daysToEarnings - b._daysToEarnings || (b.marketCap || 0) - (a.marketCap || 0));

    const pick = (list, tag) => {
      for (const c of list) {
        if (watchlistHot.length >= WATCHLIST_TARGET) break;
        if (seen.has(c.ticker)) continue;
        seen.add(c.ticker);
        const { _daysToEarnings, _meta, ...rest } = c;
        watchlistHot.push({
          ...rest,
          selectionTag: tag,
          daysToEarnings: _daysToEarnings,
          pool: _meta?.reasonPool || null,
        });
      }
    };

    pick(primary, "mega_cap_earnings_next_14d");
    pick(fromActivesUpcoming, "yahoo_most_actives_earnings_next_14d");
    pick(recentlyReported, "recently_reported");
    pick(fallback, "calendar_highlight_within_45d");
  }

  const digest = {
    asOf,
    market: "US",
    twStub: {
      status: "planned",
      note: "台股財報稍後開放（TW stub）",
    },
    source: sourceLabel,
    disclaimer:
      "非投資建議。公開財報／預估摘要僅供教育參考，不構成個人化投資建議。數字來自 Yahoo 或 Nasdaq 公開行事曆，缺欄標資料不足、不捏造。",
    selectionRule: SELECTION_RULE,
    refreshHint:
      "npm run fetch-earnings  （平日與每日數學選股一併跑；daily-scan 結尾亦可呼叫）",
    sessionOk: session.ok,
    sessionBlocker,
    mag7,
    watchlistHot,
    watchlistMeta: {
      target: WATCHLIST_TARGET,
      primaryWindowDays: WINDOW_PRIMARY_DAYS,
      recentWindowDays: WINDOW_RECENT_DAYS,
      fallbackWindowDays: WINDOW_FALLBACK_DAYS,
      mostActivesOk: actives.ok,
      mostActivesError: actives.error,
      count: watchlistHot.length,
    },
  };

  fs.mkdirSync(path.dirname(OUT_PUBLIC), { recursive: true });
  fs.writeFileSync(OUT_PUBLIC, JSON.stringify(digest, null, 2) + "\n");
  console.log("wrote", OUT_PUBLIC, "mag7=", mag7.length, "watch=", watchlistHot.length);

  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    fs.writeFileSync(OUT_DOCS, JSON.stringify(digest, null, 2) + "\n");
    console.log("wrote", OUT_DOCS);
  }

  // Field population summary
  for (const row of mag7) {
    const fields = ["nextEarningsDate", "revenueYoYPct", "epsYoYPct", "pe", "lastReport", "whatItDoes"];
    const populated = fields.filter((f) => {
      if (f === "lastReport") return row.lastReport != null;
      return row[f] != null && row[f] !== "";
    });
    const missing = fields.filter((f) => !populated.includes(f));
    console.log(
      `  ${row.ticker}: ok=${populated.join(",") || "—"} | 資料不足=${missing.join(",") || "—"}`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
