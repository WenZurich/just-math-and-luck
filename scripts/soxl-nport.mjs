/**
 * SOXL official holdings from SEC EDGAR N-PORT-P (series S000027920) +
 * per-holding last completed daily return from Yahoo chart closes.
 * Pure helpers (parseNportHoldings, dailyChangeFromChart, decodeEntities) are smoke-tested.
 * Never invents numbers: any failure ⇒ caller keeps the previous official snapshot / null.
 */
export const SOXL_SERIES_ID = "S000027920";
export const SOXL_CIK = "1424958";
// SEC fair-access policy: automated clients must send a User-Agent with a real contact email
// (same convention as fetch-company-profiles.mjs). Unset ⇒ no EDGAR call; caller keeps the last official snapshot.
export const SEC_UA = process.env.SEC_CONTACT ? `just-math-and-luck ${process.env.SEC_CONTACT}` : null;

const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
/** Decode HTML entities (repeatedly, for double-escaped feeds like &amp;lt;p&amp;gt;), then strip tags. */
export function decodeEntities(s) {
  if (s == null) return s;
  let out = String(s);
  for (let i = 0; i < 3; i++) {
    const next = out
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&([a-z]+);/gi, (m, n) => (ENTITY[n.toLowerCase()] ?? m));
    if (next === out) break;
    out = next;
  }
  return out.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1]) : null;
}

