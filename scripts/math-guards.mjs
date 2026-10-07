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
} from "./math-core.mjs";
import { temperatureScore } from "./market-regime.mjs";
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

console.log("——");
if (failures.length) {
  console.error(`▶ math-guards: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("▶ math-guards: all checks passed");
process.exit(0);
