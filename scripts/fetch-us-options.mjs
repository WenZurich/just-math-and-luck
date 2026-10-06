#!/usr/bin/env node
/**
 * Fetch US equity light fundamentals + options snapshot (Yahoo public APIs).
 * Writes public/data/us-options-snapshot.json (+ docs/data/ when present).
 *
 * Primary framework: McMillan《選擇權策略完全手冊》
 *   (research-library id book-mcmillan-options-handbook)
 * Light equity quality filter is secondary; options education is primary.
 *
 * Manual: node scripts/fetch-us-options.mjs
 * Optional later: after daily-scan writes latest.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { annualizedHistVol } from "./math-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LATEST = path.join(ROOT, "public/data/latest.json");
const LIBRARY = path.join(ROOT, "public/data/research-library.json");
const OUT_PUBLIC = path.join(ROOT, "public/data/us-options-snapshot.json");
const OUT_DOCS = path.join(ROOT, "docs/data/us-options-snapshot.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const DEFAULT_LIMIT = 8;
const SLEEP_MS = 400;
const PRIMARY_BOOK_ID = "book-mcmillan-options-handbook";

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

function isUsTicker(t) {
  if (!t) return false;
  const s = String(t).toUpperCase();
  if (s.endsWith(".TW") || s.endsWith(".TWO")) return false;
  if (s.startsWith("^") || s.includes("=")) return false;
  return /^[A-Z][A-Z0-9.-]{0,11}$/.test(s);
}

function pickTickers(latest, limit) {
  const seen = new Set();
  const out = [];
  const push = (row) => {
    const t = String(row?.ticker || "").toUpperCase();
    if (!isUsTicker(t) || seen.has(t)) return;
    seen.add(t);
    out.push({
      ticker: t,
      name: row.name || t,
      price: row.price ?? null,
      dayPct: row.dayPct ?? null,
      screens: row.screens || [],
    });
  };
  for (const row of latest?.top5 || []) {
    if ((row.market || "").toUpperCase() === "US" || isUsTicker(row.ticker)) push(row);
  }
  for (const row of latest?.us || []) push(row);
  return out.slice(0, limit);
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
  const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
  let lastStatus = 0;
  for (const host of hosts) {
    const url = `https://${host}${urlPath}${sep}crumb=${encodeURIComponent(session.crumb)}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Cookie: session.cookies,
          Accept: "application/json",
        },
      });
      lastStatus = res.status;
      if (!res.ok) continue;
      try {
        return { ok: true, status: res.status, data: await res.json(), host };
      } catch {
        continue;
      }
    } catch {
      continue;
    }
  }
  return { ok: false, status: lastStatus, data: null };
}

function yoyTrend(series) {
  if (!Array.isArray(series) || series.length < 4) {
    return { label: null, pct: null, incomplete: true };
  }
  const latest = series[0];
  const yearAgo = series[3];
  if (latest == null || yearAgo == null || yearAgo === 0) {
    return { label: null, pct: null, incomplete: true };
  }
  const pct = ((latest - yearAgo) / Math.abs(yearAgo)) * 100;
  let label = "flat";
  if (pct > 8) label = "up";
  else if (pct < -8) label = "down";
  return { label, pct: round(pct, 2), incomplete: false };
}

function scoreQuality(f) {
  /** Light equity hygiene before options education — not a buy signal. */
  const missing = [];
  const notes = [];
  let score = 0;
  let max = 0;

  const pe = f.trailingPE ?? f.forwardPE;
  max += 2;
  if (pe == null) missing.push("PE");
  else if (pe > 0 && pe < 25) {
    score += 2;
    notes.push("pe_ok");
  } else if (pe > 0 && pe < 45) {
    score += 1;
    notes.push("pe_elevated");
  } else notes.push("pe_stretched");

  max += 1;
  if (f.priceToBook == null) missing.push("PB");
  else if (f.priceToBook > 0 && f.priceToBook < 5) {
    score += 1;
    notes.push("pb_ok");
  } else if (f.priceToBook >= 5) notes.push("pb_high");

  max += 2;
  if (f.roe == null) missing.push("ROE");
  else if (f.roe >= 0.15) {
    score += 2;
    notes.push("roe_strong");
  } else if (f.roe >= 0.08) {
    score += 1;
    notes.push("roe_ok");
  } else notes.push("roe_weak");

  max += 2;
  if (f.debtToEquity == null) missing.push("debt");
  else if (f.debtToEquity < 80) {
    score += 2;
    notes.push("debt_low");
  } else if (f.debtToEquity < 150) {
    score += 1;
    notes.push("debt_ok");
  } else notes.push("debt_high");

  max += 2;
  if (f.revenueTrend?.incomplete) missing.push("revenueTrend");
  else if (f.revenueTrend?.label === "up") {
    score += 2;
    notes.push("rev_up");
  } else if (f.revenueTrend?.label === "flat") {
    score += 1;
    notes.push("rev_flat");
  } else if (f.revenueTrend?.label === "down") notes.push("rev_down");

  max += 1;
  if (f.earningsTrend?.incomplete) missing.push("earningsTrend");
  else if (f.earningsTrend?.label === "up") {
    score += 1;
    notes.push("earn_up");
  } else if (f.earningsTrend?.label === "down") notes.push("earn_down");

  const ratio = max > 0 ? score / max : 0;
  let gate = "watch";
  if (missing.length >= 4) gate = "incomplete";
  else if (ratio >= 0.65 && !(notes.includes("debt_high") && notes.includes("roe_weak")))
    gate = "pass";
  else if (ratio < 0.35) gate = "fail";

  return {
    score: round(ratio, 3),
    scoreRaw: score,
    scoreMax: max,
    gate,
    notes,
    missingFields: missing,
  };
}