const ABBR = [
  [/\bTrsry\b/gi, "Treasury"], [/\bTrsy\b/gi, "Treasury"], [/\bMgmt\b/gi, "Management"], [/\bFinl\b/gi, "Financial"],
  [/\bFin\b/gi, "Financial"], [/\bSq\b/gi, "Square"], [/\bInstitut\b/gi, "Institutional"], [/\bInst\b/gi, "Institutional"],
  [/\bGov'?T\b/gi, "Government"], [/\bGov\b/gi, "Government"], [/\bJp Morgan\b/gi, "J.P. Morgan"], [/\bUs\b/g, "US"],
];
/** Readable name from an N-PORT title: drop share-class / par-value tails, expand fund abbreviations. */
export function cleanSecurityName(raw) {
  let s = String(raw || "")
    .replace(/\s+(COM|SPON|ADR|ADS|ORD|EUR\d|USD\d|CUSIP)\b.*$/i, "")
    .replace(/\s*\(#\d+\)\s*$/, "")
    .trim();
  if (s === s.toUpperCase()) s = titleCase(s);
  s = s.replace(/\s*[-–]\s*Institutional\b/i, " Institutional");
  for (const [re, to] of ABBR) s = s.replace(re, to);
  return s.replace(/\s+/g, " ").trim();
}

function titleCase(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\b(Inc|Corp|Ltd|Nv|Plc|Llc|Co)\b/g, (w) => (w === "Nv" ? "N.V." : w === "Plc" ? "PLC" : w === "Llc" ? "LLC" : w));
}

/**
 * Parse an N-PORT-P primary_doc.xml → { seriesId, repPdDate, netAssets, holdings[top N by % of net assets] }.
 * Weight = SEC-reported pctVal (percent of net assets), unchanged.
 */
export function parseNportHoldings(xml, topN = 20) {
  const seriesId = tag(xml, "seriesId");
  const repPdDate = tag(xml, "repPdDate");
  const netAssets = Number(tag(xml, "netAssets"));
  const blocks = xml.match(/<invstOrSec>[\s\S]*?<\/invstOrSec>/g) || [];
  const rows = [];
  for (const b of blocks) {
    const pct = Number(tag(b, "pctVal"));
    if (!Number.isFinite(pct)) continue;
    const assetCat = tag(b, "assetCat") || (/<derivativeInfo>/.test(b) ? "DERIV" : null);
    const isSwap = /<swapDeriv|derivCat="SWP"|SWAP/i.test(b) && /<derivativeInfo>|SWAP/i.test(b);
    const ticker = (b.match(/<ticker value="([^"]+)"/)?.[1] || "").trim().split(/\s+/)[0] || null;
    const counterparty = tag(b, "counterpartyName");
    const rawName = tag(b, "name");
    const title = tag(b, "title");
    let instrument_type = "other";
    let name;
    if (isSwap) {
      instrument_type = "swap";
      name = `ICE Semiconductor Index Swap${counterparty ? ` (${counterparty})` : ""}`;
    } else if (assetCat === "STIV") {
      instrument_type = "cash_equivalent";
      name = cleanSecurityName(title || rawName);
    } else if (assetCat === "EC") {
      instrument_type = "equity";
      name = cleanSecurityName(title || rawName);
    } else {
      name = cleanSecurityName(title || rawName);
    }
    rows.push({ ticker: instrument_type === "equity" ? ticker : null, name, weight_pct: pct, instrument_type });
  }
  rows.sort((a, b) => b.weight_pct - a.weight_pct);
  return {
    seriesId,
    repPdDate,
    netAssets: Number.isFinite(netAssets) ? netAssets : null,
    holdingsCount: rows.length,
    holdings: rows.slice(0, topN).map((r, i) => ({
      rank: i + 1,
      ...r,
      recent_change_pct: null,
      recent_change_asof: null,
    })),
  };
}

/** Newest SOXL N-PORT-P from EDGAR (series-level atom feed). */
export async function fetchLatestSoxlNport({ fetchImpl = fetch, ua = SEC_UA } = {}) {
  if (!ua) throw new Error("SEC_CONTACT not set; EDGAR refresh skipped");
  const feed = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${SOXL_SERIES_ID}&type=NPORT-P&dateb=&owner=include&count=5&output=atom`;
  const r = await fetchImpl(feed, { headers: { "User-Agent": ua, Accept: "application/atom+xml" } });
  if (!r.ok) throw new Error(`EDGAR feed HTTP ${r.status}`);
  const atom = await r.text();
  const acc = atom.match(/<accession-number>([\d-]+)<\/accession-number>/)?.[1];
  const filed = atom.match(/<filing-date>([\d-]+)<\/filing-date>/)?.[1] || null;
  if (!acc) throw new Error("EDGAR feed: no NPORT-P accession");
  const dir = `https://www.sec.gov/Archives/edgar/data/${SOXL_CIK}/${acc.replace(/-/g, "")}`;
  const x = await fetchImpl(`${dir}/primary_doc.xml`, { headers: { "User-Agent": ua } });
  if (!x.ok) throw new Error(`EDGAR primary_doc HTTP ${x.status}`);
  const parsed = parseNportHoldings(await x.text());
  if (parsed.seriesId !== SOXL_SERIES_ID) throw new Error(`EDGAR series mismatch ${parsed.seriesId}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.repPdDate || "")) throw new Error("EDGAR: no report date");
  if (parsed.holdings.length < 10) throw new Error(`EDGAR: only ${parsed.holdings.length} holdings`);
  return {
    ...parsed,
    accession: acc,
    filingDate: filed,
    url: `${dir}/${acc}.txt`,
    indexUrl: `${dir}/${acc}-index.htm`,
  };
}

function nyDate(sec) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date(sec * 1000));
}

/**
 * Last *completed* regular-session daily return from a Yahoo v8 chart payload.
 * changePct = (last close ÷ previous close − 1) × 100. A bar for a session that has not closed yet is dropped.
 */
export function dailyChangeFromChart(chart, nowSec = Math.floor(Date.now() / 1000)) {
  const res = chart?.chart?.result?.[0];
  const ts = res?.timestamp || [];
  const closes = res?.indicators?.quote?.[0]?.close || [];
  const pts = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (typeof c === "number" && Number.isFinite(c) && c > 0) pts.push({ t: ts[i], c });
  }
  const end = res?.meta?.currentTradingPeriod?.regular?.end;
  if (pts.length && Number.isFinite(end) && nowSec < end && nyDate(pts[pts.length - 1].t) === nyDate(end)) pts.pop();
  if (pts.length < 2) return null;
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  return { changePct: (last.c / prev.c - 1) * 100, close: last.c, prevClose: prev.c, date: nyDate(last.t) };
}

export async function fetchDailyChange(ticker, { fetchImpl = fetch, ua = "Mozilla/5.0" } = {}) {
  for (const host of ["query1", "query2"]) {
    try {
      const r = await fetchImpl(
        `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=10d&interval=1d`,
        { headers: { "User-Agent": ua } }
      );
      if (!r.ok) continue;
      const d = dailyChangeFromChart(await r.json());
      if (d) return { ...d, source: `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}/` };
    } catch {
      /* try next host */
    }
  }
  return null;
}
