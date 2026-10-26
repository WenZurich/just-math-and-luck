#!/usr/bin/env node
/**
 * Olympiad-grade property guards for screening math.
 * Habit → code: prove edge cases (empty, singleton, ÷0, NaN/∞) before trusting
 * a formula on live quotes. Failures here must block smoke / predeploy.
 *
 * See scripts/study/olympiad-math-guards.md
 */
import {
  isFiniteNumber,
  finiteOrNull,
  sma,
  pctChange,
  retChange,
  volumeRatio,
  rsVsIndex,
  baseRankingScore,
  avgVolume,
  clamp,
  pctFromSma,
  peakInWindow,
  drawdownFromPeak,
  compoundRet,
  weightedMean,
  logReturn,
  avgCostAfterBuy,
  annualizedHistVol,
  futuresBasis,
  thirdWednesdayYmd,
  atrPct,
  realizedPnl,
  roundHalfAway,
  observedVolume,
  volumeRatioObserved,
  rsiWilder,
  rsiLast2,
  volumeRatioVsPrev,
  pricePct,
  rangePct,
  smaSpreadPct,
  priceShapeMetrics,
  positionSizeShares,
  unrealizedReturn,
  takeProfitQty,
} from "./math-core.mjs";
import { temperatureScore, indexFeaturesFromChart } from "./market-regime.mjs";
import {
  isFiniteNumber as pdFinite,
  optionIntrinsic,
  optionExtrinsic,
  optionPremiumCashImpact,
  optionPositionMarkValue,
  optionUnrealizedPnl,
  optionExpirySettlement,
  txfMultiplier,
  futuresPnlTwd,
  futuresMarkPnlTwd,
  futuresMarginHold,
  canOpenFutures,
  canBuyOption,
  assertFinitePayload,
  strategyLabelPlain,
  US_OPTION_MULTIPLIER,
  TXF_MULTIPLIERS,
  stockRealizedPnl,
  resolveTradeRealizedPnl,
  sumSellRealizedPnl,
} from "../src/paper-derivatives-math.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __mgDir = dirname(fileURLToPath(import.meta.url));
const ROOT_MG = join(__mgDir, "..");

const failures = [];
function fail(msg) {
  failures.push(msg);
  console.error("FAIL:", msg);
}
function ok(msg) {
  console.log("OK:", msg);
}
function assert(cond, msg) {
  if (!cond) fail(msg);
  else ok(msg);
}
function approx(a, b, eps = 1e-9) {
  return isFiniteNumber(a) && isFiniteNumber(b) && Math.abs(a - b) <= eps;
}

console.log("▶ math-guards: start");

// —— SMA: empty / single / window bounds / NaN / Infinity ——
assert(sma([], 5) === null, "SMA empty series → null");
assert(sma([10], 1) === 10, "SMA single point window=1 → value");
assert(sma([10], 2) === null, "SMA single point window=2 → null");
assert(sma([1, 2, 3, 4, 5], 0) === null, "SMA window 0 → null");
assert(sma([1, 2, 3], -1) === null, "SMA negative window → null");
assert(sma([1, 2, 3], 1.5) === null, "SMA non-integer window → null");
assert(sma(null, 3) === null, "SMA null arr → null");
assert(sma([1, 2, NaN, 4], 4) === null, "SMA rejects NaN in window");
assert(sma([1, 2, Infinity, 4], 4) === null, "SMA rejects Infinity in window");
assert(sma([1, 2, -Infinity, 4], 3) === null, "SMA rejects -Infinity in window");
{
  const v = sma([2, 4, 6, 8], 4);
  assert(approx(v, 5), `SMA [2,4,6,8]/4 = 5 (got ${v})`);
}
{
  const v = sma([10, 20, 30, 40, 50], 3);
  assert(approx(v, 40), `SMA last-3 of [10..50] = 40 (got ${v})`);
}
assert(sma([1, 2, 3], 3) !== null && sma([1, 2, 3], 4) === null, "SMA window bounds: len>=n only");

// —— pct = (a−b)/b×100 with a=to, b=from; edge b=0 ——
assert(pctChange(0, 10) === null, "pctChange from=0 → null");
assert(pctChange(0, 0) === null, "pctChange 0→0 → null");
assert(pctChange(null, 10) === null, "pctChange null from → null");
assert(pctChange(10, null) === null, "pctChange null to → null");
assert(pctChange(NaN, 10) === null, "pctChange NaN from → null");
assert(pctChange(10, NaN) === null, "pctChange NaN to → null");
assert(pctChange(Infinity, 10) === null, "pctChange Infinity from → null");
assert(pctChange(10, Infinity) === null, "pctChange Infinity to → null");
{
  const v = pctChange(100, 110);
  assert(approx(v, 10), `pctChange 100→110 = 10% (got ${v})`);
}
{
  const v = pctChange(100, 90);
  assert(approx(v, -10), `pctChange 100→90 = -10% (got ${v})`);
}
{
  const v = pctChange(-25, 50);
  assert(approx(v, -300), `pctChange negative base -25→50 = -300% (got ${v})`);
}
{
  const v = pctChange(50, 50);
  assert(approx(v, 0), `pctChange flat = 0 (got ${v})`);
}

// —— fractional returns (regime) ——
assert(retChange(0, 1) === null, "retChange from=0 → null");
assert(retChange(NaN, 1) === null, "retChange NaN → null");
{
  const v = retChange(100, 110);
  assert(approx(v, 0.1), `retChange 100→110 = 0.1 (got ${v})`);
}
assert(
  approx(pctChange(80, 100), retChange(80, 100) * 100),
  "pctChange ≡ retChange × 100"
);

// —— volume ratio: denominator > 0 ——
assert(volumeRatio(1000, 0) === null, "volumeRatio avg=0 → null");
assert(volumeRatio(1000, -5) === null, "volumeRatio avg≤0 → null");
assert(volumeRatio(NaN, 100) === null, "volumeRatio NaN last → null");
assert(volumeRatio(100, NaN) === null, "volumeRatio NaN avg → null");
assert(volumeRatio(Infinity, 100) === null, "volumeRatio Infinity last → null");
{
  const v = volumeRatio(200, 100);
  assert(approx(v, 2), `volumeRatio 200/100 = 2 (got ${v})`);
}
assert(avgVolume([], { minLen: 1 }) === null, "avgVolume empty → null");
assert(avgVolume([1], { minLen: 2 }) === null, "avgVolume short → null");
assert(avgVolume([1, NaN, 3], { minLen: 2 }) === null, "avgVolume rejects NaN");
{
  const avg = avgVolume([10, 20, 30], { minLen: 3 });
  assert(approx(avg, 20), `avgVolume = 20 (got ${avg})`);
  const vr = volumeRatio(40, avg);
  assert(approx(vr, 2), `volumeRatio from avgVolume = 2 (got ${vr})`);
}

// —— RS vs index ——
assert(rsVsIndex(NaN, 0) === null, "rsVsIndex NaN stock → null");
assert(rsVsIndex(2, NaN) === null, "rsVsIndex NaN index → null");
assert(rsVsIndex(Infinity, 1) === null, "rsVsIndex Infinity → null");
{
  const v = rsVsIndex(3.5, 1.2);
  assert(approx(v, 2.3), `rsVsIndex 3.5−1.2 = 2.3 (got ${v})`);
}
{
  const v = rsVsIndex(1.5, null);
  assert(approx(v, 1.5), `rsVsIndex null index treated as 0 (got ${v})`);
}

// —— Regime temperature arithmetic (−2…+2 clamp, additive proxies) ——
{
  const cold = temperatureScore(
    { pctFromSma200: -0.2, ddFrom252dHigh: -0.2 },
    { d20d: 0.3 },
    { skipCredit: true, breadthProxy: 0.2 }
  );
  assert(cold.score != null && cold.score >= -2 && cold.score <= 2, `temp cold in [-2,2] (got ${cold.score})`);
  assert(cold.score < 0, `temp cold is negative (got ${cold.score})`);
}
{
  const hot = temperatureScore(
    { pctFromSma200: 0.15, ddFrom252dHigh: -0.005, near52wHigh: true, atrBottomQuartile: true },
    { d20d: -0.2 },
    { skipCredit: true, breadthProxy: 0.8, hygVsLqd20d: 0.02 }
  );
  assert(hot.score != null && hot.score >= -2 && hot.score <= 2, `temp hot in [-2,2] (got ${hot.score})`);
  assert(hot.score > 0, `temp hot is positive (got ${hot.score})`);
}
{
  const empty = temperatureScore({}, {}, { skipCredit: true });
  assert(empty.score === null && empty.used === 0, "temp no proxies → null score");
}
{
  const piled = temperatureScore(
    { pctFromSma200: 0.2, ddFrom252dHigh: 0, near52wHigh: true, atrBottomQuartile: true },
    { d20d: -0.5 },
    { breadthProxy: 0.9, hygVsLqd20d: 0.05 }
  );
  assert(piled.score === 2, `temp clamp upper = 2 (got ${piled.score})`);
}
{
  const t = temperatureScore(
    { pctFromSma200: 0.12, ddFrom252dHigh: -0.005 },
    null,
    { skipCredit: true }
  );
  assert(approx(t.score, 1.75), `temp arithmetic 1+0.75 = 1.75 (got ${t.score})`);
}

// —— Ranking score monotonicity on synthetic fixtures ——
{
  const idx = 0.5;
  const weak = {
    dayPct: 0.2,
    d5Pct: 0,
    d1mPct: 0,
    above20: false,
    above50: false,
    above200: false,
    volRatio: 1.0,
  };
  const strongerRs = { ...weak, dayPct: 2.0 };
  const withTrend = { ...strongerRs, above20: true, above50: true };
  const withVol = { ...withTrend, volRatio: 2.5 };

  const s0 = baseRankingScore(weak, idx);
  const s1 = baseRankingScore(strongerRs, idx);
  const s2 = baseRankingScore(withTrend, idx);
  const s3 = baseRankingScore(withVol, idx);

  assert(s1 > s0, `mono: higher RS scores higher (${s1} > ${s0})`);
  assert(s2 > s1, `mono: SMA flags raise score (${s2} > ${s1})`);
  assert(s3 > s2, `mono: constructive vol raises score (${s3} > ${s2})`);
}
{
  const base = {
    dayPct: 1,
    d5Pct: 2,
    d1mPct: 3,
    above20: true,
    above50: false,
    above200: false,
    volRatio: 1.5,
  };
  const a = baseRankingScore(base, 0);
  const b = baseRankingScore({ ...base, dayPct: 1.5 }, 0);
  assert(approx(b - a, 1.0), `mono: ΔdayPct +0.5 → Δscore +1.0 (got ${b - a})`);
}
{
  assert(baseRankingScore(null, 0) === -1e9, "ranking null metrics → sentinel");
  assert(baseRankingScore({ dayPct: NaN }, 0) === -1e9, "ranking NaN dayPct → sentinel");
  assert(baseRankingScore({ dayPct: 1, volRatio: Infinity }, 0) === -1e9, "ranking Infinity vol → sentinel");
}
{
  const thin = {
    dayPct: 1,
    d5Pct: 0,
    d1mPct: 0,
    above20: false,
    above50: false,
    above200: false,
    volRatio: 0.2,
  };
  const withPen = baseRankingScore(thin, 0, { preferVol: true });
  const noPen = baseRankingScore(thin, 0, { preferVol: false });
  assert(noPen > withPen, `preferVol=false skips thin-vol penalty (${noPen} > ${withPen})`);
}



// —— pct from SMA: fractional price/sma−1; sma>0 ——
assert(pctFromSma(110, 0) === null, "pctFromSma sma=0 → null");
assert(pctFromSma(110, -50) === null, "pctFromSma sma≤0 → null");
assert(pctFromSma(NaN, 100) === null, "pctFromSma NaN price → null");
assert(pctFromSma(110, NaN) === null, "pctFromSma NaN sma → null");
assert(pctFromSma(Infinity, 100) === null, "pctFromSma Infinity price → null");
assert(pctFromSma(100, Infinity) === null, "pctFromSma Infinity sma → null");
{
  const v = pctFromSma(110, 100);
  assert(approx(v, 0.1), `pctFromSma 110/100−1 = 0.1 (got ${v})`);
}
{
  const v = pctFromSma(85, 100);
  assert(approx(v, -0.15), `pctFromSma 85/100−1 = -0.15 (got ${v})`);
}
{
  const v = pctFromSma(100, 100);
  assert(approx(v, 0), `pctFromSma flat = 0 (got ${v})`);
}
assert(
  approx(pctFromSma(112, 100), retChange(100, 112)),
  "pctFromSma ≡ retChange(sma, price)"
);

// —— clamp: closed-interval projection (inequalities → Marks/temp caps) ——
assert(clamp(NaN, -2, 2) === null, "clamp NaN → null");
assert(clamp(1, NaN, 2) === null, "clamp NaN lo → null");
assert(clamp(1, -2, NaN) === null, "clamp NaN hi → null");
assert(clamp(Infinity, -2, 2) === null, "clamp Infinity → null");
assert(clamp(0, 2, -2) === null, "clamp lo>hi → null");
{
  const v = clamp(3, -2, 2);
  assert(approx(v, 2), `clamp upper 3→[-2,2] = 2 (got ${v})`);
}
{
  const v = clamp(-5, -2, 2);
  assert(approx(v, -2), `clamp lower -5→[-2,2] = -2 (got ${v})`);
}
{
  const v = clamp(0.5, -2, 2);
  assert(approx(v, 0.5), `clamp interior preserved (got ${v})`);
}
{
  const v = clamp(-2, -2, 2);
  assert(approx(v, -2), `clamp endpoint lo preserved (got ${v})`);
}
assert(
  clamp(temperatureScore({ pctFromSma200: 0.2, ddFrom252dHigh: 0, near52wHigh: true, atrBottomQuartile: true }, { d20d: -0.5 }, { breadthProxy: 0.9, hygVsLqd20d: 0.05 }).score, -2, 2) === 2,
  "clamp agrees with temp upper bound 2"
);


// —— peak window + drawdown from peak (regime ddFrom252dHigh units) ——
assert(peakInWindow([], 5) === null, "peakInWindow empty → null");
assert(peakInWindow([1, 2, 3], 0) === null, "peakInWindow window 0 → null");
assert(peakInWindow([1, 2, 3], -1) === null, "peakInWindow negative window → null");
assert(peakInWindow([1, 2, 3], 1.5) === null, "peakInWindow non-integer window → null");
assert(peakInWindow([1, 2], 3) === null, "peakInWindow short series → null");
assert(peakInWindow(null, 2) === null, "peakInWindow null arr → null");
assert(peakInWindow([1, NaN, 3], 3) === null, "peakInWindow rejects NaN");
assert(peakInWindow([1, Infinity, 3], 3) === null, "peakInWindow rejects Infinity");
assert(peakInWindow([1, -Infinity, 3], 3) === null, "peakInWindow rejects -Infinity");
{
  const v = peakInWindow([2, 9, 4, 7], 4);
  assert(approx(v, 9), `peakInWindow full = 9 (got ${v})`);
}
{
  const v = peakInWindow([2, 9, 4, 7], 2);
  assert(approx(v, 7), `peakInWindow last-2 = 7 (got ${v})`);
}

assert(drawdownFromPeak(90, 0) === null, "drawdownFromPeak peak=0 → null");
assert(drawdownFromPeak(90, -10) === null, "drawdownFromPeak peak≤0 → null");
assert(drawdownFromPeak(NaN, 100) === null, "drawdownFromPeak NaN price → null");
assert(drawdownFromPeak(90, NaN) === null, "drawdownFromPeak NaN peak → null");
assert(drawdownFromPeak(Infinity, 100) === null, "drawdownFromPeak Infinity price → null");
assert(drawdownFromPeak(90, Infinity) === null, "drawdownFromPeak Infinity peak → null");
{
  const v = drawdownFromPeak(90, 100);
  assert(approx(v, -0.1), `drawdownFromPeak 90/100−1 = -0.1 (got ${v})`);
}
{
  const v = drawdownFromPeak(100, 100);
  assert(approx(v, 0), `drawdownFromPeak at peak = 0 (got ${v})`);
}
{
  const v = drawdownFromPeak(110, 100);
  assert(approx(v, 0.1), `drawdownFromPeak above peak = +0.1 (got ${v})`);
}
assert(
  approx(drawdownFromPeak(85, 100), pctFromSma(85, 100)),
  "drawdownFromPeak ≡ pctFromSma (same fractional form)"
);
{
  const peak = peakInWindow([80, 100, 95, 90], 4);
  const dd = drawdownFromPeak(90, peak);
  assert(approx(peak, 100) && approx(dd, -0.1), `peak+dd chain 90 vs 100 → -0.1 (got peak=${peak}, dd=${dd})`);
}


// —— compound multi-day fractional returns (SOS/AM-GM domain: ∏(1+r)−1) ——
assert(compoundRet([]) === null, "compoundRet empty → null");
assert(compoundRet(null) === null, "compoundRet null → null");
assert(compoundRet([NaN]) === null, "compoundRet NaN → null");
assert(compoundRet([Infinity]) === null, "compoundRet Infinity → null");
assert(compoundRet([-1]) === null, "compoundRet r=-1 → null");
assert(compoundRet([-1.5]) === null, "compoundRet r<-1 → null");
assert(compoundRet([0.1, -1]) === null, "compoundRet mixed with r=-1 → null");
assert(compoundRet([0.1, NaN]) === null, "compoundRet mixed NaN → null");
{
  const v = compoundRet([0.1]);
  assert(approx(v, 0.1), `compoundRet single 0.1 = 0.1 (got ${v})`);
}
{
  const v = compoundRet([0.1, 0.1]);
  assert(approx(v, 0.21), `compoundRet 1.1×1.1−1 = 0.21 (got ${v})`);
}
{
  const v = compoundRet([0.5, -0.5]);
  assert(approx(v, -0.25), `compoundRet 1.5×0.5−1 = -0.25 (got ${v})`);
}
{
  const v = compoundRet([0, 0, 0]);
  assert(approx(v, 0), `compoundRet flat zeros = 0 (got ${v})`);
}
assert(
  approx(compoundRet([retChange(100, 110)]), retChange(100, 110)),
  "compoundRet([ret]) ≡ retChange"
);
assert(
  approx(compoundRet([0.1, 0.2]), (1.1 * 1.2) - 1),
  "compoundRet matches explicit product"
);

// —— weighted mean (multi-day volume / score blends) ——
assert(weightedMean(null, [1]) === null, "weightedMean null values → null");
assert(weightedMean([1], null) === null, "weightedMean null weights → null");
assert(weightedMean([], []) === null, "weightedMean empty → null");
assert(weightedMean([1, 2], [1]) === null, "weightedMean length mismatch → null");
assert(weightedMean([1], [1, 2]) === null, "weightedMean length mismatch reverse → null");
assert(weightedMean([NaN], [1]) === null, "weightedMean NaN value → null");
assert(weightedMean([1], [NaN]) === null, "weightedMean NaN weight → null");
assert(weightedMean([1], [Infinity]) === null, "weightedMean Infinity weight → null");
assert(weightedMean([1, 2], [0, 0]) === null, "weightedMean total weight 0 → null");
assert(weightedMean([1], [-1]) === null, "weightedMean negative weight → null");
assert(weightedMean([1, 2], [1, -0.5]) === null, "weightedMean mixed negative weight → null");
{
  const v = weightedMean([10], [3]);
  assert(approx(v, 10), `weightedMean single = 10 (got ${v})`);
}
{
  const v = weightedMean([2, 4, 6], [1, 1, 1]);
  assert(approx(v, 4), `weightedMean equal weights → arithmetic mean 4 (got ${v})`);
}
{
  // exact fixture: (10·1 + 20·3) / (1+3) = 70/4 = 17.5
  const v = weightedMean([10, 20], [1, 3]);
  assert(approx(v, 17.5), `weightedMean [10,20],[1,3] = 17.5 (got ${v})`);
}
assert(
  approx(weightedMean([5, 5], [0, 2]), 5),
  "weightedMean zero+positive weight ok when total>0"
);


// —— log return: ln(p1/p0); prices > 0 ——
assert(logReturn(0, 110) === null, "logReturn p0=0 → null");
assert(logReturn(100, 0) === null, "logReturn p1=0 → null");
assert(logReturn(-10, 110) === null, "logReturn p0≤0 → null");
assert(logReturn(100, -10) === null, "logReturn p1≤0 → null");
assert(logReturn(NaN, 110) === null, "logReturn NaN p0 → null");
assert(logReturn(100, NaN) === null, "logReturn NaN p1 → null");
assert(logReturn(Infinity, 110) === null, "logReturn Infinity p0 → null");
assert(logReturn(100, Infinity) === null, "logReturn Infinity p1 → null");
{
  const v = logReturn(100, 100);
  assert(approx(v, 0), `logReturn flat = 0 (got ${v})`);
}
{
  const v = logReturn(100, 110);
  assert(approx(v, Math.log(1.1)), `logReturn 100→110 = ln(1.1) (got ${v})`);
}
{
  const v = logReturn(110, 100);
  assert(approx(v, Math.log(100 / 110)), `logReturn down = ln(100/110) (got ${v})`);
}
assert(
  approx(logReturn(100, 121), Math.log(1.1) + Math.log(1.1)),
  "logReturn additive across equal factors"
);
assert(
  approx(Math.exp(logReturn(80, 100)) - 1, retChange(80, 100)),
  "exp(logReturn)−1 ≡ retChange on positive prices"
);

// —— Paper derivatives: US options + TW 台指期 (olympiad guards) ——
assert(US_OPTION_MULTIPLIER === 100, "US option multiplier = 100");
assert(TXF_MULTIPLIERS.TX === 200 && TXF_MULTIPLIERS.MTX === 50, "TX=200 MTX=50 official");
assert(txfMultiplier("TX") === 200 && txfMultiplier("mtx") === 50, "txfMultiplier case-insensitive");
assert(txfMultiplier("FAKE") === null, "txfMultiplier unknown → null (never invent)");

assert(optionIntrinsic(100, 95, "call") === 5, "call ITM intrinsic");
assert(optionIntrinsic(100, 105, "call") === 0, "call OTM intrinsic 0");
assert(optionIntrinsic(100, 105, "put") === 5, "put ITM intrinsic");
assert(optionIntrinsic(100, 95, "put") === 0, "put OTM intrinsic 0");
assert(optionIntrinsic(NaN, 100, "call") === null, "intrinsic NaN spot → null");
assert(optionIntrinsic(-1, 100, "call") === null, "intrinsic negative spot → null");
assert(optionIntrinsic(100, 100, "weird") === null, "intrinsic bad right → null");

{
  const e = optionExtrinsic(7, 100, 95, "call");
  assert(approx(e, 2), `extrinsic 7−5 = 2 (got ${e})`);
}
assert(optionExtrinsic(-1, 100, 95, "call") === null, "extrinsic negative premium → null");
assert(optionExtrinsic(1, 100, 95, "call") === null, "extrinsic premium < intrinsic → null");

