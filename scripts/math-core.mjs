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

/**
 * Average True Range as a fraction of the last close (simple mean, not Wilder smoothing).
 *   TR_i = max(h_i − l_i, |h_i − c_{i−1}|, |l_i − c_{i−1}|) over the last `window` bars
 *   (each needs the previous bar's close), ATR% = mean(TR) / c_last.  Unit: fraction (0.012 = 1.2%).
 * A bar is skipped (not zero-filled) when h, l or the prior close is non-finite or ≤ 0, or h < l.
 * Domain: ≥ window+1 bars, ≥ minTr usable TRs, last close finite > 0; otherwise null.
 * Invariants: ATR% ≥ 0; unchanged when every price is scaled by k > 0; 0 for a flat series.
 */
export function atrPct(bars, { window = 20, minTr = 10 } = {}) {
  if (!Array.isArray(bars) || !Number.isInteger(window) || window < 1 || bars.length < window + 1) return null;
  const slice = bars.slice(-(window + 1));
  let sum = 0;
  let count = 0;
  for (let i = 1; i < slice.length; i++) {
    const h = slice[i]?.h;
    const l = slice[i]?.l;
    const pc = slice[i - 1]?.c;
    if (!isFiniteNumber(h) || !isFiniteNumber(l) || !isFiniteNumber(pc) || h <= 0 || l <= 0 || pc <= 0 || h < l) continue;
    sum += Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
    count++;
  }
  if (count < minTr) return null;
  const close = slice[slice.length - 1]?.c;
  if (!isFiniteNumber(close) || close <= 0) return null;
  const v = sum / count / close;
  return isFiniteNumber(v) && v >= 0 ? v : null;
}

/**
 * Money rounding, half away from zero, sign-symmetric: roundHalfAway(−x) = −roundHalfAway(x).
 * Plain Math.round(n·10^d)/10^d rounds −2.345 to −2.34 but +2.345 to +2.35 (losses and gains
 * treated differently) and drops 1.005 to 1.00 through binary float error; a relative
 * Number.EPSILON nudge on |n| fixes the decimal-tie cases. Non-finite or bad digits ⇒ null
 * (never a silent 0 that would look like a real flat result).
 */
export function roundHalfAway(n, digits = 2) {
  if (!isFiniteNumber(n) || !Number.isInteger(digits) || digits < 0 || digits > 10) return null;
  const f = 10 ** digits;
  const a = Math.abs(n);
  // beyond 2^52 every representable double at this scale is already an integer step: leave as is
  if (a * f >= 2 ** 52) return n;
  const r = Math.round(a * f * (1 + Number.EPSILON)) / f;
  const out = n < 0 ? -r : r;
  return Object.is(out, -0) ? 0 : out;
}

/**
 * Realized P&L of a sell: (sellPrice − avgCost) × qty, in the book's currency.
 * Domain: sellPrice finite & > 0, avgCost finite & > 0, qty finite & > 0; else null so the
 * caller refuses the fill instead of booking a fake 0. Invariants: sign = sign(sellPrice − avgCost);
 * linear in qty (selling q1 then q2 at one price = selling q1+q2); scales with price units;
 * proceeds − cost basis identity: sellPrice·qty − avgCost·qty.
 */
export function realizedPnl(sellPrice, avgCost, qty) {
  if (!isFiniteNumber(sellPrice) || !isFiniteNumber(avgCost) || !isFiniteNumber(qty)) return null;
  if (!(sellPrice > 0) || !(avgCost > 0) || !(qty > 0)) return null;
  const r = (sellPrice - avgCost) * qty;
  return isFiniteNumber(r) ? r : null;
}

/**
 * Observed traded volume: finite and > 0, else null. Yahoo leaves the newest session's volume
 * null/0 for indices (^TWII meta regularMarketVolume = 0) until it backfills; `v || 0` turned
 * that into a fake "zero volume" day. A liquid index or screened stock never truly trades 0,
 * so 0 is treated as missing, never as data.
 */
export function observedVolume(v) {
  return isFiniteNumber(v) && v > 0 ? v : null;
}

/**
 * Last-bar volume ratio vs the mean of the OBSERVED bars among the prior `window` bars.
 * Domain: last bar must be observed and ≥ minLen prior bars observed; else ratio null (a gap,
 * not a 0 that reads as "dead volume" and not an inflated ratio from zero-filled priors).
 * When every bar is observed this equals the legacy volumeRatio(v[n−1], mean(v[n−21..n−2])).
 * @returns {{ lastVol: number|null, avgVol: number|null, ratio: number|null, observedPrior: number }}
 */
export function volumeRatioObserved(vols, { window = 20, minLen = 10 } = {}) {
  if (!Array.isArray(vols) || vols.length < 2 || !Number.isInteger(window) || window < 1) {
    return { lastVol: null, avgVol: null, ratio: null, observedPrior: 0 };
  }
  const lastVol = observedVolume(vols[vols.length - 1]);
  const prior = vols.slice(-(window + 1), -1).map(observedVolume).filter((v) => v != null);
  const avgVol = avgVolume(prior, { minLen });
  const ratio = lastVol == null ? null : volumeRatio(lastVol, avgVol);
  return { lastVol, avgVol, ratio, observedPrior: prior.length };
}

