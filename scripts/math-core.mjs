/**
 * Pure math helpers for screening (SMA, pct/returns, volume ratio, RS vs index,
 * base ranking). Used by daily-scan / market-regime and verified by math-guards.
 * Olympiad habit: every identity is total on its domain — reject NaN/∞, empty,
 * and divide-by-zero instead of shipping silent garbage.
 */

/** @returns {boolean} */
export function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

/** Reject non-finite numbers; return null (screening-safe). */
export function finiteOrNull(n) {
  return isFiniteNumber(n) ? n : null;
}

/**
 * Simple moving average of the last `n` points.
 * @param {number[]} arr
 * @param {number} n window (positive integer)
 * @returns {number|null}
 */
export function sma(arr, n) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  if (!Number.isInteger(n) || n <= 0) return null;
  if (arr.length < n) return null;
  const slice = arr.slice(-n);
  for (const x of slice) {
    if (!isFiniteNumber(x)) return null;
  }
  return slice.reduce((a, b) => a + b, 0) / n;
}

/**
 * Percent change: (to − from) / from × 100.
 * Matches daily-scan dayPct / d5Pct / d1mPct units (percentage points).
 * from === 0 or non-finite → null.
 */
export function pctChange(from, to) {
  if (!isFiniteNumber(from) || !isFiniteNumber(to)) return null;
  if (from === 0) return null;
  return ((to - from) / from) * 100;
}

/**
 * Fractional return: (to − from) / from.
 * Matches market-regime ret* / seriesRet units.
 */
export function retChange(from, to) {
  if (!isFiniteNumber(from) || !isFiniteNumber(to)) return null;
  if (from === 0) return null;
  return (to - from) / from;
}

/**
 * Volume ratio = lastVol / avgVolPrior. Denominator must be > 0.
 */
export function volumeRatio(lastVol, avgVol) {
  if (!isFiniteNumber(lastVol) || !isFiniteNumber(avgVol)) return null;
  if (!(avgVol > 0)) return null;
  return lastVol / avgVol;
}

/**
 * Relative strength vs index in percentage points: stockDayPct − indexDayPct.
 */
export function rsVsIndex(stockDayPct, indexDayPct) {
  if (!isFiniteNumber(stockDayPct)) return null;
  const idx = indexDayPct == null ? 0 : indexDayPct;
  if (!isFiniteNumber(idx)) return null;
  return stockDayPct - idx;
}

/**
 * Base ranking score (pre–regime adjust). Monotonic in RS / short-horizon pct
 * and rewards trend + constructive volume — see math-guards fixtures.
 */
export function baseRankingScore(m, indexDayPct, { preferVol = true } = {}) {
  if (!m || !isFiniteNumber(m.dayPct)) return -1e9;
  const rs = rsVsIndex(m.dayPct, indexDayPct ?? 0);
  if (rs == null) return -1e9;
  let score = rs * 2 + (m.d5Pct ?? 0) * 0.35 + (m.d1mPct ?? 0) * 0.15;
  if (m.above20) score += 1.5;
  if (m.above50) score += 1;
  if (m.above200) score += 0.5;
  if (preferVol && m.volRatio != null) {
    if (!isFiniteNumber(m.volRatio)) return -1e9;
    if (m.volRatio >= 1.2) score += Math.min(m.volRatio, 8) * 0.6;
    else if (m.volRatio < 0.4) score -= 0.5;
  }
  if (m.dayPct >= 9.5) score += 2;
  return score;
}

/**
 * Average of a prior volume window (e.g. vols.slice(-21,-1)).
 * Requires length ≥ minLen and all finite; rejects empty/short windows.
 */
export function avgVolume(vols, { minLen = 10 } = {}) {
  if (!Array.isArray(vols) || vols.length < minLen) return null;
  for (const v of vols) {
    if (!isFiniteNumber(v)) return null;
  }
  return vols.reduce((a, b) => a + b, 0) / vols.length;
}

/**
 * Project x onto [lo, hi]. Screening-safe: non-finite or lo > hi → null.
 * Olympiad habit: closed-interval projection (Marks temperature, score caps).
 */
