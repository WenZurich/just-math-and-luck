#!/usr/bin/env node
/**
 * Re-select a stored scan offline after a listing-status fix (no new quotes are fetched).
 *
 *   node scripts/rescreen-stored-scan.mjs --raw /workspace/stock-ops-study/raw-quotes-2026-09-16.json [--dry]
 *
 * Uses the raw per-ticker metrics the scan saved (same fetch, same asOf) and the scan's stored
 * regime features. Step 1 proves the replay is faithful: WITHOUT the listing filter it must
 * reproduce the published latest.json us / tw / top5 / marketRegime exactly, else it aborts.
 * Step 2 applies the listing filter (delisted / stale) and writes latest.json + the dated copy
 * (public + docs) and rebuilds the 週期 (kostolany) pack from the filtered metrics. asOf is kept,
 * so the paper ledger does not see a new scan day.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { selectPicks, applyListingFilter, excludedFromScanRecord, US_UNIVERSE, TW_UNIVERSE } from "./daily-scan.mjs";
import { computeMarketRegime, buildKostolanyStrategyPack } from "./market-regime.mjs";
import { breadthShare } from "./math-core.mjs";
import { loadCorporateActions, filterStrategyHits } from "./listing-status.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : null; };
const RAW = arg("--raw");
const DRY = process.argv.includes("--dry");
const die = (m) => { console.error(`FAIL: ${m}`); process.exit(1); };
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function regimeFor(market, stored, metrics) {
  const f = stored.features;
  const indexFeat = { ...f };
  const rate = { level: f.us10y, d5d: f.dUs10y5d, d20d: f.dUs10y20d, d60d: f.dUs10y60d };
  const b = breadthShare(metrics, "above50");
  return computeMarketRegime({
    market,
    indexFeat,
    secondaryFeat: null, // NDX only tips mid_cycle→late_optimism when NDX is within 1% of its high (checked below)
    rate,
    fx: market === "TW" ? { d20dRet: f.dUsdtwd20d } : null,
    breadthProxy: b != null ? round(b, 3) : null,
    hygVsLqd20d: market === "US" ? f.hygVsLqd20d : null,
  });
}

function main() {
  if (!RAW || !existsSync(RAW)) die("--raw <raw-quotes.json> required");
  const raw = JSON.parse(readFileSync(RAW, "utf8"));
  const latestPath = join(ROOT, "public/data/latest.json");
  const latest = JSON.parse(readFileSync(latestPath, "utf8"));
  const rawAsOf = String(raw.fetched_at_utc || "").replace(" UTC", "Z").replace(" ", "T");
  if (rawAsOf !== latest.asOf) die(`raw quotes ${rawAsOf} are not the published scan ${latest.asOf}`);
  const q = raw.quotes || [];
  const bySym = Object.fromEntries(q.filter((x) => !x.universe).map((x) => [x.symbol, x]));
  const ixic = bySym["^IXIC"];
  if (latest.marketRegime.us.psychologyPhase === "mid_cycle" && !(ixic && ixic.ddFrom252dHigh < -0.01)) die("NDX tip cannot be ruled out offline");
  const usAll = q.filter((x) => x.universe === "US");
  const twAll = q.filter((x) => x.universe === "TW");
  const meta = (u) => Object.fromEntries(u.map(([t, n, b]) => [t, { ticker: t, name: n, nameZh: n, business: b }]));
  const usMeta = meta(US_UNIVERSE), twMeta = meta(TW_UNIVERSE);
  const spxIdx = bySym["^GSPC"].dayPct, twIdx = bySym["^TWII"].dayPct;
  if (spxIdx !== latest.indices.spx.dayPct || twIdx !== latest.indices.tw.dayPct) die("index dayPct mismatch");

  // 1) faithful replay (no filter)
  const mr0 = { ...latest.marketRegime, us: regimeFor("US", latest.marketRegime.us, usAll), tw: regimeFor("TW", latest.marketRegime.tw, twAll) };
  if (!same(mr0.us, latest.marketRegime.us) || !same(mr0.tw, latest.marketRegime.tw)) {
    console.error(JSON.stringify({ us: mr0.us, stored: latest.marketRegime.us }, null, 1));
    die("regime replay does not reproduce the published scan");
  }
  const clone = (a) => a.map((x) => ({ ...x }));
  const p0 = selectPicks({ usMetrics: clone(usAll), twMetrics: clone(twAll), usMeta, twMeta, spxIdx, twIdx, marketRegime: mr0 });
  for (const k of ["usPicks", "twPicks", "top5"]) {
    const pub = k === "usPicks" ? latest.us : k === "twPicks" ? latest.tw : latest.top5;
    if (!same(p0[k], pub)) die(`replay ${k} does not reproduce the published scan`);
  }
  console.log("replay OK: published us / tw / top5 / regime reproduced exactly");

  // 2) listing filter
  const ses = (sym) => (bySym[sym]?.recent || []).map((b) => b.date);
  const listing = applyListingFilter({ usMetrics: clone(usAll), twMetrics: clone(twAll), usSessionDates: ses("^GSPC"), twSessionDates: ses("^TWII"), actions: loadCorporateActions(ROOT) });
  for (const x of listing.excluded) console.log(`EXCLUDED ${x.market} ${x.ticker}: ${x.status} — ${x.reason}`);
  const mr = { ...latest.marketRegime, us: regimeFor("US", latest.marketRegime.us, listing.usMetrics), tw: regimeFor("TW", latest.marketRegime.tw, listing.twMetrics) };
  const p = selectPicks({ usMetrics: listing.usMetrics, twMetrics: listing.twMetrics, usMeta, twMeta, spxIdx, twIdx, marketRegime: mr });
  const out = { ...latest, marketRegime: mr, top5: p.top5, us: p.usPicks, tw: p.twPicks, excludedFromScan: excludedFromScanRecord(listing.excluded) };
  // keep key order of the original file, excludedFromScan after tw
  const ordered = {};
  for (const k of Object.keys(latest)) { ordered[k] = out[k]; if (k === "tw") ordered.excludedFromScan = out.excludedFromScan; }
  console.log("US before:", latest.us.map((s) => s.ticker).join(","));
  console.log("US after: ", p.usPicks.map((s) => s.ticker).join(","));
  console.log("TW changed:", !same(p.twPicks, latest.tw), " top5 before:", latest.top5.map((s) => s.ticker).join(","), " after:", p.top5.map((s) => s.ticker).join(","));
  console.log("US regime:", latest.marketRegime.us.cycleStance, "→", mr.us.cycleStance, " breadth", latest.marketRegime.us.features.breadthProxy, "→", mr.us.features.breadthProxy);
  console.log("TW regime:", latest.marketRegime.tw.cycleStance, "→", mr.tw.cycleStance, " breadth", latest.marketRegime.tw.features.breadthProxy, "→", mr.tw.features.breadthProxy);

  // 週期 pack from filtered metrics; other packs: drop delisted hits (no OHLCV refetch offline)
  const sp = JSON.parse(readFileSync(join(ROOT, "public/data/strategy-screener.json"), "utf8"));
  const kosto = buildKostolanyStrategyPack({ marketRegime: mr, usMetrics: listing.usMetrics, twMetrics: listing.twMetrics, usMeta, twMeta, spxIdx, twIdx });
  let strategies = sp.strategies.map((s) => (s.id === kosto.id ? kosto : s));
  const { strategies: kept, removed } = filterStrategyHits(strategies, {
    actions: loadCorporateActions(ROOT),
    sessionDatesByMarket: { US: ses("^GSPC"), TW: ses("^TWII") },
    lastBarDateOf: (h) => h.ohlcvBarDate ?? null,
  });
  for (const r of removed) console.log(`strategy hit dropped: ${r.id} ${r.ticker} — ${r.status}`);
  strategies = kept.map((s) => {
    if (!removed.some((r) => r.id === s.id) || !Array.isArray(s.ohlcvBarDates)) return s;
    const uniq = [...new Set(s.hits.map((h) => h.ohlcvBarDate).filter(Boolean))].sort();
    const notes = (s.notes || []).map((n) => (/^技術欄位 OHLCV 最後一根日K：/.test(n)
      ? (uniq.length === 1 && uniq[0] !== sp.sessionDate
        ? `技術欄位 OHLCV 最後一根日K：${uniq[0]}（證交所 session ${sp.sessionDate}；非「今日」若不同日）`
        : `技術欄位 OHLCV 最後一根日K：${uniq.join(", ")}（證交所 session ${sp.sessionDate}）`)
      : n));
    const cal = s.calibrationNotes?.dataAsOf ? { ...s.calibrationNotes, dataAsOf: { ...s.calibrationNotes.dataAsOf, ohlcvBarDates: uniq } } : s.calibrationNotes;
    return { ...s, hits: s.hits, ohlcvBarDates: uniq, notes, calibrationNotes: cal };
  });
  const spOut = { ...sp, strategies };
  console.log("kostolany hits:", sp.strategies.find((s) => s.id === kosto.id)?.hits.length, "→", kosto.hits.length);
  if (DRY) { console.log("DRY: nothing written"); return; }
  const day = new Date(latest.asOf).toISOString().slice(0, 10);
  const json = JSON.stringify(ordered, null, 2);
  for (const dir of ["public/data", "docs/data"]) {
    writeFileSync(join(ROOT, dir, "latest.json"), json);
    writeFileSync(join(ROOT, dir, `${day}.json`), json);
    writeFileSync(join(ROOT, dir, "strategy-screener.json"), JSON.stringify(spOut, null, 2));
  }
  console.log(`Wrote latest.json / ${day}.json / strategy-screener.json (public + docs)`);
}

main();