{
  const buy = optionPremiumCashImpact({ side: "buy", premium: 2.5, contracts: 2 });
  assert(buy.ok && approx(buy.cashDelta, -500) && approx(buy.notional, 500), `buy debit 2.5×100×2 = −500 (got ${buy.cashDelta})`);
  const sell = optionPremiumCashImpact({ side: "sell", premium: 2.5, contracts: 2 });
  assert(sell.ok && approx(sell.cashDelta, 500), `sell credit = +500 (got ${sell.cashDelta})`);
}
assert(!optionPremiumCashImpact({ side: "buy", premium: -1, contracts: 1 }).ok, "reject negative premium");
assert(!optionPremiumCashImpact({ side: "buy", premium: 1, contracts: 1.5 }).ok, "reject non-int contracts");
assert(!optionPremiumCashImpact({ side: "buy", premium: 1, contracts: 0 }).ok, "reject zero contracts");
assert(!optionPremiumCashImpact({ side: "hold", premium: 1, contracts: 1 }).ok, "reject bad side");

{
  const mv = optionPositionMarkValue({ qty: 3, markPremium: 1.25 });
  assert(approx(mv, 375), `long mark value 3×1.25×100 = 375 (got ${mv})`);
  const shortMv = optionPositionMarkValue({ qty: -2, markPremium: 1.25 });
  assert(approx(shortMv, -250), `short mark value = −250 (got ${shortMv})`);
}
assert(optionPositionMarkValue({ qty: 1, markPremium: -0.1 }) === null, "mark value rejects neg premium");

{
  const u = optionUnrealizedPnl({ qtySigned: 2, avgPremium: 3, markPremium: 5 });
  assert(approx(u, 400), `long uPnl (5−3)×100×2 = 400 (got ${u})`);
  const s = optionUnrealizedPnl({ qtySigned: -2, avgPremium: 3, markPremium: 5 });
  assert(approx(s, -400), `short uPnl sign flip = −400 (got ${s})`);
}

{
  const set = optionExpirySettlement({ qtySigned: 1, spot: 110, strike: 100, right: "call" });
  assert(set.ok && approx(set.intrinsic, 10) && approx(set.cashDelta, 1000), `expiry long call settle +1000 (got ${set.cashDelta})`);
  const shortPut = optionExpirySettlement({ qtySigned: -1, spot: 90, strike: 100, right: "put" });
  assert(shortPut.ok && approx(shortPut.cashDelta, -1000), `expiry short put pays intrinsic (got ${shortPut.cashDelta})`);
  const otm = optionExpirySettlement({ qtySigned: 1, spot: 90, strike: 100, right: "call" });
  assert(otm.ok && approx(otm.cashDelta, 0), "OTM expiry cash 0");
}

{
  const pnl = futuresPnlTwd({ pointsDelta: 10, multiplier: 200, contractsSigned: 2 });
  assert(approx(pnl, 4000), `TX long +10pts ×200 ×2 = 4000 (got ${pnl})`);
  const shortPnl = futuresPnlTwd({ pointsDelta: 10, multiplier: 50, contractsSigned: -3 });
  assert(approx(shortPnl, -1500), `MTX short +10pts → −1500 (got ${shortPnl})`);
  const down = futuresPnlTwd({ pointsDelta: -5, multiplier: 200, contractsSigned: -1 });
  assert(approx(down, 1000), `TX short profits on −5pts = 1000 (got ${down})`);
}
assert(futuresPnlTwd({ pointsDelta: 1, multiplier: 200, contractsSigned: 1.5 }) === null, "futures rejects non-int contracts");
assert(futuresPnlTwd({ pointsDelta: 1, multiplier: 0, contractsSigned: 1 }) === null, "futures rejects mult≤0");
assert(futuresPnlTwd({ pointsDelta: NaN, multiplier: 200, contractsSigned: 1 }) === null, "futures rejects NaN points");

{
  const m = futuresMarkPnlTwd({ entryPrice: 48000, markPrice: 48100, code: "TX", contractsSigned: 1 });
  assert(approx(m, 20000), `TX mark P&L 100pts×200 = 20000 (got ${m})`);
  const bad = futuresMarkPnlTwd({ entryPrice: 48000, markPrice: 48100, code: "XYZ", contractsSigned: 1 });
  assert(bad === null, "unknown futures code → null");
}

assert(futuresMarginHold({ contracts: 2, initialMarginPerContract: 701000 }) === 1402000, "margin hold 2×TX initial");
assert(futuresMarginHold({ contracts: 0, initialMarginPerContract: 100 }) === null, "margin reject 0 contracts");
assert(futuresMarginHold({ contracts: 1, initialMarginPerContract: -1 }) === null, "margin reject neg initial");

{
  const okOpen = canOpenFutures({ freeCash: 800000, contracts: 1, initialMarginPerContract: 701000 });
  assert(okOpen.ok && approx(okOpen.hold, 701000), "can open TX with enough cash");
  const no = canOpenFutures({ freeCash: 100000, contracts: 1, initialMarginPerContract: 701000 });
  assert(!no.ok, "block futures when cash < margin");
}
{
  const okBuy = canBuyOption({ freeCash: 600, premium: 2.5, contracts: 2 });
  assert(okBuy.ok, "can buy option with cash");
  const no = canBuyOption({ freeCash: 100, premium: 2.5, contracts: 2 });
  assert(!no.ok, "block option buy when cash < debit");
}

assert(assertFinitePayload({ a: 1, b: { c: 2 } }).ok, "finite payload ok");
assert(!assertFinitePayload({ a: NaN }).ok, "NaN payload blocked");
assert(!assertFinitePayload({ a: Infinity }).ok, "Infinity payload blocked");

assert(strategyLabelPlain({ stockQty: 200, optionRight: "call", optionQtySigned: -2, underlying: "AAPL" }) === "covered-call", "covered call when stock covers");
assert(strategyLabelPlain({ stockQty: 50, optionRight: "call", optionQtySigned: -1, underlying: "AAPL" }) === "short-call", "naked short call label");
assert(strategyLabelPlain({ stockQty: 100, optionRight: "put", optionQtySigned: 1, underlying: "AAPL" }) === "protective-put", "protective put");
assert(strategyLabelPlain({ stockQty: 0, optionRight: "call", optionQtySigned: 1, underlying: "AAPL" }) === "long-call", "long call");

// Currency / book separation habit: multipliers never cross books
assert(TXF_MULTIPLIERS.TX !== US_OPTION_MULTIPLIER, "TX multiplier ≠ US option 100 (units differ)");
assert(pdFinite(TXF_MULTIPLIERS.TX) && pdFinite(US_OPTION_MULTIPLIER), "multipliers finite");

// —— Equity paper realized P&L (fill − cost) × shares ——
{
  const r = stockRealizedPnl({ fillPrice: 264.8, avgCost: 236.22, sharesSold: 4 });
  assert(approx(r, 114.32, 1e-6), `CRWD sample realized 114.32 (got ${r})`);
  const o = stockRealizedPnl({ fillPrice: 213, avgCost: 186.75, sharesSold: 10 });
  assert(approx(o, 262.5, 1e-6), `OKTA sample realized 262.5 (got ${o})`);
  const a = stockRealizedPnl({ fillPrice: 296.49, avgCost: 250.9, sharesSold: 1 });
  assert(approx(a, 45.59, 1e-6), `ARM sample realized 45.59 (got ${a})`);
}
assert(stockRealizedPnl({ fillPrice: 10, avgCost: 8, sharesSold: 0 }) === null, "sharesSold 0 → null");
assert(stockRealizedPnl({ fillPrice: 10, avgCost: 8, sharesSold: -1 }) === null, "sharesSold neg → null");
assert(stockRealizedPnl({ fillPrice: NaN, avgCost: 8, sharesSold: 1 }) === null, "NaN fill → null");
assert(stockRealizedPnl({ fillPrice: 10, avgCost: Infinity, sharesSold: 1 }) === null, "Inf cost → null");
{
  const loss = stockRealizedPnl({ fillPrice: 90, avgCost: 100, sharesSold: 5 });
  assert(approx(loss, -50), `loss (90−100)×5 = −50 (got ${loss})`);
}
{
  const buy = resolveTradeRealizedPnl({ side: "BUY", price: 10, qty: 1, realizedPnl: 0 });
  assert(buy.status === "open", "BUY is open / not 實現");
  const miss = resolveTradeRealizedPnl({ side: "SELL", price: 10, qty: 2 });
  assert(miss.status === "missing-cost", "SELL without cost/realized → missing-cost");
  const okRow = resolveTradeRealizedPnl({ side: "SELL", price: 12, qty: 3, avgCostAtSale: 10, realizedPnl: 6 });
  assert(okRow.status === "ok" && approx(okRow.value, 6), "prefer stored realizedPnl");
  const recomputed = resolveTradeRealizedPnl({ side: "SELL", price: 12, qty: 3, avgCostAtSale: 10 });
  assert(recomputed.status === "ok" && approx(recomputed.value, 6), "recompute from avgCostAtSale");
}
{
  const agg = sumSellRealizedPnl([
    { side: "SELL", realizedPnl: 10 },
    { side: "BUY", realizedPnl: 0 },
    { side: "SELL", realizedPnl: -3 },
    { side: "SELL", price: 5, qty: 1 }, // missing cost
  ]);
  assert(agg.ok && approx(agg.sum, 7) && agg.missing === 1 && agg.counted === 2, `sum sells 7 missing 1 (got ${JSON.stringify(agg)})`);
}

// Live paper-portfolio.json: each SELL realized matches (price − avgCostAtSale)×qty; book totals match sum
{
  const raw = readFileSync(join(ROOT_MG, "public/data/paper-portfolio.json"), "utf8");
  const folio = JSON.parse(raw);
  for (const [mid, book] of Object.entries(folio.books || {})) {
    let sum = 0;
    for (const tr of book.trades || []) {
      if (tr.side !== "SELL") continue;
      assert(pdFinite(tr.realizedPnl), `${mid} ${tr.ticker} ${tr.date} realizedPnl finite`);
      assert(pdFinite(tr.price) && pdFinite(tr.qty) && tr.qty > 0, `${mid} sell qty/price ok`);
      if (tr.avgCostAtSale != null) {
        const expect = stockRealizedPnl({ fillPrice: tr.price, avgCost: tr.avgCostAtSale, sharesSold: tr.qty });
        assert(expect != null && approx(expect, tr.realizedPnl, 0.02), `${mid} ${tr.ticker} ${tr.date} realized identity (got ${tr.realizedPnl} expect ${expect})`);
      }
      sum += tr.realizedPnl;
    }
    assert(approx(sum, book.realizedPnl, 0.05), `${mid} book.realizedPnl ${book.realizedPnl} = sum sells ${sum}`);
    const m = folio.metrics?.[mid];
    if (m && m.realizedPnl != null) {
      assert(approx(m.realizedPnl, book.realizedPnl, 0.05), `${mid} metrics.realizedPnl matches book`);
    }
  }
  ok("paper-portfolio sell realized identities + book totals");
}


// avgCostAfterBuy: blended cost, convex-hull invariant, total-cost identity, domain refusals
{
  assert(avgCostAfterBuy(0, null, 10, 50) === 50, "fresh open → addPrice");
  assert(approx(avgCostAfterBuy(100, 10, 100, 20), 15), "equal qty → midpoint 15");
  assert(approx(avgCostAfterBuy(30, 10, 10, 50), 20), "(300+500)/40 = 20");
  assert(avgCostAfterBuy(10, 10, 0, 20) === null, "addQty 0 → null");
  assert(avgCostAfterBuy(-1, 10, 1, 20) === null, "oldQty neg → null");
  assert(avgCostAfterBuy(10, 0, 1, 20) === null, "oldAvg 0 with qty>0 → null");
  assert(avgCostAfterBuy(10, 10, 1, -5) === null, "neg price → null");
  assert(avgCostAfterBuy(10, NaN, 1, 5) === null, "NaN avg → null");
  assert(avgCostAfterBuy(10, 10, 1, Infinity) === null, "Inf price → null");
  // randomized: convexity + total cost identity (deterministic LCG, no Math.random)
  let seed = 20261005;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = 0; i < 500; i++) {
    const q0 = 1 + Math.floor(rnd() * 5000), a0 = 1 + rnd() * 900;
    const q1 = 1 + Math.floor(rnd() * 5000), p1 = 1 + rnd() * 900;
    const r = avgCostAfterBuy(q0, a0, q1, p1);
    assert(r != null && r >= Math.min(a0, p1) - 1e-9 && r <= Math.max(a0, p1) + 1e-9, `convex hull #${i}`);
    assert(approx(r * (q0 + q1), a0 * q0 + p1 * q1, 1e-6 * (a0 * q0 + p1 * q1)), `total cost identity #${i}`);
  }
  ok("avgCostAfterBuy domain + convexity + total-cost identity");
}

// Live paper-portfolio.json: replay logged BUY/SELL per ticker → avgCost must match
// open positions and each SELL's avgCostAtSale (skip tickers whose opening BUY was trimmed).
{
  const folio = JSON.parse(readFileSync(join(ROOT_MG, "public/data/paper-portfolio.json"), "utf8"));
  let checked = 0;
  for (const [mid, book] of Object.entries(folio.books || {})) {
    const st = new Map();
    for (const tr of book.trades || []) {
      let s = st.get(tr.ticker);
      if (tr.side === "BUY") {
        if (!s) { s = { qty: 0, avg: null, complete: true }; st.set(tr.ticker, s); }
        const nAvg = avgCostAfterBuy(s.qty, s.avg, tr.qty, tr.price);
        assert(nAvg != null, `${mid} ${tr.ticker} ${tr.date} replay buy in-domain`);
        s.avg = nAvg; s.qty += tr.qty;
      } else if (tr.side === "SELL") {
        if (!s) { st.set(tr.ticker, { qty: 0, avg: null, complete: false }); continue; }
        if (s.complete && tr.avgCostAtSale != null) {
          assert(approx(s.avg, tr.avgCostAtSale, 0.006), `${mid} ${tr.ticker} ${tr.date} replay avg ${s.avg} = avgCostAtSale ${tr.avgCostAtSale}`);
          checked++;
        }
        s.qty -= tr.qty;
        assert(s.qty >= -1e-9 || !s.complete, `${mid} ${tr.ticker} sell qty ≤ held`);
        if (s.qty <= 1e-9) st.delete(tr.ticker);
      }
    }
    for (const pos of book.positions || []) {
      const s = st.get(pos.ticker);
      if (!s || !s.complete) continue;
      assert(approx(s.qty, pos.qty, 1e-6), `${mid} ${pos.ticker} replay qty ${s.qty} = position ${pos.qty}`);
      assert(approx(s.avg, pos.avgCost, 0.006), `${mid} ${pos.ticker} replay avg ${s.avg} = position ${pos.avgCost}`);
      checked++;
    }
  }
  ok(`paper-portfolio avgCost replay (${checked} checks)`);
}

// Live paper-portfolio.json: accounting identities (no fees in the paper model).
//   (1) positionsValue = Σ mark·qty, equity = cash + positionsValue
//   (2) cash ledger: startCash − Σ BUY qty·price + Σ SELL qty·price = cash (only when trade log untrimmed)
//   (3) P&L decomposition: equity − startCash = realizedPnl + Σ (mark − avgCost)·qty
//   (4) metrics.totalPnl / totalPnlPct consistent; cash ≥ 0; every qty > 0, prices > 0
{
  const folio = JSON.parse(readFileSync(join(ROOT_MG, "public/data/paper-portfolio.json"), "utf8"));
  let n = 0;
  for (const [mid, book] of Object.entries(folio.books || {})) {
    const fin = (x) => typeof x === "number" && Number.isFinite(x);
    assert(fin(book.startCash) && book.startCash > 0, `${mid} startCash finite > 0`);
    assert(fin(book.cash) && book.cash >= -0.005, `${mid} cash ${book.cash} ≥ 0`);
    let pv = 0, upnl = 0;
    for (const p of book.positions || []) {
      assert(fin(p.qty) && p.qty > 0 && fin(p.mark) && p.mark > 0 && fin(p.avgCost) && p.avgCost > 0, `${mid} ${p.ticker} position fields finite & > 0`);
      pv += p.mark * p.qty;
      upnl += (p.mark - p.avgCost) * p.qty;
    }
    const tolPv = 0.01 * Math.max(1, (book.positions || []).length);
    assert(approx(pv, book.positionsValue, tolPv), `${mid} positionsValue ${book.positionsValue} = Σ mark·qty ${pv}`);
    assert(approx(book.cash + book.positionsValue, book.equity, 0.02), `${mid} equity = cash + positionsValue`);
    const trades = book.trades || [];
    for (const tr of trades) assert(fin(tr.qty) && tr.qty > 0 && fin(tr.price) && tr.price > 0, `${mid} ${tr.ticker} ${tr.date} trade qty/price > 0`);
    if (trades.length < 400) {
      let c = book.startCash;
      for (const tr of trades) c += tr.side === "BUY" ? -tr.qty * tr.price : tr.side === "SELL" ? tr.qty * tr.price : 0;
      assert(approx(c, book.cash, 0.01 * Math.max(1, trades.length)), `${mid} cash ledger replay ${c} = cash ${book.cash}`);
      n++;
    }
    const lhs = book.equity - book.startCash, rhs = book.realizedPnl + upnl;
    assert(approx(lhs, rhs, 0.02 * Math.max(1, trades.length)), `${mid} P&L decomposition equity−start ${lhs} = realized+unrealized ${rhs}`);
    const m = folio.metrics?.[mid];
    if (m && m.totalPnl != null) {
      assert(approx(m.totalPnl, lhs, 0.05), `${mid} metrics.totalPnl ${m.totalPnl} = equity−start ${lhs}`);
      assert(approx(m.totalPnlPct, (m.totalPnl / book.startCash) * 100, 0.001), `${mid} totalPnlPct is percent of startCash`);
      if (m.unrealizedPnl != null) assert(approx(m.realizedPnl + m.unrealizedPnl, m.totalPnl, 0.05), `${mid} metrics realized+unrealized = total`);
    }
    n += 3;
  }
  ok(`paper-portfolio accounting identities (${n} book checks)`);
}

// annualizedHistVol (options desk HV20): hand closed form, invariants, independent re-implementation,
// domain refusals, and live us-options-snapshot consistency (ivHvRatio = atmIv / HV).
{
  const HV = (c) => annualizedHistVol(c, { window: 21, periodsPerYear: 252, minCloses: 22, minReturns: 20 });
  const rel = (a, b) => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(b));
  // (a) constant & geometric paths ⇒ 0 (drift does not count as volatility)
  assert(HV(Array(30).fill(100)) === 0, "HV constant closes = 0");
  const geo = Array.from({ length: 30 }, (_, i) => 50 * 1.01 ** i);
  assert(HV(geo) != null && HV(geo) < 1e-12, `HV geometric path ≈ 0 (got ${HV(geo)})`);
  // (b) hand closed form: 22 closes alternating 100,110 ⇒ 21 returns (11×+L, 10×−L), L = ln 1.1
  //     mean = L/21, sample var = L²·(21 − 1/21)/20 = L²·22/21 ⇒ HV = L·√(22/21)·√252
  const alt = Array.from({ length: 22 }, (_, i) => (i % 2 === 0 ? 100 : 110));
  const L = Math.log(1.1);
  assert(rel(HV(alt), L * Math.sqrt(22 / 21) * Math.sqrt(252)), `HV alternating closed form ${HV(alt)}`);
  // (c) invariants: price scale, time reversal (exactly 22 closes ⇒ same return set, negated)
  let s = 20261007 >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  let nRand = 0;
  for (let t = 0; t < 400; t++) {
    const n = 22 + Math.floor(rnd() * 40);
    const c = [80 + rnd() * 40];
    for (let i = 1; i < n; i++) c.push(c[i - 1] * Math.exp((rnd() - 0.5) * 0.08));
    const h = HV(c);
    assert(h != null && Number.isFinite(h) && h >= 0, `HV random finite ≥ 0 (t=${t})`);
    assert(rel(HV(c.map((x) => x * 37.5)), h) || Math.abs(HV(c.map((x) => x * 37.5)) - h) < 1e-12, `HV scale-invariant (t=${t})`);
    // independent re-implementation: Welford one-pass over the last 21 log returns
    const r = [];
    for (let i = 1; i < c.length; i++) r.push(Math.log(c[i] / c[i - 1]));
    const w = r.slice(-21);
    let m = 0, M2 = 0;
    w.forEach((x, k) => { const d = x - m; m += d / (k + 1); M2 += d * (x - m); });
    const ind = Math.sqrt(M2 / (w.length - 1)) * Math.sqrt(252);
    assert(Math.abs(ind - h) < 1e-12, `HV matches Welford re-implementation (t=${t}, ${h} vs ${ind})`);
    if (n === 22) assert(Math.abs(HV([...c].reverse()) - h) < 1e-12, `HV time-reversal invariant (t=${t})`);
    nRand++;
  }
  // (d) domain refusals: too short, non-array, garbage never leaks a non-finite number
  assert(HV(Array(21).fill(100)) === null, "HV < 22 closes → null");
  assert(HV(null) === null && HV("x") === null, "HV non-array → null");
  const dirty = [...alt, NaN, Infinity, -5, 0, null, 105];
  const hd = HV(dirty);
  assert(hd != null && Number.isFinite(hd) && hd >= 0, `HV skips NaN/∞/≤0/null bars, stays finite (got ${hd})`);
  assert(HV([...Array(25).fill(0)]) === null, "HV all-zero closes → null");
  // (e) live snapshot: historicalVol in (0, 5], ivHvRatio = round(atmIv/hv, 3)
  let nLive = 0;
  try {
    const snap = JSON.parse(readFileSync(join(ROOT_MG, "public/data/us-options-snapshot.json"), "utf8"));
    for (const row of snap.tickers || []) {
      const o = row.options || {};
      if (o.historicalVol == null) continue;
      assert(Number.isFinite(o.historicalVol) && o.historicalVol > 0 && o.historicalVol <= 5, `${row.ticker} historicalVol ${o.historicalVol} ∈ (0,5] (annual fraction, not %)`);
      if (o.atmIv != null && o.ivHvRatio != null)
        assert(Math.abs(o.ivHvRatio - o.atmIv / o.historicalVol) <= 0.0005 + 1e-9, `${row.ticker} ivHvRatio ${o.ivHvRatio} = atmIv/HV ${o.atmIv / o.historicalVol}`);
      nLive++;
    }
  } catch (e) {
    fail(`us-options-snapshot.json unreadable for HV guard: ${e.message}`);
  }
  ok(`annualizedHistVol (closed form, ${nRand} random invariant/re-impl cases, domain, ${nLive} live rows)`);
}