function pickAtm(contracts, spot) {
  if (!contracts?.length || spot == null) return null;
  const usable = contracts.filter(
    (c) =>
      c &&
      typeof c.strike === "number" &&
      (c.impliedVolatility == null || c.impliedVolatility >= 0.02 || (c.bid ?? 0) > 0)
  );
  const pool = usable.length ? usable : contracts;
  return pool.reduce((best, c) =>
    Math.abs(c.strike - spot) < Math.abs(best.strike - spot) ? c : best
  );
}


/** Compact chain for paper fills — only public Yahoo fields; never invent premiums. */
function slimContract(c) {
  if (!c || typeof c.strike !== "number") return null;
  const last = c.lastPrice ?? null;
  const bid = c.bid ?? null;
  const ask = c.ask ?? null;
  let premium = null;
  if (typeof last === "number" && last >= 0) premium = last;
  else if (typeof bid === "number" && typeof ask === "number" && bid >= 0 && ask >= 0) {
    premium = (bid + ask) / 2;
  } else if (typeof bid === "number" && bid >= 0) premium = bid;
  else if (typeof ask === "number" && ask >= 0) premium = ask;
  if (premium == null || !Number.isFinite(premium) || premium < 0) return null;
  return {
    contractSymbol: c.contractSymbol || null,
    strike: c.strike,
    premium: round(premium, 4),
    lastPrice: typeof last === "number" ? round(last, 4) : null,
    bid: typeof bid === "number" ? round(bid, 4) : null,
    ask: typeof ask === "number" ? round(ask, 4) : null,
    volume: c.volume ?? null,
    openInterest: c.openInterest ?? null,
    inTheMoney: !!c.inTheMoney,
  };
}

function buildPaperChain(calls, puts, spot, expiration, expirationUnix) {
  const ATM_BAND = 8; // keep ±8 strikes around ATM for paper ticket
  const slimCalls = (calls || []).map(slimContract).filter(Boolean);
  const slimPuts = (puts || []).map(slimContract).filter(Boolean);
  if (!slimCalls.length && !slimPuts.length) return null;
  let atm = spot;
  if (!(typeof atm === "number" && Number.isFinite(atm))) {
    const pool = [...slimCalls, ...slimPuts];
    atm = pool.length ? pool.reduce((b, c) => (Math.abs(c.strike - (b?.strike ?? c.strike)) < Math.abs((atm ?? c.strike) - c.strike) ? c : b), pool[0]).strike : null;
  }
  const near = (arr) => {
    if (atm == null) return arr.slice(0, ATM_BAND * 2);
    return [...arr]
      .sort((a, b) => Math.abs(a.strike - atm) - Math.abs(b.strike - atm))
      .slice(0, ATM_BAND * 2)
      .sort((a, b) => a.strike - b.strike);
  };
  return {
    expiration,
    expirationUnix,
    underlyingPrice: typeof spot === "number" ? spot : null,
    asOfPremiumSource: "Yahoo options last/bid/ask (public)",
    multiplier: 100,
    calls: near(slimCalls),
    puts: near(slimPuts),
  };
}