export function clamp(x, lo, hi) {
  if (!isFiniteNumber(x) || !isFiniteNumber(lo) || !isFiniteNumber(hi)) return null;
  if (lo > hi) return null;
  return Math.min(hi, Math.max(lo, x));
}

/**
 * Fractional distance from an SMA: price/sma − 1.
 * Matches market-regime pctFromSma200 units (not percentage points).
 * sma ≤ 0 or non-finite → null (no Infinity / sign-flip garbage).
 */
export function pctFromSma(price, smaVal) {
  if (!isFiniteNumber(price) || !isFiniteNumber(smaVal)) return null;
  if (!(smaVal > 0)) return null;
  return price / smaVal - 1;
}

/**
 * Max of the last `n` points (peak lookback).
 * Rejects empty/short windows and any non-finite entry (NaN must not become dd garbage).
 * @param {number[]} arr
 * @param {number} n window (positive integer)
 * @returns {number|null}
 */
export function peakInWindow(arr, n) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  if (!Number.isInteger(n) || n <= 0) return null;
  if (arr.length < n) return null;
  const slice = arr.slice(-n);
  let peak = -Infinity;
  for (const x of slice) {
    if (!isFiniteNumber(x)) return null;
    if (x > peak) peak = x;
  }
  return peak;
}

/**
 * Fractional drawdown from a peak: price/peak − 1.
 * Matches market-regime ddFrom252dHigh units (≤ 0 when price ≤ peak).
 * Same domain as pctFromSma: peak must be > 0.
 */
export function drawdownFromPeak(price, peak) {
  if (!isFiniteNumber(price) || !isFiniteNumber(peak)) return null;
  if (!(peak > 0)) return null;
  return price / peak - 1;
}

/**
 * Compound fractional returns: ∏(1+r_i) − 1.
 * Domain: nonempty array; every r finite and r > −1 (else growth factor ≤ 0 breaks
 * multiplicative compounding — olympiad habit: refuse the formula off-domain).
 * Units match retChange / regime lookbacks (fractional, not percentage points).
 */
export function compoundRet(rets) {
  if (!Array.isArray(rets) || rets.length === 0) return null;
  let growth = 1;
  for (const r of rets) {
    if (!isFiniteNumber(r)) return null;
    if (!(r > -1)) return null;
    growth *= 1 + r;
  }
  if (!isFiniteNumber(growth)) return null;
  return growth - 1;
}

/**
 * Finite-only weighted mean: Σ(v_i w_i) / Σ w_i.
 * Domain: nonempty equal-length arrays; every value and weight finite; every weight ≥ 0;
 * total weight > 0. Reject negatives (weights are blend masses for volume/score, not signed).
 * Returns null off-domain (olympiad habit: refuse the formula rather than invent a blend).
 */
export function weightedMean(values, weights) {
  if (!Array.isArray(values) || !Array.isArray(weights)) return null;
  if (values.length === 0 || values.length !== weights.length) return null;
  let num = 0;
  let den = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    const w = weights[i];
    if (!isFiniteNumber(v) || !isFiniteNumber(w)) return null;
    if (w < 0) return null;
    num += v * w;
    den += w;
  }
  if (!(den > 0) || !isFiniteNumber(num) || !isFiniteNumber(den)) return null;
  return num / den;
}

/**
 * Logarithmic return: ln(p1 / p0).
 * Domain: both prices finite and strictly positive (no log of ≤0; no sign-flip garbage).
 * Units: continuously compounded fractional return — compatible with summing across bars
 * and with compoundRet via exp(Σ logRet) − 1 when every step is defined.
 */
export function logReturn(p0, p1) {
  if (!isFiniteNumber(p0) || !isFiniteNumber(p1)) return null;
  if (!(p0 > 0) || !(p1 > 0)) return null;
  const r = Math.log(p1 / p0);
  return isFiniteNumber(r) ? r : null;
}

/**
 * Blended average cost after adding to a position:
 *   (oldAvg·oldQty + addPrice·addQty) / (oldQty + addQty).
 * Domain: oldQty ≥ 0 (0 ⇒ fresh open, result = addPrice), addQty > 0, prices finite & > 0;
 * oldAvg must be > 0 whenever oldQty > 0. Invariant (convexity): result ∈ [min, max] of the
 * two prices, and result·newQty = total cost. Returns null off-domain.
 */