// —— TXF futures basis + third-Wednesday last trading day (olympiad practice 2026-10-08) ——
{
  const FB = futuresBasis;
  // (a) hand cases: premium, discount, flat; units = index points and percent of spot
  let b = FB(50060, 49822.55);
  assert(b && b.basisPoints === 237.45 && b.basisPct === 0.4766, `basis hand premium ${JSON.stringify(b)}`);
  b = FB(19900, 20000);
  assert(b && b.basisPoints === -100 && b.basisPct === -0.5, `basis hand discount ${JSON.stringify(b)}`);
  b = FB(20000, 20000);
  assert(b && b.basisPoints === 0 && b.basisPct === 0 && !Object.is(b.basisPct, -0), "basis flat = +0");
  // (b) invariants over 2000 LCG cases: sign agreement, |pct| ≈ |pts|/spot·100, scale-invariance of pct,
  //     fut = spot·(1 + pct/100) round-trip within rounding, rounding granularity
  let s = 20261008 >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  let nB = 0;
  for (let t = 0; t < 2000; t++) {
    const spot = 5000 + rnd() * 60000;
    const fut = spot * (1 + (rnd() - 0.5) * 0.04);
    const r = FB(fut, spot);
    assert(r && Number.isFinite(r.basisPoints) && Number.isFinite(r.basisPct), `basis finite t=${t}`);
    const d = fut - spot;
    assert(Math.abs(r.basisPoints - d) <= 0.005 + 1e-9, `basisPoints within ½ cent of fut−spot t=${t}`);
    assert(Math.abs(r.basisPct - (d / spot) * 100) <= 0.00005 + 1e-12, `basisPct within ½e−4 of exact t=${t}`);
    assert(Math.sign(r.basisPoints) * Math.sign(r.basisPct) >= 0, `basis sign agreement t=${t}`);
    assert(Math.abs(Math.round(r.basisPoints * 100) - r.basisPoints * 100) < 1e-6, `basisPoints on 0.01 grid t=${t}`);
    const k = 0.5 + rnd() * 3;
    const rk = FB(fut * k, spot * k);
    assert(Math.abs(rk.basisPct - r.basisPct) <= 0.0001 + 1e-12, `basisPct scale-invariant t=${t}`);
    // antisymmetry of the raw difference: swapping roles negates points exactly (before % normalisation)
    const sw = FB(spot, fut);
    assert(Math.abs(sw.basisPoints + r.basisPoints) <= 0.01 + 1e-9, `basisPoints antisymmetric t=${t}`);
    nB++;
  }
  // (c) domain refusals: never 0/∞ on bad input
  for (const [f, sp] of [[null, 1], [1, null], [NaN, 1], [1, Infinity], [100, 0], [100, -5], [0, 100], ["1", 1]])
    assert(FB(f, sp) === null, `basis refuses (${f}, ${sp})`);

  // (d) third Wednesday: brute day-scan for every month 1900–2200 (3612 months)
  const TW = thirdWednesdayYmd;
  let nW = 0;
  for (let y = 1900; y <= 2200; y++) {
    for (let m = 1; m <= 12; m++) {
      let cnt = 0, want = null;
      for (let dd = 1; dd <= 31; dd++) {
        const dt = new Date(Date.UTC(y, m - 1, dd));
        if (dt.getUTCMonth() !== m - 1) break;
        if (dt.getUTCDay() === 3 && ++cnt === 3) { want = dd; break; }
      }
      const got = TW(y, m);
      const exp = `${y}-${String(m).padStart(2, "0")}-${String(want).padStart(2, "0")}`;
      if (got !== exp) assert(false, `thirdWednesday ${y}-${m}: ${got} ≠ brute ${exp}`);
      const day = Number(got.slice(8, 10));
      if (!(day >= 15 && day <= 21)) assert(false, `thirdWednesday day ∈ [15,21] (${got})`);
      nW++;
    }
  }
  assert(TW(2026, 10) === "2026-10-21" && TW(2026, 11) === "2026-11-18" && TW(2027, 3) === "2027-03-17", "thirdWednesday hand cases 2026-10/11, 2027-03");
  for (const [y, m] of [[2026, 0], [2026, 13], [2026.5, 1], [null, 1], [2026, "10"]])
    assert(TW(y, m) === null, `thirdWednesday refuses (${y}, ${m})`);

  // (e) live replay: txf-desk.json basis = futuresBasis(futLast, spot); every monthly contract's
  //     lastTradingDay = thirdWednesday(month) and is a Wednesday; change/changePct consistent.
  let nLive = 0;
  try {
    const desk = JSON.parse(readFileSync(join(ROOT_MG, "public/data/txf-desk.json"), "utf8"));
    if (desk.basis) {
      const lb = FB(desk.basis.futuresLast, desk.basis.spotLast);
      assert(lb && Math.abs(lb.basisPoints - desk.basis.basisPoints) <= 0.01 + 1e-9, `live basisPoints ${desk.basis.basisPoints} vs ${lb?.basisPoints}`);
      assert(lb && Math.abs(lb.basisPct - desk.basis.basisPct) <= 0.0001 + 1e-9, `live basisPct ${desk.basis.basisPct} vs ${lb?.basisPct}`);
      nLive++;
    }
    for (const c of Object.values(desk.contracts || {})) {
      for (const row of [c.near, c.next, ...(c.listed || [])].filter(Boolean)) {
        if (/^\d{6}$/.test(row.month)) {
          const exp = TW(Number(row.month.slice(0, 4)), Number(row.month.slice(4, 6)));
          assert(row.lastTradingDay === exp, `${c.code} ${row.month} lastTradingDay ${row.lastTradingDay} = 3rd Wed ${exp}`);
          assert(new Date(`${row.lastTradingDay}T00:00:00Z`).getUTCDay() === 3, `${c.code} ${row.month} LTD is a Wednesday`);
        }
        if (Number.isFinite(row.last) && Number.isFinite(row.change) && Number.isFinite(row.changePct) && row.last - row.change > 0) {
          const pct = (row.change / (row.last - row.change)) * 100;
          assert(Math.abs(pct - row.changePct) <= 0.006, `${c.code} ${row.month} changePct ${row.changePct} ≈ change/prev ${pct.toFixed(4)}`);
          assert(Math.sign(row.change) * Math.sign(row.changePct) >= 0, `${c.code} ${row.month} change/changePct sign agree`);
        }
        nLive++;
      }
    }
    const sp = desk.spot || {};
    if (Number.isFinite(sp.change) && Number.isFinite(sp.changePct))
      assert(Math.sign(sp.change) * Math.sign(sp.changePct) >= 0, `spot change ${sp.change} / changePct ${sp.changePct} sign agree`);
  } catch (e) {
    fail(`txf-desk.json unreadable for basis/LTD guard: ${e.message}`);
  }
  ok(`futuresBasis + thirdWednesdayYmd (hand, ${nB} random invariant cases, ${nW} months brute-scanned, domain, ${nLive} live rows)`);
}

// ── isFiniteNumber / finiteOrNull truth table + cross-module agreement + live data token scan (2026-10-13)
{
  const good = [0, -0, 1, -1, 1e-300, -1e308, Number.MAX_VALUE, Number.MIN_VALUE, 0.1 + 0.2];
  const bad = [NaN, Infinity, -Infinity, "1", "", "NaN", null, undefined, true, false, [], [1], {}, () => 1, 10n, new Number(1)];
  let n = 0;
  for (const v of good) {
    if (!(isFiniteNumber(v) && pdFinite(v))) fail(`isFiniteNumber accepts finite ${String(v)}`);
    if (!Object.is(finiteOrNull(v), v)) fail(`finiteOrNull(${String(v)}) returns input unchanged`);
    n++;
  }
  for (const v of bad) {
    if (isFiniteNumber(v) || pdFinite(v)) fail(`isFiniteNumber rejects ${typeof v} ${String(v)}`);
    if (finiteOrNull(v) !== null) fail(`finiteOrNull(${typeof v} ${String(v)}) → null`);
    n++;
  }
  // idempotence + range property on a random mix
  let seed = 20261013;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = 0; i < 2000; i++) {
    const r = rnd();
    const v = r < 0.2 ? NaN : r < 0.3 ? (rnd() < 0.5 ? Infinity : -Infinity) : r < 0.4 ? String(rnd()) : (rnd() - 0.5) * 10 ** Math.floor(rnd() * 40 - 20);
    const f = finiteOrNull(v);
    if (!(f === null || isFiniteNumber(f))) fail(`finiteOrNull range violated for ${String(v)}`);
    if (!Object.is(finiteOrNull(f), f) && f !== null) fail(`finiteOrNull not idempotent at ${String(v)}`);
    if (isFiniteNumber(v) !== pdFinite(v)) fail(`math-core vs paper-derivatives isFiniteNumber disagree at ${String(v)}`);
    n++;
  }
  // Live public data: no stringified non-finite tokens anywhere a number belongs
  let files = 0;
  try {
    const { readdirSync } = await import("node:fs");
    const dir = join(ROOT_MG, "public", "data");
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      const txt = readFileSync(join(dir, f), "utf8");
      if (/:\s*(NaN|-?Infinity)\b|"(NaN|-?Infinity|undefined)"/.test(txt)) fail(`public/data/${f} contains a NaN/Infinity/undefined token`);
      files++;
    }
  } catch (e) {
    fail(`public/data unreadable for non-finite token scan: ${e.message}`);
  }
  ok(`isFiniteNumber/finiteOrNull (${n} truth-table/random cases, cross-module agreement, ${files} live data files token-clean)`);
}

// —— ATR% (true range / close): extracted from market-regime atrPct20, 2026-10-15 ——
{
  let n = 0;
  const legacy = (bars) => {
    // verbatim copy of the pre-extraction market-regime atrPct20 (valid-data oracle)
    if (!bars || bars.length < 21) return null;
    const slice = bars.slice(-21);
    let sum = 0, count = 0;
    for (let i = 1; i < slice.length; i++) {
      const h = slice[i].h, l = slice[i].l, pc = slice[i - 1].c;
      if (h == null || l == null || pc == null) continue;
      sum += Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
      count++;
    }
    if (count < 10) return null;
    const close = slice[slice.length - 1].c;
    if (!close) return null;
    return sum / count / close;
  };
  const flat = Array.from({ length: 30 }, () => ({ h: 100, l: 100, c: 100 }));
  if (atrPct(flat) !== 0) fail("atrPct flat series → 0"); n++;
  // hand case: 21 bars, constant range 2 around close 100 ⇒ TR = 2, ATR% = 0.02
  const band = Array.from({ length: 21 }, () => ({ h: 101, l: 99, c: 100 }));
  if (Math.abs(atrPct(band) - 0.02) > 1e-15) fail("atrPct band h−l=2, c=100 → 0.02"); n++;
  // gap case: prior close 100, today h=110 l=108 c=109 ⇒ TR = |h−pc| = 10 (not h−l = 2)
  const gap = [...Array.from({ length: 20 }, () => ({ h: 100, l: 100, c: 100 })), { h: 110, l: 108, c: 109 }];
  if (Math.abs(atrPct(gap) - 10 / 20 / 109) > 1e-15) fail("atrPct gap-up uses |h − prevClose|"); n++;
  const gapDn = [...Array.from({ length: 20 }, () => ({ h: 100, l: 100, c: 100 })), { h: 92, l: 90, c: 91 }];
  if (Math.abs(atrPct(gapDn) - 10 / 20 / 91) > 1e-15) fail("atrPct gap-down uses |l − prevClose|"); n++;
  // domain refusals
  const refuse = [
    [null, "null"], [[], "empty"], [band.slice(0, 20), "20 bars < window+1"],
    [[...band.slice(0, 20), { h: 101, l: 99, c: 0 }], "last close 0"],
    [[...band.slice(0, 20), { h: 101, l: 99, c: NaN }], "last close NaN"],
    [band.map((b, i) => (i % 2 || i === 2 ? { ...b, h: NaN } : b)), "only 9 usable TRs (< minTr 10)"],
  ];
  for (const [bars, why] of refuse) { if (atrPct(bars) !== null) fail(`atrPct refuses ${why}`); n++; }
  // boundary: exactly 10 usable TRs (odd bars 1..19 unusable) is still accepted
  if (Math.abs(atrPct(band.map((b, i) => (i % 2 ? { ...b, h: NaN } : b))) - 0.02) > 1e-15) fail("atrPct accepts exactly minTr usable TRs"); n++;
  // invalid bars are skipped, not zero-filled: one NaN high must not drag ATR toward 0
  const holed = band.map((b, i) => (i === 5 ? { ...b, h: NaN } : b));
  if (Math.abs(atrPct(holed) - 0.02) > 1e-15) fail("atrPct skips NaN bar instead of counting TR=0"); n++;
  const inverted = band.map((b, i) => (i === 7 ? { h: 99, l: 101, c: 100 } : b));
  if (Math.abs(atrPct(inverted) - 0.02) > 1e-15) fail("atrPct skips h<l bar"); n++;
  // random walks: invariants + agreement with legacy oracle on valid data
  let seed = 20261015;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let t = 0; t < 1500; t++) {
    const len = 21 + Math.floor(rnd() * 60);
    let c = 10 + rnd() * 500;
    const bars = [];
    for (let i = 0; i < len; i++) {
      const o = c * (1 + (rnd() - 0.5) * 0.06);
      c = o * (1 + (rnd() - 0.5) * 0.04);
      const h = Math.max(o, c) * (1 + rnd() * 0.02);
      const l = Math.min(o, c) * (1 - rnd() * 0.02);
      bars.push({ h, l, c });
    }
    const a = atrPct(bars);
    if (!(isFiniteNumber(a) && a >= 0)) { fail(`atrPct finite ≥0 (case ${t})`); continue; }
    const ref = legacy(bars);
    if (Math.abs(a - ref) > 1e-12 * Math.max(1, ref)) fail(`atrPct ≠ legacy oracle (case ${t}): ${a} vs ${ref}`);
    // lower bound: mean(h−l)/c ≤ ATR%, since each TR ≥ h−l
    const last = bars.slice(-20);
    const hl = last.reduce((s, b) => s + (b.h - b.l), 0) / 20 / bars[bars.length - 1].c;
    if (a < hl - 1e-12) fail(`atrPct ≥ mean range lower bound (case ${t})`);
    const k = 0.01 + rnd() * 100;
    const scaled = atrPct(bars.map((b) => ({ h: b.h * k, l: b.l * k, c: b.c * k })));
    if (Math.abs(scaled - a) > 1e-9 * Math.max(1, a)) fail(`atrPct scale-invariant (case ${t}, k=${k})`);
    // only the last window+1 bars matter
    const prefixed = atrPct([{ h: 1e6, l: 1, c: 5e5 }, ...bars]);
    if (Math.abs(prefixed - a) > 1e-15) fail(`atrPct ignores bars before the window (case ${t})`);
    n += 4;
  }
  // live: published regime atrPct20 must sit in a plausible index band (0, 0.15]
  let live = 0;
  try {
    const latest = JSON.parse(readFileSync(join(ROOT_MG, "public", "data", "latest.json"), "utf8"));
    const walk = (o) => {
      if (!o || typeof o !== "object") return;
      for (const [k, v] of Object.entries(o)) {
        if (k === "atrPct20" && v != null) {
          if (!(isFiniteNumber(v) && v > 0 && v <= 0.15)) fail(`live atrPct20 out of band: ${v}`);
          live++;
        } else walk(v);
      }
    };
    walk(latest);
  } catch (e) {
    fail(`latest.json unreadable for atrPct20 band check: ${e.message}`);
  }
  if (live === 0) fail("latest.json has no atrPct20 field to check");
  ok(`atrPct (${n} hand/refusal/random cases incl. legacy-oracle agreement, scale & window invariance; ${live} live atrPct20 in (0, 0.15])`);
}


// ── realized P&L on sells + sign-symmetric money rounding ──
{
  let n = 0;
  // roundHalfAway hand cases (incl. decimal ties that plain Math.round gets wrong)
  const hand = [
    [2.345, 2, 2.35], [-2.345, 2, -2.35], [0.125, 2, 0.13], [-0.125, 2, -0.13],
    [1.005, 2, 1.01], [-1.005, 2, -1.01], [0, 2, 0], [-0, 2, 0], [-0.004, 2, 0],
    [123.456789, 4, 123.4568], [70050, 2, 70050], [-108.0204, 2, -108.02], [2.5, 0, 3], [-2.5, 0, -3],
  ];
  for (const [x, d, want] of hand) {
    const got = roundHalfAway(x, d);
    if (!Object.is(got, want)) fail(`roundHalfAway(${x}, ${d}) = ${got}, want ${want}`);
    n++;
  }
  for (const bad of [NaN, Infinity, -Infinity, null, undefined, "1.5"]) {
    if (roundHalfAway(bad, 2) !== null) fail(`roundHalfAway refuses ${String(bad)}`);
    n++;
  }
  for (const d of [-1, 1.5, 11]) {
    if (roundHalfAway(1.23, d) !== null) fail(`roundHalfAway refuses digits=${d}`);
    n++;
  }
  if (roundHalfAway(1e15 + 0.5, 2) !== 1e15 + 0.5) fail("roundHalfAway leaves huge values untouched");
  n++;
  // random: symmetry, idempotence, |x − round(x)| ≤ half a unit, result on the 10^-d grid
  let seed = 1016;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let t = 0; t < 3000; t++) {
    const d = Math.floor(rnd() * 5);
    const x = (rnd() - 0.5) * 2 * 10 ** Math.floor(rnd() * 8);
    const r = roundHalfAway(x, d);
    const f = 10 ** d;
    if (!Object.is(roundHalfAway(-x, d), r === 0 ? 0 : -r)) fail(`roundHalfAway symmetric (x=${x}, d=${d})`);
    if (roundHalfAway(r, d) !== r) fail(`roundHalfAway idempotent (x=${x}, d=${d})`);
    if (Math.abs(x - r) > 0.5 / f + 1e-9 * Math.max(1, Math.abs(x))) fail(`roundHalfAway within half unit (x=${x}, d=${d})`);
    if (Math.abs(r * f - Math.round(r * f)) > Math.max(1e-6, 8 * Number.EPSILON * Math.abs(r * f))) fail(`roundHalfAway on grid (x=${x}, d=${d})`);
    n += 4;
  }
  // exact decimal ties k + 0.5 units: must go away from zero for both signs
  for (let k = 0; k < 500; k++) {
    const x = (k + 0.5) / 100;
    const want = (k + 1) / 100;
    if (roundHalfAway(x, 2) !== want || roundHalfAway(-x, 2) !== -want) fail(`roundHalfAway tie ${x}`);
    n++;
  }

  // realizedPnl: hand, refusals, invariants
  if (realizedPnl(44.2, 36.3, 3000) == null || Math.abs(realizedPnl(44.2, 36.3, 3000) - 23700) > 1e-6) fail("realizedPnl hand TW 光鼎 23700");
  if (Math.abs(realizedPnl(668.83, 677.8317, 12) - -108.0204) > 1e-9) fail("realizedPnl hand US META −108.0204");
  if (realizedPnl(10, 10, 5) !== 0) fail("realizedPnl flat = 0");
  n += 3;
  for (const [p, c, q] of [[NaN, 10, 1], [10, NaN, 1], [10, 10, NaN], [0, 10, 1], [-1, 10, 1], [10, 0, 1], [10, -5, 1], [10, 10, 0], [10, 10, -3], [Infinity, 10, 1], [10, 10, Infinity], [null, 10, 1], ["10", 10, 1]]) {
    if (realizedPnl(p, c, q) !== null) fail(`realizedPnl refuses (${p}, ${c}, ${q})`);
    n++;
  }
  for (let t = 0; t < 2000; t++) {
    const p = 0.5 + rnd() * 2000;
    const c = 0.5 + rnd() * 2000;
    const q1 = 1 + Math.floor(rnd() * 5000);
    const q2 = 1 + Math.floor(rnd() * 5000);
    const r = realizedPnl(p, c, q1);
    const tol = 1e-9 * Math.max(1, p, c) * (q1 + q2);
    if (Math.sign(r) !== Math.sign(p - c)) fail(`realizedPnl sign (p=${p}, c=${c})`);
    if (Math.abs(realizedPnl(p, c, q1) + realizedPnl(p, c, q2) - realizedPnl(p, c, q1 + q2)) > tol) fail(`realizedPnl additive in qty (case ${t})`);
    if (Math.abs(r - (p * q1 - c * q1)) > tol) fail(`realizedPnl = proceeds − cost basis (case ${t})`);
    const k = 0.01 + rnd() * 100;
    if (Math.abs(realizedPnl(p * k, c * k, q1) - k * r) > tol * Math.max(1, k) * 10) fail(`realizedPnl scales with price units (case ${t})`);
    // round trip with avgCostAfterBuy: two buys then sell all ⇒ realized = proceeds − total paid
    const b1 = 0.5 + rnd() * 2000;
    const b2 = 0.5 + rnd() * 2000;
    const avg = avgCostAfterBuy(q1, b1, q2, b2);
    const rt = realizedPnl(p, avg, q1 + q2);
    const direct = p * (q1 + q2) - (b1 * q1 + b2 * q2);
    if (Math.abs(rt - direct) > 1e-7 * Math.max(1, Math.abs(direct), p * (q1 + q2))) fail(`realizedPnl ∘ avgCostAfterBuy round trip (case ${t})`);
    n += 5;
  }

  // live replay: every booked SELL's realizedPnl must equal (price − avgCostAtSale) × qty
  // up to the rounding of avgCostAtSale (≤ 0.005·qty) plus cent rounding; book total = Σ trades
  let live = 0;
  try {
    const pp = JSON.parse(readFileSync(join(ROOT_MG, "public", "data", "paper-portfolio.json"), "utf8"));
    for (const [id, book] of Object.entries(pp.books || {})) {
      let sum = 0;
      for (const tr of book.trades || []) {
        if (String(tr.side).toUpperCase() !== "SELL") continue;
        for (const k of ["price", "qty", "avgCostAtSale", "realizedPnl"]) {
          if (!isFiniteNumber(tr[k])) fail(`paper ${id} SELL ${tr.ticker} ${tr.date}: ${k} not finite`);
        }
        const re = realizedPnl(tr.price, tr.avgCostAtSale, tr.qty);
        if (re == null) fail(`paper ${id} SELL ${tr.ticker} ${tr.date}: inputs off-domain`);
        else if (Math.abs(re - tr.realizedPnl) > 0.005 * tr.qty + 0.006) {
          fail(`paper ${id} SELL ${tr.ticker} ${tr.date}: realizedPnl ${tr.realizedPnl} ≠ (price−avg)×qty ${re.toFixed(4)}`);
        }
        sum += tr.realizedPnl;
        live++;
      }
      if ((book.trades || []).length < 400 && isFiniteNumber(book.realizedPnl)) {
        const sells = (book.trades || []).filter((x) => String(x.side).toUpperCase() === "SELL").length;
        if (Math.abs(sum - book.realizedPnl) > 0.006 * Math.max(1, sells)) fail(`paper ${id}: book realizedPnl ${book.realizedPnl} ≠ Σ trades ${sum.toFixed(2)}`);
      }
    }
  } catch (e) {
    fail(`paper-portfolio.json unreadable for realized P&L replay: ${e.message}`);
  }
  ok(`realizedPnl + roundHalfAway (${n} hand/refusal/tie/random cases incl. sign, qty additivity, unit scaling, avgCostAfterBuy round trip; ${live} live paper SELLs reproduce (price − avg) × qty, book totals = Σ trades)`);
}