function sanitizeIv(iv) {
  if (iv == null || !Number.isFinite(iv)) return null;
  if (iv < 0.02) return null;
  if (iv > 5) return null;
  return round(iv, 4);
}

function volRegime(atmIv, hv) {
  if (atmIv == null) return "unknown";
  if (hv == null || hv <= 0) return "iv_only";
  const ratio = atmIv / hv;
  if (ratio >= 1.25) return "iv_rich";
  if (ratio <= 0.8) return "iv_cheap";
  return "iv_fair";
}

function educationalSetups(row) {
  const iv = row.options?.atmIv;
  const hv = row.options?.historicalVol;
  const regime = volRegime(iv, hv);
  const setups = [
    { id: "covered-call", outlook: "mild_bull_or_flat", volBias: ["iv_fair", "iv_rich", "iv_only", "unknown"], plainRisk: "upside_capped" },
    { id: "protective-put", outlook: "own_shares_want_floor", volBias: ["iv_fair", "iv_cheap", "iv_only", "unknown"], plainRisk: "premium_cost" },
    { id: "vertical-spread", outlook: "directional_defined_risk", volBias: ["iv_fair", "iv_rich", "iv_cheap", "iv_only", "unknown"], plainRisk: "defined_max_loss" },
    { id: "calendar-diagonal", outlook: "time_and_vol_view", volBias: ["iv_cheap", "iv_fair", "iv_only"], plainRisk: "timing_and_iv_change" },
    { id: "straddle-strangle", outlook: "big_move_either_way", volBias: ["iv_cheap", "iv_fair"], plainRisk: "needs_large_move" },
    { id: "butterfly", outlook: "pin_near_strike", volBias: ["iv_rich", "iv_fair"], plainRisk: "narrow_profit_zone" },
  ];
  return setups.map((s) => ({
    ...s,
    shown: true,
    volRegime: regime,
    volAligned: s.volBias.includes(regime),
    ivNote: iv == null ? "iv_missing" : "iv_present",
  }));
}

async function fetchFundamentals(session, ticker) {
  const modules = [
    "defaultKeyStatistics",
    "financialData",
    "summaryDetail",
    "incomeStatementHistoryQuarterly",
  ].join(",");
  const res = await yahooJson(
    session,
    `/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`
  );
  if (!res.ok) {
    return { ok: false, blocker: `Yahoo quoteSummary HTTP ${res.status}`, fundamentals: null };
  }
  const block = res.data?.quoteSummary?.result?.[0];
  if (!block) {
    return { ok: false, blocker: "Yahoo quoteSummary empty", fundamentals: null };
  }
  const ks = block.defaultKeyStatistics || {};
  const fd = block.financialData || {};
  const sd = block.summaryDetail || {};
  const hist = block.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
  const revs = hist.map((h) => raw(h.totalRevenue));
  const nis = hist.map((h) => raw(h.netIncome));

  return {
    ok: true,
    blocker: null,
    fundamentals: {
      trailingPE: round(raw(ks.trailingPE) ?? raw(sd.trailingPE), 2),
      forwardPE: round(raw(ks.forwardPE) ?? raw(sd.forwardPE), 2),
      priceToBook: round(raw(ks.priceToBook), 2),
      roe: round(raw(fd.returnOnEquity), 4),
      debtToEquity: round(raw(fd.debtToEquity), 2),
      profitMargin: round(raw(fd.profitMargins), 4),
      grossMargin: round(raw(fd.grossMargins), 4),
      revenueTrend: yoyTrend(revs),
      earningsTrend: yoyTrend(nis),
      quartersAvailable: hist.length,
    },
  };
}

async function fetchHistoricalVol(session, ticker) {
  const p2 = Math.floor(Date.now() / 1000) + 3600;
  const p1 = p2 - 80 * 86400;
  const res = await yahooJson(
    session,
    `/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&period1=${p1}&period2=${p2}`
  );
  if (!res.ok) return null;
  const r = res.data?.chart?.result?.[0];
  const closes = (r?.indicators?.quote?.[0]?.close || []).filter((c) => c != null);
  // 21 daily log returns, sample stdev, ×√252 — single source of truth in math-core (guarded by test:math).
  const hv = annualizedHistVol(closes, { window: 21, periodsPerYear: 252, minCloses: 22, minReturns: 20 });
  return hv == null ? null : round(hv, 4);
}