export function avgCostAfterBuy(oldQty, oldAvg, addQty, addPrice) {
  if (!isFiniteNumber(oldQty) || !isFiniteNumber(addQty) || !isFiniteNumber(addPrice)) return null;
  if (oldQty < 0 || !(addQty > 0) || !(addPrice > 0)) return null;
  if (oldQty === 0) return addPrice;
  if (!isFiniteNumber(oldAvg) || !(oldAvg > 0)) return null;
  const newQty = oldQty + addQty;
  const r = (oldAvg * oldQty + addPrice * addQty) / newQty;
  if (!isFiniteNumber(r)) return null;
  // clamp float drift back into the convex hull (never outside [min,max] of inputs)
  return Math.min(Math.max(r, Math.min(oldAvg, addPrice)), Math.max(oldAvg, addPrice));
}

/**
 * Annualized historical (realized) volatility from daily closes.
 *   r_i = ln(c_i / c_{i−1}) over consecutive valid pairs (both finite & > 0; others skipped),
 *   take the last `window` returns, sample stdev with (n − 1) denominator, × √periodsPerYear.
 * Units: fraction per year (0.25 = 25 %/yr), same unit as Yahoo implied vol.
 * Domain: needs ≥ minCloses valid closes and ≥ minReturns returns; result finite & ≥ 0, else null.
 * Invariants: price-scale invariant (c → k·c), drift-free on geometric paths (constant r ⇒ 0),
 * time-reversal invariant (r → −r leaves stdev unchanged).
 */
export function annualizedHistVol(closes, { window = 21, periodsPerYear = 252, minCloses = 22, minReturns = 20 } = {}) {
  if (!Array.isArray(closes)) return null;
  const c = closes.filter((x) => isFiniteNumber(x) && x > 0);
  if (c.length < minCloses) return null;
  const rets = [];
  for (let i = 1; i < c.length; i++) {
    const r = logReturn(c[i - 1], c[i]);
    if (r != null) rets.push(r);
  }
  if (rets.length < minReturns || rets.length < 2) return null;
  const slice = rets.slice(-window);
  if (slice.length < 2) return null;
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / (slice.length - 1);
  const out = Math.sqrt(Math.max(0, variance)) * Math.sqrt(periodsPerYear);
  return isFiniteNumber(out) && out >= 0 ? out : null;
}

/**
 * Index-futures basis vs cash index.
 *   basisPoints = fut − spot (index points, rounded to 0.01)
 *   basisPct    = (fut − spot) / spot × 100 (percent of spot, rounded to 1e-4; computed from the
 *                 unrounded difference so rounding never compounds)
 * Sign: positive ⇒ futures premium (正價差), negative ⇒ discount (逆價差).
 * Domain: both finite, spot > 0, fut > 0; otherwise null (never 0, never ±∞).
 */
export function futuresBasis(fut, spot) {
  if (!isFiniteNumber(fut) || !isFiniteNumber(spot) || spot <= 0 || fut <= 0) return null;
  const d = fut - spot;
  const basisPoints = Math.round(d * 100) / 100;
  const basisPct = Math.round((d / spot) * 100 * 1e4) / 1e4;
  if (!isFiniteNumber(basisPoints) || !isFiniteNumber(basisPct)) return null;
  return { basisPoints: Object.is(basisPoints, -0) ? 0 : basisPoints, basisPct: Object.is(basisPct, -0) ? 0 : basisPct };
}

/**
 * Third Wednesday of a Gregorian month as "YYYY-MM-DD" (TAIFEX TX/MTX/TMF monthly last trading day,
 * before any holiday adjustment). first weekday w (0=Sun) ⇒ first Wed = 1 + (3 − w + 7) mod 7 ∈ [1,7],
 * third Wed = that + 14 ∈ [15,21]. Domain: integer year 1..9999, month 1..12; else null.
 */
export function thirdWednesdayYmd(year, month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || year < 1 || year > 9999 || month < 1 || month > 12) return null;
  const first = new Date(Date.UTC(2000, month - 1, 1));
  first.setUTCFullYear(year);
  const w = first.getUTCDay();
  const day = 1 + ((3 - w + 7) % 7) + 14;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