// —— Observed-volume ratio (no zero-fill) + Marks temperature finite gating (2026-10-19) ——
// Bug found: `b.v || 0` zero-filled Yahoo's not-yet-backfilled last-session volume, so the
// published ^TWII indexVolRatio20 was exactly 0 on 13 of 16 scan days (a fake "dead volume"
// day), and a missing prior bar would have deflated the mean and inflated the ratio.
{
  let n = 0;
  const bad = (m) => { fail(m); };
  // observedVolume domain
  for (const [v, want] of [[5, 5], [0.5, 0.5], [0, null], [-3, null], [NaN, null], [Infinity, null], [-Infinity, null], ["5", null], [null, null], [undefined, null]]) {
    n++;
    if (!Object.is(observedVolume(v), want)) bad(`observedVolume(${String(v)}) = ${observedVolume(v)} ≠ ${want}`);
  }
  let seed = 20261019;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const legacyRatio = (vols) => volumeRatio(vols[vols.length - 1], avgVolume(vols.slice(-21, -1), { minLen: 10 }));
  const mkVols = (len) => Array.from({ length: len }, () => 1e3 + rnd() * 9e6);
  // (1) all observed ⇒ identical to legacy formula (verbatim oracle)
  for (let i = 0; i < 2000; i++) {
    const len = 11 + Math.floor(rnd() * 60);
    const vols = mkVols(len);
    const a = volumeRatioObserved(vols).ratio, b = legacyRatio(vols);
    n++;
    if (!(a != null && b != null && Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(b)))) bad(`all-observed ratio ${a} ≠ legacy ${b} (len ${len})`);
    // scale invariance (units of shares vs lots) and strict positivity
    const c = 1 + Math.floor(rnd() * 999);
    const s = volumeRatioObserved(vols.map((v) => v * c)).ratio;
    n++;
    if (!(s != null && Math.abs(s - a) <= 1e-12 * Math.max(1, a))) bad(`ratio not scale-invariant ×${c}: ${s} vs ${a}`);
    n++;
    if (!(a > 0)) bad(`ratio not > 0: ${a}`);
  }
  // (2) missing last bar ⇒ null, never 0 (the legacy zero-fill published 0 here)
  for (let i = 0; i < 500; i++) {
    const vols = mkVols(25);
    vols[vols.length - 1] = [null, undefined, 0, NaN, -1][i % 5];
    const r = volumeRatioObserved(vols).ratio;
    n++;
    if (r !== null) bad(`missing last volume (${String(vols[24])}) gave ratio ${r}, want null`);
    const zf = legacyRatio(vols.map((v) => v || 0));
    n++;
    if (zf !== 0 && i % 5 !== 4) bad(`oracle sanity: zero-fill should reproduce the published 0 (got ${zf})`);
  }
  // (3) k missing priors: mean over observed only; boundary 9 observed → null, 10 → value
  for (let i = 0; i < 1000; i++) {
    const vols = mkVols(21);
    const k = Math.floor(rnd() * 21); // 0..20 priors dropped
    const idx = Array.from({ length: 20 }, (_, j) => j);
    for (let j = 19; j > 0; j--) { const t = Math.floor(rnd() * (j + 1)); [idx[j], idx[t]] = [idx[t], idx[j]]; }
    for (const j of idx.slice(0, k)) vols[j] = rnd() < 0.5 ? null : 0;
    const obs = vols.slice(0, 20).filter((v) => typeof v === "number" && v > 0);
    const r = volumeRatioObserved(vols);
    n++;
    if (r.observedPrior !== 20 - k) bad(`observedPrior ${r.observedPrior} ≠ ${20 - k}`);
    if (20 - k < 10) {
      n++;
      if (r.ratio !== null) bad(`${20 - k} observed priors (<10) gave ratio ${r.ratio}, want null`);
    } else {
      const want = vols[20] / (obs.reduce((a, b) => a + b, 0) / obs.length);
      n++;
      if (!(r.ratio != null && Math.abs(r.ratio - want) <= 1e-12 * want)) bad(`k=${k} ratio ${r.ratio} ≠ last/mean(observed) ${want}`);
      // zero-filled priors would deflate the mean ⇒ legacy ratio ≥ honest ratio, strictly when k>0
      const zf = legacyRatio(vols.map((v) => v || 0));
      n++;
      if (k > 0 && !(zf > r.ratio)) bad(`oracle sanity: zero-filled priors should inflate ratio (zf ${zf} vs ${r.ratio})`);
    }
  }
  // (4) window only looks at the 20 bars before the last
  {
    const vols = mkVols(40);
    const a = volumeRatioObserved(vols).ratio;
    vols[0] = null; vols[18] = 0; // outside the prior-20 window (indices 19..38)
    n++;
    if (volumeRatioObserved(vols).ratio !== a) bad("bars outside the 20-bar prior window changed the ratio");
  }
  // (5) integration: indexFeaturesFromChart publishes null (gap) on a missing last volume, never 0
  {
    const bars = [];
    let px = 100;
    for (let i = 0; i < 260; i++) {
      px *= 1 + (rnd() - 0.5) * 0.02;
      bars.push({ date: `d${i}`, o: px, h: px * 1.005, l: px * 0.995, c: px, v: 2e6 + rnd() * 3e6 });
    }
    const full = indexFeaturesFromChart({ bars });
    const want = Math.round(legacyRatio(bars.map((b) => b.v)) * 1000) / 1000;
    n++;
    if (full?.indexVolRatio20 !== want) bad(`indexFeaturesFromChart all-observed ${full?.indexVolRatio20} ≠ legacy ${want}`);
    for (const miss of [null, undefined, 0]) {
      const b2 = bars.map((b) => ({ ...b }));
      b2[b2.length - 1].v = miss;
      const f = indexFeaturesFromChart({ bars: b2 });
      n++;
      if (f?.indexVolRatio20 !== null) bad(`indexFeaturesFromChart last v=${String(miss)} → ${f?.indexVolRatio20}, want null`);
    }
  }
  // (6) live: no published index volume ratio is exactly 0 (a liquid index never trades 0)
  try {
    const lj = JSON.parse(readFileSync(join(ROOT_MG, "public", "data", "latest.json"), "utf8"));
    for (const m of ["us", "tw"]) {
      const v = lj?.marketRegime?.[m]?.features?.indexVolRatio20;
      n++;
      if (v != null && !(isFiniteNumber(v) && v > 0)) bad(`latest.json ${m} indexVolRatio20 = ${v} (zero/non-finite volume ratio published)`);
    }
  } catch (e) {
    bad(`latest.json unreadable for volume-ratio live check: ${e.message}`);
  }
  ok(`observedVolume / volumeRatioObserved (${n} cases: legacy-equal when all observed, scale-invariant, missing last ⇒ null not 0, mean over observed priors, 9/10 boundary, window locality, indexFeaturesFromChart integration, live latest.json has no 0 ratio)`);
}
{
  // Marks temperature: verbatim legacy oracle on finite inputs; non-finite ⇒ gap (not "used")
  const legacyTemp = (feat, rate, opts = {}) => {
    let score = 0, used = 0;
    if (feat?.pctFromSma200 != null) { used++; if (feat.pctFromSma200 >= 0.12) score += 1; else if (feat.pctFromSma200 >= 0.05) score += 0.5; else if (feat.pctFromSma200 <= -0.15) score -= 1; else if (feat.pctFromSma200 <= -0.08) score -= 0.5; }
    if (feat?.ddFrom252dHigh != null) { used++; if (feat.ddFrom252dHigh >= -0.01) score += 0.75; else if (feat.ddFrom252dHigh <= -0.15) score -= 1; else if (feat.ddFrom252dHigh <= -0.1) score -= 0.5; }
    if (feat?.near52wHigh && feat?.atrBottomQuartile) { used++; score += 1; }
    if (rate?.d20d != null) { used++; if (rate.d20d >= 0.25) score -= 0.75; else if (rate.d20d <= -0.15) score += 0.5; }
    if (opts.breadthProxy != null) { used++; if (opts.breadthProxy >= 0.7) score += 0.5; else if (opts.breadthProxy <= 0.3) score -= 0.5; }
    if (opts.skipCredit) { /* */ } else if (opts.hygVsLqd20d != null) { used++; if (opts.hygVsLqd20d > 0.01) score += 0.25; else if (opts.hygVsLqd20d < -0.01) score -= 0.25; }
    if (used === 0) return { score: null, used: 0 };
    return { score: Math.max(-2, Math.min(2, Math.round(score * 100) / 100)), used };
  };
  let n = 0;
  let seed = 19102026;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (lo, hi, pNull = 0.15) => (rnd() < pNull ? null : lo + rnd() * (hi - lo));
  const gen = () => {
    const dd = pick(-0.4, 0);
    return {
      feat: { pctFromSma200: pick(-0.3, 0.3), ddFrom252dHigh: dd, near52wHigh: dd == null ? null : dd >= -0.02, atrBottomQuartile: rnd() < 0.2 ? null : rnd() < 0.3 },
      rate: { d20d: pick(-0.6, 0.6) },
      opts: { breadthProxy: pick(0, 1), hygVsLqd20d: pick(-0.05, 0.05), skipCredit: rnd() < 0.4 },
    };
  };
  for (let i = 0; i < 5000; i++) {
    const { feat, rate, opts } = gen();
    const a = temperatureScore(feat, rate, opts), b = legacyTemp(feat, rate, opts);
    n++;
    if (a.score !== b.score || a.used !== b.used) bad2(`temp ≠ legacy on finite inputs: ${JSON.stringify({ feat, rate, opts })} new ${a.score}/${a.used} legacy ${b.score}/${b.used}`);
    n++;
    if (a.score != null && !(a.score >= -2 && a.score <= 2 && Number.isInteger(Math.round(a.score * 4 * 1e9) / 1e9))) bad2(`temp ${a.score} outside [-2,2] or not a multiple of 0.25`);
  }
  function bad2(m) { fail(m); }
  // non-finite proxy ⇒ same as absent (gap), never counted as used
  const slots = [
    ["pctFromSma200", (f, r, o, v) => { f.pctFromSma200 = v; }],
    ["ddFrom252dHigh", (f, r, o, v) => { f.ddFrom252dHigh = v; }],
    ["d20d", (f, r, o, v) => { r.d20d = v; }],
    ["breadthProxy", (f, r, o, v) => { o.breadthProxy = v; }],
    ["hygVsLqd20d", (f, r, o, v) => { o.hygVsLqd20d = v; o.skipCredit = false; }],
  ];
  for (let i = 0; i < 600; i++) {
    const [name, set] = slots[i % slots.length];
    const g = gen();
    const junk = [NaN, Infinity, -Infinity, "0.2"][i % 4];
    const f1 = { ...g.feat }, r1 = { ...g.rate }, o1 = { ...g.opts };
    const f2 = { ...g.feat }, r2 = { ...g.rate }, o2 = { ...g.opts };
    set(f1, r1, o1, junk); set(f2, r2, o2, null);
    const a = temperatureScore(f1, r1, o1), b = temperatureScore(f2, r2, o2);
    n++;
    if (a.score !== b.score || a.used !== b.used) bad2(`temp ${name}=${String(junk)} not treated as gap: ${a.score}/${a.used} vs absent ${b.score}/${b.used}`);
  }
  // monotonicity per proxy (others fixed)
  const mono = [
    ["pctFromSma200", +1, -0.3, 0.3, (g, v) => { g.feat.pctFromSma200 = v; }],
    ["ddFrom252dHigh", +1, -0.4, 0, (g, v) => { g.feat.ddFrom252dHigh = v; g.feat.near52wHigh = false; }],
    ["d20d", -1, -0.6, 0.6, (g, v) => { g.rate.d20d = v; }],
    ["breadthProxy", +1, 0, 1, (g, v) => { g.opts.breadthProxy = v; }],
    ["hygVsLqd20d", +1, -0.05, 0.05, (g, v) => { g.opts.hygVsLqd20d = v; g.opts.skipCredit = false; }],
  ];
  for (let i = 0; i < 2500; i++) {
    const [name, dir, lo, hi, set] = mono[i % mono.length];
    const g = gen();
    let x = lo + rnd() * (hi - lo), y = lo + rnd() * (hi - lo);
    if (x > y) [x, y] = [y, x];
    const gx = JSON.parse(JSON.stringify(g)), gy = JSON.parse(JSON.stringify(g));
    set(gx, x); set(gy, y);
    const sx = temperatureScore(gx.feat, gx.rate, gx.opts).score, sy = temperatureScore(gy.feat, gy.rate, gy.opts).score;
    n++;
    if (!(dir > 0 ? sy >= sx : sy <= sx)) bad2(`temp not monotone in ${name}: f(${x})=${sx}, f(${y})=${sy}`);
  }
  // exact thresholds (single proxy, contribution read off directly)
  const one = (key, v) => {
    if (key === "p") return temperatureScore({ pctFromSma200: v }, null, { skipCredit: true }).score;
    if (key === "d") return temperatureScore({ ddFrom252dHigh: v }, null, { skipCredit: true }).score;
    if (key === "r") return temperatureScore({}, { d20d: v }, { skipCredit: true }).score;
    if (key === "b") return temperatureScore({}, null, { skipCredit: true, breadthProxy: v }).score;
    return temperatureScore({}, null, { hygVsLqd20d: v }).score;
  };
  for (const [k, v, want] of [
    ["p", 0.12, 1], ["p", 0.1199, 0.5], ["p", 0.05, 0.5], ["p", 0.0499, 0], ["p", -0.0799, 0], ["p", -0.08, -0.5], ["p", -0.1499, -0.5], ["p", -0.15, -1],
    ["d", -0.01, 0.75], ["d", -0.0101, 0], ["d", -0.0999, 0], ["d", -0.1, -0.5], ["d", -0.1499, -0.5], ["d", -0.15, -1],
    ["r", 0.25, -0.75], ["r", 0.2499, 0], ["r", -0.1499, 0], ["r", -0.15, 0.5],
    ["b", 0.7, 0.5], ["b", 0.6999, 0], ["b", 0.3001, 0], ["b", 0.3, -0.5],
    ["h", 0.01, 0], ["h", 0.0101, 0.25], ["h", -0.01, 0], ["h", -0.0101, -0.25],
  ]) {
    n++;
    if (one(k, v) !== want) bad2(`temp threshold ${k}=${v} → ${one(k, v)}, want ${want}`);
  }
  // live replay: published temperatureScore reproduces from published features
  try {
    const lj = JSON.parse(readFileSync(join(ROOT_MG, "public", "data", "latest.json"), "utf8"));
    for (const m of ["us", "tw"]) {
      const r = lj?.marketRegime?.[m];
      if (!r || r.temperatureScore == null) continue;
      const f = r.features || {};
      const t = temperatureScore(
        { pctFromSma200: f.pctFromSma200, ddFrom252dHigh: f.ddFrom252dHigh, near52wHigh: f.ddFrom252dHigh != null ? f.ddFrom252dHigh >= -0.02 : null, atrBottomQuartile: f.atrBottomQuartile },
        { d20d: f.dUs10y20d },
        { breadthProxy: f.breadthProxy, hygVsLqd20d: f.hygVsLqd20d, skipCredit: m === "tw" }
      );
      n++;
      if (t.score !== r.temperatureScore) bad2(`live ${m} temperatureScore ${r.temperatureScore} ≠ recomputed ${t.score}`);
    }
  } catch (e) {
    bad2(`latest.json unreadable for temperature replay: ${e.message}`);
  }
  ok(`temperatureScore (${n} cases: 5000 random = verbatim legacy, range/0.25 grid, NaN/±Inf/string ⇒ gap, monotone per proxy, 26 exact thresholds, live US/TW replay)`);
}


// —— Wilder RSI + prev-day volume ratio (run-strategies techMetrics, 2026-10-20) ——
{
  let n = 0;
  const bad = (m) => fail(m);
  // verbatim legacy run-strategies rsiWilder (oracle; flat case differs by design: legacy 100, now null)
  function legacyRsi(closes, period = 14) {
    if (!closes || closes.length < period + 2) return null;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) { const d = closes[i] - closes[i - 1]; if (d >= 0) gains += d; else losses -= d; }
    let avgGain = gains / period, avgLoss = losses / period;
    for (let i = period + 1; i < closes.length; i++) {
      const d = closes[i] - closes[i - 1]; const g = d > 0 ? d : 0; const l = d < 0 ? -d : 0;
      avgGain = (avgGain * (period - 1) + g) / period; avgLoss = (avgLoss * (period - 1) + l) / period;
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }
  let seed = 20261020;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const walk = (len, tick) => {
    const out = [50 + rnd() * 200];
    for (let i = 1; i < len; i++) {
      let x = out[i - 1] * (1 + (rnd() - 0.5) * 0.08);
      if (tick) x = Math.max(tick, Math.round(x / tick) * tick);
      out.push(x);
    }
    return out;
  };
  const close = (a, b, rel = 1e-9) => isFiniteNumber(a) && isFiniteNumber(b) && Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));
  const periods = [2, 5, 14];
  for (let i = 0; i < 3000; i++) {
    const p = periods[i % 3];
    const c = walk(p + 2 + Math.floor(rnd() * 180), i % 2 ? 0.05 : 0);
    const r = rsiWilder(c, p);
    n++;
    if (!(isFiniteNumber(r) && r >= 0 && r <= 100)) { bad(`rsi out of [0,100]: ${r}`); continue; }
    if (!close(r, legacyRsi(c, p), 1e-9)) bad(`rsi ≠ legacy p=${p}: ${r} vs ${legacyRsi(c, p)}`);
    const k = Math.exp((rnd() - 0.5) * 9);
    if (!close(rsiWilder(c.map((x) => x * k), p), r, 1e-8)) bad(`rsi not scale-invariant k=${k}`);
    const b = rnd() * 100;
    if (!close(rsiWilder(c.map((x) => x + b), p), r, 1e-8)) bad(`rsi not shift-invariant b=${b}`);
    const M = Math.max(...c) + 1 + rnd() * 50;
    if (!close(rsiWilder(c.map((x) => M - x), p), 100 - r, 1e-8)) bad(`rsi reflection ≠ 100 − rsi`);
    const up = c.slice(); up[up.length - 1] += 0.01 + rnd() * 5;
    if (!(rsiWilder(up, p) >= r - 1e-9)) bad(`rsi decreased when last close raised`);
    const l2 = rsiLast2(c, p);
    n += 5;
    if (c.length >= p + 3 && !(l2.cur === r && l2.prev === rsiWilder(c.slice(0, -1), p))) bad(`rsiLast2 mismatch`);
  }
  // hand case: p=2, [10,11,10.5,11.5] → G=0.75, L=0.125 → 600/7
  n++;
  if (!approx(rsiWilder([10, 11, 10.5, 11.5], 2), 600 / 7, 1e-12)) bad(`rsi hand case ${rsiWilder([10, 11, 10.5, 11.5], 2)} ≠ 600/7`);
  // extremes, flat, domain, length boundary
  const inc = Array.from({ length: 30 }, (_, i) => 10 + i), dec = inc.slice().reverse();
  n += 8;
  if (rsiWilder(inc) !== 100) bad(`strict up rsi ${rsiWilder(inc)} ≠ 100`);
  if (rsiWilder(dec) !== 0) bad(`strict down rsi ${rsiWilder(dec)} ≠ 0`);
  if (rsiWilder(Array(30).fill(42)) !== null) bad(`flat series rsi should be null (0/0), got ${rsiWilder(Array(30).fill(42))}`);
  if (rsiWilder(inc.slice(0, 15), 14) !== null || !isFiniteNumber(rsiWilder(inc.slice(0, 16), 14))) bad(`rsi length boundary p+1 null / p+2 defined`);
  for (const junk of [NaN, Infinity, -5, 0, null, "12"]) {
    const c = walk(40, 0); c[17] = junk; n++;
    if (rsiWilder(c) !== null) bad(`rsi accepted junk close ${String(junk)}`);
  }
  if (rsiLast2(inc.slice(0, 16), 14).cur !== null) bad(`rsiLast2 should need p+3 closes`);
  // prev-day volume ratio
  for (let i = 0; i < 2000; i++) {
    const a = 1 + rnd() * 1e7, b = 1 + rnd() * 1e7; n++;
    if (!close(volumeRatioVsPrev(a, b), a / b, 1e-12)) bad(`volRatioVsPrev ${a}/${b}`);
  }
  for (const [a, b] of [[0, 5], [5, 0], [NaN, 5], [5, null], [-1, 5], [5, Infinity], [undefined, 3]]) {
    n++;
    if (volumeRatioVsPrev(a, b) !== null) bad(`volRatioVsPrev(${a},${b}) should be null`);
  }
  // live: published screener hits satisfy their own RSI rule, and no fake 0 prev-day volume ratio
  try {
    const sj = JSON.parse(readFileSync(join(ROOT_MG, "public", "data", "strategy-screener.json"), "utf8"));
    for (const st of sj.strategies || []) {
      for (const h of st.hits || []) {
        const m = h.metrics || {};
        if (st.id === "ultra-short") {
          n++;
          if (!(isFiniteNumber(m.rsi) && isFiniteNumber(m.rsiPrev) && m.rsi >= 0 && m.rsi <= 100 && m.rsiPrev >= 0 && m.rsiPrev <= 100 && m.rsi >= m.rsiPrev && m.rsi < 50))
            bad(`live ultra-short ${h.ticker} breaks its RSI rule: rsi=${m.rsi} prev=${m.rsiPrev}`);
        }
        if ("volRatioYday" in m) {
          n++;
          if (m.volRatioYday != null && !(isFiniteNumber(m.volRatioYday) && m.volRatioYday > 0)) bad(`live ${st.id} ${h.ticker} volRatioYday=${m.volRatioYday}`);
        }
      }
    }
  } catch (e) {
    bad(`strategy-screener.json unreadable for RSI replay: ${e.message}`);
  }
  ok(`Wilder RSI + prev-day volume ratio (${n} cases: 3000 random = verbatim legacy, [0,100], scale/shift invariance, reflection = 100 − rsi, last-close monotone, hand 600/7, extremes, flat ⇒ null, junk ⇒ null, length bounds, live screener RSI rule)`);
}

