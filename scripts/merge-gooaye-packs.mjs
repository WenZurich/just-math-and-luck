#!/usr/bin/env node
/**
 * Fast path: fetch OHLCV for Gooaye watchlists + latest shortlists, merge packs into screener.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAllGooayePacks,
  gooayeUniverseBoost,
  mergeGooayePacksIntoScreener,
} from "./gooaye-strategies.mjs";
import { seriesDelta } from "./market-regime.mjs";
import { fetchUs10yHistory, us10y20dFromRegime } from "./us10y.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public/data/strategy-screener.json");
const OUT_DOCS = path.join(ROOT, "docs/data/strategy-screener.json");
const LATEST = path.join(ROOT, "public/data/latest.json");
const UA =
  "Mozilla/5.0 (compatible; JustMathAndLuck/1.0; +https://github.com/WenZurich/Just-Math-and-Luck)";

async function yahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&range=2y`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r?.timestamp?.length) return null;
  const q = r.indicators?.quote?.[0] || {};
  const bars = [];
  for (let i = 0; i < r.timestamp.length; i++) {
    const c = q.close?.[i];
    const v = q.volume?.[i];
    if (c == null || v == null) continue;
    bars.push({
      t: r.timestamp[i],
      o: q.open?.[i] ?? c,
      h: q.high?.[i] ?? c,
      l: q.low?.[i] ?? c,
      c,
      v,
    });
  }
  if (bars.length < 60) return null;
  return { symbol, name: r.meta?.shortName || symbol, bars };
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const universeMap = new Map();
  for (const g of gooayeUniverseBoost()) universeMap.set(g.ticker, g);

  if (fs.existsSync(LATEST)) {
    const latest = JSON.parse(fs.readFileSync(LATEST, "utf8"));
    for (const row of [...(latest.us || []), ...(latest.tw || []), ...(latest.top5 || [])]) {
      if (!row?.ticker) continue;
      const market = row.market || (String(row.ticker).endsWith(".TW") ? "TW" : "US");
      if (!universeMap.has(row.ticker)) {
        universeMap.set(row.ticker, { ticker: row.ticker, name: row.name, market });
      }
    }
  }

  if (fs.existsSync(OUT_PUBLIC)) {
    const prev = JSON.parse(fs.readFileSync(OUT_PUBLIC, "utf8"));
    for (const s of prev.strategies || []) {
      for (const h of s.hits || []) {
        if (!h?.ticker) continue;
        const market = h.market || (String(h.ticker).endsWith(".TW") ? "TW" : "US");
        if (!universeMap.has(h.ticker)) {
          universeMap.set(h.ticker, { ticker: h.ticker, name: h.name, market });
        }
      }
    }
  }

  const universe = [...universeMap.values()];
  console.log("universe", universe.length);
  const ohlcvMap = new Map();
  const charts = await mapPool(universe, 6, async (u) => {
    await sleep(40);
    return yahooChart(u.ticker);
  });
  let ok = 0;
  for (let i = 0; i < universe.length; i++) {
    if (charts[i]) {
      ohlcvMap.set(universe[i].ticker, charts[i]);
      ok++;
    }
  }
  console.log("ohlcv ok", ok);

  let rateCtx = {};
  if (fs.existsSync(LATEST)) {
    const latest = JSON.parse(fs.readFileSync(LATEST, "utf8"));
    const usR = latest.marketRegime?.us;
    rateCtx = {
      liquidityBias: usR?.liquidityBias ?? null,
      dUs10Y_20d: us10y20dFromRegime(usR),
    };
  }
  if (rateCtx.dUs10Y_20d == null) {
    const h = await fetchUs10yHistory();
    const d = h ? seriesDelta({ bars: h.bars }, 20).value : null;
    if (d != null) rateCtx.dUs10Y_20d = d;
  }

  const packs = buildAllGooayePacks({ universe, ohlcvMap, rateCtx });
  for (const p of packs) {
    console.log(p.id, "hits", p.hits.length, "status", p.status);
  }

  mergeGooayePacksIntoScreener(OUT_PUBLIC, packs);
  console.log("Wrote", OUT_PUBLIC);
  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    mergeGooayePacksIntoScreener(OUT_DOCS, packs);
    console.log("Wrote", OUT_DOCS);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