/**
 * Wilder RSI (0–100) over the whole close series: seed = simple mean of the first `period`
 * up/down moves, then Wilder smoothing avg ← (avg·(period−1) + move) / period.
 * Written as 100·G/(G+L), algebraically identical to 100 − 100/(1 + G/L) when L > 0 and to the
 * legacy 100 when L = 0 < G; numerically stabler (no G/L blow-up).
 * Domain: every close finite and > 0, length ≥ period + 2 (legacy run-strategies bound).
 * G = L = 0 (perfectly flat series) is 0/0 — undefined, so null (no signal), not a fake 100.
 * @returns {number|null}
 */
export function rsiWilder(closes, period = 14) {
  if (!Array.isArray(closes) || !Number.isInteger(period) || period < 1) return null;
  if (closes.length < period + 2) return null;
  for (const c of closes) if (!(isFiniteNumber(c) && c > 0)) return null;
  let g = 0;
  let l = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) g += d;
    else l -= d;
  }
  g /= period;
  l /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    g = (g * (period - 1) + (d > 0 ? d : 0)) / period;
    l = (l * (period - 1) + (d < 0 ? -d : 0)) / period;
  }
  const den = g + l;
  if (!(den > 0)) return null;
  return finiteOrNull((100 * g) / den);
}

/** RSI today and yesterday (series without the last close). Legacy bound: length ≥ period + 3. */
export function rsiLast2(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length < period + 3) return { prev: null, cur: null };
  return { prev: rsiWilder(closes.slice(0, -1), period), cur: rsiWilder(closes, period) };
}

/** Last-bar volume ÷ previous-bar volume; both must be observed (> 0), else null — never a fake 0. */
export function volumeRatioVsPrev(lastVol, prevVol) {
  const a = observedVolume(lastVol);
  const b = observedVolume(prevVol);
  if (a == null || b == null) return null;
  return volumeRatio(a, b);
}

/**
 * Price-return % for positive prices: (to − from) / from × 100.
 * Stricter than pctChange: prices must be finite and > 0 (a 0 / negative base is a data gap, not a return).
 */
export function pricePct(from, to) {
  if (!(isFiniteNumber(from) && from > 0 && isFiniteNumber(to) && to > 0)) return null;
  return pctChange(from, to);
}

/** Intraday range % of previous close: (high − low) / prevClose × 100. Needs high ≥ low > 0, prevClose > 0. */
export function rangePct(high, low, prevClose) {
  if (!(isFiniteNumber(high) && isFiniteNumber(low) && isFiniteNumber(prevClose))) return null;
  if (!(low > 0 && high >= low && prevClose > 0)) return null;
  return ((high - low) / prevClose) * 100;
}

/** Spread of moving averages as % of their mean: (max − min) / mean × 100. Every value finite and > 0. */
export function smaSpreadPct(vals) {
  if (!Array.isArray(vals) || vals.length < 2) return null;
  for (const v of vals) if (!(isFiniteNumber(v) && v > 0)) return null;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return ((Math.max(...vals) - Math.min(...vals)) / mean) * 100;
}

/**
 * Price-shape metrics used by the TW screener (extracted from run-strategies techMetrics, 2026-10-21).
 * Units: every *Pct / roc10 is percentage points. Windows: "prior N" excludes today; high20 includes today.
 * Any non-finite / non-positive input in a window ⇒ that metric is null (never NaN, never a fake breakout).
 * @param {{h:number,l:number,c:number}[]} bars oldest → newest
 * @param {{s5:number|null,s10:number|null,s20:number|null}} smas
 */
export function priceShapeMetrics(bars, { s5 = null, s10 = null, s20 = null } = {}) {
  const empty = {
    fiveDayHigh: null, is5dHigh: false, ampPct: null, pct5d: null, dayPct: null, high20: null,
    is20dHigh: false, distHigh20Pct: null, roc10: null, smaSpreadPct: null, aboveMaxSma: false,
  };
  if (!Array.isArray(bars) || bars.length < 2) return empty;
  const closes = bars.map((b) => b?.c);
  const highs = bars.map((b) => b?.h);
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const n = bars.length;
  const posPrice = (x) => isFiniteNumber(x) && x > 0;
  const fiveDayHigh = n >= 6 ? peakInWindow(highs.slice(0, -1), 5) : null;
  const lastOk = posPrice(last?.c) && posPrice(last?.h);
  const is5dHigh = fiveDayHigh != null && lastOk && (last.h >= fiveDayHigh || last.c >= fiveDayHigh);
  const high20 = n >= 20 ? peakInWindow(highs, 20) : null;
  const prior20 = n >= 21 ? peakInWindow(highs.slice(0, -1), 20) : null;
  const is20dHigh = prior20 != null && lastOk && (last.h >= prior20 || last.c >= prior20);
  const smaVals = [s5, s10, s20];
  const smaOk = smaVals.every(posPrice);
  return {
    fiveDayHigh,
    is5dHigh,
    ampPct: rangePct(last?.h, last?.l, prev?.c),
    pct5d: n >= 6 ? pricePct(closes[n - 6], last?.c) : null,
    dayPct: pricePct(prev?.c, last?.c),
    high20,
    is20dHigh,
    distHigh20Pct: high20 != null && high20 > 0 ? pricePct(high20, last?.c) : null,
    roc10: n >= 11 ? pricePct(closes[n - 11], last?.c) : null,
    smaSpreadPct: smaOk ? smaSpreadPct(smaVals) : null,
    aboveMaxSma: smaOk && posPrice(last?.c) && last.c >= Math.max(...smaVals),
  };
}