// —— Price-shape % metrics (run-strategies techMetrics: 5d/20d high, amp, pct5d, roc10, dayPct, MA spread), 2026-10-21 ——
{
  let n = 0;
  const bad = (m) => fail(m);
  // verbatim legacy run-strategies techMetrics price block (oracle on clean positive bars)
  function legacy(bars) {
    const closes = bars.map((b) => b.c), highs = bars.map((b) => b.h);
    const last = bars[bars.length - 1], prev = bars[bars.length - 2];
    const s5 = sma(closes, 5), s10 = sma(closes, 10), s20 = sma(closes, 20);
    const prior5Highs = highs.slice(-6, -1);
    const fiveDayHigh = Math.max(...prior5Highs);
    const is5dHigh = last.h >= fiveDayHigh || last.c >= fiveDayHigh;
    const ampPct = prev.c > 0 ? ((last.h - last.l) / prev.c) * 100 : null;
    const pct5d = closes.length >= 6 ? ((last.c - closes[closes.length - 6]) / closes[closes.length - 6]) * 100 : null;
    const high20 = highs.length >= 20 ? Math.max(...highs.slice(-20)) : null;
    const prior20Highs = highs.length >= 21 ? Math.max(...highs.slice(-21, -1)) : null;
    const is20dHigh = prior20Highs != null && (last.h >= prior20Highs || last.c >= prior20Highs);
    const distHigh20Pct = high20 ? ((last.c - high20) / high20) * 100 : null;
    const roc10 = closes.length >= 11 && closes[closes.length - 11] > 0 ? ((last.c - closes[closes.length - 11]) / closes[closes.length - 11]) * 100 : null;
    const smaVals = [s5, s10, s20].filter((x) => x != null);
    const smaMid = smaVals.length ? smaVals.reduce((a, b) => a + b, 0) / smaVals.length : null;
    const smaSpread = smaVals.length === 3 && smaMid ? ((Math.max(...smaVals) - Math.min(...smaVals)) / smaMid) * 100 : null;
    const aboveMaxSma = smaVals.length === 3 && last.c >= Math.max(...smaVals);
    return { fiveDayHigh, is5dHigh, ampPct, pct5d, dayPct: prev.c ? ((last.c - prev.c) / prev.c) * 100 : null, high20, is20dHigh, distHigh20Pct, roc10, smaSpreadPct: smaSpread, aboveMaxSma, s5, s10, s20 };
  }
  let seed = 20261021;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const mkBars = (len, tick) => {
    const out = []; let c = 20 + rnd() * 500;
    for (let i = 0; i < len; i++) {
      c = c * (1 + (rnd() - 0.5) * 0.12); if (tick) c = Math.max(tick, Math.round(c / tick) * tick);
      const h = c * (1 + rnd() * 0.04), l = c * (1 - rnd() * 0.04);
      out.push({ h: rnd() < 0.05 ? c : h, l: rnd() < 0.05 ? c : l, c });
    }
    return out;
  };
  const same = (a, b) => (a === null && b === null) || a === b || (isFiniteNumber(a) && isFiniteNumber(b) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)));
  const KEYS = ["fiveDayHigh", "is5dHigh", "ampPct", "pct5d", "dayPct", "high20", "is20dHigh", "distHigh20Pct", "roc10", "smaSpreadPct", "aboveMaxSma"];
  for (let i = 0; i < 4000; i++) {
    const bars = mkBars(21 + Math.floor(rnd() * 120), i % 3 === 0 ? 0.05 : 0);
    const L = legacy(bars), M = priceShapeMetrics(bars, { s5: L.s5, s10: L.s10, s20: L.s20 });
    for (const k of KEYS) { n++; if (!same(M[k], L[k])) bad(`priceShape ${k}: ${M[k]} ≠ legacy ${L[k]}`); }
    // invariants
    n += 6;
    if (!(M.ampPct >= 0)) bad(`ampPct < 0: ${M.ampPct}`);
    if (!(M.distHigh20Pct <= 1e-12)) bad(`distHigh20Pct > 0: ${M.distHigh20Pct}`);
    if (M.is20dHigh && M.high20 !== bars[bars.length - 1].h && M.high20 !== Math.max(bars[bars.length - 1].h)) bad(`is20dHigh but high20 ≠ today high`);
    if (M.is20dHigh && !M.is5dHigh) bad(`20d high must imply 5d high`);
    if (!(M.smaSpreadPct >= 0)) bad(`smaSpread < 0`);
    if (M.aboveMaxSma && !(bars[bars.length - 1].c >= L.s5 && bars[bars.length - 1].c >= L.s10 && bars[bars.length - 1].c >= L.s20)) bad(`aboveMaxSma but below an SMA`);
    // scale invariance (price units cancel): ×k every price ⇒ % unchanged, highs ×k, booleans unchanged
    const k = [0.01, 7, 1000][i % 3];
    const sb = bars.map((b) => ({ h: b.h * k, l: b.l * k, c: b.c * k }));
    const S = priceShapeMetrics(sb, { s5: L.s5 * k, s10: L.s10 * k, s20: L.s20 * k });
    for (const key of ["ampPct", "pct5d", "dayPct", "distHigh20Pct", "roc10", "smaSpreadPct"]) {
      n++; if (!(Math.abs(S[key] - M[key]) <= 1e-7 * Math.max(1, Math.abs(M[key])))) bad(`scale ${k} changed ${key}: ${M[key]} → ${S[key]}`);
    }
    // compounding identity: (1+pct5d/100) = Π(1+day_i/100) over the last 5 days
    const cl = bars.map((b) => b.c), N = cl.length; let prod = 1;
    for (let j = N - 5; j < N; j++) prod *= 1 + pricePct(cl[j - 1], cl[j]) / 100;
    n++; if (!(Math.abs(prod - (1 + M.pct5d / 100)) <= 1e-9)) bad(`pct5d ≠ compounded daily: ${M.pct5d} vs ${(prod - 1) * 100}`);
  }
  // hand cases
  const hb = [{ h: 10, l: 9, c: 10 }, { h: 10, l: 9, c: 10 }, { h: 10, l: 9, c: 10 }, { h: 10, l: 9, c: 10 }, { h: 10, l: 9, c: 10 }, { h: 10, l: 9, c: 10 }, { h: 12.1, l: 10.9, c: 12 }];
  const hm = priceShapeMetrics(hb, { s5: 10.4, s10: 10.4, s20: 10.4 });
  n += 5;
  if (!same(hm.dayPct, 20)) bad(`hand dayPct ${hm.dayPct} ≠ 20`);
  if (!same(hm.pct5d, 20)) bad(`hand pct5d ${hm.pct5d} ≠ 20`);
  if (!same(hm.ampPct, 12)) bad(`hand ampPct ${hm.ampPct} ≠ 12`);
  if (!(hm.is5dHigh === true && hm.fiveDayHigh === 10)) bad(`hand 5d high ${hm.is5dHigh}/${hm.fiveDayHigh}`);
  if (!(hm.smaSpreadPct === 0 && hm.aboveMaxSma === true && hm.high20 === null && hm.roc10 === null)) bad(`hand spread/short-window nulls`);
  n += 2;
  if (!same(smaSpreadPct([9, 10, 11]), 20)) bad(`smaSpread([9,10,11]) ${smaSpreadPct([9, 10, 11])} ≠ 20`);
  if (!same(rangePct(11, 9, 10), 20)) bad(`rangePct(11,9,10) ≠ 20`);
  // junk / domain: never NaN, never a fake breakout
  for (const junk of [NaN, Infinity, -3, 0, null, undefined, "12"]) {
    for (const field of ["c", "h"]) {
      const bars = mkBars(40, 0); const idx = bars.length - 1 - Math.floor(rnd() * 21);
      bars[idx] = { ...bars[idx], [field]: junk };
      const L = legacy(bars.map((b) => ({ ...b, c: isFiniteNumber(b.c) ? b.c : 1, h: isFiniteNumber(b.h) ? b.h : 1 })));
      const M = priceShapeMetrics(bars, { s5: L.s5, s10: L.s10, s20: L.s20 });
      for (const kk of KEYS) {
        n++;
        const v = M[kk];
        if (typeof v === "number" && !Number.isFinite(v)) bad(`junk ${String(junk)} in ${field} ⇒ ${kk}=${v}`);
      }
    }
  }
  for (const [a, b] of [[0, 5], [-1, 5], [5, 0], [5, -2], [NaN, 5], [5, Infinity], [null, 5], [5, undefined]]) {
    n++; if (pricePct(a, b) !== null) bad(`pricePct(${a},${b}) should be null`);
  }
  for (const [h, l, p] of [[9, 10, 10], [10, 9, 0], [10, 0, 10], [NaN, 9, 10], [10, 9, -1]]) {
    n++; if (rangePct(h, l, p) !== null) bad(`rangePct(${h},${l},${p}) should be null (h<l or bad base)`);
  }
  n += 3;
  if (smaSpreadPct([10, null, 11]) !== null || smaSpreadPct([10, 0, 11]) !== null || smaSpreadPct([10]) !== null) bad(`smaSpread domain`);
  const junkHigh = mkBars(40, 0); junkHigh[junkHigh.length - 3] = { ...junkHigh[junkHigh.length - 3], h: NaN };
  const jm = priceShapeMetrics(junkHigh, { s5: 1, s10: 1, s20: 1 });
  n += 2;
  if (jm.is5dHigh !== false || jm.fiveDayHigh !== null) bad(`NaN high in prior 5 must kill 5d-high signal, got ${jm.is5dHigh}/${jm.fiveDayHigh}`);
  if (jm.is20dHigh !== false || jm.high20 !== null || jm.distHigh20Pct !== null) bad(`NaN high in 20d window must null 20d metrics`);
  // last bar junk: string / non-positive close or high must never coerce into a breakout or "above MAs"
  for (const lastJunk of [{ c: "999" }, { h: "999" }, { c: -5 }, { c: 0 }, { h: NaN }]) {
    const bars = mkBars(40, 0); bars[bars.length - 1] = { ...bars[bars.length - 1], ...lastJunk, h: lastJunk.h ?? 1e9 };
    const m = priceShapeMetrics(bars, { s5: 1, s10: 1, s20: 1 });
    n += 3;
    if (m.is5dHigh !== false || m.is20dHigh !== false) bad(`junk last bar ${JSON.stringify(lastJunk)} gave a breakout`);
    // aboveMaxSma depends on the close only: junk close ⇒ false; junk high with a valid close may legitimately be true
    if ("c" in lastJunk && m.aboveMaxSma !== false) bad(`junk last close ${JSON.stringify(lastJunk)} gave aboveMaxSma`);
    if (m.dayPct !== null && !isFiniteNumber(m.dayPct)) bad(`junk last bar dayPct ${m.dayPct}`);
  }
  // missing SMA must not count as "above every MA" (Math.max(null, …) treats null as 0)
  for (const sm of [{ s5: null, s10: 1, s20: 1 }, { s5: 1, s10: undefined, s20: 1 }, { s5: 1, s10: 1, s20: NaN }, { s5: 0, s10: 1, s20: 1 }]) {
    const m = priceShapeMetrics(mkBars(40, 0), sm);
    n += 2;
    if (m.aboveMaxSma !== false) bad(`aboveMaxSma true with smas ${JSON.stringify(sm)}`);
    if (m.smaSpreadPct !== null) bad(`smaSpread defined with smas ${JSON.stringify(sm)}`);
  }
  // live replay: published screener hits satisfy their own price-shape rule
  try {
    const sj = JSON.parse(readFileSync(join(ROOT_MG, "public", "data", "strategy-screener.json"), "utf8"));
    // published metrics are rounded to 2 dp ⇒ allow half a unit (0.005) of rounding slack, never more
    const e = 0.005;
    const has = (m, k) => k in m && m[k] != null;
    const rules = {
      "ultra-short": (m) => !has(m, "ampPct") || m.ampPct >= 3 - e,
      "ma-tangle-break": (m) => (!has(m, "smaSpreadPct") || m.smaSpreadPct <= 1.5 + e) && (!has(m, "dayPct") || m.dayPct >= -e),
      "new-high-momentum": (m) => m.is20dHigh === true && (!has(m, "pct5d") || m.pct5d >= 3 - e),
      "short-roc": (m) => !has(m, "roc10") || m.roc10 >= 8 - e,
      "day-up-5": (m) => !has(m, "dayPct") || m.dayPct >= 5 - e,
      "pct5d-10": (m) => !has(m, "pct5d") || m.pct5d >= 10 - e,
      "near-high": (m) => (!has(m, "distHigh20Pct") || (m.distHigh20Pct >= -1 - e && m.distHigh20Pct <= e)) && (!has(m, "dayPct") || m.dayPct >= -e),
    };
    let live = 0;
    for (const st of sj.strategies || []) {
      for (const h of st.hits || []) {
        const m = h.metrics || {};
        for (const key of ["ampPct", "pct5d", "dayPct", "distHigh20Pct", "roc10", "smaSpreadPct"]) {
          if (key in m) { n++; live++; if (m[key] != null && !isFiniteNumber(m[key])) bad(`live ${st.id} ${h.ticker} ${key}=${m[key]}`); }
        }
        if ("ampPct" in m && m.ampPct != null) { n++; if (!(m.ampPct >= 0)) bad(`live ${st.id} ${h.ticker} ampPct<0`); }
        if ("distHigh20Pct" in m && m.distHigh20Pct != null) { n++; if (!(m.distHigh20Pct <= 0.005)) bad(`live ${st.id} ${h.ticker} distHigh20Pct>0`); }
        if ("smaSpreadPct" in m && m.smaSpreadPct != null) { n++; if (!(m.smaSpreadPct >= 0)) bad(`live ${st.id} ${h.ticker} smaSpread<0`); }
        if (rules[st.id]) { n++; if (!rules[st.id](m)) bad(`live ${st.id} ${h.ticker} breaks its own rule: ${JSON.stringify(m)}`); }
      }
    }
    if (live === 0) bad(`live replay found no price-shape metrics (schema drift?)`);
  } catch (e) {
    bad(`strategy-screener.json unreadable for price-shape replay: ${e.message}`);
  }
  ok(`price-shape metrics (${n} cases: 4000 random = verbatim legacy on 11 fields, amp ≥ 0, dist20 ≤ 0, 20d⇒5d high, aboveMaxSma, scale invariance ×0.01/7/1000, pct5d = compounded daily, hand cases, junk ⇒ null/false never NaN, h<l ⇒ null, live screener rules)`);
}

// —— Paper-book sizing / take-profit / unrealized return (moved out of paper-trade.mjs 2026-10-22) ——
// Dependencies of each check are stated inline: [risk] equity·riskPct/stop, [cap] 8% room, [lot] whole lots,
// [cash] affordability loop, [vol] stop widening at volRatio ≥ 3. Every check evaluates the function on data.
{
  let n = 0;
  const bad = (m) => fail(`paper sizing: ${m}`);
  const P = { riskPct: 0.01, maxPosPct: 0.08, stopPct: 0.015, stopPctHighVol: 0.025, volRatioHigh: 3 };
  // verbatim legacy (paper-trade.mjs sizeShares @ 22a6144) — the oracle
  function legacySize({ market, price, equity, cash, volRatio, existingQty }) {
    if (!(price > 0) || !(equity > 0)) return 0;
    const riskCash = equity * 0.01;
    const dist = price * (typeof volRatio === "number" && volRatio >= 3 ? 0.025 : 0.015);
    if (!(dist > 0)) return 0;
    let shares = Math.floor(riskCash / dist);
    const existingVal = (existingQty || 0) * price;
    const room = equity * 0.08 - existingVal;
    if (room <= 0) return 0;
    shares = Math.min(shares, Math.floor(room / price));
    if (market === "TW") {
      shares = Math.floor(shares / 1000) * 1000;
      if (shares < 1000) return 0;
      while (shares >= 1000 && shares * price > cash + 1e-9) shares -= 1000;
      if (shares < 1000) return 0;
    } else {
      if (shares < 1) return 0;
      while (shares >= 1 && shares * price > cash + 1e-9) shares -= 1;
      if (shares < 1) return 0;
    }
    return shares;
  }
  function legacyTp(qty, market) {
    const lot = market === "TW" ? 1000 : 1;
    if (qty <= lot) return qty;
    let q = market === "TW" ? Math.floor(qty / 2 / 1000) * 1000 : Math.floor(qty / 2);
    if (q < lot) q = qty;
    return q;
  }
  const legacyRet = (mark, avg) => (!avg || avg === 0 ? 0 : (mark - avg) / avg);
  const size = (o) => positionSizeShares({ ...P, lotSize: o.market === "TW" ? 1000 : 1, ...o });
  let seed = 20261022;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const mkCase = () => {
    const market = rnd() < 0.5 ? "TW" : "US";
    const equity = market === "TW" ? 3e6 * (0.5 + rnd()) : 1e5 * (0.5 + rnd());
    const price = market === "TW" ? Math.round((5 + rnd() * rnd() * 2500) * 20) / 20 : Math.round((1 + rnd() * rnd() * 2000) * 100) / 100;
    const cash = pick([equity, equity * rnd(), equity * rnd() * 0.1, price * 1000 * rnd() * 3, price * rnd() * 5, 0]);
    const volRatio = pick([null, undefined, rnd() * 2.9, 3, 3 + rnd() * 5, 2.9999, "5"]);
    const lot = market === "TW" ? 1000 : 1;
    const existingQty = pick([0, 0, undefined, lot * Math.floor(rnd() * 10), Math.floor(rnd() * equity * 0.1 / price)]);
    return { market, price, equity, cash, volRatio, existingQty };
  };
  let oracleN = 0, nonzero = 0, cashBound = 0;
  for (let i = 0; i < 30000; i++) {
    const c = mkCase();
    const got = size(c), want = legacySize(c);
    n++; oracleN++;
    if (got !== want) { bad(`legacy oracle ${JSON.stringify(c)} got ${got} want ${want}`); break; }
    const lot = c.market === "TW" ? 1000 : 1;
    const high = typeof c.volRatio === "number" && c.volRatio >= 3;
    const riskShares = Math.floor((c.equity * 0.01) / (c.price * (high ? 0.025 : 0.015)));
    const held = c.existingQty || 0;
    const capShares = Math.floor((c.equity * 0.08 - held * c.price) / c.price);
    if (got > 0) nonzero++;
    // [lot] non-negative whole lots
    n++; if (!(Number.isInteger(got) && got >= 0 && got % lot === 0)) bad(`not whole lots ${got}`);
    // [cash] affordable
    n++; if (got * c.price > c.cash + 1e-9) bad(`unaffordable ${JSON.stringify(c)} → ${got}`);
    // [cap] position ≤ 8% equity
    n++; if (got > 0 && (held + got) * c.price > c.equity * 0.08 * (1 + 1e-12)) bad(`over 8% cap ${JSON.stringify(c)} → ${got}`);
    // [risk] ≤ risk-based shares
    n++; if (got > riskShares) bad(`over risk budget ${got} > ${riskShares}`);
    // [risk][cap][cash][lot] maximal: one more lot must break at least one constraint
    const nx = got + lot;
    n++; if (!(nx > riskShares || nx > capShares || nx * c.price > c.cash + 1e-9)) bad(`not maximal ${JSON.stringify(c)} → ${got}`);
    if (got > 0 && got + lot <= Math.min(riskShares, capShares)) cashBound++;
    // [cash] monotone in cash
    const more = size({ ...c, cash: c.cash * 1.5 + c.price * lot });
    n++; if (more < got) bad(`more cash fewer shares ${JSON.stringify(c)} ${more} < ${got}`);
    // [risk][cap] monotone in equity
    const richer = size({ ...c, equity: c.equity * 1.25 });
    n++; if (richer < got) bad(`more equity fewer shares ${JSON.stringify(c)} ${richer} < ${got}`);
    // [vol] widening the stop never adds shares
    n++; if (size({ ...c, volRatio: 5 }) > size({ ...c, volRatio: 1 })) bad(`high-vol stop gave more shares ${JSON.stringify(c)}`);
  }
  if (nonzero < 5000 || cashBound < 500) bad(`random cases too degenerate: nonzero ${nonzero}, cash-bound ${cashBound}`);
  // hand cases = real published fills (paper-portfolio 2026-09-15): 2468.TW 5000 @ 43.25, ZS 41 @ 190.73
  n++; if (size({ market: "TW", price: 43.25, equity: 3e6, cash: 3e6 }) !== 5000) bad(`hand TW 43.25 ≠ 5000`); // cap floor(240000/43.25)=5549 → 5000
  n++; if (size({ market: "US", price: 190.73, equity: 1e5, cash: 1e5 }) !== 41) bad(`hand US 190.73 ≠ 41`); // floor(8000/190.73)=41
  n++; if (size({ market: "US", price: 100, equity: 1e5, cash: 250 }) !== 2) bad(`hand cash-bound US ≠ 2`);
  n++; if (size({ market: "TW", price: 100, equity: 3e6, cash: 150000 }) !== 1000) bad(`hand cash-bound TW ≠ 1000`);
  n++; if (size({ market: "TW", price: 100, equity: 3e6, cash: 3e6, existingQty: 2000 }) !== 0) bad(`hand TW full position ≠ 0`); // room 240000−200000 → 400 sh < 1 lot
  n++; if (size({ market: "US", price: 100, equity: 1e5, cash: 1e5, volRatio: 3 }) !== 80) bad(`hand US vol≥3 ≠ 80`); // risk floor(1000/2.5)=400, cap 80
  // risk binds only with a tiny cap: maxPosPct 1 ⇒ risk floor(1000/1.5)=666
  n++; if (positionSizeShares({ ...P, maxPosPct: 1, lotSize: 1, price: 100, equity: 1e5, cash: 1e5 }) !== 666) bad(`hand risk-bound ≠ 666`);
  // [vol] boundary volRatio exactly 3 is "high" — only visible when risk binds (maxPosPct 1): floor(1000/2.5)=400, not 666
  n++; if (positionSizeShares({ ...P, maxPosPct: 1, lotSize: 1, price: 100, equity: 1e5, cash: 1e5, volRatio: 3 }) !== 400) bad(`hand vol=3 risk-bound ≠ 400`);
  // [cash] 1e-9 fill tolerance: cash a hair under 2 shares still buys 2 (same tolerance as buyFill)
  n++; if (size({ market: "US", price: 100, equity: 1e5, cash: 199.9999999995 }) !== 2) bad(`hand cash tolerance ≠ 2`);
  // [cash][lot] float edges of the closed form floor(lim/price): found by search, both directions
  // 16000·2883.26 = 46132160 but floor(46132160.000000001/2883.26) = 15999 ⇒ must still give 16000
  n++; if (size({ market: "TW", price: 2883.26, equity: 1e9, cash: 46132160 }) !== 16000) bad(`float edge up ≠ 16000`);
  // floor(lim/2859.28) = 23000 but 23000·2859.28 > 65763440 + 1e-9 in doubles ⇒ must give 22000
  { const e = { market: "TW", price: 2859.28, equity: 1e9, cash: 65763440 };
    n++; if (size(e) !== 22000 || legacySize(e) !== 22000) bad(`float edge down: new ${size(e)} legacy ${legacySize(e)} (want 22000)`); }
  let edgeN = 0;
  for (let i = 0; i < 4000; i++) {
    const market = rnd() < 0.5 ? "TW" : "US", lot = market === "TW" ? 1000 : 1;
    const price = Math.round((0.01 + rnd() * 3000) * 100) / 100, k = (1 + Math.floor(rnd() * 50)) * lot;
    const cash = pick([k * price, k * price - 1e-9 * rnd(), k * price * (1 + (rnd() - 0.5) * 1e-15)]);
    const c = { market, price, equity: ((k + 5 * lot) * price) / 0.08 * 1.001, cash }; // cap ≈ k + 5 lots so the legacy loop stays short
    n++; edgeN++;
    if (size(c) !== legacySize(c)) { bad(`float-edge oracle ${JSON.stringify(c)} got ${size(c)} want ${legacySize(c)}`); break; }
  }
  // junk ⇒ 0, never NaN / never a fill
  const base = { market: "US", price: 100, equity: 1e5, cash: 1e5 };
  for (const [k, v] of [["price", NaN], ["price", 0], ["price", -5], ["price", "100"], ["price", Infinity], ["equity", NaN], ["equity", Infinity], ["equity", -1], ["cash", NaN], ["cash", -1], ["cash", Infinity], ["existingQty", NaN], ["existingQty", -3], ["existingQty", "2"]]) {
    n++; const r = size({ ...base, [k]: v });
    if (r !== 0) bad(`junk ${k}=${v} → ${r} (want 0)`);
  }
  for (const lot of [0, -1, 1.5, NaN, "1000"]) { n++; if (positionSizeShares({ ...P, ...base, lotSize: lot }) !== 0) bad(`junk lotSize ${lot}`); }
  // the junk path that motivated the move: legacy buys with NaN cash (would make cash NaN → written as 0)
  n++; if (!(legacySize({ ...base, cash: NaN }) > 0 && size({ ...base, cash: NaN }) === 0)) bad(`NaN-cash legacy/new contrast not reproduced`);

  // take-profit quantity: exhaustive qty 1..20000 against legacy, both lot sizes
  for (const market of ["TW", "US"]) {
    const lot = market === "TW" ? 1000 : 1;
    for (let q = 1; q <= 20000; q++) {
      const got = takeProfitQty(q, lot); n++;
      if (got !== legacyTp(q, market)) { bad(`takeProfitQty(${q},${lot})=${got} legacy ${legacyTp(q, market)}`); break; }
      n++; if (!(got > 0 && got <= q && (got === q || (got % lot === 0 && got <= q / 2)))) { bad(`takeProfitQty invariant q=${q} lot=${lot} → ${got}`); break; }
    }
  }
  n++; if (takeProfitQty(5000, 1000) !== 2000 || takeProfitQty(1500, 1000) !== 1500 || takeProfitQty(7, 1) !== 3 || takeProfitQty(1, 1) !== 1) bad(`takeProfitQty hand cases`);
  for (const [q, l] of [[0, 1], [-4, 1], [2.5, 1], [NaN, 1], ["10", 1], [10, 0], [10, 1.5]]) { n++; if (takeProfitQty(q, l) !== null) bad(`takeProfitQty junk ${q},${l}`); }

  // unrealized return: legacy oracle on the positive domain, sign, stop/TP thresholds, junk
  for (let i = 0; i < 20000; i++) {
    const avg = 1 + rnd() * 999, mark = avg * (0.5 + rnd());
    const r = unrealizedReturn(mark, avg); n++;
    if (r !== legacyRet(mark, avg)) { bad(`unrealizedReturn oracle ${mark},${avg}`); break; }
    n++; if (Math.sign(r) !== Math.sign(mark - avg)) { bad(`unrealizedReturn sign ${mark},${avg}`); break; }
  }
  n++; if (!(unrealizedReturn(97, 100) <= -0.03 && unrealizedReturn(97.01, 100) > -0.03)) bad(`stop boundary −3%`);
  n++; if (!(unrealizedReturn(112, 100) >= 0.12 && unrealizedReturn(111.99, 100) < 0.12)) bad(`take-profit boundary +12%`);
  for (const [m, a] of [[NaN, 10], [10, 0], [10, NaN], [0, 10], [-1, 10], [10, -1], ["11", 10], [Infinity, 10]]) { n++; if (unrealizedReturn(m, a) !== null) bad(`unrealizedReturn junk ${m},${a}`); }

  // live: every published paper fill obeys the lot rule and has a finite positive price/qty
  try {
    const pf = JSON.parse(readFileSync(join(ROOT_MG, "public", "data", "paper-portfolio.json"), "utf8"));
    let live = 0;
    for (const m of ["TW", "US"]) {
      const lot = m === "TW" ? 1000 : 1;
      for (const t of pf.books?.[m]?.trades || []) {
        n++; live++;
        if (!(Number.isInteger(t.qty) && t.qty > 0 && isFiniteNumber(t.price) && t.price > 0)) bad(`live ${m} ${t.ticker} qty/price ${t.qty}/${t.price}`);
        if (t.side === "BUY" && t.qty % lot !== 0) bad(`live ${m} BUY ${t.ticker} qty ${t.qty} not whole lots`);
      }
      for (const p of pf.books?.[m]?.positions || []) {
        n++; if (unrealizedReturn(p.mark, p.avgCost) == null) bad(`live ${m} position ${p.ticker} mark/avgCost invalid`);
      }
    }
    if (live === 0) bad(`no live paper trades found (schema drift?)`);
  } catch (e) {
    bad(`paper-portfolio.json unreadable for sizing replay: ${e.message}`);
  }
  ok(`paper sizing / take-profit / unrealized return (${n} cases: ${oracleN} random = verbatim legacy sizeShares, whole lots, affordable, ≤ 8% cap, ≤ risk budget, maximal, monotone in cash & equity, vol stop never adds; published fills 5000@43.25 / 41@190.73; vol=3 & 1e-9 cash boundaries; 4000 cash = k·price float edges vs legacy; junk ⇒ 0/null; takeProfitQty exhaustive 1..20000 ×2 lots; ±3%/12% boundaries; live paper fills)`);
}

