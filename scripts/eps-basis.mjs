/**
 * EPS "same basis" guard for the 讀財報 digest.
 *
 * Problem this solves: a consensus EPS estimate is (almost always) an analyst-adjusted
 * figure. If the "actual" we show is the GAAP (accounting) EPS — e.g. Yahoo's GOOGL row
 * carried Alphabet's GAAP $2.12 against the adjusted $3.01 consensus — the beat/miss %
 * is apples vs oranges. Rules:
 *   1. Actual and estimate are always taken as ONE pair from ONE provider row
 *      (epsActualSource === epsEstimateSource). Never mix fields across providers.
 *   2. If the actual equals the GAAP diluted EPS and the gap to the estimate is large,
 *      the pair is suspect. Prefer another same-quarter pair (share-class sibling first,
 *      then Nasdaq/Zacks earnings-surprise) whose actual is NOT the GAAP figure.
 *      Otherwise keep the actual and drop the estimate (no beat/miss shown).
 *   3. Share-class siblings (GOOGL/GOOG) are one company: their pairs must agree.
 * Never invents numbers: every output value is copied from a fetched provider field.
 */

export const GAAP_MATCH_ABS = 0.005; // exact GAAP EPS (provider field, 2 dp): actual within half a cent ⇒ "is the GAAP figure"
export const GAAP_MATCH_REL_APPROX = 0.005; // GAAP EPS derived from net income ÷ diluted shares: within 0.5%
// |surprise| above this with a GAAP-equal actual ⇒ check basis. 25%: one-off items (GOOGL −29.5%, META −29.9%,
// AMZN +215%, UBER +41%) sit above it; genuine GAAP = adjusted beats like PLTR Q2 2026 ($0.41 both, +18.5%) stay below.
export const SUSPECT_SURPRISE_PCT = 25;
export const SIBLING_SURPRISE_TOL_PP = 0.5; // GOOGL vs GOOG surprise may differ by ≤ 0.5 percentage points
export const SHARE_CLASS_SIBLINGS = [["GOOGL", "GOOG"]];

export const SRC_YAHOO = "Yahoo earningsHistory (epsActual/epsEstimate)";
export const SRC_NASDAQ = "Nasdaq earnings-surprise (eps/consensusForecast, Zacks)";

