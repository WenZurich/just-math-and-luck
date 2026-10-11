#!/usr/bin/env node
/**
 * Official company-profile snapshot for 查股「公司在做什麼」fallback.
 *
 * TW: TWSE OpenAPI t187ap03_L (上市) + TPEx OpenAPI mopsfin_t187ap03_O (上櫃) basics for every
 *     listed/OTC company (name, market, 產業別, website), plus 主要經營業務 from MOPS 公司基本資料
 *     (t05st03) for the tickers the site covers (and a rolling batch of others).
 * US: SEC EDGAR submissions (registrant name, SIC code + description, exchange) for every US
 *     ticker the site covers.
 *
 * Never invents text: only official fields are stored; on fetch failure the previous value is kept.
 * Output: public/data/company-profiles.json (+ docs/data copy).
 *
 *   node scripts/fetch-company-profiles.mjs            # normal daily refresh
 *   MOPS_MAX=300 node scripts/fetch-company-profiles.mjs
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public/data");
const DOCS = join(ROOT, "docs/data");
const OUT_NAME = "company-profiles.json";

const TWSE_L = "https://openapi.twse.com.tw/v1/opendata/t187ap03_L";
const TPEX_O = "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O";
const MOPS_AJAX = "https://mopsov.twse.com.tw/mops/web/ajax_t05st03";
const SEC_TICKERS = "https://www.sec.gov/files/company_tickers.json";
const SEC_SUB = (cik10) => `https://data.sec.gov/submissions/CIK${cik10}.json`;
const UA_BROWSER = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
// SEC fair-access policy: automated clients must send a User-Agent with a real contact email.
// Set SEC_CONTACT="Name email@domain" (no default: we never make one up). Unset → SEC step skipped,
// previous US rows kept; the browser lookup still reads SEC submissions live as a fallback.
const UA_SEC = process.env.SEC_CONTACT ? `just-math-and-luck ${process.env.SEC_CONTACT}` : null;

const MOPS_MAX = Number(process.env.MOPS_MAX || 120); // MOPS requests per run (polite)
const MOPS_GAP_MS = 1200;
const MOPS_STALE_DAYS = 30;
const SEC_STALE_DAYS = 30;
const DEADLINE = Date.now() + Number(process.env.PROFILE_BUDGET_MS || 270_000);

/** TWSE / TPEx 產業別 code table (official category codes used in t187ap03). */
export const TW_INDUSTRY = {
  "01": "水泥工業", "02": "食品工業", "03": "塑膠工業", "04": "紡織纖維", "05": "電機機械",
  "06": "電器電纜", "08": "玻璃陶瓷", "09": "造紙工業", "10": "鋼鐵工業", "11": "橡膠工業",
  "12": "汽車工業", "14": "建材營造", "15": "航運業", "16": "觀光餐旅", "17": "金融保險業",
  "18": "貿易百貨", "19": "綜合", "20": "其他", "21": "化學工業", "22": "生技醫療業",
  "23": "油電燃氣業", "24": "半導體業", "25": "電腦及週邊設備業", "26": "光電業",
  "27": "通信網路業", "28": "電子零組件業", "29": "電子通路業", "30": "資訊服務業",
  "31": "其他電子業", "32": "文化創意業", "33": "農業科技業", "34": "電子商務",
  "35": "綠能環保", "36": "數位雲端", "37": "運動休閒", "38": "居家生活",
  "80": "管理股票", "91": "存託憑證",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => String(s ?? "").replace(/[\u3000\s]+/g, " ").trim();
const daysSince = (iso) => (iso ? (Date.now() - Date.parse(iso)) / 86_400_000 : Infinity);

async function getJson(url, ua = UA_BROWSER, timeoutMs = 45_000) {
  const res = await fetch(url, { headers: { "User-Agent": ua, Accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

/**
 * Condense MOPS 主要經營業務 without adding words: join wrapped lines, drop company-registry
 * codes (e.g. CC01080), cap length.
 */
export function condenseMainBusiness(raw, max = 220) {
  let s = String(raw || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;?/g, " ")
    .replace(/&amp;/g, "&");
  // Lines wrapped inside a word: join without a separator (MOPS hard-wraps long text).
  s = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join("");
  s = s.replace(/\b[A-Z]{1,2}\d{5,6}\b/g, "").replace(/[\u3000 ]{2,}/g, " ").replace(/\s*([，、。；：])\s*/g, "$1");
  s = s.replace(/^[、，。；\s]+/, "").trim();
  if (s.length > max) s = `${s.slice(0, max).replace(/[，、；：\s]+$/, "")}…`;
  return s;
}

export function parseMopsT05st03(html) {
  const cell = (label) => {
    const re = new RegExp(`>${label}</th>\\s*<td[^>]*>([\\s\\S]*?)</td>`);
    const m = String(html).match(re);
    return m ? m[1] : null;
  };
  const biz = cell("主要經營業務");
  const ind = cell("產業類別");
  const name = cell("公司名稱");
  return {
    mainBusiness: biz ? condenseMainBusiness(biz) : null,
    industry: ind ? clean(ind.replace(/&nbsp;?/g, " ")) : null,
    name: name ? clean(name.replace(/<[^>]+>/g, "")) : null,
  };
}

async function fetchMops(code) {
  const body = new URLSearchParams({ encodeURIComponent: "1", step: "1", firstin: "1", off: "1",
    queryName: "co_id", inpuType: "co_id", TYPEK: "all", co_id: code });
  const res = await fetch(MOPS_AJAX, { method: "POST", body,
    headers: { "User-Agent": UA_BROWSER, "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`MOPS HTTP ${res.status}`);
  const html = await res.text();
  if (/查詢過於頻繁|過於頻繁/.test(html)) throw new Error("MOPS rate-limited");
  return parseMopsT05st03(html);
}

/** Tickers the site shows anywhere (picks, strategies, digest, options, paper, …). */
function coveredTickers() {
  const tw = new Set();
  const us = new Set();
  const files = readdirSync(PUB).filter((f) => f.endsWith(".json") && f !== OUT_NAME);
  const walk = (v, key) => {
    if (Array.isArray(v)) return v.forEach((x) => walk(x, key));
    if (v && typeof v === "object") return Object.entries(v).forEach(([k, x]) => walk(x, k));
    if (typeof v !== "string") return;
    const tm = v.match(/^(\d{4})\.TWO?$/);
    if (tm) tw.add(tm[1]);
    if (/^(ticker|symbol|code)$/i.test(key || "")) {
      if (/^\d{4}$/.test(v)) tw.add(v);
      else if (/^[A-Z][A-Z.\-]{0,5}$/.test(v)) us.add(v.replace(/\./g, "-"));
    }
  };
  for (const f of files) {
    try { walk(JSON.parse(readFileSync(join(PUB, f), "utf8"))); } catch { /* skip */ }
  }
  return { tw, us };
}

function loadPrev() {
  const p = join(PUB, OUT_NAME);
  if (!existsSync(p)) return { tw: {}, us: {} };
  try { const j = JSON.parse(readFileSync(p, "utf8")); return { tw: j.tw || {}, us: j.us || {} }; }
  catch { return { tw: {}, us: {} }; }
}

async function main() {
  const prev = loadPrev();
  const covered = coveredTickers();
  const nowIso = new Date().toISOString();
  const tw = {};
  const us = {};
  const status = { twse: "skip", tpex: "skip", mopsFetched: 0, mopsFailed: 0, secFetched: 0, secFailed: 0 };

  // --- TW basics (all listed + OTC) ---
  const addTw = (code, row, market) => {
    code = clean(code);
    if (!/^\d{4,6}$/.test(code)) return;
    const old = prev.tw[code] || {};
    tw[code] = {
      n: clean(row.abbr) || old.n || null,
      f: clean(row.full) || old.f || null,
      mk: market,
      ind: TW_INDUSTRY[clean(row.ind)] || old.ind || null,
      web: clean(row.web) || old.web || null,
      biz: old.biz || null,
      bizAt: old.bizAt || null,
    };
  };
  try {
    const rows = await getJson(TWSE_L);
    for (const r of rows) addTw(r["公司代號"], { abbr: r["公司簡稱"], full: r["公司名稱"], ind: r["產業別"], web: r["網址"] }, "上市");
    status.twse = `ok ${rows.length}`;
  } catch (e) { status.twse = `fail ${e.message}`; }
  try {
    const rows = await getJson(TPEX_O);
    for (const r of rows) addTw(r.SecuritiesCompanyCode, { abbr: r.CompanyAbbreviation, full: r.CompanyName, ind: r.SecuritiesIndustryCode, web: r.WebAddress }, "上櫃");
    status.tpex = `ok ${rows.length}`;
  } catch (e) { status.tpex = `fail ${e.message}`; }
  // keep previous rows if a source was down
  for (const [code, row] of Object.entries(prev.tw)) if (!tw[code]) tw[code] = row;

  // --- TW 主要經營業務 from MOPS: covered first, then stale/missing others ---
  const need = (code) => !tw[code]?.biz || daysSince(tw[code]?.bizAt) > MOPS_STALE_DAYS;
  const queue = [
    ...[...covered.tw].filter((c) => tw[c] && need(c)),
    ...Object.keys(tw).filter((c) => !covered.tw.has(c) && !tw[c].biz),
  ];
  for (const code of queue.slice(0, MOPS_MAX)) {
    if (Date.now() > DEADLINE) break;
    try {
      const m = await fetchMops(code);
      if (m.mainBusiness) { tw[code].biz = m.mainBusiness; tw[code].bizAt = nowIso; }
      if (m.industry) {
        if (tw[code].ind && tw[code].ind !== m.industry) console.warn(`industry map ${code}: code→${tw[code].ind} vs MOPS ${m.industry}`);
        tw[code].ind = m.industry;
      }
      status.mopsFetched++;
    } catch (e) {
      status.mopsFailed++;
      if (/rate-limited/.test(e.message)) { console.warn("MOPS rate-limited; stopping batch"); break; }
    }
    await sleep(MOPS_GAP_MS);
  }

  // --- US covered tickers from SEC EDGAR ---
  let cikMap = null;
  if (!UA_SEC) { console.warn("SEC_CONTACT not set; skipping SEC refresh (keeping previous US rows)"); status.sec = "skipped: SEC_CONTACT unset"; }
  else try {
    const j = await getJson(SEC_TICKERS, UA_SEC);
    cikMap = new Map(Object.values(j).map((r) => [String(r.ticker).toUpperCase().replace(/\./g, "-"), r]));
  } catch (e) { console.warn("SEC ticker map failed:", e.message); }
  for (const t of cikMap ? [...covered.us].sort() : []) {
    const old = prev.us[t];
    const row = cikMap?.get(t);
    if (!row) { if (old) us[t] = old; continue; }
    if (old?.sicDesc && daysSince(old.at) <= SEC_STALE_DAYS) { us[t] = old; continue; }
    if (Date.now() > DEADLINE) { if (old) us[t] = old; continue; }
    const cik10 = String(row.cik_str).padStart(10, "0");
    try {
      const s = await getJson(SEC_SUB(cik10), UA_SEC, 30_000);
      us[t] = {
        n: clean(s.name) || clean(row.title),
        cik: cik10,
        sic: clean(s.sic) || null,
        sicDesc: clean(s.sicDescription) || null,
        ex: Array.isArray(s.exchanges) ? s.exchanges.filter(Boolean).join("/") || null : null,
        web: clean(s.website) || null,
        at: nowIso,
      };
      status.secFetched++;
    } catch (e) {
      status.secFailed++;
      if (old) us[t] = old;
    }
    await sleep(150); // SEC fair-access: well under 10 req/s
  }
  for (const [t, row] of Object.entries(prev.us)) if (!us[t]) us[t] = row;

  const twCount = Object.keys(tw).length;
  if (!twCount && !Object.keys(us).length) {
    console.error("company-profiles: every source failed and no previous snapshot; not writing");
    process.exit(1);
  }
  const out = {
    generatedAt: nowIso,
    sources: {
      twBasics: [TWSE_L, TPEX_O],
      twMainBusiness: "https://mops.twse.com.tw/mops/#/web/t05st03",
      us: "https://www.sec.gov/cgi-bin/browse-edgar (SEC EDGAR submissions: SIC)",
    },
    note: "Official fields only. tw.biz = MOPS 公司基本資料「主要經營業務」(condensed: wrapped lines joined, registry codes removed). us.sicDesc = SEC EDGAR SIC description.",
    status,
    tw,
    us,
  };
  const json = JSON.stringify(out);
  mkdirSync(PUB, { recursive: true });
  writeFileSync(join(PUB, OUT_NAME), json);
  if (existsSync(DOCS)) writeFileSync(join(DOCS, OUT_NAME), json);
  const withBiz = Object.values(tw).filter((r) => r.biz).length;
  console.log(`company-profiles: TW ${twCount} (主要經營業務 ${withBiz}; covered ${covered.tw.size}), US ${Object.keys(us).length} (covered ${covered.us.size}); ${JSON.stringify(status)}; ${(json.length / 1024).toFixed(0)} KB`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