// ── paper book valuation: equity, unrealized P&L, trailing-window performance (2026-10-23) ──
{
  const { bookMarkValue, unrealizedPnlOf, addDaysYmdUtc, windowPerformance, avgCostAfterBuy, realizedPnl, roundHalfAway } = await import("./math-core.mjs");
  let n = 0;
  const bad = (m) => fail(`book valuation: ${m}`);
  let s = 20261023 >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  // verbatim legacy (paper-trade.mjs before 2026-10-23)
  const legacyRoundMoney = (x, d = 2) => { const r = roundHalfAway(x, d); return r == null ? 0 : r; };
  const legacyBookEquity = (pos, cash) => { const pv = pos.reduce((sum, p) => sum + p.qty * p.mark, 0); return { positionsValue: legacyRoundMoney(pv), equity: legacyRoundMoney(cash + pv) }; };
  const legacyParse = (ymd) => { const [y, m, d] = ymd.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  const legacyAddDays = (ymd, days) => { const dt = new Date(legacyParse(ymd) + days * 86400000); return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`; };
  function legacyWindowPerf(de, days) {
    if (!de.length) return { pct: 0, pnl: 0, label: "成立以來", sinceInception: true, days };
    const last = de[de.length - 1]; const target = legacyAddDays(last.date, -days);
    let base = de[0]; let found = false;
    for (const x of de) if (x.date <= target) { base = x; found = true; }
    const sinceInception = !found || de[0].date > target;
    const pnl = legacyRoundMoney(last.equity - base.equity);
    const pct = base.equity ? legacyRoundMoney((last.equity / base.equity - 1) * 100, 4) : 0;
    return { pct, pnl, label: sinceInception ? "成立以來" : `${days}日`, sinceInception, days, fromDate: base.date, toDate: last.date };
  }
  const randBook = () => {
    const k = Math.floor(rnd() * 12); const pos = [];
    for (let i = 0; i < k; i++) { const tw = rnd() < 0.5; pos.push({ qty: tw ? 1000 * (1 + Math.floor(rnd() * 20)) : 1 + Math.floor(rnd() * 300), mark: Math.round((1 + rnd() * 1500) * 100) / 100, avgCost: Math.round((1 + rnd() * 1500) * 100) / 100 }); }
    return { pos, cash: Math.round(rnd() * 3e6 * 100) / 100 };
  };
  // 1) bookMarkValue = legacy after rounding; additivity; scale; empty; junk
  for (let i = 0; i < 20000; i++) {
    const { pos, cash } = randBook();
    const v = bookMarkValue(pos, cash); const L = legacyBookEquity(pos, cash); n++;
    if (!v || legacyRoundMoney(v.positionsValue) !== L.positionsValue || legacyRoundMoney(v.equity) !== L.equity) { bad(`legacy oracle ${JSON.stringify({ pos, cash })}`); break; }
    const cut = Math.floor(rnd() * (pos.length + 1));
    const a = bookMarkValue(pos.slice(0, cut), 0), b = bookMarkValue(pos.slice(cut), cash); n++;
    if (Math.abs(a.positionsValue + b.positionsValue - v.positionsValue) > 1e-6 * Math.max(1, v.positionsValue)) { bad(`additivity`); break; }
    const k = 1 + Math.floor(rnd() * 5); const sc = bookMarkValue(pos.map((p) => ({ ...p, qty: p.qty * k })), 0); n++;
    if (Math.abs(sc.positionsValue - k * v.positionsValue) > 1e-6 * Math.max(1, k * v.positionsValue)) { bad(`qty scaling`); break; }
    n++; if (v.positionsValue < 0 || Math.abs(v.equity - cash - v.positionsValue) > 1e-9 * Math.max(1, v.equity)) { bad(`equity = cash + pv`); break; }
  }
  n++; { const e = bookMarkValue([], 123.45); if (!e || e.positionsValue !== 0 || e.equity !== 123.45) bad(`empty book`); }
  n++; { const e = bookMarkValue(undefined, 5); if (!e || e.equity !== 5) bad(`undefined positions`); }
  n++; { const e = bookMarkValue([{ qty: 5000, mark: 43.25 }, { qty: 41, mark: 190.73 }], 1000); if (!e || Math.abs(e.equity - (1000 + 216250 + 7819.93)) > 1e-6) bad(`hand case 5000@43.25 + 41@190.73`); }
  for (const [p, c] of [[{ qty: NaN, mark: 1 }, 0], [{ qty: 1, mark: undefined }, 0], [{ qty: 1, mark: "10" }, 0], [{ qty: -1, mark: 1 }, 0], [{ qty: 1, mark: -1 }, 0], [{ qty: 1, mark: Infinity }, 0], [{ qty: 1, mark: 1 }, NaN], [{ qty: 1, mark: 1 }, "5"], [null, 0]]) {
    n++; if (bookMarkValue([{ qty: 10, mark: 10 }, p], c) !== null) bad(`junk not refused ${JSON.stringify(p)} cash ${c}`);
  }
  // 2) unrealizedPnlOf: oracle, sign, junk
  for (let i = 0; i < 20000; i++) {
    const m = 1 + rnd() * 999, a = 1 + rnd() * 999, q = Math.floor(rnd() * 5000); const u = unrealizedPnlOf(m, a, q); n++;
    if (u !== (m - a) * q) { bad(`unrealizedPnlOf oracle`); break; }
    n++; if (q > 0 && Math.sign(u) !== Math.sign(m - a)) { bad(`unrealizedPnlOf sign`); break; }
  }
  n++; if (unrealizedPnlOf(12, 10, 2.5) !== 5 || unrealizedPnlOf(9.5, 10, 0.5) !== -0.25) bad(`unrealizedPnlOf fractional qty (no hidden rounding)`);
  for (const [m, a, q] of [[NaN, 1, 1], [1, 0, 1], [1, -1, 1], [-1, 1, 1], [1, 1, -1], ["2", 1, 1], [1, 1, Infinity]]) { n++; if (unrealizedPnlOf(m, a, q) !== null) bad(`unrealizedPnlOf junk ${m},${a},${q}`); }
  // 3) accounting identity on random trade sequences: equity − start = realized + Σ unrealized
  for (let t = 0; t < 2000; t++) {
    const start = 1e5 + rnd() * 3e6; let cash = start, realized = 0; const book = new Map();
    for (let step = 0; step < 40; step++) {
      const tk = "T" + Math.floor(rnd() * 6); const price = Math.round((5 + rnd() * 500) * 100) / 100; const p = book.get(tk);
      if (!p || rnd() < 0.6) {
        const q = 1 + Math.floor(rnd() * 50); if (q * price > cash) continue;
        const avg = p ? avgCostAfterBuy(p.qty, p.avgCost, q, price) : price; cash -= q * price;
        book.set(tk, { qty: (p ? p.qty : 0) + q, avgCost: avg, mark: price });
      } else {
        const q = Math.max(1, Math.floor(p.qty * rnd())); realized += realizedPnl(price, p.avgCost, q); cash += q * price;
        if (q >= p.qty) book.delete(tk); else book.set(tk, { ...p, qty: p.qty - q, mark: price });
      }
      for (const [k, v] of book) v.mark = Math.max(0.01, Math.round(v.mark * (0.9 + rnd() * 0.2) * 100) / 100);
    }
    const pos = [...book.values()]; const v = bookMarkValue(pos, cash);
    const un = pos.reduce((acc, p) => acc + unrealizedPnlOf(p.mark, p.avgCost, p.qty), 0); n++;
    if (!v || Math.abs((v.equity - start) - (realized + un)) > 1e-6 * start) { bad(`identity equity−start = realized + unrealized (seq ${t})`); break; }
  }
  // 4) addDaysYmdUtc: legacy equality, round trip, calendar boundaries, invalid
  for (let i = 0; i < 5000; i++) {
    const t = Date.UTC(2000, 0, 1) + Math.floor(rnd() * 40 * 365) * 86400000; const dt = new Date(t);
    const ymd = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
    const d = Math.floor(rnd() * 800) - 400; const out = addDaysYmdUtc(ymd, d); n++;
    if (out !== legacyAddDays(ymd, d) || addDaysYmdUtc(out, -d) !== ymd) { bad(`addDays ${ymd} ${d}`); break; }
    n++; if ((legacyParse(out) - legacyParse(ymd)) / 86400000 !== d) { bad(`addDays distance ${ymd} ${d}`); break; }
  }
  for (const [a, d, want] of [["2024-02-28", 1, "2024-02-29"], ["2026-03-01", -1, "2026-02-28"], ["2026-12-31", 1, "2027-01-01"], ["2026-10-22", -30, "2026-09-22"], ["2026-10-22", -7, "2026-10-15"], ["2026-10-22", -365, "2025-10-22"], ["2024-10-22", -365, "2023-10-23"]]) { n++; if (addDaysYmdUtc(a, d) !== want) bad(`addDays hand ${a}${d} → ${addDaysYmdUtc(a, d)} want ${want}`); }
  for (const [a, d] of [["2026-02-30", 1], ["2026-13-01", 1], ["2026-1-01", 1], [20261022, 1], ["2026-10-22", 1.5], ["2026-10-22", NaN]]) { n++; if (addDaysYmdUtc(a, d) !== null) bad(`addDays junk ${a},${d}`); }
  // 5) windowPerformance: verbatim legacy on random series + invariants + junk
  let wN = 0;
  for (let i = 0; i < 6000; i++) {
    const len = Math.floor(rnd() * 40); const de = []; let t = Date.UTC(2026, 0, 1) + Math.floor(rnd() * 300) * 86400000; let eq = 1e5 + rnd() * 3e6;
    for (let j = 0; j < len; j++) { t += (1 + Math.floor(rnd() * (rnd() < 0.1 ? 30 : 4))) * 86400000; eq = Math.round(eq * (0.97 + rnd() * 0.06) * 100) / 100; const dt = new Date(t); de.push({ date: `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`, equity: eq }); }
    for (const days of [7, 30, 90, 365]) {
      const w = windowPerformance(de, days); const L = legacyWindowPerf(de, days); n++; wN++;
      if (JSON.stringify(w) !== JSON.stringify(L)) { bad(`legacy windowPerf ${days} len ${len}`); i = 1e9; break; }
      if (!de.length) continue;
      const last = de[de.length - 1]; const target = addDaysYmdUtc(last.date, -days);
      const bi = de.findIndex((x) => x.date === w.fromDate); n++;
      if (!w.sinceInception && !(de[bi].date <= target && (bi + 1 >= de.length || de[bi + 1].date > target))) { bad(`base not latest ≤ target`); i = 1e9; break; }
      n++; if (w.sinceInception !== (de[0].date > target) || (w.sinceInception && bi !== 0)) { bad(`sinceInception flag`); i = 1e9; break; }
      n++; if (w.pnl !== roundHalfAway(last.equity - de[bi].equity, 2) || Math.abs(w.pct - (w.pnl / de[bi].equity) * 100) > 2e-4 + 1e-3 / de[bi].equity * 100) { bad(`pnl/pct consistency`); i = 1e9; break; }
    }
  }
  n++; { const w = windowPerformance([{ date: "2026-10-01", equity: 100 }, { date: "2026-10-08", equity: 110 }, { date: "2026-10-15", equity: 121 }], 7); if (!(w.pct === 10 && w.pnl === 11 && w.fromDate === "2026-10-08" && !w.sinceInception)) bad(`window hand case +10%`); }
  n++; { const w = windowPerformance([{ date: "2026-10-01", equity: 100 }, { date: "2026-10-08", equity: 110 }], 7); if (!(w.fromDate === "2026-10-01" && !w.sinceInception && w.pct === 10)) bad(`window boundary: snapshot exactly 7 days back is the base`); }
  n++; { const w = windowPerformance([{ date: "2026-10-02", equity: 100 }, { date: "2026-10-08", equity: 110 }], 7); if (!(w.sinceInception && w.label === "成立以來")) bad(`window 6 days back ⇒ since inception`); }
  n++; { const w = windowPerformance([], 7); if (!(w && w.pct === 0 && w.sinceInception)) bad(`empty series row`); }
  for (const de of [[{ date: "2026-10-08", equity: 1 }, { date: "2026-10-01", equity: 1 }], [{ date: "2026-10-01", equity: 1 }, { date: "2026-10-01", equity: 2 }], [{ date: "2026-10-01", equity: NaN }], [{ date: "2026-10-01", equity: "5" }], [{ date: "2026-02-30", equity: 1 }], [null]]) { n++; if (windowPerformance(de, 7) !== null) bad(`window junk not refused ${JSON.stringify(de)}`); }
  for (const d of [0, -7, 7.5, NaN]) { n++; if (windowPerformance([{ date: "2026-10-01", equity: 1 }], d) !== null) bad(`window bad days ${d}`); }
  // 6) live: published books satisfy equity = cash + Σ qty·mark, identity, and every published metric recomputes
  try {
    const pf = JSON.parse(readFileSync(join(ROOT_MG, "public", "data", "paper-portfolio.json"), "utf8"));
    let live = 0;
    for (const m of ["TW", "US"]) {
      const b = pf.books?.[m]; if (!b) { bad(`live book ${m} missing`); continue; }
      const v = bookMarkValue(b.positions, b.cash); n++; live++;
      if (!v || roundHalfAway(v.equity, 2) !== b.equity || roundHalfAway(v.positionsValue, 2) !== b.positionsValue) bad(`live ${m} equity ${b.equity} ≠ cash + Σ qty·mark`);
      const un = b.positions.reduce((acc, p) => acc + unrealizedPnlOf(p.mark, p.avgCost, p.qty), 0); n++;
      if (!(Math.abs((b.equity - b.startCash) - (b.realizedPnl + un)) <= 0.02 + 1e-9 * b.startCash)) bad(`live ${m} identity: equity − start ${b.equity - b.startCash} vs realized + unrealized ${b.realizedPnl + un}`);
      const met = pf.metrics?.[m]; n++;
      if (!met || roundHalfAway(un, 2) !== met.unrealizedPnl || roundHalfAway(b.equity - b.startCash, 2) !== met.totalPnl) bad(`live ${m} published total/unrealized P&L do not recompute`);
      for (const [key, days] of [["week", 7], ["month", 30], ["quarter", 90], ["year", 365]]) { n++; if (JSON.stringify(windowPerformance(b.dailyEquity, days)) !== JSON.stringify(met?.[key])) bad(`live ${m} ${key} window does not recompute`); }
      n++; { const last = b.dailyEquity[b.dailyEquity.length - 1]; if (!last || last.equity !== b.equity) bad(`live ${m} last dailyEquity ${last?.equity} ≠ book equity ${b.equity}`); }
    }
    if (!live) bad(`no live books`);
  } catch (e) {
    bad(`paper-portfolio.json unreadable for valuation replay: ${e.message}`);
  }
  ok(`paper book valuation (${n} cases: 20000 random books = verbatim legacy equity, additivity, qty scaling, equity = cash + Σ qty·mark, hand 5000@43.25 + 41@190.73, junk ⇒ null; unrealizedPnlOf oracle/sign/junk; 2000 random trade sequences keep equity − start = realized + unrealized; addDaysYmdUtc = legacy, round trip, leap/month/year edges, invalid ⇒ null; ${wN} random windows = verbatim legacy windowPerf, base = latest snapshot ≤ last − days, 7-day boundary inclusive, since-inception flag, pnl/pct consistent, unsorted/duplicate/NaN ⇒ null; live TW/US equity, identity, total/unrealized and 4 windows recompute)`);
}

// ── Regime inputs: prior-10d drawdown, ATR bottom quartile, breadth, rate/FX/credit lag deltas (2026-10-26) ──
// Dependencies: [dd] closes[n−11..n−2] only; [q] series + today's ATR; [br] boolean above50 flags; [lag] closes
// with null dropped, endpoints n−1−days and n−1. Each check evaluates the function on data.
{
  const { priorWindowDrawdown, peakToTroughDrawdown, bottomQuantileFlag, atrBottomQuartile, breadthShare, lagChange } = await import("./math-core.mjs");
  const { seriesDelta, seriesRet } = await import("./market-regime.mjs");
  let n = 0;
  const bad = (m) => fail(`regime inputs: ${m}`);
  let s = 20261026 >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const r4 = (x, d = 4) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** d) / 10 ** d);
  // verbatim legacy (market-regime.mjs / daily-scan.mjs before 2026-10-26)
  const legacyPrior = (closes) => { if (closes.length < 11) return null; const w = closes.slice(-11, -1); const pk = Math.max(...w), tr = Math.min(...w); return pk > 0 ? tr / pk - 1 : null; };
  const legacyAtrQ = (bars) => {
    const atr = atrPct(bars, { window: 20, minTr: 10 }); let flag = null, gap = false;
    if (bars.length >= 60) {
      const ser = []; const start = Math.max(21, bars.length - 252);
      for (let i = start; i < bars.length; i++) { const a = atrPct(bars.slice(0, i + 1), { window: 20, minTr: 10 }); if (a != null) ser.push(a); }
      if (atr != null && ser.length >= 40) { const so = [...ser].sort((a, b) => a - b); flag = atr <= so[Math.floor(so.length * 0.25)]; } else gap = true;
      return { flag, gap, count: ser.length };
    }
    return { flag, gap, count: 0 };
  };
  const legacyBreadth = (ms) => (ms.length > 0 ? ms.filter((m) => m.above50).length / ms.length : null);
  const legacyLag = (closesRaw, days, ret) => { const c = closesRaw.filter((x) => x != null); if (c.length < days + 1) return { value: null, gap: true }; const a = c[c.length - 1 - days], b = c[c.length - 1]; if (a == null || b == null) return { value: null, gap: true }; if (ret) { if (a === 0) return { value: null, gap: true }; return { value: r4(b / a - 1), gap: false }; } return { value: r4(b - a), gap: false }; };
  const legacyDd252 = (price, highs) => { const lb = Math.min(252, highs.length); let mh = null; if (lb >= 20) mh = Math.max(...highs.slice(-lb)); return mh != null && mh > 0 ? price / mh - 1 : null; };
  const randWalk = (len, p0 = 100) => { const out = []; let p = p0; for (let i = 0; i < len; i++) { p *= Math.exp((rnd() - 0.5) * 0.06); out.push(Math.round(p * 100) / 100); } return out; };
  const randBars = (len) => { const out = []; let p = 50 + rnd() * 500; for (let i = 0; i < len; i++) { const o = p; p *= Math.exp((rnd() - 0.5) * (0.01 + 0.05 * rnd())); const h = Math.max(o, p) * (1 + rnd() * 0.02), l = Math.min(o, p) * (1 - rnd() * 0.02); out.push({ o, h, l, c: p, v: Math.floor(rnd() * 1e6) }); } return out; };
  const bruteDd = (a) => { let m = 0; for (let i = 0; i < a.length; i++) for (let j = i; j < a.length; j++) { let pk = -Infinity; for (let k = 0; k <= i; k++) pk = Math.max(pk, a[k]); m = Math.min(m, a[j] / pk - 1); } return m; };

  // [dd] 1) legacy oracle + invariants on random positive series
  for (let t = 0; t < 20000; t++) {
    const len = 11 + Math.floor(rnd() * 40); const c = randWalk(len);
    const v = priorWindowDrawdown(c, 10); n++;
    if (v !== legacyPrior(c)) { bad(`priorWindowDrawdown ≠ legacy ${JSON.stringify(c)}`); break; }
    n++; if (!(v <= 0)) { bad(`priorWindowDrawdown > 0`); break; }
    const k = 0.5 + rnd() * 3; const vs = priorWindowDrawdown(c.map((x) => x * k), 10); n++;
    if (Math.abs(vs - v) > 1e-12) { bad(`scale invariance ${v} vs ${vs}`); break; }
    const w = c.slice(-11, -1); const sh = [...w].sort(() => rnd() - 0.5); n++;
    if (priorWindowDrawdown([...c.slice(0, -11), ...sh, c.at(-1)], 10) !== v) { bad(`order-blind (permuting the window must not change the range ratio)`); break; }
    const tru = peakToTroughDrawdown(w); n++;
    if (!(v <= tru + 1e-15)) { bad(`range ratio ${v} > true drawdown ${tru}`); break; }
    const desc = [...w].sort((a, b) => b - a); n++;
    if (Math.abs(priorWindowDrawdown([...desc, 1], 10) - peakToTroughDrawdown(desc)) > 1e-15) { bad(`max-before-min ⇒ range = true dd`); break; }
    const c2 = [...c]; c2[c2.length - 1] = rnd() < 0.5 ? NaN : 0; if (c2.length > 11) c2[0] = -5; n++;
    if (priorWindowDrawdown(c2, 10) !== v) { bad(`locality: last bar / bars before the window must not matter`); break; }
  }
  // [dd] 2) junk inside the window ⇒ null (legacy: 0 ⇒ −100%, negative ⇒ < −100%, "12" coerced)
  {
    const base = randWalk(15);
    for (const j of [0, -3, NaN, Infinity, -Infinity, null, undefined, "12", {}]) {
      for (const pos of [base.length - 2, base.length - 11]) { const c = [...base]; c[pos] = j; n++; if (priorWindowDrawdown(c, 10) !== null) bad(`junk ${String(j)} at ${pos} ⇒ ${priorWindowDrawdown(c, 10)}, want null`); }
    }
    n++; if (legacyPrior([...base.slice(0, -2), 0, base.at(-1)]) !== -1) bad(`documenting legacy: 0 close made −100%`);
    n++; if (priorWindowDrawdown(base.slice(0, 10), 10) !== null || priorWindowDrawdown(base.slice(0, 11), 10) === null) bad(`length boundary 10/11`);
    for (const lb of [0, -1, 1.5, "10"]) { n++; if (priorWindowDrawdown(base, lb) !== null) bad(`bad lookback ${lb}`); }
    n++; if (priorWindowDrawdown(null) !== null || priorWindowDrawdown("abc") !== null) bad(`non-array`);
    // hand: rally 100→110 inside the window reads −9.09% (documented order-blindness), true dd 0
    const rally = [100, 101, 102, 103, 104, 105, 106, 107, 108, 110, 111]; n++;
    if (Math.abs(priorWindowDrawdown(rally, 10) - (100 / 110 - 1)) > 1e-15 || peakToTroughDrawdown(rally.slice(0, 10)) !== 0) bad(`hand rally case`);
  }
  // [dd] 3) peakToTroughDrawdown = brute O(n³) definition; junk
  for (let t = 0; t < 3000; t++) { const a = randWalk(1 + Math.floor(rnd() * 14)); n++; if (Math.abs(peakToTroughDrawdown(a) - bruteDd(a)) > 1e-15) { bad(`peakToTrough ≠ brute ${JSON.stringify(a)}`); break; } }
  for (const j of [[], [1, 0, 2], [1, NaN], ["2", 1], null]) { n++; if (peakToTroughDrawdown(j) !== null) bad(`peakToTrough junk ${JSON.stringify(j)}`); }

  // [q] 4) bottomQuantileFlag ⇔ #{x < value} ≤ floor(n/4) (sort-free oracle) and = legacy rule; boundaries
  for (let t = 0; t < 20000; t++) {
    const len = 40 + Math.floor(rnd() * 220); const ser = Array.from({ length: len }, () => (rnd() < 0.2 ? Math.round(rnd() * 10) / 100 : rnd() * 0.1));
    const val = rnd() < 0.3 ? ser[Math.floor(rnd() * len)] : rnd() * 0.1;
    const f = bottomQuantileFlag(val, ser); const cnt = ser.filter((x) => x < val).length; n++;
    if (f !== (cnt <= Math.floor(len / 4))) { bad(`bottomQuantileFlag ≠ count oracle (n=${len}, below=${cnt})`); break; }
    const so = [...ser].sort((a, b) => a - b); n++;
    if (f !== (val <= so[Math.floor(so.length * 0.25)])) { bad(`bottomQuantileFlag ≠ legacy rule`); break; }
    n++; if (f && bottomQuantileFlag(val - rnd() * 0.01, ser) !== true) { bad(`monotone: lower value stays flagged`); break; }
  }
  {
    const ser = Array.from({ length: 40 }, (_, i) => i + 1); // q index floor(40/4)=10 ⇒ sorted[10] = 11
    n++; if (bottomQuantileFlag(11, ser) !== true || bottomQuantileFlag(11.0001, ser) !== false) bad(`quartile boundary 11/11.0001 on 1..40`);
    n++; if (bottomQuantileFlag(1, ser.slice(0, 39)) !== null) bad(`minLen 39 ⇒ null`);
    for (const j of [NaN, null, "5"]) { n++; if (bottomQuantileFlag(j, ser) !== null) bad(`junk value ${j}`); }
    n++; if (bottomQuantileFlag(5, [...ser.slice(0, 39), NaN]) !== null) bad(`NaN in series ⇒ null`);
  }
  // [q] 5) atrBottomQuartile = verbatim legacy loop (flag and gap) on random charts incl. junk bars; boundaries; flat
  let aq = 0;
  for (let t = 0; t < 400; t++) {
    const len = 30 + Math.floor(rnd() * 330); const bars = randBars(len);
    if (rnd() < 0.25) for (let k = 0; k < 1 + Math.floor(rnd() * 30); k++) { const i = Math.floor(rnd() * len); const key = ["h", "l", "c"][Math.floor(rnd() * 3)]; bars[i] = { ...bars[i], [key]: [NaN, null, 0, -1][Math.floor(rnd() * 4)] }; }
    if (rnd() < 0.05) for (let i = len - 25; i < len; i++) if (i >= 0) bars[i] = { ...bars[i], h: NaN };
    const a = atrBottomQuartile(bars); const L = legacyAtrQ(bars); n++; aq++;
    if (a.flag !== L.flag || a.gap !== L.gap || a.count !== L.count) { bad(`atrBottomQuartile ${JSON.stringify(a)} ≠ legacy ${JSON.stringify(L)} (len ${len})`); break; }
    if (t < 60 && a.flag != null) { const k = 0.1 + rnd() * 5; const sc = atrBottomQuartile(bars.map((b) => ({ ...b, h: b.h * k, l: b.l * k, c: b.c * k, o: b.o * k }))); n++; if (sc.flag !== a.flag) { bad(`ATR quartile scale invariance`); break; } }
  }
  {
    const b59 = randBars(59), b60 = randBars(60); n++;
    if (JSON.stringify(atrBottomQuartile(b59)) !== JSON.stringify({ flag: null, gap: false, count: 0 })) bad(`59 bars ⇒ {null,false}`);
    { const long = randBars(400); n++; if (atrBottomQuartile(long).count !== 252) bad(`400 bars ⇒ exactly 252 ATR values (window n−252..n−1), got ${atrBottomQuartile(long).count}`); }
    { const b100 = randBars(100); n++; if (atrBottomQuartile(b100).count !== 79) bad(`100 bars ⇒ 79 ATR values (i = 21..99), got ${atrBottomQuartile(b100).count}`); }
    const r60 = atrBottomQuartile(b60); n++; if (r60.flag !== null || r60.gap !== true) bad(`60 bars ⇒ only 39 ATRs ⇒ gap (got ${JSON.stringify(r60)})`);
    const r61 = atrBottomQuartile(randBars(61)); n++; if (r61.flag == null) bad(`61 bars ⇒ 40 ATRs ⇒ a flag`);
    const flat = Array.from({ length: 120 }, () => ({ o: 10, h: 10, l: 10, c: 10, v: 1 })); n++;
    if (atrBottomQuartile(flat).flag !== true) bad(`flat series ATR 0 ⇒ bottom quartile`);
    const calmEnd = [...randBars(200), ...Array.from({ length: 30 }, () => ({ o: 100, h: 100.01, l: 99.99, c: 100, v: 1 }))]; n++;
    if (atrBottomQuartile(calmEnd).flag !== true) bad(`very calm last 30 bars ⇒ flagged`);
    const wildEnd = [...Array.from({ length: 200 }, () => ({ o: 100, h: 100.1, l: 99.9, c: 100, v: 1 })), ...randBars(30).map((b) => ({ ...b, h: b.h * 1.2, l: b.l * 0.8 }))]; n++;
    if (atrBottomQuartile(wildEnd).flag !== false) bad(`wild last 30 bars ⇒ not flagged`);
    n++; if (JSON.stringify(atrBottomQuartile(null)) !== JSON.stringify({ flag: null, gap: false, count: 0 })) bad(`null bars`);
  }
  // [br] 6) breadthShare = legacy on boolean flags; exact k/n; empty/junk
  for (let t = 0; t < 5000; t++) {
    const len = 1 + Math.floor(rnd() * 80); const ms = Array.from({ length: len }, () => ({ above50: rnd() < rnd() }));
    const v = breadthShare(ms, "above50"); const k = ms.filter((m) => m.above50 === true).length; n++;
    if (v !== legacyBreadth(ms) || v !== k / len || v < 0 || v > 1) { bad(`breadthShare ≠ legacy / k/n`); break; }
  }
  n++; if (breadthShare([], "above50") !== null || breadthShare(null) !== null) bad(`empty ⇒ null`);
  n++; if (breadthShare([{ above50: true }, { above50: "false" }]) !== null) bad(`string flag ⇒ null (legacy counted "false" as above)`);
  n++; if (legacyBreadth([{ above50: true }, { above50: "false" }]) !== 1) bad(`documenting legacy "false" ⇒ counted`);
  n++; if (breadthShare([{ above50: true }, {}]) !== null) bad(`missing flag ⇒ null`);
  // [lag] 7) lagChange / seriesDelta / seriesRet = verbatim legacy on random series with null holes; identities; junk
  for (let t = 0; t < 20000; t++) {
    const len = 1 + Math.floor(rnd() * 80); const c = randWalk(len, rnd() < 0.3 ? 4.5 : 30).map((x) => (rnd() < 0.05 ? null : (rnd() < 0.5 ? x + rnd() * 1e-3 : x)));
    const days = [5, 20, 60][Math.floor(rnd() * 3)]; const chart = { bars: c.map((x) => ({ c: x })) };
    const d = seriesDelta(chart, days), r = seriesRet(chart, days); n += 2;
    if (JSON.stringify(d) !== JSON.stringify(legacyLag(c, days, false))) { bad(`seriesDelta ≠ legacy (len ${len}, days ${days})`); break; }
    if (JSON.stringify(r) !== JSON.stringify(legacyLag(c, days, true))) { bad(`seriesRet ≠ legacy (len ${len}, days ${days})`); break; }
    const raw = lagChange(c, days, "diff"), rr = lagChange(c, days, "ret"); n++;
    if (!raw.gap) { const xs = c.filter((x) => x != null); const a = xs[xs.length - 1 - days]; if (Math.abs(rr.value - raw.value / a) > 1e-12 || Math.abs(raw.value - (xs.at(-1) - a)) > 1e-12) { bad(`ret = diff / a identity`); break; } }
  }
  {
    const c = randWalk(30);
    n++; if (lagChange(c, 29, "diff").gap !== false || lagChange(c, 30, "diff").gap !== true) bad(`length boundary days+1`);
    for (const j of ["4.1", NaN, Infinity, {}]) { const c2 = [...c]; c2[c2.length - 1] = j; n++; if (lagChange(c2, 5, "diff").gap !== true || seriesRet({ bars: c2.map((x) => ({ c: x })) }, 5).gap !== true) bad(`junk endpoint ${String(j)} ⇒ gap`); }
    n++; if (JSON.stringify(legacyLag([...c.slice(0, -1), "40"], 5, false)) === JSON.stringify({ value: null, gap: true })) bad(`documenting legacy: "40" string was coerced`);
    for (const a0 of [0, -2]) { const c2 = [...c]; c2[c2.length - 6] = a0; n++; if (lagChange(c2, 5, "ret").gap !== true) bad(`ret base ${a0} ⇒ gap`); }
    n++; if (lagChange(c, 5, "pct").gap !== true || lagChange(c, 0, "diff").gap !== true || lagChange(c, 2.5).gap !== true) bad(`bad mode/days ⇒ gap`);
    const hand = [4.0, 4.1, 4.2, 4.3, 4.4, 4.5]; n++; if (seriesDelta({ bars: hand.map((x) => ({ c: x })) }, 5).value !== 0.5) bad(`hand ^TNX 4.0→4.5 = +0.5`);
    n++; if (seriesDelta({ bars: [4.81234, 0, 0, 0, 0, 4.953000068664551].map((x) => ({ c: x })) }, 5).value !== 0.1407) bad(`4-dp rounding of a yield change (published scale)`);
    n++; if (seriesRet({ bars: [32.5, 33.30625].map((x) => ({ c: x })) }, 1).value !== 0.0248) bad(`4-dp rounding of an FX return`);
    n++; if (seriesRet({ bars: [100, null, 110].map((x) => ({ c: x })) }, 1).value !== 0.1) bad(`null dropped before lag`);
  }
  // 8) daily-scan computeMetrics 252d-high drawdown / SMA200 distance via peakInWindow/drawdownFromPeak/pctFromSma = legacy inline
  for (let t = 0; t < 20000; t++) {
    const len = 1 + Math.floor(rnd() * 300); const highs = randWalk(len); const price = highs.at(-1) * (0.7 + rnd() * 0.3);
    const lb = Math.min(252, len); const mh = lb >= 20 ? peakInWindow(highs, lb) : null; const v = mh != null ? drawdownFromPeak(price, mh) : null; n++;
    if (r4(v) !== r4(legacyDd252(price, highs))) { bad(`computeMetrics dd252 ≠ legacy`); break; }
    n++; if (v != null && v > 0) { bad(`dd252 > 0 with price ≤ last high`); break; }
    const sm = highs.slice(-Math.min(200, len)).reduce((a, b) => a + b, 0) / Math.min(200, len); n++;
    if (r4(pctFromSma(price, sm)) !== r4(sm > 0 ? price / sm - 1 : null)) { bad(`pctFromSma200 ≠ legacy`); break; }
  }
  { const h = randWalk(40); h[10] = NaN; n++; if (peakInWindow(h, 40) !== null || legacyDd252(1, h) !== null) bad(`NaN high ⇒ null both`); }
  // 9) caller path: indexFeaturesFromChart publishes legacy prior10dDd / atrBottomQuartile / gap list; junk close ⇒ null not −100%
  for (let t = 0; t < 150; t++) {
    const bars = randBars(40 + Math.floor(rnd() * 260)).map((b, i) => ({ ...b, date: `d${String(i).padStart(4, "0")}` }));
    const f = indexFeaturesFromChart({ bars }); const L = legacyAtrQ(bars); const lp = legacyPrior(bars.map((b) => b.c)); n++;
    if (f.prior10dDd !== r4(lp) || f.atrBottomQuartile !== L.flag || f.dataGaps.includes("ATR_pct_20_quartile") !== L.gap) { bad(`indexFeaturesFromChart ≠ legacy block`); break; }
  }
  for (const [len, junkTail, want] of [[60, false, true], [61, false, false], [59, false, false], [200, true, true]]) {
    const bars = randBars(len).map((b, i) => ({ ...b, date: `g${i}` }));
    if (junkTail) for (let i = len - 25; i < len; i++) bars[i] = { ...bars[i], h: NaN }; // today's ATR null ⇒ gap
    const f = indexFeaturesFromChart({ bars }); n++;
    if (f.dataGaps.includes("ATR_pct_20_quartile") !== want) bad(`indexFeaturesFromChart ATR quartile gap (len ${len}, junkTail ${junkTail}) should be ${want}`);
  }
  { const bars = randBars(80); bars[75] = { ...bars[75], c: 0 }; const f = indexFeaturesFromChart({ bars }); n++; if (f.prior10dDd !== null) bad(`0 close in window ⇒ prior10dDd ${f.prior10dDd}, want null (legacy −1 would read as a crash)`); }
  // 10) wiring: daily-scan uses the guarded helpers (static), no inline Math.max over highs / filter-ratio breadth left
  {
    const src = readFileSync(join(ROOT_MG, "scripts/daily-scan.mjs"), "utf8"); const mrSrc = readFileSync(join(ROOT_MG, "scripts/market-regime.mjs"), "utf8"); n++;
    if (/Math\.max\(\.\.\.highs/.test(src) || /filter\(\(m\) => m\.above50\)\.length/.test(src) || !/breadthShare\(usMetrics/.test(src) || !/breadthShare\(twMetrics/.test(src) || !/peakInWindow\(highs, lookbackHigh\)/.test(src)) bad(`daily-scan not wired to guarded helpers`);
    n++; if (/Math\.max\(\.\.\.window\)/.test(mrSrc) || !/priorWindowDrawdown\(closes, 10\)/.test(mrSrc) || !/atrBottomQuartileOf\(bars/.test(mrSrc) || !/lagChange\(/.test(mrSrc)) bad(`market-regime not wired to guarded helpers`);
  }
  // 11) live: published breadthProxy recomputes from the scan's raw quotes (when the dump is from the same scan)
  try {
    const latest = JSON.parse(readFileSync(join(ROOT_MG, "public/data/latest.json"), "utf8"));
    const rawPath = "/workspace/stock-ops-study/raw-quotes-2026-09-16.json"; let raw = null;
    try { raw = JSON.parse(readFileSync(rawPath, "utf8")); } catch { /* CI / fresh box: dump absent */ }
    const sameScan = raw && Math.abs(Date.parse(raw.fetched_at_utc) - Date.parse(latest.asOf)) < 6 * 3600e3;
    if (sameScan) {
      for (const [mkt, uni] of [["us", "US"], ["tw", "TW"]]) { const v = breadthShare(raw.quotes.filter((q) => q.universe === uni), "above50"); n++; if (r4(v, 3) !== latest.marketRegime[mkt].features.breadthProxy) bad(`live ${mkt} breadth ${r4(v, 3)} ≠ published ${latest.marketRegime[mkt].features.breadthProxy}`); }
    }
    for (const mkt of ["us", "tw"]) { const F = latest.marketRegime?.[mkt]?.features; n++; if (!F) { bad(`live ${mkt} features missing`); continue; } if (F.prior10dDd != null && !(F.prior10dDd <= 0 && F.prior10dDd > -1)) bad(`live ${mkt} prior10dDd ${F.prior10dDd} out of (−1, 0]`); if (F.breadthProxy != null && !(F.breadthProxy >= 0 && F.breadthProxy <= 1)) bad(`live ${mkt} breadth out of [0,1]`); if (![true, false, null].includes(F.atrBottomQuartile)) bad(`live ${mkt} atrBottomQuartile not boolean/null`); }
  } catch (e) { bad(`live regime check: ${e.message}`); }
  ok(`regime inputs (${n} cases: priorWindowDrawdown 20000 random = verbatim legacy, ≤ 0, scale/order invariance, ≤ true peak-to-trough dd and = it when max precedes min, locality, junk/0/negative/string ⇒ null, rally reads −9.09% (documented); peakToTroughDrawdown = brute; bottomQuantileFlag = sort-free count oracle + legacy rule, monotone, 1..40 boundary, minLen; atrBottomQuartile ${aq} random charts incl. junk bars = verbatim legacy flag+gap, 59/60/61-bar boundaries, flat/calm/wild, scale; breadthShare = legacy, k/n, string/missing flag ⇒ null; seriesDelta/seriesRet 20000 random with null holes = verbatim legacy, ret = diff/a, junk/base ≤ 0 ⇒ gap; computeMetrics dd252/pctFromSma200 = legacy; indexFeaturesFromChart caller path = legacy block, 0 close ⇒ null; wiring; live breadth recompute)`);
}

// ── TW fundamental growth math: annual rev/pretax YoY, 4Q ROE sum, EPS QoQ streak, ROE block growth, averages,
//    margin YoY (2026-10-27) ──
// Dependencies: [g] cur, prev only; [mean] every entry; [sum] last n entries; [streak] values from the end back to
// the first failing step; [block] last 2·block (or 2) values. Each check evaluates the function on data.
{
  const { signedGrowth, meanOrNull, trailingSum, growthStreak, blockGrowth } = await import("./math-core.mjs");
  const { annualGrowthSeries, avg } = await import("./tw-fundamentals.mjs");
  const { sumRecentRoe, epsGrowthStreak, roeGrowthLatest } = await import("./master-strategies.mjs");
  let n = 0;
  const bad = (m) => fail(`fundamental growth: ${m}`);
  let s = 20261027 >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  // strict equality: JSON.stringify maps NaN/±Infinity to null and −0 to 0 — that hid two mutants in round 1
  const enc = (k, v) => (typeof v === "number" && (!Number.isFinite(v) || Object.is(v, -0)) ? `#num:${Object.is(v, -0) ? "-0" : String(v)}` : v);
  const same = (x, y) => (x === null || y === null || typeof x !== "object" || typeof y !== "object" ? Object.is(x, y) : JSON.stringify(x, enc) === JSON.stringify(y, enc));
  n++; if (same(Infinity, null) || same([NaN], [null]) || same(-0, 0) || !same({ a: [1, null] }, { a: [1, null] })) bad(`strict comparator broken`);
  // verbatim legacy (before 2026-10-27)
  const L = {
    avg: (arr) => { if (!arr?.length) return null; return arr.reduce((s2, x) => s2 + x, 0) / arr.length; },
    sumRecentRoe: (fund, k = 4) => { if (!fund?.quarters?.length) return null; const qs = fund.quarters.filter((q) => q.roe != null); if (qs.length < k) return null; return qs.slice(-k).reduce((s2, q) => s2 + q.roe, 0); },
    epsGrowthStreak: (fund) => { if (!fund?.quarters?.length) return 0; const qs = fund.quarters.filter((q) => q.eps != null); let st = 0; for (let i = qs.length - 1; i >= 1; i--) { const cur = qs[i].eps; const prev = qs[i - 1].eps; if (prev == null || !(Math.abs(prev) > 1e-9)) break; const g = (cur - prev) / Math.abs(prev); if (g > 0.1) st++; else break; } return st; },
    roeGrowthLatest: (fund) => { if (!fund?.quarters?.length) return null; const qs = fund.quarters.filter((q) => q.roe != null); if (qs.length >= 8) { const a = qs.slice(-4).reduce((s2, q) => s2 + q.roe, 0); const b = qs.slice(-8, -4).reduce((s2, q) => s2 + q.roe, 0); if (!(Math.abs(b) > 1e-9)) return null; return (a - b) / Math.abs(b); } if (qs.length >= 2) { const a = qs[qs.length - 1].roe; const b = qs[qs.length - 2].roe; if (!(Math.abs(b) > 1e-9)) return null; return (a - b) / Math.abs(b); } return null; },
    series: (annual) => { const rev = [], pretax = []; for (let i = 1; i < annual.length; i++) { const a = annual[i], b = annual[i - 1]; if (a.revenue != null && b.revenue > 0) rev.push({ year: a.year, g: (a.revenue - b.revenue) / Math.abs(b.revenue) }); if (a.pretax != null && b.pretax != null && Math.abs(b.pretax) > 0) pretax.push({ year: a.year, g: (a.pretax - b.pretax) / Math.abs(b.pretax) }); } return { rev, pretax }; },
    margin: (cur, prev) => { if (cur == null || prev == null) return null; if (!(Math.abs(prev) > 1e-9)) return null; return (cur - prev) / Math.abs(prev); },
  };
  // published-precision generators: MOPS amounts are integer NT$ thousands (pretax may be ≤ 0); EPS 2 dp, single
  // quarter = cumulative difference (so FP tails like 0.8700000000000001 occur); ROE = NI / equity
  const amt = () => (rnd() < 0.08 ? 0 : (rnd() < 0.2 ? -1 : 1) * ri(1, 10 ** ri(2, 8)));
  const eps2 = () => (rnd() < 0.06 ? 0 : Math.round((rnd() - 0.25) * 10 ** ri(1, 3)) / 100);
  const randAnnual = () => { const len = ri(0, 7), out = []; let y = 108; for (let i = 0; i < len; i++) { y += rnd() < 0.1 ? 2 : 1; out.push({ year: y, revenue: rnd() < 0.07 ? null : Math.abs(amt()) * (rnd() < 0.05 ? 0 : 1), pretax: rnd() < 0.07 ? null : amt() }); } return out; };
  const randFund = () => {
    const len = ri(0, 10), qs = []; let cum = 0;
    for (let i = 0; i < len; i++) {
      const season = (i % 4) + 1; if (season === 1) cum = 0; const e = eps2(); const prevCum = cum; cum = Math.round((cum + e) * 100) / 100;
      const ni = amt(), eq = rnd() < 0.05 ? 0 : ri(1000, 10 ** 8);
      const pick = rnd();
      qs.push({ year: 113 + Math.floor(i / 4), season, eps: rnd() < 0.08 ? null : (season === 1 ? cum : cum - prevCum), roe: rnd() < 0.08 ? null : (eq > 0 ? ni / eq : null) * (pick < 0.03 ? 0 : 1) });
    }
    return { quarters: qs };
  };
  // [g] 1) verbatim legacy, three call variants, published precision; invariants
  for (let t = 0; t < 30000; t++) {
    const cur = rnd() < 0.5 ? amt() : eps2(), prev = rnd() < 0.5 ? amt() : eps2();
    n++; if (!same(signedGrowth(cur, prev), L.margin(cur, prev))) { bad(`signedGrowth(1e-9) ≠ legacy margin/EPS/ROE form ${cur},${prev}`); break; }
    const lr = prev > 0 ? (cur - prev) / Math.abs(prev) : null; n++;
    if (!same(signedGrowth(cur, prev, { minAbsPrev: 0, requirePositivePrev: true }), lr)) { bad(`signedGrowth revenue form ≠ legacy ${cur},${prev}`); break; }
    const lp = Math.abs(prev) > 0 ? (cur - prev) / Math.abs(prev) : null; n++;
    if (!same(signedGrowth(cur, prev, { minAbsPrev: 0 }), lp)) { bad(`signedGrowth pretax form ≠ legacy ${cur},${prev}`); break; }
    const g = signedGrowth(cur, prev);
    if (g != null) {
      n++; if ((g > 0) !== (cur > prev) || (g === 0) !== (cur === prev)) { bad(`sign: g ${g} for ${prev}→${cur}`); break; }
      n++; if (prev > 0 && cur >= 0 && !(g >= -1)) { bad(`g < −100% from positive base with non-negative cur`); break; }
      const k = 2 ** ri(-6, 6); n++; if (signedGrowth(cur * k, prev * k) !== g) { bad(`scale by power of 2 must be exact`); break; }
      n++; if (Math.abs(g * Math.abs(prev) - (cur - prev)) > 1e-9 * Math.max(1, Math.abs(cur - prev))) { bad(`g·|prev| ≠ cur − prev`); break; }
      if (prev > 0 && cur > 0) { const h = signedGrowth(prev, cur); n++; if (Math.abs((1 + g) * (1 + h) - 1) > 1e-12 * Math.max(cur / prev, prev / cur)) { bad(`(1+g(c,p))(1+g(p,c)) ≠ 1`); break; } }
    }
  }
  // [g] 2) boundaries + junk
  const gcases = [
    [[1, 1e-9], null], [[1, -1e-9], null], [[1, 1.0000001e-9], (1 - 1.0000001e-9) / 1.0000001e-9], [[0.11, 0.1], (0.11 - 0.1) / 0.1],
    [[5, 0, { minAbsPrev: 0 }], null], [[5, -2, { minAbsPrev: 0, requirePositivePrev: true }], null], [[5, -2, { minAbsPrev: 0 }], 3.5],
    [[50, -100], 1.5], [[-200, -100], -1], [[0, 100], -1], [[100, 100], 0],
    [[NaN, 1], null], [[1, NaN], null], [[Infinity, 1], null], [["12", 10], null], [[12, "10"], null], [[null, 1], null], [[1, undefined], null], [[1, 1, { minAbsPrev: -1 }], null], [[1, 2, { minAbsPrev: NaN }], null],
    [[1e308, -1e-300, { minAbsPrev: 0 }], null],
  ];
  for (const [args, want] of gcases) { n++; const v = signedGrowth(...args); if (!same(v, want)) bad(`signedGrowth(${JSON.stringify(args)}) = ${v}, want ${want}`); }
  // [mean] legacy avg on finite arrays (bit-identical, same summation order); bounds; junk ⇒ null (legacy: null→0, "x" concat, NaN)
  for (let t = 0; t < 20000; t++) {
    const len = ri(0, 7); const a = Array.from({ length: len }, () => (rnd() < 0.5 ? amt() / 1000 : (rnd() - 0.3) * 20));
    const m = meanOrNull(a); n++;
    if (!same(m, L.avg(a)) || !same(avg(a), m)) { bad(`meanOrNull/avg ≠ legacy ${JSON.stringify(a)}`); break; }
    if (len) { n++; if (!(m >= Math.min(...a) - 1e-9 * Math.max(1, ...a.map(Math.abs)) && m <= Math.max(...a) + 1e-9 * Math.max(1, ...a.map(Math.abs)))) { bad(`mean outside [min,max]`); break; } }
    if (len) { const c = a[0]; n++; if (meanOrNull(a.map(() => c)) !== c && Math.abs(meanOrNull(a.map(() => c)) - c) > 1e-12 * Math.abs(c)) { bad(`constant mean`); break; } }
    if (len) { const j = ri(0, len - 1); const junk = [null, NaN, "0.2", undefined, Infinity][ri(0, 4)]; const b = [...a]; b[j] = junk; n++; if (meanOrNull(b) !== null || avg(b) !== null) { bad(`junk ${String(junk)} in mean ⇒ must be null`); break; } }
  }
  n++; if (L.avg([0.3, null]) !== 0.15 || meanOrNull([0.3, null]) !== null) bad(`documented legacy hole: avg([0.3,null]) read as 0.15`);
  n++; if (meanOrNull([]) !== null || meanOrNull(null) !== null || meanOrNull([0.2]) !== 0.2 || !Object.is(meanOrNull([-0]), L.avg([-0])) || !Object.is(meanOrNull([-0]), 0)) bad(`meanOrNull edges (incl. [−0] ⇒ +0 like legacy)`);
  // [sum] brute; boundaries; junk in window ⇒ null, outside window irrelevant
  for (let t = 0; t < 20000; t++) {
    const len = ri(0, 10), k = ri(1, 6); const a = Array.from({ length: len }, () => amt() / ri(1000, 1e8));
    const v = trailingSum(a, k); let want = null; if (len >= k) { want = 0; for (let i = len - k; i < len; i++) want += a[i]; }
    n++; if (!same(v, want)) { bad(`trailingSum ≠ brute ${JSON.stringify(a)} k ${k}`); break; }
    if (len > k) { const b = [...a]; b[0] = NaN; n++; if (!same(trailingSum(b, k), v)) { bad(`trailingSum locality`); break; } const c = [...a]; c[len - 1 - ri(0, k - 1)] = "0.1"; n++; if (trailingSum(c, k) !== null) { bad(`string in window ⇒ null`); break; } }
  }
  for (const [args, want] of [[[[1, 2, 3], 3], 6], [[[1, 2, 3], 4], null], [[[1, 2, 3], 0], null], [[[1, 2, 3], 1.5], null], [[[1, 2, 3], -1], null], [[null, 1], null], [[[1, null, 2], 2], null], [[[null, 1, 2], 2], 3], [[[1, undefined], 1], null], [[[1, true], 1], null]]) { n++; if (!same(trailingSum(...args), want)) bad(`trailingSum(${JSON.stringify(args)}) ≠ ${want}`); }
  // [streak] brute definition; monotone in threshold; ≤ len−1; appending a failing step ⇒ 0
  const bruteStreak = (v, thr) => { let k = 0; while (k + 1 < v.length) { const c = v[v.length - 1 - k], p = v[v.length - 2 - k]; if (typeof c !== "number" || typeof p !== "number" || !Number.isFinite(c) || !Number.isFinite(p) || !(Math.abs(p) > 1e-9) || !((c - p) / Math.abs(p) > thr)) break; k++; } return k; };
  for (let t = 0; t < 20000; t++) {
    const len = ri(0, 9); let v = Array.from({ length: len }, () => eps2()); if (rnd() < 0.4) { let x = 0.5 + rnd(); v = v.map(() => (x = Math.round(x * (1 + rnd() * 0.4) * 100) / 100)); }
    const thr = [0.1, 0, 0.05, 0.25][ri(0, 3)]; const st = growthStreak(v, thr); n++;
    if (st !== bruteStreak(v, thr)) { bad(`growthStreak ≠ brute ${JSON.stringify(v)} thr ${thr}`); break; }
    n++; if (growthStreak(v, thr + 0.05) > st || st > Math.max(0, len - 1)) { bad(`streak monotonicity/bound`); break; }
    if (len) { const w = [...v, v[len - 1]]; n++; if (growthStreak(w, thr) !== 0) { bad(`flat last step must end the streak`); break; } }
  }
  for (const [v, want] of [[[1, 1.2, 1.5, 2], 3], [[0, 1, 2], 1], [[1e-9, 1, 2], 1], [[-1, -0.5, 0], 2], [[1, 1.2, NaN, 2], 0], [[1, "1.5", 2], 0], [[1, "1.5", 2, 3], 1], [[], 0], [[3], 0]]) { n++; if (growthStreak(v, 0.1) !== want) bad(`growthStreak(${JSON.stringify(v)}) = ${growthStreak(v, 0.1)}, want ${want}`); }
  n++; if (growthStreak(null, 0.1) !== 0 || growthStreak([1, 2], NaN) !== 0 || growthStreak([1, 2], "0.1") !== 0 || growthStreak([1e-10, 1], 0.1, { minAbsPrev: 0 }) !== 1) bad(`growthStreak junk ⇒ 0 / minAbsPrev passthrough`);
  // documented FP boundary (legacy behaviour kept): +10.00% at 2-dp precision can read as > 10%
  n++; if (growthStreak([0.7, 0.77], 0.1) !== 1 || growthStreak([1, 1.1], 0.1) !== 1 || growthStreak([1.3, 1.43], 0.1) !== 0) bad(`FP boundary at exactly +10% changed — re-check replay before shipping`);
  // [block] brute definition; 7/8/9 and 1/2 length boundaries
  for (let t = 0; t < 20000; t++) {
    const len = ri(0, 12); const v = Array.from({ length: len }, () => (rnd() < 0.05 ? 0 : amt() / ri(1000, 1e8)));
    let want = null;
    if (len >= 8) { let a = 0, b = 0; for (let i = len - 4; i < len; i++) a += v[i]; for (let i = len - 8; i < len - 4; i++) b += v[i]; want = Math.abs(b) > 1e-9 ? (a - b) / Math.abs(b) : null; }
    else if (len >= 2) { const b = v[len - 2]; want = Math.abs(b) > 1e-9 ? (v[len - 1] - b) / Math.abs(b) : null; }
    n++; if (!same(blockGrowth(v, 4), want)) { bad(`blockGrowth ≠ brute ${JSON.stringify(v)}`); break; }
    if (len >= 9) { const w = [...v]; w[0] = NaN; n++; if (!same(blockGrowth(w, 4), want)) { bad(`blockGrowth locality (9+ values)`); break; } }
  }
  { const v8 = [1, 1, 1, 1, 2, 2, 2, 2]; n++; if (blockGrowth(v8, 4) !== 1 || blockGrowth(v8.slice(1), 4) !== 0 || blockGrowth([1], 4) !== null || blockGrowth([2, 3], 4) !== 0.5) bad(`blockGrowth 8/7/1/2 boundaries`); }
  { const tiny = [1e-10, 1e-10, 1e-10, 2e-10, 1, 1, 1, 1]; n++; if (blockGrowth(tiny, 4) !== null || !same(blockGrowth(tiny, 4, { minAbsPrev: 0 }), (4 - 5e-10) / 5e-10) || blockGrowth([5e-10, 1], 4) !== null || !same(blockGrowth([5e-10, 1], 4, { minAbsPrev: 0 }), (1 - 5e-10) / 5e-10)) bad(`blockGrowth minAbsPrev passthrough (both branches)`); }
  n++; if (blockGrowth([1, 1, 1, 1, 2, 2, NaN, 2], 4) !== null || blockGrowth([1, 2], 0) !== null || blockGrowth("12345678", 4) !== null) bad(`blockGrowth junk ⇒ null`);
  // caller path: tw-fundamentals annualGrowthSeries + master-strategies helpers on random funds = verbatim legacy
  for (let t = 0; t < 20000; t++) {
    const an = randAnnual(); n++;
    if (!same(annualGrowthSeries(an), L.series(an))) { bad(`annualGrowthSeries ≠ legacy ${JSON.stringify(an)}`); break; }
    const f = randFund(); n++;
    if (!same(sumRecentRoe(f, 4), L.sumRecentRoe(f, 4)) || !same(epsGrowthStreak(f), L.epsGrowthStreak(f)) || !same(roeGrowthLatest(f), L.roeGrowthLatest(f))) { bad(`master helpers ≠ legacy ${JSON.stringify(f)}`); break; }
  }
  // caller path junk: legacy published NaN / coerced strings; new ⇒ null (name skipped, fail-closed)
  {
    const an = [{ year: 112, revenue: 100, pretax: 10 }, { year: 113, revenue: NaN, pretax: "20" }, { year: 114, revenue: 120, pretax: 30 }];
    const g = annualGrowthSeries(an), lg = L.series(an); n++;
    if (!(Number.isNaN(lg.rev[0].g) && g.rev[0].g === null && g.pretax[0].g === null && lg.pretax[0].g === 1 && g.rev.length === lg.rev.length)) bad(`annualGrowthSeries junk ⇒ g null at the same index (legacy NaN / coerced "20")`);
    n++; if (avg(g.rev.map((x) => x.g)) !== null) bad(`average over a null growth must be null`);
    // off-domain but exact: legacy pretax rule is |prev| > 0 (not 1e-9); revenue needs prev > 0
    const tiny = [{ year: 1, revenue: 5e-10, pretax: -5e-10 }, { year: 2, revenue: 1, pretax: 1 }]; n++;
    if (!same(annualGrowthSeries(tiny), L.series(tiny)) || annualGrowthSeries(tiny).pretax.length !== 1 || annualGrowthSeries(tiny).rev.length !== 1) bad(`annualGrowthSeries tiny-base thresholds ≠ legacy (pretax |prev|>0, revenue prev>0)`);
    const f = { quarters: [{ roe: 0.05 }, { roe: "0.05" }, { roe: 0.05 }, { roe: 0.05 }] }; n++;
    if (typeof L.sumRecentRoe(f) !== "string" || sumRecentRoe(f) !== null) bad(`string ROE: legacy concatenated, new must be null`);
    n++; if (sumRecentRoe({}) !== null || epsGrowthStreak({}) !== 0 || roeGrowthLatest(null) !== null) bad(`empty fund edges`);
  }
  // wiring (static): no inline (a − b)/|b| growth or reduce-sum left in the fundamental callers
  {
    const tw = readFileSync(join(ROOT_MG, "scripts/tw-fundamentals.mjs"), "utf8"), msrc = readFileSync(join(ROOT_MG, "scripts/master-strategies.mjs"), "utf8"), rsrc = readFileSync(join(ROOT_MG, "scripts/run-strategies.mjs"), "utf8"); n++;
    if (/\/ Math\.abs\(b\.(revenue|pretax)\)/.test(tw) || !/annualGrowthSeries\(rec\.annual\)/.test(tw) || !/rec\.revGrowthYoY = gs\.rev;/.test(tw) || !/rec\.pretaxGrowthYoY = gs\.pretax;/.test(tw) || !/return meanOrNull\(arr\)/.test(tw)) bad(`tw-fundamentals not wired to guarded growth helpers`);
    n++; if (/\/ Math\.abs\((prev|b)\)/.test(msrc) || /reduce\(\(s, q\) => s \+ q\.roe/.test(msrc) || !/trailingSum\(/.test(msrc) || !/growthStreak\(/.test(msrc) || !/blockGrowth\(/.test(msrc)) bad(`master-strategies not wired to guarded helpers`);
    n++; if (/\(cur - prev\) \/ Math\.abs\(prev\)/.test(rsrc) || /reduce\(\(a, q\) => a \+ q\.roe/.test(rsrc) || !/signedGrowth\(cur, prev, \{ minAbsPrev: 1e-9 \}\)/.test(rsrc) || !/const roe4 = trailingSum\(qs\.map\(\(q\) => q\.roe\), 4\);/.test(rsrc)) bad(`run-strategies not wired to guarded helpers`);
  }
  // live: published 大師 hits are internally consistent with their own thresholds (no NaN, streak integer ≥ 4, …)
  try {
    const scr = JSON.parse(readFileSync(join(ROOT_MG, "public/data/strategy-screener.json"), "utf8"));
    const th = { "kenneth-fisher": [["revGrowth5yAvgPct", 15], ["pretaxGrowth5yAvgPct", 5]], "peter-lynch": [["revGrowth2yAvgPct", 25], ["pretaxGrowth5yAvgPct", 5]], "michael-murphy": [["revGrowth3yAvgPct", 5], ["roe4qPct", 5]], "warren-buffett": [["roe4qPct", 15]], "james-oshaughnessy": [["roe4qPct", 15], ["roeGrowthPct", 15]], "mark-minervini": [["roe4qPct", 15]] };
    for (const st of scr.strategies || []) {
      const T = th[st.id]; if (!T) continue;
      for (const h of st.hits || []) {
        for (const [k, min] of T) { n++; if (!(typeof h.metrics?.[k] === "number" && Number.isFinite(h.metrics[k]) && h.metrics[k] >= min)) bad(`live ${st.id} ${h.ticker} ${k}=${h.metrics?.[k]} not ≥ ${min}`); }
        if (st.id === "james-oshaughnessy") { n++; if (!(Number.isInteger(h.metrics?.epsGrowthStreak) && h.metrics.epsGrowthStreak >= 4)) bad(`live O'Shaughnessy ${h.ticker} streak ${h.metrics?.epsGrowthStreak}`); }
        if (Array.isArray(h.metrics?.revGrowth3y)) { n++; if (h.metrics.revGrowth3y.length !== 3 || !h.metrics.revGrowth3y.every((x) => typeof x === "number" && x > 5)) bad(`live ${st.id} ${h.ticker} revGrowth3y ${JSON.stringify(h.metrics.revGrowth3y)}`); }
      }
    }
  } catch (e) { bad(`live screener check: ${e.message}`); }
  ok(`fundamental growth (${n} cases: signedGrowth 30000 published-precision pairs = verbatim legacy in all 3 call forms (EPS/ROE/margin 1e-9, revenue prev>0, pretax ≠0), sign/zero, ≥ −100% from positive base, exact power-of-2 scaling, g·|prev| = Δ, reciprocal identity; 1e-9 / 0 / negative-base boundaries; junk/string/∞/overflow ⇒ null; meanOrNull = legacy avg bit-for-bit, within [min,max], junk ⇒ null (legacy read [0.3,null] as 0.15); trailingSum = brute, locality, window junk ⇒ null; growthStreak = brute, threshold-monotone, flat step ends streak, exact +10% FP boundary documented; blockGrowth = brute incl. 7/8/9 & 1/2 lengths; caller path annualGrowthSeries + sumRecentRoe/epsGrowthStreak/roeGrowthLatest on 20000 random funds = legacy; junk caller ⇒ null at same index; wiring; live 大師 hits meet their thresholds)`);
}

console.log("——");
if (failures.length) {
  console.error(`▶ math-guards: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("▶ math-guards: all checks passed");
process.exit(0);