function r(n, d) {
  if (n == null || !Number.isFinite(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

export function approxEq(a, b, rel = 0, abs = GAAP_MATCH_ABS) {
  if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= Math.max(abs, rel * Math.abs(b)) + 1e-9;
}

/** Is `eps` the GAAP figure? gaap = {value, approx} */
export function isGaapValue(eps, gaap) {
  if (!gaap || gaap.value == null) return false;
  return gaap.approx ? approxEq(eps, gaap.value, GAAP_MATCH_REL_APPROX, 0) : approxEq(eps, gaap.value);
}

export function surprisePct(actual, estimate) {
  if (actual == null || estimate == null || !Number.isFinite(actual) || !Number.isFinite(estimate) || estimate === 0) return null;
  return r(((actual - estimate) / Math.abs(estimate)) * 100, 2);
}

export function siblingOf(ticker) {
  for (const g of SHARE_CLASS_SIBLINGS) if (g.includes(ticker)) return g.filter((x) => x !== ticker);
  return [];
}

/** "2026-09-30" vs "Sep 2026" / "2026-09-xx" → same year-month */
export function sameQuarter(a, b) {
  const ym = (s) => {
    if (!s) return null;
    const m = String(s).match(/^(\d{4})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}`;
    const n = String(s).match(/^([A-Za-z]{3})\w*\s+(\d{4})$/);
    if (!n) return null;
    const mon = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(n[1].toLowerCase());
    return mon < 0 ? null : `${n[2]}-${String(mon + 1).padStart(2, "0")}`;
  };
  const x = ym(a);
  return x != null && x === ym(b);
}

/**
 * @param {object} p
 * @param {{quarter:string, epsActual:number|null, epsEstimate:number|null, period?:string, currency?:string}} p.primary  Yahoo pair
 * @param {{value:number|null, source:string|null}} [p.gaap]  GAAP diluted EPS for that quarter
 * @param {Array<{quarter:string, epsActual:number, epsEstimate:number, source:string, via?:string}>} [p.alts] other same-company pairs
 * @returns lastReport with basis fields
 */
export function resolveEpsPair({ primary, gaap = null, alts = [] }) {
  if (!primary) return null;
  const g = gaap?.value ?? null;
  const p = { ...primary, source: primary.source || SRC_YAHOO };
  const isGaap = isGaapValue(p.epsActual, gaap);
  // Shown GAAP EPS is always a provider value: the exact field, or (approx check) the actual that matched it.
  const shownGaap = g == null ? null : !gaap.approx ? r(g, 4) : isGaap ? p.epsActual : null;
  const base = {
    period: primary.period ?? null,
    quarter: primary.quarter ?? null,
    currency: primary.currency || "USD",
    epsGaap: shownGaap,
    epsGaapSource: shownGaap == null ? null : !gaap.approx ? gaap.source || null : `${p.source} (matches ${gaap.source})`,
    epsGaapCheck: g != null ? { value: r(g, 4), approx: !!gaap.approx, source: gaap.source || null } : null,
  };
  const out = (pair, basis, note, extra = {}) => ({
    ...base,
    epsActual: pair.epsActual ?? null,
    epsEstimate: pair.epsEstimate ?? null,
    epsSurprisePct: surprisePct(pair.epsActual, pair.epsEstimate),
    epsActualSource: pair.source,
    epsEstimateSource: pair.epsEstimate != null ? pair.source : null,
    epsBasis: basis,
    epsBasisNote: note,
    ...extra,
  });
  const pct = surprisePct(p.epsActual, p.epsEstimate);
  const suspect = isGaap && pct != null && Math.abs(pct) > SUSPECT_SURPRISE_PCT;
  if (!suspect) {
    const basis = g == null ? "provider-pair" : isGaap ? "provider-pair (equals GAAP)" : "adjusted";
    return out(p, basis, null);
  }
  const same = (alts || []).filter(
    (a) => a && sameQuarter(a.quarter, p.quarter) && Number.isFinite(a.epsActual) && Number.isFinite(a.epsEstimate)
  );
  // (a) a same-quarter pair whose actual is not the GAAP figure ⇒ adjusted-vs-adjusted
  const adj = same.find((a) => {
    const ap = surprisePct(a.epsActual, a.epsEstimate);
    return !isGaapValue(a.epsActual, gaap) && ap != null && Math.abs(ap) <= SUSPECT_SURPRISE_PCT;
  });
  if (adj) {
    return out(
      { epsActual: adj.epsActual, epsEstimate: adj.epsEstimate, source: adj.via ? `${adj.source} via ${adj.via}` : adj.source },
      "adjusted",
      `primary actual ${p.epsActual} equals GAAP diluted EPS; replaced by same-provider adjusted pair`,
      { replacedPair: { epsActual: p.epsActual, epsEstimate: p.epsEstimate, source: p.source } }
    );
  }
  // (b) No same-quarter non-GAAP pair. A second provider repeating the same GAAP actual does NOT prove
  //     the basis (Nasdaq/Zacks also carried GOOGL's GAAP 9.11 vs an adjusted 2.88), so we never "confirm".
  // (c) unresolved: keep the actual, drop the estimate (no apples-vs-oranges beat/miss)
  return {
    ...out({ epsActual: p.epsActual, epsEstimate: null, source: p.source }, "gaap-estimate-dropped",
      "actual equals GAAP diluted EPS but consensus is adjusted; no same-basis pair found"),
    droppedEstimate: { value: p.epsEstimate, source: p.source },
  };
}

/** Violations for the smoke guard. rows: digest rows (mag7 + watchlistHot). */
export function epsBasisViolations(rows) {
  const v = [];
  const byTicker = new Map();
  for (const row of rows || []) {
    const lr = row?.lastReport;
    if (!lr) continue;
    byTicker.set(row.ticker, row);
    if (lr.epsEstimate != null) {
      if (!lr.epsActualSource || lr.epsActualSource !== lr.epsEstimateSource) {
        v.push(`${row.ticker}: actual (${lr.epsActualSource}) and estimate (${lr.epsEstimateSource}) not from one source`);
      }
      if (lr.epsBasis === "gaap-estimate-dropped") v.push(`${row.ticker}: estimate present on a dropped-basis pair`);
      const pct = surprisePct(lr.epsActual, lr.epsEstimate);
      if (lr.epsSurprisePct != null && pct != null && Math.abs(pct - lr.epsSurprisePct) > 0.02) {
        v.push(`${row.ticker}: surprise ${lr.epsSurprisePct}% does not match its own pair (${pct}%)`);
      }
      if (
        (approxEq(lr.epsActual, lr.epsGaap) || isGaapValue(lr.epsActual, lr.epsGaapCheck)) &&
        pct != null &&
        Math.abs(pct) > SUSPECT_SURPRISE_PCT
      ) {
        v.push(`${row.ticker}: GAAP actual ${lr.epsActual} vs estimate ${lr.epsEstimate} (${pct}%) — unverified basis`);
      }
    }
  }
  for (const g of SHARE_CLASS_SIBLINGS) {
    const [a, b] = g.map((t) => byTicker.get(t)?.lastReport);
    if (!a || !b || !sameQuarter(a.quarter, b.quarter)) continue;
    if ((a.epsSurprisePct == null) !== (b.epsSurprisePct == null)) {
      v.push(`${g.join("/")}: one share class has a surprise %, the other not`);
    } else if (a.epsSurprisePct != null && Math.abs(a.epsSurprisePct - b.epsSurprisePct) > SIBLING_SURPRISE_TOL_PP) {
      v.push(`${g.join("/")}: surprise ${a.epsSurprisePct}% vs ${b.epsSurprisePct}% (same company, same quarter)`);
    }
    if (!approxEq(a.epsActual, b.epsActual)) v.push(`${g.join("/")}: actual EPS ${a.epsActual} vs ${b.epsActual}`);
  }
  return v;
}