async function fetchOptions(session, ticker, spotHint) {
  const list = await yahooJson(
    session,
    `/v7/finance/options/${encodeURIComponent(ticker)}`
  );
  if (!list.ok) {
    return { ok: false, blocker: `Yahoo options HTTP ${list.status}`, options: null };
  }
  const chain = list.data?.optionChain?.result?.[0];
  if (!chain) {
    return { ok: false, blocker: "Yahoo options empty chain", options: null };
  }
  const spot = chain.quote?.regularMarketTime
    ? chain.quote?.regularMarketPrice ?? spotHint ?? null
    : chain.quote?.regularMarketPrice ?? spotHint ?? null;
  const exps = chain.expirationDates || [];
  if (!exps.length) {
    return { ok: false, blocker: "no expirationDates", options: null };
  }
  const now = Date.now() / 1000;
  let chosen = exps.find((e) => e - now >= 21 * 86400 && e - now <= 45 * 86400);
  if (chosen == null) chosen = exps.find((e) => e - now >= 14 * 86400) ?? exps[0];

  await sleep(SLEEP_MS);
  const dated = await yahooJson(
    session,
    `/v7/finance/options/${encodeURIComponent(ticker)}?date=${chosen}`
  );
  if (!dated.ok) {
    return { ok: false, blocker: `Yahoo options date HTTP ${dated.status}`, options: null };
  }
  const opt = dated.data?.optionChain?.result?.[0]?.options?.[0];
  const calls = opt?.calls || [];
  const puts = opt?.puts || [];
  if (!calls.length && !puts.length) {
    return { ok: false, blocker: "empty calls/puts for expiry", options: null };
  }

  const atmCall = pickAtm(calls, spot);
  const atmPut = pickAtm(puts, spot);
  let atmIvCall = sanitizeIv(atmCall?.impliedVolatility);
  let atmIvPut = sanitizeIv(atmPut?.impliedVolatility);
  // Fallback: nearest strikes with usable IV if ATM quote IV is junk/zero
  if (atmIvCall == null && spot != null) {
    const near = [...calls]
      .filter((c) => sanitizeIv(c.impliedVolatility) != null)
      .sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot));
    if (near[0]) atmIvCall = sanitizeIv(near[0].impliedVolatility);
  }
  if (atmIvPut == null && spot != null) {
    const near = [...puts]
      .filter((c) => sanitizeIv(c.impliedVolatility) != null)
      .sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot));
    if (near[0]) atmIvPut = sanitizeIv(near[0].impliedVolatility);
  }
  let atmIv = atmIvCall ?? atmIvPut;
  if (atmIvCall != null && atmIvPut != null) atmIv = round((atmIvCall + atmIvPut) / 2, 4);
  // Yahoo sometimes returns near-zero junk IV (~0.03); treat <5% annualized as unusable
  if (atmIv != null && atmIv < 0.05) {
    atmIv = null;
    atmIvCall = null;
    atmIvPut = null;
  }

  const callVol = calls.reduce((s, c) => s + (c.volume || 0), 0);
  const putVol = puts.reduce((s, c) => s + (c.volume || 0), 0);
  const callOi = calls.reduce((s, c) => s + (c.openInterest || 0), 0);
  const putOi = puts.reduce((s, c) => s + (c.openInterest || 0), 0);

  const missing = [];
  if (atmIv == null) missing.push("atmIv");
  if (spot == null) missing.push("spot");
  // Keep chain usable with HV + volume even if ATM IV missing — do not brand whole card incomplete
  const softOnly = missing.length === 1 && missing[0] === "atmIv" && (callVol > 0 || putVol > 0);

  return {
    ok: true,
    blocker: missing.length && !softOnly ? `options fields incomplete: ${missing.join(",")}` : null,
    options: {
      asOfUnderlying: spot,
      expiration: new Date(chosen * 1000).toISOString().slice(0, 10),
      expirationUnix: chosen,
      atmStrikeCall: atmCall?.strike ?? null,
      atmStrikePut: atmPut?.strike ?? null,
      atmIv,
      atmIvCall,
      atmIvPut,
      historicalVol: null,
      ivHvRatio: null,
      callVolume: callVol,
      putVolume: putVol,
      putCallVolumeRatio: callVol > 0 ? round(putVol / callVol, 3) : null,
      callOpenInterest: callOi,
      putOpenInterest: putOi,
      putCallOiRatio: callOi > 0 ? round(putOi / callOi, 3) : null,
      contractCounts: { calls: calls.length, puts: puts.length },
      missingFields: missing,
      paperChain: buildPaperChain(calls, puts, spot, new Date(chosen * 1000).toISOString().slice(0, 10), chosen),
    },
  };
}

