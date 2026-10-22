#!/usr/bin/env node
/**
 * 模擬帳本：補「持有中、但當天掃描名單沒有」的股票報價
 * ==========================================================
 * 為什麼：paper-trade 的市價只來自當天掃描（top5／us／tw）。持股掉出名單後就沒有當天價，
 * 舊做法沿用「上次標記價」來賣，會出現同一個舊價格連續幾天成交（例如 CRWD 264.8）。
 * 這支程式替那些持股抓「同一個交易時段」的公開收盤價（Yahoo Finance 日線），存成
 * public/data/paper-quotes/<台北日期>.json，paper-trade 只在掃描沒有該檔時才拿來用。
 *
 * 交易時段怎麼對：用掃描檔裡的大盤收盤（S&P 500／加權指數）去 Yahoo 日線找同一根 K 棒，
 * 那一天就是掃描用的時段；找不到就不補（paper-trade 對沒有當天價的持股不做任何買賣）。
 * 不估算、不內插：抓不到就記在 missing。
 *
 * 執行：node scripts/paper-held-quotes.mjs [--input public/data/2026-10-05.json]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sma, pctChange } from "./math-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const UA = "Mozilla/5.0 (compatible; JustMathAndLuck/1.0)";
const i = process.argv.indexOf("--input");
const INPUT = i >= 0 && process.argv[i + 1]
  ? (process.argv[i + 1].startsWith("/") ? process.argv[i + 1] : join(process.cwd(), process.argv[i + 1]))
  : join(ROOT, "public/data/latest.json");
const PORTFOLIO_PATH = join(ROOT, "public/data/paper-portfolio.json");
const OUT_DIR = join(ROOT, "public/data/paper-quotes");

const taipeiDate = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
const round = (n, d) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 10 ** d) / 10 ** d);
const cache = new Map();

async function dailyBars(symbol, endYmd) {
  const key = symbol;
  if (cache.has(key)) return cache.get(key);
  const p2 = Math.floor(Date.parse(endYmd + "T23:59:59Z") / 1000) + 86400;
  const p1 = p2 - 160 * 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&period1=${p1}&period2=${p2}`;
  let out = null;
  for (let attempt = 0; attempt < 3 && !out; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
      if (res.ok) {
        const r = (await res.json())?.chart?.result?.[0];
        const q = r?.indicators?.quote?.[0];
        if (r?.timestamp?.length && q) {
          const off = r.meta?.gmtoffset ?? 0;
          out = r.timestamp
            .map((t, k) => ({ date: new Date((t + off) * 1000).toISOString().slice(0, 10), c: q.close?.[k] }))
            .filter((b, k) => {
              if (Number.isFinite(b.c)) return true;
              // Yahoo 有時把最新一根日線的 close 留空（null），但 meta.regularMarketPrice
              // 就是同一天 16:00 收盤後的官方收盤價。只有在 regularMarketTime 落在這根 K 的同一天、
              // 且已是收盤時間（當地 16:00 之後）時才補上，否則丟掉這根（不猜價格）。
              const last = k === r.timestamp.length - 1;
              const mt = r.meta?.regularMarketTime;
              const mp = r.meta?.regularMarketPrice;
              if (!last || !Number.isFinite(mt) || !Number.isFinite(mp)) return false;
              const local = new Date((mt + off) * 1000);
              if (local.toISOString().slice(0, 10) !== b.date || local.getUTCHours() < 16) return false;
              b.c = mp;
              b.fromMetaClose = true;
              return true;
            });
        }
      }
    } catch {}
    if (!out) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  cache.set(key, out);
  return out;
}

async function sessionFor(indexSymbol, value, scanYmd) {
  if (!Number.isFinite(value)) return null;
  const bars = await dailyBars(indexSymbol, scanYmd);
  if (!bars) return null;
  const hit = bars.filter((b) => b.date < scanYmd && Math.abs(b.c - value) <= Math.max(0.02, value * 1e-6));
  return hit.length ? hit[hit.length - 1].date : null;
}

async function main() {
  const scan = JSON.parse(readFileSync(INPUT, "utf8"));
  const portfolio = JSON.parse(readFileSync(PORTFOLIO_PATH, "utf8"));
  const date = taipeiDate(scan.asOf);
  const inScan = new Set([...(scan.top5 || []), ...(scan.us || []), ...(scan.tw || [])].filter((s) => typeof s?.price === "number").map((s) => s.ticker));
  const sessions = {
    US: await sessionFor("^GSPC", scan.indices?.spx?.value, date),
    TW: await sessionFor("^TWII", scan.indices?.tw?.value, date),
  };
  const quotes = [];
  const missing = [];
  for (const market of ["US", "TW"]) {
    for (const p of portfolio.books?.[market]?.positions || []) {
      if (inScan.has(p.ticker)) continue;
      const ses = sessions[market];
      if (!ses) { missing.push({ ticker: p.ticker, market, why: "找不到掃描對應的交易時段" }); continue; }
      const bars = await dailyBars(p.ticker, date);
      const k = bars ? bars.findIndex((b) => b.date === ses) : -1;
      if (k < 1) { missing.push({ ticker: p.ticker, market, why: `Yahoo 日線沒有 ${ses} 收盤` }); continue; }
      const closes = bars.slice(0, k + 1).map((b) => b.c);
      const price = closes[k];
      const s20 = sma(closes, 20);
      quotes.push({
        ticker: p.ticker,
        name: p.name || "",
        market,
        session: ses,
        price: round(price, price >= 100 ? 2 : 4),
        dayPct: round(pctChange(closes[k - 1], price), 2),
        aboveSma20: s20 != null ? price >= s20 : undefined,
        source: "Yahoo Finance 日線收盤（一般交易時段）",
      });
    }
  }
  const out = {
    scanAsOf: scan.asOf,
    date,
    sessions,
    note: "只補持有中、但當天掃描沒有的股票；掃描有報價的一律用掃描價。抓不到就列在 missing，當天不對該檔做買賣。",
    quotes,
    missing,
  };
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, `${date}.json`), JSON.stringify(out, null, 2) + "\n");
  console.log(`held-quotes ${date}: sessions US=${sessions.US} TW=${sessions.TW}; filled ${quotes.length}, missing ${missing.length}`);
  for (const m of missing) console.log(`  missing ${m.market} ${m.ticker}: ${m.why}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
