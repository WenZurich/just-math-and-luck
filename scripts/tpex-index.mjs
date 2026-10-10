/**
 * 櫃買指數 (TPEx Index) close + daily change from the official TPEx OpenAPI.
 * Source: https://www.tpex.org.tw/openapi/v1/tpex_index  (rows: Date YYYYMMDD, Close, Change)
 *
 * Never invents numbers. If the API is down, falls back to the last good row
 * saved in public/data/tpex-index.json and marks it stale with its own date.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
export const TPEX_INDEX_API = "https://www.tpex.org.tw/openapi/v1/tpex_index";
export const TPEX_INDEX_PAGE = "https://www.tpex.org.tw/zh-tw/mainboard/trading/info/daily-indices.html";
const CACHE_FILE = "tpex-index.json";

function num(x) {
  const n = Number(String(x ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

/** Pure: newest valid row → { date, value, dayAbs, dayPct }. */
export function parseTpexIndexRows(rows) {
  if (!Array.isArray(rows)) return null;
  const valid = rows
    .map((r) => ({
      ymd: String(r?.Date ?? "").trim(),
      close: num(r?.Close),
      change: num(r?.Change),
    }))
    .filter((r) => /^\d{8}$/.test(r.ymd) && r.close != null && r.close > 0)
    .sort((a, b) => a.ymd.localeCompare(b.ymd));
  const last = valid[valid.length - 1];
  if (!last) return null;
  const prev = last.change != null ? last.close - last.change : null;
  const dayPct = prev && prev > 0 && last.change != null
    ? Math.round((last.change / prev) * 10000) / 100
    : null;
  return {
    date: `${last.ymd.slice(0, 4)}-${last.ymd.slice(4, 6)}-${last.ymd.slice(6, 8)}`,
    value: last.close,
    dayAbs: last.change,
    dayPct,
  };
}

function readCache() {
  for (const dir of ["public/data", "docs/data"]) {
    const p = join(ROOT, dir, CACHE_FILE);
    if (!existsSync(p)) continue;
    try {
      const j = JSON.parse(readFileSync(p, "utf8"));
      if (j?.value != null && j?.date) return j;
    } catch { /* ignore */ }
  }
  return null;
}

function writeCache(row) {
  const body = JSON.stringify(row, null, 2) + "\n";
  for (const dir of ["public/data", "docs/data", "dist/data"]) {
    const d = join(ROOT, dir);
    if (!existsSync(d)) { if (dir === "dist/data") continue; mkdirSync(d, { recursive: true }); }
    writeFileSync(join(d, CACHE_FILE), body);
  }
}

/**
 * @returns {Promise<{name,value,dayPct,dayAbs,date,source,sourceUrl,stale?:boolean}|null>}
 */
export async function fetchTpexIndex({ timeoutMs = 20000 } = {}) {
  let fresh = null;
  try {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(TPEX_INDEX_API, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (just-math-and-luck daily scan)", Accept: "application/json" },
    });
    clearTimeout(tm);
    if (res.ok) fresh = parseTpexIndexRows(await res.json());
  } catch { /* fall back below */ }

  if (fresh) {
    const row = {
      name: "櫃買",
      ...fresh,
      source: "TPEx OpenAPI tpex_index",
      sourceUrl: TPEX_INDEX_PAGE,
      fetchedAt: new Date().toISOString(),
    };
    writeCache(row);
    return row;
  }
  const cached = readCache();
  if (cached) return { ...cached, name: "櫃買", stale: true };
  return null;
}

/** CLI: patch indices.otc in latest.json (+ dated copy) without a full rescan. */
async function cli() {
  const otc = await fetchTpexIndex();
  if (!otc) {
    console.error("TPEx index: no live or cached value; latest.json left unchanged");
    process.exit(1);
  }
  console.log(`TPEx index ${otc.date}: ${otc.value} (${otc.dayAbs >= 0 ? "+" : ""}${otc.dayAbs}, ${otc.dayPct}%)${otc.stale ? " [last good]" : ""}`);
  for (const dir of ["public/data", "docs/data", "dist/data"]) {
    const p = join(ROOT, dir, "latest.json");
    if (!existsSync(p)) continue;
    const j = JSON.parse(readFileSync(p, "utf8"));
    if (!j.indices) continue;
    j.indices.otc = otc;
    const body = JSON.stringify(j, null, 2) + "\n";
    writeFileSync(p, body);
    const dated = j.asOf ? join(ROOT, dir, `${String(j.asOf).slice(0, 10)}.json`) : null;
    if (dated && existsSync(dated)) {
      const d = JSON.parse(readFileSync(dated, "utf8"));
      if (d.indices) { d.indices.otc = otc; writeFileSync(dated, JSON.stringify(d, null, 2) + "\n"); }
    }
    console.log("patched", p);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  cli();
}
