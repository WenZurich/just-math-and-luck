/**
 * 查股／個股 — MSN Finance–like stock lookup (US + TW).
 * Live fields from public Yahoo Finance (chart / search / quoteSummary when reachable).
 * Official filings: US → SEC EDGAR; TW → MOPS (公開資訊觀測站) deep-links + optional parsed list.
 * Never invents numbers; missing fields omitted. Local earnings-digest used only as fill-in.
 */
import { escapeHtml } from "./glossary.js";
import { t, numberLocale } from "./i18n.js";
import { fetchViaRelayChain } from "./relay.js";

const DIGEST_URL = "./data/earnings-digest.json";
/** Official company-profile snapshot (TWSE/TPEx OpenAPI + MOPS 主要經營業務 + SEC SIC), refreshed by the daily scan. */
const PROFILES_URL = "./data/company-profiles.json";
const MOPS_T05ST03 = "https://mops.twse.com.tw/mops/#/web/t05st03";
const TW_OPENAPI_DOC = "https://openapi.twse.com.tw/";
const YAHOO_HOSTS = [
  "https://query2.finance.yahoo.com",
  "https://query1.finance.yahoo.com",
];
const JINA = "https://r.jina.ai/";
const SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";
/** EDGAR company search (official SEC index): one ticker → CIK, ~1 KB instead of the ~800 KB full map. */
const SEC_ENTITY_SEARCH = (q) => `https://efts.sec.gov/LATEST/search-index?keysTyped=${encodeURIComponent(q)}`;
const SEC_SUBMISSIONS = (cik10) => `https://data.sec.gov/submissions/CIK${cik10}.json`;
const SEC_FORM_KEEP = /^(10-K|10-Q|8-K)(\/A)?$/i;
const OFFICIAL_FILING_LIMIT = 8;

const QS_MODULES = [
  "price",
  "summaryProfile",
  "summaryDetail",
  "defaultKeyStatistics",
  "financialData",
  "calendarEvents",
  "earningsHistory",
].join(",");

let digestCache = null;
let digestPromise = null;
let profilesCache = null;
let profilesPromise = null;
let cikMapCache = null;
let cikMapPromise = null;


function raw(v) {
  if (v == null) return null;
  if (typeof v === "object" && "raw" in v) {
    const n = v.raw;
    return n == null || Number.isNaN(n) ? null : n;
  }
  if (typeof v === "number") return Number.isNaN(v) ? null : v;
  return v;
}