/**
 * Paper-book position size in shares (extracted from paper-trade sizeShares, 2026-10-22).
 *   riskShares = floor(equity·riskPct / (price·stopPct)), stopPct widened when volRatio ≥ volRatioHigh
 *   capShares  = floor((equity·maxPosPct − existingQty·price) / price)   (0 if no room left)
 *   shares     = min(riskShares, capShares) rounded DOWN to a whole lot, then the largest whole-lot
 *                count k ≤ shares with k·price ≤ cash + 1e-9 (same tolerance as the fill check).
 * Domain: price, equity finite > 0; cash finite ≥ 0; existingQty finite ≥ 0 (null/undefined ⇒ 0);
 * lotSize integer ≥ 1. Anything else ⇒ 0 (no order), never NaN — a NaN qty used to pass
 * `qty <= 0` and let buyFill turn cash into NaN (then roundMoney wrote 0).
 * Non-finite volRatio counts as "not high" (legacy treated +Infinity as high; junk-only difference).
 * Invariants: result is a non-negative multiple of lotSize; result·price ≤ cash + 1e-9;
 * (existing + result)·price ≤ equity·maxPosPct; monotone: more cash never yields fewer shares.
 */
export function positionSizeShares({
  lotSize = 1, price, equity, cash, volRatio = null, existingQty = 0,
  riskPct = 0.01, maxPosPct = 0.08, stopPct = 0.015, stopPctHighVol = 0.025, volRatioHigh = 3,
} = {}) {
  if (!Number.isInteger(lotSize) || lotSize < 1) return 0;
  if (!(isFiniteNumber(price) && price > 0 && isFiniteNumber(equity) && equity > 0)) return 0;
  if (!(isFiniteNumber(cash) && cash >= 0)) return 0;
  const held = existingQty == null ? 0 : existingQty;
  if (!(isFiniteNumber(held) && held >= 0)) return 0;
  for (const k of [riskPct, maxPosPct, stopPct, stopPctHighVol]) if (!(isFiniteNumber(k) && k > 0)) return 0;
  const high = isFiniteNumber(volRatio) && volRatio >= volRatioHigh;
  const dist = price * (high ? stopPctHighVol : stopPct);
  if (!(dist > 0)) return 0;
  let shares = Math.floor((equity * riskPct) / dist);
  const room = equity * maxPosPct - held * price;
  if (!(room > 0)) return 0;
  shares = Math.min(shares, Math.floor(room / price));
  shares = Math.floor(shares / lotSize) * lotSize;
  if (!(shares >= lotSize)) return 0;
  const lim = cash + 1e-9;
  if (shares * price > lim) {
    // largest whole-lot k ≤ shares with k·price ≤ lim; start from the closed form, then fix float edges
    let k = Math.min(shares, Math.floor(Math.floor(lim / price) / lotSize) * lotSize);
    while (k + lotSize <= shares && (k + lotSize) * price <= lim) k += lotSize;
    while (k >= lotSize && k * price > lim) k -= lotSize;
    shares = k;
  }
  return Number.isInteger(shares) && shares >= lotSize ? shares : 0;
}

/**
 * Unrealized fractional return of a position: (mark − avgCost) / avgCost.
 * Both finite & > 0, else null (caller then takes no return-based stop / take-profit action,
 * same as the legacy `avgCost falsy ⇒ 0` and NaN-compares-false paths).
 */
export function unrealizedReturn(mark, avgCost) {
  if (!(isFiniteNumber(mark) && mark > 0 && isFiniteNumber(avgCost) && avgCost > 0)) return null;
  return (mark - avgCost) / avgCost;
}

/**
 * Take-profit sell quantity: half the position rounded DOWN to whole lots; a position of
 * ≤ 1 lot, or one whose half rounds below 1 lot, is sold in full.
 * Domain: qty a positive integer, lotSize integer ≥ 1, else null (no sale).
 * Invariants: lotSize | result or result = qty; 0 < result ≤ qty; result ≤ qty/2 unless sold in full.
 */
export function takeProfitQty(qty, lotSize = 1) {
  if (!Number.isInteger(lotSize) || lotSize < 1) return null;
  if (!(Number.isInteger(qty) && qty > 0)) return null;
  if (qty <= lotSize) return qty;
  const half = Math.floor(qty / 2 / lotSize) * lotSize;
  return half < lotSize ? qty : half;
}

/**
 * Mark-to-market value of a paper book: positionsValue = Σ qty·mark, equity = cash + positionsValue.
 * Domain: cash finite; each position qty finite ≥ 0 and mark finite ≥ 0. Any junk ⇒ null so the
 * caller refuses to write a book instead of publishing NaN (which the old roundMoney turned into 0).
 * Unrounded; the caller rounds once for display. Identity (no fees): equity − startCash =
 * realized + Σ (mark − avgCost)·qty whenever cash = startCash + realized − Σ avgCost·qty.
 */