function loadPrimaryBook() {
  if (!fs.existsSync(LIBRARY)) return null;
  try {
    const lib = JSON.parse(fs.readFileSync(LIBRARY, "utf8"));
    const it = (lib.items || []).find((x) => x.id === PRIMARY_BOOK_ID);
    if (!it) return null;
    return {
      id: it.id,
      title: it.title,
      titleLocalized: it.titleLocalized || null,
      plainTakeaways: it.plainTakeaways || [],
      plainTakeawaysLocalized: it.plainTakeawaysLocalized || null,
    };
  } catch {
    return null;
  }
}

async function main() {
  const limit = Number(process.env.US_OPTIONS_LIMIT || DEFAULT_LIMIT);
  if (!fs.existsSync(LATEST)) {
    console.error("missing", LATEST);
    process.exit(1);
  }
  const latest = JSON.parse(fs.readFileSync(LATEST, "utf8"));
  const picks = pickTickers(latest, limit);
  const primaryBook = loadPrimaryBook();

  const session = await yahooSession();
  const asOf = new Date().toISOString();
  const tickers = [];
  let sessionBlocker = null;

  if (!session.ok) {
    sessionBlocker = session.error || "Yahoo session failed";
    console.warn("Yahoo session blocker:", sessionBlocker);
  }

  for (const pick of picks) {
    if (!session.ok) {
      tickers.push({
        ...pick,
        fundamentals: null,
        quality: { gate: "incomplete", score: null, missingFields: ["session"], notes: [] },
        options: null,
        setups: educationalSetups({ options: null }),
        blockers: [sessionBlocker],
      });
      continue;
    }

    console.log("fetch", pick.ticker);
    const blockers = [];
    const fund = await fetchFundamentals(session, pick.ticker);
    await sleep(SLEEP_MS);
    const opt = await fetchOptions(session, pick.ticker, pick.price);
    await sleep(SLEEP_MS);
    const hv = await fetchHistoricalVol(session, pick.ticker);
    await sleep(SLEEP_MS);

    if (!fund.ok) blockers.push(fund.blocker);
    if (!opt.ok && opt.blocker) blockers.push(opt.blocker);
    else if (opt.blocker) blockers.push(opt.blocker);

    if (opt.options) {
      opt.options.historicalVol = hv;
      if (opt.options.atmIv != null && hv != null && hv > 0) {
        opt.options.ivHvRatio = round(opt.options.atmIv / hv, 3);
      } else {
        opt.options.ivHvRatio = null;
        const miss = new Set(opt.options.missingFields || []);
        if (opt.options.atmIv == null) miss.add("atmIv");
        if (hv == null) miss.add("historicalVol");
        opt.options.missingFields = [...miss];
      }
    }

    const quality = fund.fundamentals
      ? scoreQuality(fund.fundamentals)
      : {
          gate: "incomplete",
          score: null,
          scoreRaw: 0,
          scoreMax: 0,
          notes: [],
          missingFields: ["fundamentals"],
        };

    const row = {
      ticker: pick.ticker,
      name: pick.name,
      price: opt.options?.asOfUnderlying ?? pick.price,
      dayPct: pick.dayPct,
      screens: pick.screens,
      fundamentals: fund.fundamentals,
      quality,
      options: opt.options,
      blockers,
    };
    row.setups = educationalSetups(row);
    tickers.push(row);
  }

  const snapshot = {
    asOf,
    market: "US",
    source: "Yahoo Finance public quoteSummary + options + chart (crumb session)",
    disclaimer:
      "非投資建議；選擇權風險高。Educational screen only — not personalized advice.",
    primaryBookId: PRIMARY_BOOK_ID,
    primaryBook,
    limit,
    refreshHint:
      "node scripts/fetch-us-options.mjs  （可選：daily-scan 後手動／排程）",
    sessionOk: session.ok,
    sessionBlocker,
    tickers,
  };

  fs.mkdirSync(path.dirname(OUT_PUBLIC), { recursive: true });
  fs.writeFileSync(OUT_PUBLIC, JSON.stringify(snapshot, null, 2) + "\n");
  console.log("wrote", OUT_PUBLIC, "tickers=", tickers.length);

  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    fs.writeFileSync(OUT_DOCS, JSON.stringify(snapshot, null, 2) + "\n");
    console.log("wrote", OUT_DOCS);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