function fmtNum(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  return Number(n).toLocaleString(numberLocale(), {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function fmtPct(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const sign = n > 0 ? "+" : "";
  return `${sign}${Number(n).toFixed(d)}%`;
}

function fmtVol(n) {
  if (n == null || Number.isNaN(n)) return null;
  if (Math.abs(n) >= 1e9) return `${fmtNum(n / 1e9, 2)}B`;
  if (Math.abs(n) >= 1e6) return `${fmtNum(n / 1e6, 2)}M`;
  if (Math.abs(n) >= 1e3) return `${fmtNum(n / 1e3, 1)}K`;
  return fmtNum(n, 0);
}

function fmtMcap(n, currency) {
  if (n == null || Number.isNaN(n)) return null;
  const pref = currency === "TWD" ? "NT$" : currency === "USD" ? "$" : "";
  if (Math.abs(n) >= 1e12) return `${pref}${fmtNum(n / 1e12, 2)}T`;
  if (Math.abs(n) >= 1e9) return `${pref}${fmtNum(n / 1e9, 2)}B`;
  if (Math.abs(n) >= 1e6) return `${pref}${fmtNum(n / 1e6, 2)}M`;
  return `${pref}${fmtNum(n, 0)}`;
}

function fmtPrice(n, currency) {
  if (n == null || Number.isNaN(n)) return null;
  const digits = currency === "TWD" && n >= 100 ? 0 : 2;
  const pref = currency === "USD" ? "$" : currency === "TWD" ? "NT$" : "";
  return `${pref}${fmtNum(n, digits)}`;
}

function fmtAsOf(isoOrSec) {
  try {
    const d =
      typeof isoOrSec === "number"
        ? new Date(isoOrSec * (isoOrSec < 1e12 ? 1000 : 1))
        : new Date(isoOrSec);
    if (Number.isNaN(d.getTime())) return null;
    return (
      d.toLocaleString(numberLocale(), {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + t("taipei")
    );
  } catch {
    return null;
  }
}

function dirClass(n) {
  if (n == null || Number.isNaN(n) || n === 0) return "lk-flat";
  return n > 0 ? "lk-up" : "lk-down";
}

function extractJson(text) {
  if (!text) return null;
  const trimmed = String(text).trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      /* continue */
    }
  }
  const md = trimmed.match(/Markdown Content:\s*(\{[\s\S]*|\[[\s\S]*)/i);
  const blob = md ? md[1].trim() : trimmed;
  const start = blob.search(/[\{\[]/);
  if (start < 0) return null;
  const slice = blob.slice(start);
  for (let end = slice.length; end > 2; end--) {
    try {
      return JSON.parse(slice.slice(0, end));
    } catch {
      /* shrink */
    }
    // jump back to last } or ]
    const cut = Math.max(slice.lastIndexOf("}", end - 2), slice.lastIndexOf("]", end - 2));
    if (cut < 8) break;
    end = cut + 2;
  }
  return null;
}

async function fetchText(url, { timeoutMs = 14000 } = {}) {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetch(url, {
      signal: ctrl?.signal,
      headers: { Accept: "application/json,text/plain,*/*" },
    });
    if (!res.ok) {
      // Keep the body: a proxied Yahoo 404 still carries Yahoo's own JSON ("symbol not found"),
      // while a proxy block (401/403/429) carries the proxy's error. The lookup needs to tell them apart.
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      try { err.body = (await res.text()).slice(0, 4000); } catch { /* ignore */ }
      throw err;
    }
    return await res.text();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** True when the JSON came from Yahoo itself (even an error reply), not from a proxy's own error page. */
export function isYahooReply(data) {
  return Boolean(data && typeof data === "object" && (data.chart || data.finance || data.quoteSummary || data.quoteResponse));
}

/** Aggressive public fetch: direct Yahoo hosts, then r.jina.ai, then backup Worker (CORS-friendly). */
async function fetchYahooJson(pathAndQuery) {
  const errors = [];
  let answered = false;
  for (const host of YAHOO_HOSTS) {
    const url = `${host}${pathAndQuery}`;
    try {
      const text = await fetchText(url, { timeoutMs: 10000 });
      const data = extractJson(text);
      if (data) return { ok: true, data, via: "direct", url };
      errors.push(`${host}: non-json`);
    } catch (e) {
      if (e?.body && isYahooReply(extractJson(e.body))) answered = true;
      errors.push(`${host}: ${e.message || e}`);
    }
  }
  // Relay chain: r.jina.ai on both hosts first, then the backup Worker (skipped while QUOTE_PROXY_URL is empty).
  for (const via of ["jina", "backup"]) {
    for (const host of YAHOO_HOSTS) {
      const url = `${host}${pathAndQuery}`;
      const res = await fetchViaRelayChain(url, {
        fetchText,
        parse: extractJson,
        primaryTimeoutMs: 18000,
        only: [via],
        onError: (e) => {
          if (e?.body && isYahooReply(extractJson(e.body))) answered = true;
        },
      });
      if (res.ok) return { ok: true, data: res.data, via: res.via, url };
      for (const msg of res.errors) errors.push(`${host} ${msg}`);
    }
  }
  return { ok: false, data: null, via: null, answered, error: errors.slice(0, 4).join(" · ") };
}

/** Normalize user input → Yahoo symbol + market. */
export function normalizeSymbol(input, marketHint = "US") {
  let rawIn = String(input || "").trim().toUpperCase();
  rawIn = rawIn.replace(/\s+/g, "");
  if (!rawIn) return { ok: false, error: "empty" };

  const hint = marketHint === "TW" ? "TW" : "US";

  if (/^\d{4}(\.(TW|TWO))?$/.test(rawIn)) {
    const base = rawIn.replace(/\.(TW|TWO)$/, "");
    return {
      ok: true,
      market: "TW",
      symbol: `${base}.TW`,
      alt: `${base}.TWO`,
      display: base,
    };
  }
  if (/\.(TW|TWO)$/.test(rawIn)) {
    return {
      ok: true,
      market: "TW",
      symbol: rawIn,
      alt: rawIn.endsWith(".TW") ? rawIn.replace(/\.TW$/, ".TWO") : rawIn.replace(/\.TWO$/, ".TW"),
      display: rawIn.replace(/\.(TW|TWO)$/, ""),
    };
  }
  if (/^\d{4,6}$/.test(rawIn) && hint === "TW") {
    return {
      ok: true,
      market: "TW",
      symbol: `${rawIn}.TW`,
      alt: `${rawIn}.TWO`,
      display: rawIn,
    };
  }
  // US tickers: letters, dots, dashes (BRK.B → BRK-B Yahoo form)
  let us = rawIn.replace(/\./g, "-");
  if (!/^[A-Z][A-Z0-9\-]{0,9}$/.test(us)) {
    return { ok: false, error: "invalid" };
  }
  return { ok: true, market: "US", symbol: us, alt: null, display: us };
}

function pickChartMeta(data) {
  const result = data?.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta || {};
  const prev =
    meta.chartPreviousClose ??
    meta.previousClose ??
    (Array.isArray(result.indicators?.quote?.[0]?.close)
      ? [...result.indicators.quote[0].close].reverse().find((x) => x != null)
      : null);
  const price = meta.regularMarketPrice ?? null;
  let change = null;
  let changePct = meta.regularMarketChangePercent ?? meta.fulldayChangePercent ?? null;
  if (price != null && prev != null) {
    change = price - prev;
    if (changePct == null && prev !== 0) changePct = (change / prev) * 100;
  }
  return {
    symbol: meta.symbol || null,
    shortName: meta.shortName || null,
    longName: meta.longName || null,
    currency: meta.currency || null,
    exchange: meta.fullExchangeName || meta.exchangeName || null,
    price,
    previousClose: prev ?? null,
    change,
    changePct,
    volume: meta.regularMarketVolume ?? null,
    dayHigh: meta.regularMarketDayHigh ?? null,
    dayLow: meta.regularMarketDayLow ?? null,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    marketTime: meta.regularMarketTime ?? null,
    instrumentType: meta.instrumentType || null,
  };
}

function pickSearch(data, symbol) {
  const quotes = Array.isArray(data?.quotes) ? data.quotes : [];
  const hit =
    quotes.find((q) => String(q.symbol || "").toUpperCase() === symbol.toUpperCase()) ||
    quotes.find((q) => q.isYahooFinance) ||
    quotes[0];
  if (!hit) return null;
  return {
    symbol: hit.symbol || null,
    shortName: hit.shortname || hit.shortName || null,
    longName: hit.longname || hit.longName || null,
    exchange: hit.exchDisp || hit.exchange || null,
    sector: hit.sectorDisp || hit.sector || null,
    industry: hit.industryDisp || hit.industry || null,
    quoteType: hit.quoteType || hit.typeDisp || null,
  };
}

function pickQuoteSummary(data) {
  const block = data?.quoteSummary?.result?.[0];
  if (!block) return null;
  const price = block.price || {};
  const profile = block.summaryProfile || {};
  const detail = block.summaryDetail || {};
  const stats = block.defaultKeyStatistics || {};
  const fin = block.financialData || {};
  const cal = block.calendarEvents?.earnings || {};
  const hist = Array.isArray(block.earningsHistory?.history)
    ? block.earningsHistory.history
    : [];
  const last =
    hist.find((h) => h.period === "-1q") ||
    [...hist].sort((a, b) => String(b.period || "").localeCompare(String(a.period || "")))[0] ||
    null;

  const earnDates = Array.isArray(cal.earningsDate) ? cal.earningsDate : [];
  const nextDate =
    earnDates.map((d) => d?.fmt || (raw(d) != null ? fmtAsOf(raw(d))?.slice(0, 10) : null)).find(Boolean) ||
    null;

  return {
    name: price.longName || price.shortName || null,
    currency: price.currency || detail.currency || null,
    business: profile.longBusinessSummary || null,
    sector: profile.sector || null,
    industry: profile.industry || null,
    website: profile.website || null,
    pe: raw(detail.trailingPE) ?? raw(stats.trailingPE),
    forwardPe: raw(detail.forwardPE) ?? raw(stats.forwardPE),
    marketCap: raw(detail.marketCap) ?? raw(price.marketCap),
    epsTrailing: raw(stats.trailingEps) ?? raw(fin.trailingEps),
    revenue: raw(fin.totalRevenue),
    revenueGrowth: raw(fin.revenueGrowth) != null ? raw(fin.revenueGrowth) * 100 : null,
    earningsGrowth: raw(fin.earningsGrowth) != null ? raw(fin.earningsGrowth) * 100 : null,
    profitMargins: raw(fin.profitMargins) != null ? raw(fin.profitMargins) * 100 : null,
    grossMargins: raw(fin.grossMargins) != null ? raw(fin.grossMargins) * 100 : null,
    dividendYield: raw(detail.dividendYield) != null ? raw(detail.dividendYield) * 100 : null,
    beta: raw(stats.beta) ?? raw(detail.beta),
    bookValue: raw(stats.bookValue),
    nextEarningsDate: nextDate,
    nextEarningsEstimate: raw(cal.earningsAverage),
    lastEpsActual: last ? raw(last.epsActual) : null,
    lastEpsEstimate: last ? raw(last.epsEstimate) : null,
    lastEpsSurprisePct:
      last && raw(last.surprisePercent) != null ? raw(last.surprisePercent) * 100 : null,
    lastEpsPeriod: last?.period || null,
    lastEpsQuarter: last?.quarter?.fmt || null,
  };
}

async function yahooSession() {
  try {
    await fetch("https://guce.yahoo.com/consent?brandType=nonEu", {
      mode: "cors",
      credentials: "include",
      redirect: "follow",
    });
  } catch {
    /* CORS expected in browser */
  }
  for (const host of YAHOO_HOSTS) {
    try {
      const res = await fetch(`${host}/v1/test/getcrumb`, {
        mode: "cors",
        credentials: "include",
      });
      if (!res.ok) continue;
      const crumb = (await res.text()).trim();
      if (crumb && crumb.length < 80 && !crumb.includes("{")) {
        return { ok: true, crumb, host };
      }
    } catch {
      /* continue */
    }
  }
  return { ok: false, crumb: "", host: YAHOO_HOSTS[0] };
}

async function fetchQuoteSummary(symbol) {
  // 1) crumb session (works when cookies/CORS allow)
  const session = await yahooSession();
  if (session.ok) {
    const path = `/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${QS_MODULES}&crumb=${encodeURIComponent(session.crumb)}`;
    try {
      const res = await fetch(`${session.host}${path}`, {
        mode: "cors",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const picked = pickQuoteSummary(data);
        if (picked) return { ok: true, data: picked, via: "yahoo-crumb" };
      }
    } catch {
      /* fall through */
    }
  }

  // 2) unauthenticated attempt via proxy hosts (often 401 — still try)
  const path = `/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${QS_MODULES}`;
  const res = await fetchYahooJson(path);
  if (res.ok) {
    const picked = pickQuoteSummary(res.data);
    if (picked) return { ok: true, data: picked, via: `yahoo-${res.via}` };
  }

  // 3) Yahoo quote HTML SSR embed (when reachable)
  const htmlTry = await fetchYahooHtmlSummary(symbol);
  if (htmlTry.ok) return htmlTry;

  return { ok: false, data: null, via: null, error: res.error || "quoteSummary unavailable" };
}

async function fetchYahooHtmlSummary(symbol) {
  const urls = [
    `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`,
    `${JINA}https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`,
  ];
  for (const url of urls) {
    try {
      const text = await fetchText(url, { timeoutMs: 20000 });
      if (/AbuseAlleviation|Invalid Crumb|AuthenticationRequired/i.test(text) && text.length < 2000) {
        continue;
      }
      // application/json script bodies or escaped SSR
      const scripts = [...text.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)];
      for (const m of scripts) {
        try {
          const outer = JSON.parse(m[1]);
          const body = typeof outer?.body === "string" ? JSON.parse(outer.body) : outer?.body || outer;
          const picked = pickQuoteSummary(body);
          if (picked?.business || picked?.pe != null || picked?.marketCap != null) {
            return { ok: true, data: picked, via: url.startsWith(JINA) ? "yahoo-html-jina" : "yahoo-html" };
          }
        } catch {
          /* next script */
        }
      }
      // escaped longBusinessSummary fallback
      const biz = text.match(/\\"longBusinessSummary\\":\\"(.*?)\\"/);
      if (biz) {
        const business = biz[1]
          .replace(/\\n/g, " ")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
        return {
          ok: true,
          data: { business: business.slice(0, 800) },
          via: "yahoo-html-partial",
        };
      }
    } catch {
      /* next */
    }
  }
  return { ok: false, data: null, via: null };
}

async function loadDigest() {
  if (digestCache) return digestCache;
  if (digestPromise) return digestPromise;
  digestPromise = (async () => {
    try {
      const res = await fetch(DIGEST_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      digestCache = await res.json();
    } catch {
      digestCache = { mag7: [], watchlistHot: [] };
    }
    return digestCache;
  })();
  return digestPromise;
}

async function loadProfiles() {
  if (profilesCache) return profilesCache;
  if (profilesPromise) return profilesPromise;
  profilesPromise = (async () => {
    try {
      const res = await fetch(PROFILES_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      profilesCache = await res.json();
    } catch {
      profilesCache = { tw: {}, us: {} };
    }
    return profilesCache;
  })();
  return profilesPromise;
}

/**
 * Official 「公司在做什麼」 fallback — only official fields, never invented.
 * TW: MOPS 主要經營業務 (snapshot) → else TWSE/TPEx basics (name, 上市/上櫃, 產業類別).
 * US: SEC EDGAR SIC description (snapshot, else the live SEC submissions the lookup already fetched).
 * @returns {{ text: string, industry: string|null, srcKey: string, srcUrl: string } | null}
 */
export function officialBusiness({ market, symbol, profiles, secProfile } = {}) {
  const p = profiles || { tw: {}, us: {} };
  if (market === "TW") {
    const code = String(symbol || "").replace(/\.(TW|TWO)$/i, "");
    const row = p.tw?.[code];
    if (!row) return null;
    if (row.biz) {
      return { text: String(row.biz), industry: row.ind || null, srcKey: "lookupBizSrcMops", srcUrl: MOPS_T05ST03 };
    }
    if (row.n || row.f) {
      return {
        text: t("lookupBizTwBasics", { n: row.n || row.f, f: row.f || row.n, mk: row.mk || "", ind: row.ind || "—" }),
        industry: row.ind || null,
        srcKey: "lookupBizSrcTwOpenApi",
        srcUrl: TW_OPENAPI_DOC,
      };
    }
    return null;
  }
  const key = String(symbol || "").toUpperCase().replace(/\./g, "-");
  const row = p.us?.[key];
  const sicDesc = row?.sicDesc || secProfile?.sicDescription || null;
  const sic = row?.sic || secProfile?.sic || null;
  if (!sicDesc) return null;
  const cik = row?.cik || secProfile?.cik || null;
  const ex = row?.ex || secProfile?.exchanges || "";
  return {
    text: t("lookupBizUsSic", { desc: sicDesc, sic: sic || "—", ex: ex ? ` · ${ex}` : "" }),
    industry: sicDesc,
    srcKey: "lookupBizSrcSec",
    srcUrl: cik
      ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(cik)}&type=&dateb=&owner=include&count=40`
      : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(key)}&type=&dateb=&owner=include&count=40`,
  };
}

function digestMatch(symbol) {
  const dig = digestCache;
  if (!dig) return null;
  const ticker = String(symbol || "")
    .replace(/\.TW$/i, "")
    .replace(/\.TWO$/i, "")
    .toUpperCase();
  const rows = [...(dig.mag7 || []), ...(dig.watchlistHot || [])];
  return rows.find((r) => String(r.ticker || "").toUpperCase() === ticker) || null;
}

/** Zero-pad CIK to 10 digits for data.sec.gov. */
export function padCik(cik) {
  const n = String(cik ?? "").replace(/\D/g, "");
  if (!n) return null;
  return n.padStart(10, "0").slice(-10);
}

/** Build SEC Archives document URL from CIK + accession + primary doc. */
export function edgarDocumentUrl(cik, accessionNumber, primaryDocument) {
  const bare = String(cik ?? "").replace(/^0+/, "") || String(cik ?? "").replace(/\D/g, "");
  const acc = String(accessionNumber || "").replace(/-/g, "");
  const doc = String(primaryDocument || "").trim();
  if (!bare || !acc || !doc) return null;
  return `https://www.sec.gov/Archives/edgar/data/${bare}/${acc}/${doc}`;
}

/** Pure official deep-links (no network). Used by UI + smoke tests. */
export function buildOfficialLinks({ market, symbol, display, website, cik } = {}) {
  const m = market === "TW" ? "TW" : "US";
  const sym = String(symbol || "").toUpperCase();
  const code = String(display || sym.replace(/\.(TW|TWO)$/i, "")).replace(/\D/g, "").slice(0, 6);
  const links = [];
  const now = new Date();
  const rocYear = now.getFullYear() - 1911;

  if (m === "US") {
    const ticker = sym.replace(/-/, "."); // BRK-B display form for entity search
    const cik10 = padCik(cik);
    const cikBare = cik10 ? String(Number(cik10)) : null;
    links.push({
      kind: "official",
      id: "sec-edgar-search",
      labelKey: "lookupSecEdgarSearch",
      href: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(ticker)}&type=&dateb=&owner=include&count=40`,
    });
    if (cikBare) {
      links.push({
        kind: "official",
        id: "sec-edgar-browse",
        labelKey: "lookupSecEdgarBrowse",
        href: `https://www.sec.gov/edgar/browse/?CIK=${encodeURIComponent(cikBare)}`,
      });
    }
    links.push({
      kind: "official",
      id: "sec-forms-filter",
      labelKey: "lookupSecFormsFilter",
      href: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(cik10 || ticker)}&type=10-&dateb=&owner=include&count=40`,
    });
  } else {
    // TW — MOPS official portals (code deep-links when possible)
    if (code) {
      links.push({
        kind: "official",
        id: "mops-financial-book",
        labelKey: "lookupMopsFinancialBook",
        href: `https://mops.twse.com.tw/server-java/t57sb01?step=1&colorchg=1&co_id=${encodeURIComponent(code)}&year=${rocYear}&season=&mtype=A`,
      });
      links.push({
        kind: "official",
        id: "mops-financial-query",
        labelKey: "lookupMopsFinancialQuery",
        href: `https://mops.twse.com.tw/mops/web/t57sb01_q1`,
      });
      links.push({
        kind: "official",
        id: "mops-company",
        labelKey: "lookupMopsCompany",
        href: `https://mops.twse.com.tw/mops/web/t05st01?co_id=${encodeURIComponent(code)}`,
      });
      links.push({
        kind: "official",
        id: "mops-material",
        labelKey: "lookupMopsMaterial",
        href: `https://mops.twse.com.tw/mops/web/t05st02?co_id=${encodeURIComponent(code)}`,
      });
      // ISIN / TWSE basic search (official TWSE ecosystem)
      links.push({
        kind: "official",
        id: "twse-isin",
        labelKey: "lookupTwseIsin",
        href: `https://isin.twse.com.tw/isin/basic_search.jsp?code=${encodeURIComponent(code)}`,
      });
      if (/\.TWO$/i.test(sym)) {
        links.push({
          kind: "official",
          id: "tpex-company",
          labelKey: "lookupTpexCompany",
          href: `https://www.tpex.org.tw/zh-tw/mainboard/listed/company-detail.html?stkno=${encodeURIComponent(code)}`,
        });
      }
    } else {
      links.push({
        kind: "official",
        id: "mops-home",
        labelKey: "lookupMopsFinancialQuery",
        href: "https://mops.twse.com.tw/mops/web/t57sb01_q1",
      });
    }
    // Secondary quote source — clearly not official filings
    if (sym) {
      links.push({
        kind: "quote",
        id: "yahoo-tw",
        labelKey: "lookupYahooTwQuote",
        href: `https://tw.stock.yahoo.com/quote/${encodeURIComponent(sym)}`,
      });
    }
  }

  if (website && /^https?:\/\//i.test(String(website))) {
    links.push({
      kind: "company",
      id: "company-website",
      labelKey: "lookupCompanyWebsite",
      href: String(website).trim(),
    });
  }

  return { market: m, links, code: code || null, cik: padCik(cik) };
}

async function fetchPublicJson(url, { timeoutMs = 18000, directFallback = true } = {}) {
  // Prefer jina for SEC (browser CORS + UA blocks on data.sec.gov)
  const errors = [];
  for (const tryUrl of directFallback ? [`${JINA}${url}`, url] : [`${JINA}${url}`]) {
    try {
      const text = await fetchText(tryUrl, { timeoutMs });
      const data = extractJson(text);
      if (data) return { ok: true, data, via: tryUrl.startsWith(JINA) ? "jina" : "direct" };
      errors.push(`${tryUrl.startsWith(JINA) ? "jina" : "direct"}: non-json`);
    } catch (e) {
      errors.push(`${tryUrl.startsWith(JINA) ? "jina" : "direct"}: ${e.message || e}`);
    }
  }
  return { ok: false, data: null, via: null, error: errors.slice(0, 3).join(" · ") };
}

async function loadCikMap() {
  if (cikMapCache) return cikMapCache;
  if (cikMapPromise) return cikMapPromise;
  cikMapPromise = (async () => {
    // www.sec.gov sends no CORS header, so a direct browser fetch can never succeed; jina only.
    const res = await fetchPublicJson(SEC_TICKERS_URL, { timeoutMs: 22000, directFallback: false });
    const map = new Map();
    if (res.ok && res.data && typeof res.data === "object") {
      for (const row of Object.values(res.data)) {
        const t = String(row?.ticker || "").toUpperCase();
        const cik = padCik(row?.cik_str);
        if (t && cik) map.set(t, cik);
      }
    }
    cikMapCache = { map, via: res.via, ok: res.ok, error: res.error || null };
    return cikMapCache;
  })();
  return cikMapPromise;
}

/** Pick the exact-ticker hit from an EDGAR entity search response (tickers field is "A, B"). */
export function pickCikFromEntitySearch(data, key) {
  const hits = data?.hits?.hits;
  if (!Array.isArray(hits)) return null;
  const want = String(key || "").toUpperCase();
  for (const h of hits) {
    const tickers = String(h?._source?.tickers || "")
      .toUpperCase()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((x) => x.replace(/\./g, "-"));
    if (tickers.includes(want)) {
      const cik = padCik(h?._id);
      if (cik) return cik;
    }
  }
  return null;
}

const cikSearchCache = new Map();

async function searchCik(key) {
  if (cikSearchCache.has(key)) return cikSearchCache.get(key);
  const p = fetchPublicJson(SEC_ENTITY_SEARCH(key), { timeoutMs: 12000, directFallback: false }).then((res) =>
    res.ok ? pickCikFromEntitySearch(res.data, key) : null,
  );
  cikSearchCache.set(key, p);
  return p;
}

export async function resolveCik(ticker) {
  const key = String(ticker || "")
    .toUpperCase()
    .replace(/\./g, "-");
  if (!key) return { ok: false, cik: null };
  if (!cikMapCache) {
    try {
      const fast = await searchCik(key);
      if (fast) return { ok: true, cik: fast, via: "edgar-search", error: null };
    } catch {
      /* fall through to the full SEC map */
    }
  }
  const pack = await loadCikMap();
  const cik = pack.map.get(key) || null;
  return { ok: Boolean(cik), cik, via: pack.via, error: cik ? null : pack.error || "cik_not_found" };
}

function pickRecentSecFilings(submissions, { limit = OFFICIAL_FILING_LIMIT } = {}) {
  const recent = submissions?.filings?.recent;
  if (!recent || !Array.isArray(recent.form)) return [];
  const cik = padCik(submissions.cik);
  const out = [];
  for (let i = 0; i < recent.form.length && out.length < limit; i++) {
    const form = String(recent.form[i] || "");
    if (!SEC_FORM_KEEP.test(form)) continue;
    const accessionNumber = recent.accessionNumber?.[i] || null;
    const primaryDocument = recent.primaryDocument?.[i] || null;
    const filingDate = recent.filingDate?.[i] || null;
    const description =
      recent.primaryDocDescription?.[i] ||
      recent.items?.[i] ||
      form;
    const href = edgarDocumentUrl(cik, accessionNumber, primaryDocument);
    if (!href) continue;
    out.push({
      form,
      filingDate,
      description: String(description || form).slice(0, 160),
      accessionNumber,
      href,
    });
  }
  return out;
}

async function fetchSecRecentFilings(cik10) {
  const padded = padCik(cik10);
  if (!padded) return { ok: false, filings: [], companyName: null, investorWebsite: null, error: "no_cik" };
  const res = await fetchPublicJson(SEC_SUBMISSIONS(padded), { timeoutMs: 22000 });
  if (!res.ok) return { ok: false, filings: [], companyName: null, investorWebsite: null, error: res.error };
  const filings = pickRecentSecFilings(res.data);
  const investorWebsite =
    res.data?.investorWebsite && /^https?:\/\//i.test(res.data.investorWebsite)
      ? res.data.investorWebsite
      : null;
  return {
    ok: true,
    filings,
    companyName: res.data?.name || null,
    investorWebsite,
    sic: res.data?.sic ? String(res.data.sic) : null,
    sicDescription: res.data?.sicDescription || null,
    exchanges: Array.isArray(res.data?.exchanges) ? res.data.exchanges.filter(Boolean).join("/") : null,
    via: res.via,
  };
}

/**
 * Attach official filings bundle for US (SEC) or TW (MOPS links).
 * Always returns working official deep-links; recent list only when publicly fetchable.
 */
export async function fetchOfficialFilings({ market, symbol, display, website } = {}) {
  const base = buildOfficialLinks({ market, symbol, display, website, cik: null });
  const out = {
    market: base.market,
    links: base.links,
    recent: [],
    cik: null,
    status: "links_only",
    noteKey: null,
    sources: [],
  };

  if (base.market === "TW") {
    out.status = "links_ready";
    out.noteKey = "lookupFilingsTwNote";
    out.sources.push("MOPS");
    return out;
  }

  // US — resolve CIK + recent 10-K / 10-Q / 8-K when public JSON reachable
  const ticker = String(symbol || "").toUpperCase();
  try {
    const cikRes = await resolveCik(ticker);
    if (cikRes.ok) {
      out.cik = cikRes.cik;
      out.links = buildOfficialLinks({ market: "US", symbol, display, website, cik: cikRes.cik }).links;
      if (cikRes.via) out.sources.push(`SEC ticker map (${cikRes.via})`);
      const sub = await fetchSecRecentFilings(cikRes.cik);
      if (sub.ok) {
        out.recent = sub.filings;
        out.status = sub.filings.length ? "filings_ok" : "filings_empty";
        out.noteKey = sub.filings.length ? null : "lookupFilingsListEmpty";
        if (sub.via) out.sources.push(`SEC submissions (${sub.via})`);
        if (sub.sicDescription) {
          out.secProfile = { cik: cikRes.cik, sic: sub.sic, sicDescription: sub.sicDescription, exchanges: sub.exchanges };
        }
        if (sub.investorWebsite) {
          const already = out.links.some((l) => l.href === sub.investorWebsite);
          if (!already) {
            out.links.push({
              kind: "company",
              id: "sec-investor-site",
              labelKey: "lookupInvestorRelations",
              href: sub.investorWebsite,
            });
          }
        }
      } else {
        out.status = "filings_unavailable";
        out.noteKey = "lookupFilingsListUnavailable";
      }
    } else {
      out.status = "cik_unavailable";
      out.noteKey = "lookupFilingsCikUnavailable";
    }
  } catch (e) {
    out.status = "filings_unavailable";
    out.noteKey = "lookupFilingsListUnavailable";
  }
  return out;
}

function mergeSnapshot({ market, symbol, chart, search, summary, digest }) {
  const currency =
    summary?.currency || chart?.currency || (market === "TW" ? "TWD" : "USD");
  const name =
    summary?.name ||
    chart?.longName ||
    chart?.shortName ||
    search?.longName ||
    search?.shortName ||
    digest?.name ||
    symbol;

  const business =
    summary?.business ||
    (digest?.whatItDoes ? String(digest.whatItDoes) : null) ||
    null;

  const out = {
    market,
    symbol,
    name,
    business,
    sector: summary?.sector || search?.sector || null,
    industry: summary?.industry || search?.industry || null,
    exchange: chart?.exchange || search?.exchange || null,
    currency,
    price: chart?.price ?? null,
    change: chart?.change ?? null,
    changePct: chart?.changePct ?? null,
    previousClose: chart?.previousClose ?? null,
    volume: chart?.volume ?? null,
    dayHigh: chart?.dayHigh ?? null,
    dayLow: chart?.dayLow ?? null,
    fiftyTwoWeekHigh: chart?.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: chart?.fiftyTwoWeekLow ?? null,
    marketTime: chart?.marketTime ?? null,
    pe: summary?.pe ?? digest?.pe ?? null,
    forwardPe: summary?.forwardPe ?? digest?.forwardPe ?? null,
    marketCap: summary?.marketCap ?? digest?.marketCap ?? null,
    epsTrailing: summary?.epsTrailing ?? null,
    revenue: summary?.revenue ?? null,
    revenueGrowth: summary?.revenueGrowth ?? digest?.revenueYoYPct ?? null,
    earningsGrowth: summary?.earningsGrowth ?? digest?.epsYoYPct ?? null,
    profitMargins: summary?.profitMargins ?? null,
    grossMargins: summary?.grossMargins ?? null,
    dividendYield: summary?.dividendYield ?? null,
    beta: summary?.beta ?? null,
    nextEarningsDate: summary?.nextEarningsDate ?? digest?.nextEarningsDate ?? null,
    nextEarningsEstimate: summary?.nextEarningsEstimate ?? digest?.consensusEpsNext ?? null,
    lastEpsActual: summary?.lastEpsActual ?? digest?.lastReport?.epsActual ?? null,
    lastEpsEstimate: summary?.lastEpsEstimate ?? digest?.lastReport?.epsEstimate ?? null,
    lastEpsSurprisePct:
      summary?.lastEpsSurprisePct ?? digest?.lastReport?.epsSurprisePct ?? null,
    lastEpsQuarter: summary?.lastEpsQuarter ?? digest?.lastReport?.quarter ?? null,
    website: summary?.website || null,
    sources: [],
    filings: null,
  };
  return out;
}

/**
 * Quote source unreachable → card from data the site already published (no live numbers, nothing invented):
 * official company basics (TWSE/TPEx/MOPS snapshot or SEC SIC), the morning earnings digest, and the
 * official filings deep-links (pure URLs, no network).
 */
export function buildOfflineCard(norm, { profiles = profilesCache, digest = digestCache } = {}) {
  if (!norm?.ok) return null;
  const market = norm.market;
  let symbol = norm.symbol;
  let name = null;
  let known = false;
  if (market === "TW") {
    const row = profiles?.tw?.[norm.display];
    if (row) {
      known = true;
      name = row.n || row.f || null;
      if (row.mk === "上櫃" && norm.alt) symbol = norm.alt;
    }
  }
  const dig = market === "US" ? digestMatchIn(digest, symbol) : null;
  if (dig) {
    known = true;
    name = name || dig.name || null;
  }
  const off = officialBusiness({ market, symbol, profiles, secProfile: null });
  if (off) known = true;
  const business = off?.text || (dig?.whatItDoes ? String(dig.whatItDoes) : null);
  const businessSource = off ? { key: off.srcKey, url: off.srcUrl } : dig?.whatItDoes ? { key: "lookupBizSrcDigest", url: null } : null;
  const website = market === "TW" ? profiles?.tw?.[norm.display]?.web || null : null;
  const links = buildOfficialLinks({ market, symbol, display: norm.display, website, cik: null }).links;
  const earnings = dig
    ? {
        nextEarningsDate: dig.nextEarningsDate || null,
        nextIsEstimate: Boolean(dig.nextEarningsDateIsEstimate),
        lastEpsActual: dig.lastReport?.epsActual ?? null,
        nextEpsConsensus: dig.consensusEpsNext ?? null,
        lastEpsQuarter: dig.lastReport?.quarter || null,
        asOf: digest?.asOf || null,
      }
    : null;
  return { market, symbol, display: norm.display, name, known, business, businessSource, links, earnings };
}

function digestMatchIn(dig, symbol) {
  if (!dig) return null;
  const ticker = String(symbol || "").replace(/\.TWO?$/i, "").toUpperCase();
  const rows = [...(dig.mag7 || []), ...(dig.watchlistHot || [])];
  return rows.find((r) => String(r.ticker || "").toUpperCase() === ticker) || null;
}

export async function lookupStock(input, marketHint = "US") {
  const norm = normalizeSymbol(input, marketHint);
  if (!norm.ok) {
    return { ok: false, error: norm.error || "invalid", snapshot: null };
  }

  await Promise.all([loadDigest(), loadProfiles()]);

  const trySymbols = [norm.symbol];
  if (norm.alt) trySymbols.push(norm.alt);

  let chart = null;
  let usedSymbol = norm.symbol;
  let chartVia = null;
  let chartError = null;
  /** Did Yahoo itself answer at least once (even "not found")? If not, the quote source was unreachable. */
  let yahooAnswered = false;

  for (const sym of trySymbols) {
    const res = await fetchYahooJson(
      `/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d&includePrePost=false`
    );
    if (res.ok || res.answered) yahooAnswered = true;
    if (res.ok) {
      chart = pickChartMeta(res.data);
      if (chart?.price != null || chart?.longName || chart?.shortName) {
        usedSymbol = sym;
        chartVia = res.via;
        break;
      }
      chart = null;
    } else {
      chartError = res.error;
    }
  }

  if (!chart && !yahooAnswered) {
    // Not a wrong ticker: the public quote route (direct Yahoo is CORS-blocked; the reader proxy refused
    // or timed out). Show what the site already holds from official / public snapshots instead of a dead end.
    return {
      ok: false,
      error: "unreachable",
      detail: chartError,
      snapshot: null,
      offline: buildOfflineCard(norm),
      symbol: norm.symbol,
      market: norm.market,
    };
  }

  if (!chart) {
    return {
      ok: false,
      error: "not_found",
      detail: chartError,
      snapshot: null,
      symbol: usedSymbol,
      market: norm.market,
    };
  }

  const searchQ = encodeURIComponent(norm.display || usedSymbol);
  const searchRes = await fetchYahooJson(
    `/v1/finance/search?q=${searchQ}&quotesCount=8&newsCount=0&listsCount=0`
  );
  const search = searchRes.ok ? pickSearch(searchRes.data, usedSymbol) : null;

  const qs = await fetchQuoteSummary(usedSymbol);
  const digest = digestMatch(usedSymbol);

  const snapshot = mergeSnapshot({
    market: norm.market,
    symbol: usedSymbol,
    chart,
    search,
    summary: qs.data,
    digest,
  });

  const sources = [];
  if (chartVia) sources.push(`Yahoo chart (${chartVia})`);
  if (searchRes.ok) sources.push(`Yahoo search (${searchRes.via})`);
  if (qs.ok) sources.push(`Yahoo quoteSummary (${qs.via})`);
  if (digest) sources.push("site earnings-digest");

  const filings = await fetchOfficialFilings({
    market: norm.market,
    symbol: usedSymbol,
    display: norm.display,
    website: snapshot.website,
  });
  snapshot.filings = filings;
  if (Array.isArray(filings?.sources)) {
    for (const s of filings.sources) sources.push(s);
  }
  // 「公司在做什麼」 official fallback when Yahoo / digest have nothing (e.g. proxy blocked).
  if (!snapshot.business) {
    const off = officialBusiness({
      market: norm.market,
      symbol: usedSymbol,
      profiles: profilesCache,
      secProfile: filings?.secProfile || null,
    });
    if (off) {
      snapshot.business = off.text;
      snapshot.businessSource = { key: off.srcKey, url: off.srcUrl };
      if (!snapshot.industry && off.industry) snapshot.industry = off.industry;
      sources.push(t(off.srcKey));
    }
  }
  snapshot.sources = sources;

  return {
    ok: true,
    snapshot,
    market: norm.market,
    symbol: usedSymbol,
    partial: !qs.ok,
  };
}

function metric(label, valueHtml) {
  if (!valueHtml) return "";
  return `<div class="lk-metric">
    <div class="lk-ml">${escapeHtml(label)}</div>
    <div class="lk-mv">${valueHtml}</div>
  </div>`;
}

function val(text) {
  if (text == null || text === "") return null;
  return `<span class="lk-mono">${escapeHtml(String(text))}</span>`;
}

function kindBadge(kind) {
  if (kind === "official") return `<span class="lk-src-badge lk-src-official">${escapeHtml(t("lookupSourceOfficial"))}</span>`;
  if (kind === "quote") return `<span class="lk-src-badge lk-src-quote">${escapeHtml(t("lookupSourceQuote"))}</span>`;
  if (kind === "company") return `<span class="lk-src-badge lk-src-company">${escapeHtml(t("lookupSourceCompany"))}</span>`;
  return "";
}

function paintOfficialFilings(filings) {
  if (!filings || !Array.isArray(filings.links) || !filings.links.length) return "";
  const linkItems = filings.links
    .map((L) => {
      if (!L?.href) return "";
      const label = t(L.labelKey || "lookupOfficialFilings");
      return `<li class="lk-ofil-item">
        ${kindBadge(L.kind)}
        <a class="lk-ofil-link" href="${escapeHtml(L.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>
      </li>`;
    })
    .filter(Boolean)
    .join("");

  let recentHtml = "";
  if (filings.market === "US") {
    if (Array.isArray(filings.recent) && filings.recent.length) {
      const rows = filings.recent
        .map((f) => {
          const title = f.description || f.form || "";
          return `<tr>
            <td class="lk-ofil-form"><span class="lk-mono">${escapeHtml(f.form || "")}</span></td>
            <td class="lk-ofil-date">${escapeHtml(f.filingDate || "—")}</td>
            <td class="lk-ofil-title"><a href="${escapeHtml(f.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a></td>
          </tr>`;
        })
        .join("");
      recentHtml = `
        <h5 class="lk-h5">${escapeHtml(t("lookupRecentFilings"))}</h5>
        <div class="lk-ofil-table-wrap">
          <table class="lk-ofil-table">
            <thead><tr>
              <th>${escapeHtml(t("lookupFilingForm"))}</th>
              <th>${escapeHtml(t("lookupFilingDate"))}</th>
              <th>${escapeHtml(t("lookupFilingDoc"))}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    } else {
      const note = filings.noteKey ? t(filings.noteKey) : t("lookupFilingsListUnavailable");
      recentHtml = `<p class="lk-ofil-note">${escapeHtml(note)}</p>
        <p class="lk-ofil-note">${escapeHtml(t("lookupFilingsLinksStillWork"))}</p>`;
    }
  } else if (filings.market === "TW") {
    const note = filings.noteKey ? t(filings.noteKey) : t("lookupFilingsTwNote");
    recentHtml = `<p class="lk-ofil-note">${escapeHtml(note)}</p>`;
  }

  const cikLine =
    filings.cik
      ? `<p class="lk-ofil-meta">${escapeHtml(t("lookupCikLabel"))}: <span class="lk-mono">${escapeHtml(filings.cik)}</span></p>`
      : "";

  return `
    <section class="lk-block lk-ofil" aria-label="${escapeHtml(t("lookupOfficialFilings"))}">
      <h4 class="lk-h4">${escapeHtml(t("lookupOfficialFilings"))}</h4>
      <p class="lk-ofil-lead">${escapeHtml(t("lookupOfficialFilingsLead"))}</p>
      ${cikLine}
      <ul class="lk-ofil-links">${linkItems}</ul>
      ${recentHtml}
    </section>`;
}

function paintUnreachable(root, result) {
  const c = result.offline;
  const fmtTpe = (iso) => {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
    } catch { return ""; }
  };
  const marketBadge = c
    ? `<span class="lk-badge ${c.market === "TW" ? "lk-badge-tw" : "lk-badge-us"}">${escapeHtml(t(c.market === "TW" ? "twStock" : "usStock"))}</span>`
    : "";
  const bizSrc = c?.businessSource
    ? c.businessSource.url
      ? `<p class="lk-muted">${escapeHtml(t("lookupBizSourceLabel"))}<a href="${escapeHtml(c.businessSource.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(c.businessSource.key))}</a></p>`
      : `<p class="lk-muted">${escapeHtml(t("lookupBizSourceLabel"))}${escapeHtml(t(c.businessSource.key, { at: fmtTpe(c.earnings?.asOf) }))}</p>`
    : "";
  const biz = c?.business
    ? `<section class="lk-block" aria-label="${escapeHtml(t("lookupBusiness"))}">
        <h4 class="lk-h4">${escapeHtml(t("lookupBusiness"))}</h4>
        <p class="lk-biz">${escapeHtml(c.business.length > 520 ? `${c.business.slice(0, 520)}…` : c.business)}</p>${bizSrc}
      </section>`
    : "";
  const e = c?.earnings;
  const earn = e && (e.nextEarningsDate || e.lastEpsActual != null)
    ? `<section class="lk-block" aria-label="${escapeHtml(t("lookupEarnings"))}">
        <h4 class="lk-h4">${escapeHtml(t("lookupEarnings"))}</h4>
        <div class="lk-metrics">
          ${metric(t("earningsNextDate"), val(e.nextEarningsDate ? `${e.nextEarningsDate}${e.nextIsEstimate ? t("lookupEstSuffix") : ""}` : null))}
          ${metric(t("earningsLastEps"), e.lastEpsActual != null
            ? val(`${fmtNum(e.lastEpsActual, 2)}${e.lastEpsQuarter ? ` · ${e.lastEpsQuarter}` : ""}`)
            : null)}
          ${metric(t("lookupEpsConsensus"), e.nextEpsConsensus != null ? val(fmtNum(e.nextEpsConsensus, 2)) : null)}
        </div>
        ${e.asOf ? `<p class="lk-muted">${escapeHtml(t("lookupOfflineDigestAsOf", { at: fmtTpe(e.asOf) }))}</p>` : ""}
      </section>`
    : "";
  const filings = c ? paintOfficialFilings({ market: c.market, links: c.links, recent: [], noteKey: c.market === "TW" ? "lookupFilingsTwNote" : "lookupOfflineFilingsNote" }) : "";
  root.innerHTML = `
    <div class="lk-unreach" role="alert">
      <p class="lk-unreach-title">${escapeHtml(t("lookupUnreachTitle"))}</p>
      <p class="lk-unreach-body">${escapeHtml(t("lookupUnreachBody"))}</p>
      <button type="button" class="lk-retry" data-lk-retry>${escapeHtml(t("lookupRetry"))}</button>
    </div>
    ${c ? `<article class="lk-card lk-card-offline" data-symbol="${escapeHtml(c.symbol)}">
      <header class="lk-card-head">
        <div>
          <div class="lk-sym-row">
            <span class="lk-symbol">${escapeHtml(c.market === "TW" ? c.display : c.symbol)}</span>
            ${marketBadge}
            <span class="lk-offline-tag">${escapeHtml(t("lookupOfflineTag"))}</span>
          </div>
          ${c.name ? `<h3 class="lk-name">${escapeHtml(c.name)}</h3>` : ""}
          ${c.known ? "" : `<p class="lk-meta-line">${escapeHtml(t("lookupOfflineUnknown"))}</p>`}
        </div>
      </header>
      ${biz}
      ${earn}
      ${filings}
      <p class="lk-disclaimer" role="note">${escapeHtml(t("lookupDisclaimer"))}</p>
    </article>` : ""}`;
}

function paintResult(root, result) {
  if (result?.error === "unreachable") {
    paintUnreachable(root, result);
    return;
  }
  if (!result?.ok || !result.snapshot) {
    const msg =
      result?.error === "empty"
        ? t("lookupEmptyInput")
        : result?.error === "invalid"
          ? t("lookupInvalid")
          : result?.error === "not_found"
            ? t("lookupNotFound")
            : t("lookupError", { msg: result?.detail || result?.error || "error" });
    root.innerHTML = `<div class="lk-empty" role="status">${escapeHtml(msg)}</div>`;
    return;
  }

  const s = result.snapshot;
  const dir = dirClass(s.changePct ?? s.change);
  const marketBadge =
    s.market === "TW"
      ? `<span class="lk-badge lk-badge-tw">${escapeHtml(t("twStock"))}</span>`
      : `<span class="lk-badge lk-badge-us">${escapeHtml(t("usStock"))}</span>`;

  const bizSrc = s.businessSource
    ? `<p class="lk-muted">${escapeHtml(t("lookupBizSourceLabel"))}<a href="${escapeHtml(s.businessSource.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(s.businessSource.key))}</a></p>`
    : "";
  const biz = s.business
    ? `<p class="lk-biz">${escapeHtml(s.business.length > 520 ? `${s.business.slice(0, 520)}…` : s.business)}</p>${bizSrc}`
    : "";
  // No public text reachable right now: point to the official source instead of a "data missing" placeholder.
  const bizOfficialHref =
    s.market === "TW"
      ? MOPS_T05ST03
      : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(s.symbol)}&type=&dateb=&owner=include&count=40`;
  const bizFallback = `<p class="lk-muted">${escapeHtml(t("lookupBizOfficialOnly"))}<a href="${escapeHtml(bizOfficialHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(s.market === "TW" ? "lookupBizSrcMops" : "lookupBizSrcSec"))}</a></p>`;

  const asOf = fmtAsOf(s.marketTime);

  root.innerHTML = `
    <article class="lk-card" data-symbol="${escapeHtml(s.symbol)}">
      <header class="lk-card-head">
        <div>
          <div class="lk-sym-row">
            <span class="lk-symbol">${escapeHtml(s.symbol)}</span>
            ${marketBadge}
          </div>
          <h3 class="lk-name">${escapeHtml(s.name || "")}</h3>
          <p class="lk-meta-line">
            ${s.exchange ? escapeHtml(s.exchange) : ""}
            ${s.sector ? ` · ${escapeHtml(s.sector)}` : ""}
            ${s.industry ? ` · ${escapeHtml(s.industry)}` : ""}
          </p>
        </div>
        <div class="lk-quote ${dir}">
          <div class="lk-price">${escapeHtml(fmtPrice(s.price, s.currency) || "—")}</div>
          <div class="lk-chg">
            <span>${escapeHtml(fmtPrice(s.change, s.currency) || "—")}</span>
            <span>${escapeHtml(fmtPct(s.changePct) || "—")}</span>
          </div>
          ${asOf ? `<div class="lk-asof">${escapeHtml(t("dataAsOf"))} ${escapeHtml(asOf)}</div>` : ""}
        </div>
      </header>

      <section class="lk-block" aria-label="${escapeHtml(t("lookupBusiness"))}">
        <h4 class="lk-h4">${escapeHtml(t("lookupBusiness"))}</h4>
        ${biz || bizFallback}
      </section>

      <section class="lk-block" aria-label="${escapeHtml(t("lookupQuoteStats"))}">
        <h4 class="lk-h4">${escapeHtml(t("lookupQuoteStats"))}</h4>
        <div class="lk-metrics">
          ${metric(t("lookupPrevClose"), val(fmtPrice(s.previousClose, s.currency)))}
          ${metric(t("lookupVolume"), val(fmtVol(s.volume)))}
          ${metric(t("lookupDayRange"), s.dayLow != null && s.dayHigh != null
            ? val(`${fmtPrice(s.dayLow, s.currency)} – ${fmtPrice(s.dayHigh, s.currency)}`)
            : null)}
          ${metric(t("lookup52w"), s.fiftyTwoWeekLow != null && s.fiftyTwoWeekHigh != null
            ? val(`${fmtPrice(s.fiftyTwoWeekLow, s.currency)} – ${fmtPrice(s.fiftyTwoWeekHigh, s.currency)}`)
            : null)}
          ${metric(t("lookupMarketCap"), val(fmtMcap(s.marketCap, s.currency)))}
          ${metric(t("earningsPe"), val(fmtNum(s.pe, 1)))}
          ${metric(t("earningsForwardPe"), val(fmtNum(s.forwardPe, 1)))}
          ${metric(t("lookupEps"), val(fmtNum(s.epsTrailing, 2)))}
          ${metric(t("lookupBeta"), val(fmtNum(s.beta, 2)))}
          ${metric(t("lookupDivYield"), val(fmtPct(s.dividendYield, 2)))}
        </div>
      </section>

      <section class="lk-block" aria-label="${escapeHtml(t("lookupFinancials"))}">
        <h4 class="lk-h4">${escapeHtml(t("lookupFinancials"))}</h4>
        <div class="lk-metrics">
          ${metric(t("lookupRevenue"), val(fmtMcap(s.revenue, s.currency)))}
          ${metric(t("earningsRevYoy"), val(fmtPct(s.revenueGrowth, 1)))}
          ${metric(t("earningsEpsYoy"), val(fmtPct(s.earningsGrowth, 1)))}
          ${metric(t("lookupGrossMargin"), val(fmtPct(s.grossMargins, 1)))}
          ${metric(t("lookupProfitMargin"), val(fmtPct(s.profitMargins, 1)))}
        </div>
      </section>

      <section class="lk-block" aria-label="${escapeHtml(t("lookupEarnings"))}">
        <h4 class="lk-h4">${escapeHtml(t("lookupEarnings"))}</h4>
        <div class="lk-metrics">
          ${metric(t("earningsNextDate"), val(s.nextEarningsDate))}
          ${metric(t("lookupEpsConsensus"), val(fmtNum(s.nextEarningsEstimate, 2)))}
          ${metric(t("earningsLastEps"), s.lastEpsActual != null
            ? val(`${fmtNum(s.lastEpsActual, 2)}${s.lastEpsQuarter ? ` · ${s.lastEpsQuarter}` : ""}`)
            : null)}
          ${metric(t("lookupEpsSurprise"), val(fmtPct(s.lastEpsSurprisePct, 1)))}
        </div>
      </section>

      ${paintOfficialFilings(s.filings)}

      <p class="lk-sources">${escapeHtml(t("lookupSources"))}: ${escapeHtml((s.sources || []).join(" · ") || "Yahoo Finance")}</p>
      ${result.partial ? `<p class="lk-partial">${escapeHtml(t("lookupPartial"))}</p>` : ""}
      <p class="lk-disclaimer" role="note">${escapeHtml(t("lookupDisclaimer"))}</p>
    </article>`;
}

export function renderLookupSection() {
  return `
    <section class="section lookup-section" aria-label="${escapeHtml(t("lookupTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${escapeHtml(t("lookupTitle"))}</h2>
        <p class="view-lead">${escapeHtml(t("lookupLead"))}</p>
      </header>
      <p class="lk-disclaimer lk-disclaimer-top" role="note">${escapeHtml(t("lookupDisclaimer"))}</p>
      <div class="lk-market-tabs" role="tablist" aria-label="${escapeHtml(t("market"))}">
        <button type="button" class="lk-tab is-active" data-lk-market="US" role="tab" aria-selected="true">${escapeHtml(t("usStock"))}</button>
        <button type="button" class="lk-tab" data-lk-market="TW" role="tab" aria-selected="false">${escapeHtml(t("twStock"))}</button>
      </div>
      <form class="lk-form" data-lk-form>
        <label class="lk-label" for="lk-input">${escapeHtml(t("lookupInputLabel"))}</label>
        <div class="lk-row">
          <input id="lk-input" class="lk-input" name="symbol" type="text" autocomplete="off" spellcheck="false"
            placeholder="${escapeHtml(t("lookupPlaceholderUs"))}" data-lk-input />
          <button type="submit" class="lk-submit">${escapeHtml(t("lookupSearch"))}</button>
        </div>
        <p class="lk-hint" data-lk-hint>${escapeHtml(t("lookupHintUs"))}</p>
      </form>
      <div id="lk-root" class="lk-root" aria-live="polite">
        <p class="lk-muted">${escapeHtml(t("lookupIdle"))}</p>
      </div>
    </section>`;
}

export function initLookup(selector = "#lk-root") {
  const root = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!root) return { ok: false };
  const section = root.closest(".lookup-section") || root.parentElement;
  if (!section || section.dataset.lkBound === "1") return { ok: true, root };
  section.dataset.lkBound = "1";

  const form = section.querySelector("[data-lk-form]");
  const input = section.querySelector("[data-lk-input]");
  const hint = section.querySelector("[data-lk-hint]");
  const tabs = section.querySelectorAll("[data-lk-market]");
  let market = "US";

  const setMarket = (m) => {
    market = m === "TW" ? "TW" : "US";
    tabs.forEach((btn) => {
      const on = btn.dataset.lkMarket === market;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (input) {
      input.placeholder = market === "TW" ? t("lookupPlaceholderTw") : t("lookupPlaceholderUs");
    }
    if (hint) {
      hint.textContent = market === "TW" ? t("lookupHintTw") : t("lookupHintUs");
    }
  };

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => setMarket(btn.dataset.lkMarket));
  });

  const run = async () => {
    const q = input?.value || "";
    root.innerHTML = `<p class="lk-loading">${escapeHtml(t("lookupLoading"))}</p>`;
    try {
      const result = await lookupStock(q, market);
      paintResult(root, result);
    } catch (err) {
      paintResult(root, { ok: false, error: "error", detail: err?.message || String(err) });
    }
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    void run();
  });
  root.addEventListener("click", (e) => {
    if (e.target?.closest?.("[data-lk-retry]")) void run();
  });

  // Deep-link: #lookup?q=AAPL or #quote/2330
  try {
    const hash = String(location.hash || "");
    const qMatch = hash.match(/[?&]q=([^&]+)/i) || hash.match(/#(?:lookup|quote)\/([A-Za-z0-9.\-]+)/i);
    if (qMatch) {
      const q = decodeURIComponent(qMatch[1]);
      if (/^\d{4}/.test(q) || /\.TW/i.test(q)) setMarket("TW");
      else setMarket("US");
      if (input) input.value = q;
      void run();
    }
  } catch {
    /* ignore */
  }

  void loadDigest();
  return { ok: true, root, run };
}