export function bookMarkValue(positions, cash) {
  if (!isFiniteNumber(cash)) return null;
  let pv = 0;
  for (const p of positions || []) {
    if (!p || !isFiniteNumber(p.qty) || !isFiniteNumber(p.mark) || p.qty < 0 || p.mark < 0) return null;
    pv += p.qty * p.mark;
  }
  const equity = cash + pv;
  return isFiniteNumber(pv) && isFiniteNumber(equity) ? { positionsValue: pv, equity } : null;
}

/** Unrealized P&L of one position: (mark − avgCost)·qty; null on non-finite/negative inputs or avgCost ≤ 0. */
export function unrealizedPnlOf(mark, avgCost, qty) {
  if (!isFiniteNumber(mark) || !isFiniteNumber(avgCost) || !isFiniteNumber(qty)) return null;
  if (mark < 0 || !(avgCost > 0) || qty < 0) return null;
  const r = (mark - avgCost) * qty;
  return isFiniteNumber(r) ? r : null;
}

/** Calendar shift of a YYYY-MM-DD date by whole days in UTC (no DST); invalid ⇒ null. */
export function addDaysYmdUtc(ymd, days) {
  if (typeof ymd !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(ymd) || !Number.isInteger(days)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  const t0 = Date.UTC(y, m - 1, d);
  const chk = new Date(t0);
  if (chk.getUTCFullYear() !== y || chk.getUTCMonth() !== m - 1 || chk.getUTCDate() !== d) return null;
  const dt = new Date(t0 + days * 86400000);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Trailing-window performance of a daily equity series sorted by date.
 * base = the latest snapshot dated ≤ (last.date − days); if none, the first snapshot
 * ("成立以來", since inception). pnl = last − base; pct = (last/base − 1)·100, 0 when base equity
 * is 0 (legacy). Rounded half-away to 2 / 4 dp. Empty series ⇒ zero row (legacy).
 * Junk (unsorted/duplicate dates, bad date, non-finite equity) ⇒ null so nothing fake is published.
 */
export function windowPerformance(series, days) {
  if (!Array.isArray(series) || !Number.isInteger(days) || days <= 0) return null;
  if (!series.length) return { pct: 0, pnl: 0, label: "成立以來", sinceInception: true, days };
  for (let i = 0; i < series.length; i++) {
    const s = series[i];
    if (!s || addDaysYmdUtc(s.date, 0) == null || !isFiniteNumber(s.equity)) return null;
    if (i && !(series[i - 1].date < s.date)) return null;
  }
  const last = series[series.length - 1];
  const target = addDaysYmdUtc(last.date, -days);
  let base = series[0];
  let found = false;
  for (const s of series) {
    if (s.date <= target) { base = s; found = true; }
  }
  const sinceInception = !found || series[0].date > target;
  const pnl = roundHalfAway(last.equity - base.equity, 2);
  const pct = base.equity ? roundHalfAway((last.equity / base.equity - 1) * 100, 4) : 0;
  if (pnl == null || pct == null) return null;
  return { pct, pnl, label: sinceInception ? "成立以來" : `${days}日`, sinceInception, days, fromDate: base.date, toDate: last.date };
}

// ── Regime inputs moved out of market-regime / daily-scan (2026-10-26) ──

/**
 * "Prior 10-day drawdown" exactly as the regime has always published it: over the `lookback`
 * closes *before* the last bar, min/max − 1 (fraction, ≤ 0). NOTE: this is order-blind — it is the
 * range ratio, so a rally (low first, high later) also reads negative. It is ≤ the true
 * peak-to-later-trough drawdown (peakToTroughDrawdown) and equal when the max comes before the min.
 * Domain: ≥ lookback+1 closes, every close in the window finite and > 0; otherwise null
 * (legacy turned a 0/negative close into −100% or worse, and coerced numeric strings).
 */
export function priorWindowDrawdown(closes, lookback = 10) {
  if (!Array.isArray(closes) || !Number.isInteger(lookback) || lookback < 1 || closes.length < lookback + 1) return null;
  const w = closes.slice(-(lookback + 1), -1);
  let hi = -Infinity;
  let lo = Infinity;
  for (const c of w) {
    if (!isFiniteNumber(c) || !(c > 0)) return null;
    if (c > hi) hi = c;
    if (c < lo) lo = c;
  }
  const v = lo / hi - 1;
  return isFiniteNumber(v) ? v : null;
}

/** True max drawdown of a positive series: min over i ≤ j of x_j / max(x_0..x_i) − 1 (≤ 0); junk/empty ⇒ null. */
export function peakToTroughDrawdown(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  let peak = -Infinity;
  let dd = 0;
  for (const x of arr) {
    if (!isFiniteNumber(x) || !(x > 0)) return null;
    if (x > peak) peak = x;
    const d = x / peak - 1;
    if (d < dd) dd = d;
  }
  return dd;
}

/**
 * Is `value` in the bottom quartile of `series`? Empirical rule kept from the regime code:
 * q = sorted[floor(n·q)] (lower order statistic), flag = value ≤ q. n < minLen ⇒ null.
 * Any non-finite series entry or value ⇒ null (legacy sorted NaN arbitrarily).
 */
export function bottomQuantileFlag(value, series, { q = 0.25, minLen = 40 } = {}) {
  if (!isFiniteNumber(value) || !Array.isArray(series) || series.length < minLen || series.length === 0) return null;
  if (!(q >= 0 && q < 1)) return null;
  for (const x of series) if (!isFiniteNumber(x)) return null;
  const sorted = [...series].sort((a, b) => a - b);
  return value <= sorted[Math.floor(sorted.length * q)];
}

/**
 * ATR%(20) bottom-quartile flag vs the trailing ~252 sessions (Marks M5 "compressed vol near highs").
 * Same rule as the legacy inline loop: when bars ≥ minBars, collect atrPct over every end index
 * i ∈ [max(firstIdx, n − lookback), n − 1] (includes today), need ≥ minSeries values and today's ATR.
 * Returns { flag, gap, count }: bars < minBars ⇒ { null, false, 0 } (legacy pushed no gap there);
 * not enough ATR history ⇒ { null, true }. count = number of ATR values in the comparison window.
 */
export function atrBottomQuartile(bars, { window = 20, minTr = 10, lookback = 252, firstIdx = 21, minBars = 60, minSeries = 40 } = {}) {
  if (!Array.isArray(bars) || bars.length < minBars) return { flag: null, gap: false, count: 0 };
  const series = [];
  for (let i = Math.max(firstIdx, bars.length - lookback); i < bars.length; i++) {
    // atrPct only reads the last window+1 bars, so a bounded slice = legacy bars.slice(0, i + 1)
    const a = atrPct(bars.slice(Math.max(0, i - window), i + 1), { window, minTr });
    if (a != null) series.push(a);
  }
  const today = atrPct(bars, { window, minTr });
  const flag = today != null && series.length >= minSeries ? bottomQuantileFlag(today, series, { q: 0.25, minLen: minSeries }) : null;
  return flag == null ? { flag: null, gap: true, count: series.length } : { flag, gap: false, count: series.length };
}

/** Share of items whose `key` is exactly true (market breadth). Empty ⇒ null; non-boolean flag ⇒ null (no guess). */
export function breadthShare(items, key = "above50") {
  if (!Array.isArray(items) || items.length === 0) return null;
  let k = 0;
  for (const m of items) {
    const v = m?.[key];
    if (typeof v !== "boolean") return null;
    if (v) k++;
  }
  return k / items.length;
}

/**
 * Change of the last close vs the close `days` bars earlier (null/undefined closes are dropped first,
 * as before). mode "diff": b − a (yield points); mode "ret": b/a − 1 (fraction, needs a > 0).
 * Non-number endpoints ⇒ { value: null, gap: true } (legacy coerced strings and leaked NaN with gap:false).
 */
export function lagChange(closes, days, mode = "diff") {
  if (!Array.isArray(closes) || !Number.isInteger(days) || days < 1) return { value: null, gap: true };
  const xs = closes.filter((c) => c != null);
  if (xs.length < days + 1) return { value: null, gap: true };
  const a = xs[xs.length - 1 - days];
  const b = xs[xs.length - 1];
  if (!isFiniteNumber(a) || !isFiniteNumber(b)) return { value: null, gap: true };
  if (mode === "diff") return { value: b - a, gap: false };
  if (mode === "ret") {
    if (!(a > 0)) return { value: null, gap: true };
    const v = b / a - 1;
    return isFiniteNumber(v) ? { value: v, gap: false } : { value: null, gap: true };
  }
  return { value: null, gap: true };
}

// ── TW fundamental growth math moved out of tw-fundamentals / master-strategies / run-strategies (2026-10-27) ──

/**
 * Sign-aware relative growth (cur − prev) / |prev| (fraction). Used for annual revenue / pretax YoY,
 * single-quarter EPS QoQ, ROE block growth and margin YoY. |prev| must be strictly > minAbsPrev
 * (legacy: 1e-9 for EPS/ROE/margins, 0 for annual revenue/pretax); requirePositivePrev demands prev > 0
 * (annual revenue). Non-number or non-finite endpoints ⇒ null (legacy coerced numeric strings and
 * leaked NaN into averages). NOTE: from a negative base the sign is "improvement": −100 → +50 is +1.5.
 */
export function signedGrowth(cur, prev, { minAbsPrev = 1e-9, requirePositivePrev = false } = {}) {
  if (!isFiniteNumber(cur) || !isFiniteNumber(prev)) return null;
  if (!(minAbsPrev >= 0)) return null;
  if (requirePositivePrev && !(prev > 0)) return null;
  const d = Math.abs(prev);
  if (!(d > minAbsPrev)) return null;
  const g = (cur - prev) / d;
  return isFiniteNumber(g) ? g : null;
}

/** Arithmetic mean, summed left to right from 0 (legacy order). Empty / non-array / any non-finite entry ⇒ null. */
export function meanOrNull(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  let s = 0;
  for (const x of values) {
    if (!isFiniteNumber(x)) return null;
    s += x;
  }
  const m = s / values.length;
  return isFiniteNumber(m) ? m : null;
}

/** Sum of the last n values (left to right from 0). Fewer than n values, bad n, or a non-finite value in the window ⇒ null. */
export function trailingSum(values, n) {
  if (!Array.isArray(values) || !Number.isInteger(n) || n <= 0 || values.length < n) return null;
  let s = 0;
  for (const x of values.slice(-n)) {
    if (!isFiniteNumber(x)) return null;
    s += x;
  }
  return isFiniteNumber(s) ? s : null;
}

/**
 * Consecutive growth streak counted from the latest value backwards: number of i (from the end) with
 * signedGrowth(values[i], values[i−1]) > minG; stops at the first failure or undefined growth
 * (|prev| ≤ minAbsPrev or junk). Bad input ⇒ 0 (legacy returned 0 for no data).
 */
export function growthStreak(values, minG, { minAbsPrev = 1e-9 } = {}) {
  if (!Array.isArray(values) || !isFiniteNumber(minG)) return 0;
  let streak = 0;
  for (let i = values.length - 1; i >= 1; i--) {
    const g = signedGrowth(values[i], values[i - 1], { minAbsPrev });
    if (g != null && g > minG) streak++;
    else break;
  }
  return streak;
}

/**
 * Block growth: with ≥ 2·block values, signedGrowth(sum of last block, sum of the block before);
 * else with ≥ 2 values, signedGrowth(last, previous); else null. (ROE: last 4Q vs prior 4Q.)
 */
export function blockGrowth(values, block = 4, { minAbsPrev = 1e-9 } = {}) {
  if (!Array.isArray(values) || !Number.isInteger(block) || block <= 0) return null;
  if (values.length >= 2 * block) {
    const a = trailingSum(values, block);
    const b = trailingSum(values.slice(0, -block), block);
    return a == null || b == null ? null : signedGrowth(a, b, { minAbsPrev });
  }
  if (values.length >= 2) return signedGrowth(values[values.length - 1], values[values.length - 2], { minAbsPrev });
  return null;
}

/**
 * Gooaye pack technical snapshot from daily bars (oldest → newest), 2026-10-28. Same arithmetic and
 * evaluation order as the legacy gooaye-strategies techFromBars, so finite published-precision inputs give
 * bit-identical values: SMA20/50/200 of closes (left-to-right sum / n; SMA200 only with ≥ 200 bars),
 * volRatio = last volume / SMA20 of volume (SMA ≤ 0 ⇒ null), dayPct / pct5d / pct1m = (last − ref)/ref × 100
 * with ref = close 1 / 5 / 21 bars back (ref 0 or junk ⇒ null), avgVol5 = SMA5 of volume, above* = last close >
 * SMA (null when either side is missing). Fewer than minBars bars or non-array ⇒ null. Guards added: non-finite
 * or non-number closes/volumes never leak NaN/±Infinity (legacy: NaN close ⇒ NaN pct, string close coerced,
 * overflow ⇒ Infinity); every numeric output is finite or null.
 */
export function techSnapshotFromBars(bars, { minBars = 60 } = {}) {
  if (!Array.isArray(bars) || bars.length < minBars || bars.length < 2) return null;
  const closes = bars.map((b) => b?.c);
  const vols = bars.map((b) => b?.v);
  const n = bars.length;
  const lastC = closes[n - 1];
  const lastV = vols[n - 1];
  const sma20 = finiteOrNull(sma(closes, 20));
  const sma50 = finiteOrNull(sma(closes, 50));
  const sma200 = n >= 200 ? finiteOrNull(sma(closes, 200)) : null;
  const avgVol20 = finiteOrNull(sma(vols, 20));
  const volRatio = avgVol20 != null && avgVol20 > 0 && isFiniteNumber(lastV) ? finiteOrNull(lastV / avgVol20) : null;
  const back = (k) => (n >= k + 1 ? closes[n - 1 - k] : null);
  const pctBack = (k) => {
    const ref = back(k);
    return isFiniteNumber(ref) && ref !== 0 ? finiteOrNull(pctChange(ref, lastC)) : null;
  };
  const above = (s) => (s != null && isFiniteNumber(lastC) ? lastC > s : null);
  return {
    price: finiteOrNull(lastC),
    dayPct: pctBack(1),
    pct5d: pctBack(5),
    pct1m: pctBack(21),
    sma20,
    sma50,
    sma200,
    volRatio,
    avgVol5: finiteOrNull(sma(vols, 5)),
    aboveSma20: above(sma20),
    aboveSma50: above(sma50),
    aboveSma200: above(sma200),
  };
}

/**
 * Regime-aware ranking dial + screen gates (moved from market-regime scoreAdjust / passesScreenA /
 * listSizeForStance and daily-scan screensFor, 2026-10-29). Same branch order and the same left-to-right
 * additions as the legacy code, so on the pipeline's real domain (metric fields number|null from round(),
 * flags boolean, finite base score) every score, note, gate and tag is bit-identical.
 * Field view: numbers (incl. ±Infinity, NaN) pass through unchanged; null/undefined ⇒ null; any other type
 * (string, boolean, object) ⇒ null — legacy coerced "9" ≥ 8 to true. dayPct keeps the legacy distinction:
 * null ⇒ RS = −index (legacy quirk, kept for bit-identity and flagged), undefined/junk ⇒ RS NaN (never passes).
 * Index day % : null/undefined ⇒ 0 (legacy `?? 0`); a non-number ⇒ NaN (legacy coerced strings).
 * Guards added: base score not a finite number ⇒ −1e9 (baseRankingScore's own junk sentinel) instead of
 * NaN/±Infinity reaching the sort; m not an object ⇒ −1e9 / gate false / tags ["observe"] (legacy threw).
 */
const STANCE_SCORE_JUNK = -1e9;
function regimeFieldView(m) {
  const num = (v) => (typeof v === "number" ? v : null);
  const d = m.dayPct;
  return {
    dayPct: typeof d === "number" || d === null ? d : undefined,
    d5Pct: num(m.d5Pct),
    d1mPct: num(m.d1mPct),
    volRatio: num(m.volRatio),
    above20: !!m.above20,
    above50: !!m.above50,
    above200: !!m.above200,
  };
}
function indexDayView(indexDayPct) {
  if (indexDayPct == null) return 0;
  return typeof indexDayPct === "number" ? indexDayPct : NaN;
}

export function regimeScoreAdjust(baseScore, m, regime) {
  if (!isFiniteNumber(baseScore)) return { score: STANCE_SCORE_JUNK, regimeNote: null };
  if (!regime?.cycleStance) return { score: baseScore, regimeNote: null };
  if (m === null || typeof m !== "object") return { score: STANCE_SCORE_JUNK, regimeNote: null };
  const x = regimeFieldView(m);
  const stance = regime.cycleStance;
  let score = baseScore;
  let regimeNote = null;
  if (stance === "defensive" || stance === "selective") {
    if (x.above20 && x.above50) score += 1.2;
    else score -= 1.5;
    if (x.d1mPct != null && x.d1mPct >= 8 && x.volRatio != null && x.volRatio < 0.8) {
      score -= 2.5;
      regimeNote = "週期偏熱：量能不足的高 RS 降權";
    }
    if (x.volRatio != null && x.volRatio < 0.7 && (x.dayPct ?? 0) > 2) {
      score -= 1.2;
      regimeNote = regimeNote || "週期偏熱：縮量上漲降權";
    }
    if (!regimeNote) regimeNote = "週期偏防禦：提高雙均線／品質門檻";
  } else if (stance === "aggressive" || stance === "constructive") {
    if ((x.d1mPct ?? 0) < 0 && x.volRatio != null && x.volRatio >= 1.5 && x.above200) {
      score += 2.2;
      regimeNote = "週期偏積極：價弱量增（firm-hands）加權";
    }
    if (x.volRatio != null && x.volRatio >= 1.1 && (x.dayPct ?? 0) > 0) {
      score += 1.0;
      regimeNote = regimeNote || "週期偏積極：早段放量相對強度加權";
    }
    if (!x.above50 && x.above200) {
      score += 0.6;
      regimeNote = regimeNote || "週期偏積極：允許站上 SMA200 但低於 SMA50";
    }
    if (!regimeNote) regimeNote = "週期偏積極：放寬進場節奏";
  } else if (stance === "stabilize_first") {
    score -= 3;
    if (x.above20) score += 1.5;
    else score -= 2;
    regimeNote = "恐慌相位：先穩定再加碼，觀察權重";
  }
  return { score, regimeNote };
}

export function screenAPass(m, indexDayPct, regime) {
  if (m === null || typeof m !== "object") return false;
  const x = regimeFieldView(m);
  const rs = x.dayPct - indexDayView(indexDayPct);
  const stance = regime?.cycleStance;
  if (stance === "stabilize_first") {
    return !!x.above20 && (rs >= 1.0 || (x.volRatio ?? 0) >= 1.5);
  }
  if (stance === "defensive") {
    const strong =
      x.above20 && x.above50 && (rs >= 0.8 || (x.d5Pct ?? 0) >= 4) && (x.volRatio == null || x.volRatio >= 1.0);
    if (strong && (x.d1mPct ?? 0) >= 12 && x.volRatio != null && x.volRatio < 0.8) return false;
    return strong;
  }
  if (stance === "selective") {
    return x.above50 && (rs >= 0.5 || (x.d5Pct ?? 0) >= 3 || ((x.d1mPct ?? 0) >= 6 && x.above20));
  }
  if (stance === "aggressive" || stance === "constructive") {
    const early =
      rs >= 0.3 ||
      x.dayPct >= 1.0 ||
      (x.d5Pct ?? 0) >= 2 ||
      ((x.d1mPct ?? 0) >= 4 && x.above20) ||
      (x.above200 && (x.volRatio ?? 0) >= 1.4 && (x.d1mPct ?? 0) < 0);
    if (stance === "constructive") return early && (x.above20 || x.above200);
    return early && (x.above200 || x.above20 || (x.volRatio ?? 0) >= 1.3);
  }
  const strongDay = rs >= 0.5 || x.dayPct >= 1.5;
  const mom5 = (x.d5Pct ?? 0) >= 3;
  const mom1m = (x.d1mPct ?? 0) >= 6 && x.above20;
  const aboveBoth = x.above20 && x.above50 && ((x.d5Pct ?? 0) >= 0 || rs >= 0);
  return strongDay || mom5 || mom1m || aboveBoth;
}

/** Screen B volume floor by stance (defensive 1.0, aggressive 1.1, else 1.2). */
export function screenBVolFloor(stance) {
  return stance === "defensive" ? 1.0 : stance === "aggressive" ? 1.1 : 1.2;
}

export function screenTags(m, indexDayPct, { forceObserve = false, regime = null } = {}) {
  if (forceObserve) return ["observe"];
  if (m === null || typeof m !== "object") return ["observe"];
  const x = regimeFieldView(m);
  const s = [];
  if (screenAPass(m, indexDayPct, regime)) s.push("A");
  if (x.volRatio != null && x.volRatio >= screenBVolFloor(regime?.cycleStance)) s.push("B");
  if (!s.includes("A") && (x.d1mPct ?? 0) >= 8 && x.above20 && x.above50 && regime?.cycleStance !== "stabilize_first") {
    s.push("A");
  }
  if (!s.length) s.push("observe");
  return s;
}

/** Shortlist size by stance (legacy listSizeForStance, default 12). */
export function stanceListSize(stance, defaultN = 12) {
  if (stance === "defensive") return Math.max(6, Math.round(defaultN * 0.55));
  if (stance === "selective") return Math.max(8, Math.round(defaultN * 0.75));
  if (stance === "stabilize_first") return Math.max(5, Math.round(defaultN * 0.45));
  if (stance === "aggressive") return Math.min(14, defaultN + 2);
  return defaultN;
}

/**
 * Paper-trade exit rule chain (legacy paper-trade applySells, moved 2026-10-30).
 * First match wins, in this order (stop before take-profit):
 *   1 stop            ret ≤ stopLossRet                                  → sell all
 *   2 limit-up-chase  limitUpStyle, opened before today, dayPct ≤ chase  → sell all
 *   3 momentum-break  aboveSma20 === false and dayPct < momentumDayPct    → sell all
 *   4 off-list        not in today's list and (mark − avgCost)·qty < 0    → sell all
 *   5 take-profit     ret ≥ takeProfitRet                                → takeProfitQty (half, whole lots)
 * ret = unrealizedReturn(mark, avgCost), P&L = unrealizedPnlOf(mark, avgCost, qty) — the same helpers
 * the legacy code called, in the same order, so decisions are bit-identical on the pipeline domain
 * (qty positive integer, dayPct finite or missing, aboveSma20 boolean or missing, dates YYYY-MM-DD,
 * limitUpStyle boolean or missing). Junk: non-finite dayPct counts as missing (legacy let −Infinity
 * trigger a sale), non-boolean limitUpStyle/aboveSma20 count as false/unknown, qty must be a positive
 * integer (legacy returned an action that the sale then refused). Returns {reason, qty} or null.
 * Disjointness: rule 1 needs ret ≤ −3%, rule 5 ret ≥ +12%, rule 4 needs P&L < 0 (⇒ ret < 0), so
 * 4 and 5 never compete; the order only decides the label among the full-sell rules 1–4.
 */
export const PAPER_EXIT_RULES = Object.freeze({ stopLossRet: -0.03, takeProfitRet: 0.12, momentumDayPct: -2, limitUpChaseDrop: -5 });
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;
export function paperExitAction(
  { mark, avgCost, qty, dayPct = null, aboveSma20 = null, limitUpStyle = false, openedOn = null, date = null, inList = true, lotSize = 1 } = {},
  rules = PAPER_EXIT_RULES
) {
  if (!(Number.isInteger(qty) && qty > 0)) return null;
  const { stopLossRet, takeProfitRet, momentumDayPct, limitUpChaseDrop } = rules || {};
  const ret = unrealizedReturn(mark, avgCost);
  const day = isFiniteNumber(dayPct) ? dayPct : null;
  if (ret != null && ret <= stopLossRet) return { reason: "stop", qty };
  if (
    limitUpStyle === true &&
    typeof openedOn === "string" && YMD_RE.test(openedOn) &&
    typeof date === "string" && YMD_RE.test(date) &&
    openedOn < date &&
    day != null && day <= limitUpChaseDrop
  ) return { reason: "limit-up-chase", qty };
  if (aboveSma20 === false && day != null && day < momentumDayPct) return { reason: "momentum-break", qty };
  if (inList === false) {
    const u = unrealizedPnlOf(mark, avgCost, qty);
    if (u != null && u < 0) return { reason: "off-list", qty };
  }
  if (ret != null && ret >= takeProfitRet) {
    const q = takeProfitQty(qty, lotSize);
    return q == null ? null : { reason: "take-profit", qty: q };
  }
  return null;
}

/**
 * Buy-day limit-up style flag (legacy paper-trade isLimitUpStyle): dayPct ≥ threshold (default 9.5)
 * or the risk/why text mentions 漲停. Non-finite dayPct is ignored (legacy: +Infinity counted).
 */
export function limitUpStyleFlag(dayPct, text = "", threshold = 9.5) {
  if (isFiniteNumber(dayPct) && dayPct >= threshold) return true;
  return typeof text === "string" && text.includes("漲停");
}

/**
 * Add-on headroom (legacy applyBuys roomVal): equity·maxPosPct − qty·mark, same evaluation order.
 * Non-finite inputs / result ⇒ null (caller skips the add; legacy NaN fell through to sizing).
 */
export function addOnRoom(equity, maxPosPct, qty, mark) {
  if (!isFiniteNumber(equity) || !isFiniteNumber(maxPosPct) || !isFiniteNumber(qty) || !isFiniteNumber(mark)) return null;
  const r = equity * maxPosPct - qty * mark;
  return isFiniteNumber(r) ? r : null;
}
