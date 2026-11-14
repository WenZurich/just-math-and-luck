/**
 * Olympiad-grade pure math for paper options + 台指期.
 * Zero tolerance: reject NaN/∞, wrong units, non-integer contracts, negative premiums.
 * Used by paper UI and verified by scripts/math-guards.mjs.
 *
 * US equity options: cash impact = premium × 100 × contracts (OCC standard multiplier).
 * TW TX/MTX: P&L TWD = pointsDelta × multiplierTwdPerPoint × contracts.
 * Multipliers (do not guess): TX NT$200/pt, MTX NT$50/pt — TAIFEX published contract constants
 * (see public/data/txf-desk.json / paper-txf.json sources: openapi.taifex.com.tw).
 */

export const US_OPTION_MULTIPLIER = 100;

/** Official TAIFEX published TWD-per-point multipliers. */
export const TXF_MULTIPLIERS = Object.freeze({
  TX: 200,
  MTX: 50,
  TMF: 10,
});

export function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

export function isPositiveInt(n) {
  return Number.isInteger(n) && n > 0;
}

/**
 * Call intrinsic = max(spot − strike, 0); put = max(strike − spot, 0).
 * @returns {number|null}
 */
export function optionIntrinsic(spot, strike, right) {
  if (!isFiniteNumber(spot) || !isFiniteNumber(strike)) return null;
  if (!(spot >= 0) || !(strike >= 0)) return null;
  const r = String(right || "").toLowerCase();
  if (r === "call" || r === "c") return Math.max(spot - strike, 0);
  if (r === "put" || r === "p") return Math.max(strike - spot, 0);
  return null;
}

/**
 * Extrinsic (time value) = premium − intrinsic. Rejects premium < 0.
 * @returns {number|null}
 */
export function optionExtrinsic(premium, spot, strike, right) {
  if (!isFiniteNumber(premium) || premium < 0) return null;
  const intr = optionIntrinsic(spot, strike, right);
  if (intr == null) return null;
  const ext = premium - intr;
  // Allow tiny float noise below zero → clamp to 0; large negative is data error
  if (!isFiniteNumber(ext)) return null;
  if (ext < -1e-9) return null;
  return Math.max(ext, 0);
}

/**
 * Cash debit (positive) or credit (negative) for opening/closing an option leg.
 * side: "buy" → debit premium×mult×qty; "sell" → credit −premium×mult×qty.
 * @returns {{ ok: true, cashDelta: number, notional: number } | { ok: false, error: string }}
 */
export function optionPremiumCashImpact({ side, premium, contracts, multiplier = US_OPTION_MULTIPLIER }) {
  if (side !== "buy" && side !== "sell") return { ok: false, error: "side must be buy|sell" };
  if (!isFiniteNumber(premium) || premium < 0) return { ok: false, error: "premium must be ≥ 0 finite" };
  if (!isPositiveInt(contracts)) return { ok: false, error: "contracts must be positive integer" };
  if (!isFiniteNumber(multiplier) || !(multiplier > 0)) return { ok: false, error: "multiplier must be > 0" };
  const notional = premium * multiplier * contracts;
  if (!isFiniteNumber(notional)) return { ok: false, error: "notional non-finite" };
  const cashDelta = side === "buy" ? -notional : notional;
  return { ok: true, cashDelta, notional };
}

/**
 * Mark-to-market value of a long option position (asset). Short is −long.
 * qty signed: +long / −short contracts.
 */
export function optionPositionMarkValue({ qty, markPremium, multiplier = US_OPTION_MULTIPLIER }) {
  if (!Number.isInteger(qty) || qty === 0) return null;
  if (!isFiniteNumber(markPremium) || markPremium < 0) return null;
  if (!isFiniteNumber(multiplier) || !(multiplier > 0)) return null;
  const v = qty * markPremium * multiplier;
  return isFiniteNumber(v) ? v : null;
}

/**
 * Unrealized P&L for option: (mark − avgPremium) × mult × qtySigned
 * qtySigned: + long, − short.
 */
export function optionUnrealizedPnl({ qtySigned, avgPremium, markPremium, multiplier = US_OPTION_MULTIPLIER }) {
  if (!Number.isInteger(qtySigned) || qtySigned === 0) return null;
  if (!isFiniteNumber(avgPremium) || avgPremium < 0) return null;
  if (!isFiniteNumber(markPremium) || markPremium < 0) return null;
  if (!isFiniteNumber(multiplier) || !(multiplier > 0)) return null;
  const pnl = (markPremium - avgPremium) * multiplier * qtySigned;
  return isFiniteNumber(pnl) ? pnl : null;
}

/**
 * Expiry settlement to intrinsic vs spot. Returns cash from closing at intrinsic.
 * Long call/put receives intrinsic×mult×|qty|; short pays it.
 */
export function optionExpirySettlement({ qtySigned, spot, strike, right, multiplier = US_OPTION_MULTIPLIER }) {
  const intr = optionIntrinsic(spot, strike, right);
  if (intr == null) return { ok: false, error: "bad intrinsic inputs" };
  if (!Number.isInteger(qtySigned) || qtySigned === 0) return { ok: false, error: "qtySigned must be non-zero int" };
  if (!isFiniteNumber(multiplier) || !(multiplier > 0)) return { ok: false, error: "bad multiplier" };
  const cashDelta = qtySigned * intr * multiplier;
  if (!isFiniteNumber(cashDelta)) return { ok: false, error: "cash non-finite" };
  return { ok: true, intrinsic: intr, cashDelta, settlePremium: intr };
}

/**
 * Resolve TX/MTX multiplier from code; never invent unknown codes.
 */
export function txfMultiplier(code) {
  const c = String(code || "").toUpperCase();
  if (Object.prototype.hasOwnProperty.call(TXF_MULTIPLIERS, c)) return TXF_MULTIPLIERS[c];
  return null;
}

/**
 * Futures P&L in TWD: pointsDelta × multiplier × contractsSigned.
 * contractsSigned: + long, − short. pointsDelta = mark − entry (or exit − entry).
 * Identity: long profits when mark rises; short when mark falls.
 */
export function futuresPnlTwd({ pointsDelta, multiplier, contractsSigned }) {
  if (!isFiniteNumber(pointsDelta)) return null;
  if (!isFiniteNumber(multiplier) || !(multiplier > 0)) return null;
  if (!Number.isInteger(contractsSigned) || contractsSigned === 0) return null;
  const pnl = pointsDelta * multiplier * contractsSigned;
  return isFiniteNumber(pnl) ? pnl : null;
}

/**
 * Convenience: P&L from entry/mark prices.
 */
export function futuresMarkPnlTwd({ entryPrice, markPrice, code, contractsSigned }) {
  if (!isFiniteNumber(entryPrice) || !isFiniteNumber(markPrice)) return null;
  if (!(entryPrice > 0) || !(markPrice > 0)) return null;
  const mult = txfMultiplier(code);
  if (mult == null) return null;
  return futuresPnlTwd({
    pointsDelta: markPrice - entryPrice,
    multiplier: mult,
    contractsSigned,
  });
}

/**
 * Margin hold for paper: contracts × initialMarginPerContract (absolute contracts).
 * Returns null if inputs invalid — never invents margin table numbers.
 */
export function futuresMarginHold({ contracts, initialMarginPerContract }) {
  if (!isPositiveInt(contracts)) return null;
  if (!isFiniteNumber(initialMarginPerContract) || !(initialMarginPerContract > 0)) return null;
  const hold = contracts * initialMarginPerContract;
  return isFiniteNumber(hold) ? hold : null;
}

/**
 * Can open futures? Need freeCash ≥ margin hold. freeCash must be finite ≥ 0.
 */
export function canOpenFutures({ freeCash, contracts, initialMarginPerContract }) {
  if (!isFiniteNumber(freeCash) || freeCash < 0) return { ok: false, error: "freeCash invalid" };
  const hold = futuresMarginHold({ contracts, initialMarginPerContract });
  if (hold == null) return { ok: false, error: "margin hold invalid" };
  if (freeCash + 1e-9 < hold) return { ok: false, error: "insufficient margin cash", hold };
  return { ok: true, hold };
}

/**
 * Can buy option to open? Need freeCash ≥ debit.
 */
export function canBuyOption({ freeCash, premium, contracts, multiplier = US_OPTION_MULTIPLIER }) {
  if (!isFiniteNumber(freeCash) || freeCash < 0) return { ok: false, error: "freeCash invalid" };
  const impact = optionPremiumCashImpact({ side: "buy", premium, contracts, multiplier });
  if (!impact.ok) return impact;
  if (freeCash + 1e-9 < impact.notional) {
    return { ok: false, error: "insufficient cash for premium debit", need: impact.notional };
  }
  return { ok: true, debit: impact.notional };
}

/**
 * Guard: reject any payload that would send NaN into UI.
 */
export function assertFinitePayload(obj, label = "payload") {
  const bad = [];
  const walk = (v, path) => {
    if (typeof v === "number" && !Number.isFinite(v)) bad.push(path);
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
    }
  };
  walk(obj, "");
  if (bad.length) return { ok: false, error: `${label} non-finite: ${bad.join(",")}` };
  return { ok: true };
}

/**
 * Covered-call label only when stock qty ≥ option contracts × 100 (same underlying).
 */
export function strategyLabelPlain({ stockQty, optionRight, optionQtySigned, underlying }) {
  if (!underlying) return null;
  if (!Number.isInteger(optionQtySigned) || optionQtySigned === 0) return null;
  const r = String(optionRight || "").toLowerCase();
  if (optionQtySigned < 0 && (r === "call" || r === "c")) {
    const covered = Number.isInteger(stockQty) && stockQty >= Math.abs(optionQtySigned) * US_OPTION_MULTIPLIER;
    if (covered) return "covered-call";
    return "short-call";
  }
  if (optionQtySigned > 0 && (r === "put" || r === "p") && Number.isInteger(stockQty) && stockQty > 0) {
    return "protective-put";
  }
  if (optionQtySigned > 0 && (r === "call" || r === "c")) return "long-call";
  if (optionQtySigned > 0 && (r === "put" || r === "p")) return "long-put";
  if (optionQtySigned < 0 && (r === "put" || r === "p")) return "short-put";
  return null;
}

/**
 * Equity book realized P&L: (fillPrice − avgCost) × sharesSold.
 * Never invents prices. Returns null if any input is non-finite or sharesSold ≤ 0.
 * Currency is the caller's book currency (USD or TWD); this helper is unitless money.
 */
export function stockRealizedPnl({ fillPrice, avgCost, sharesSold }) {
  if (!isFiniteNumber(fillPrice) || !isFiniteNumber(avgCost) || !isFiniteNumber(sharesSold)) return null;
  if (!(sharesSold > 0)) return null;
  const pnl = (fillPrice - avgCost) * sharesSold;
  return isFiniteNumber(pnl) ? pnl : null;
}

/**
 * Resolve a trade row's realized P&L for display.
 * Prefer stored trade.realizedPnl when finite; else recompute from avgCostAtSale/avgCost.
 * BUY / open fills → status "open" (not 實現). Missing cost → status "missing-cost".
 */
export function resolveTradeRealizedPnl(trade) {
  if (!trade || typeof trade !== "object") return { status: "missing-cost", value: null };
  const side = String(trade.side || "").toUpperCase();
  if (side === "BUY" || side === "OPEN") return { status: "open", value: null };
  if (isFiniteNumber(trade.realizedPnl)) return { status: "ok", value: trade.realizedPnl };
  const avg = trade.avgCostAtSale ?? trade.avgCost;
  const computed = stockRealizedPnl({
    fillPrice: trade.price ?? trade.premium,
    avgCost: avg,
    sharesSold: trade.qty,
  });
  if (computed != null) return { status: "ok", value: computed };
  return { status: "missing-cost", value: null };
}

/**
 * Sum realized P&L for SELL (or CLOSE) trades. Skips open/BUY.
 * Returns { ok, sum, missing } — ok false only if sum becomes non-finite.
 */
export function sumSellRealizedPnl(trades) {
  let sum = 0;
  let missing = 0;
  let counted = 0;
  for (const tr of trades || []) {
    const side = String(tr?.side || "").toUpperCase();
    if (side !== "SELL" && side !== "CLOSE") continue;
    const r = resolveTradeRealizedPnl(tr);
    if (r.status === "ok") {
      sum += r.value;
      counted += 1;
    } else if (r.status === "missing-cost") {
      missing += 1;
    }
  }
  if (!isFiniteNumber(sum)) return { ok: false, sum: null, missing, counted };
  return { ok: true, sum, missing, counted };
}


/**
 * Calendar day YYYY-MM-DD (no time). Used as the only date comparison for expiry.
 */
export function isYmd(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/**
 * An expired derivative may settle only on/after its expiry (options) or last
 * trading / official final-settlement day (futures). Never settles early.
 * Official price is required — this helper does not invent one.
 *
 * officialPrice: options = official underlying close on expiry (≥ 0 finite);
 * futures = official final settlement price (> 0 finite).
 *
 * @returns {{ ok: true, due: boolean, missingOfficialPrice: boolean } | { ok: false, due: false, error: string }}
 */
export function canSettleExpiredContract(expiryOrLastTradingDay, asOfYmd, { officialPrice, requirePositivePrice = false } = {}) {
  if (!isYmd(expiryOrLastTradingDay) || !isYmd(asOfYmd)) {
    return { ok: false, due: false, missingOfficialPrice: true, error: "dates must be YYYY-MM-DD" };
  }
  if (asOfYmd < expiryOrLastTradingDay) {
    return { ok: true, due: false, missingOfficialPrice: false };
  }
  const priceOk = isFiniteNumber(officialPrice) && (requirePositivePrice ? officialPrice > 0 : officialPrice >= 0);
  if (!priceOk) {
    return { ok: true, due: true, missingOfficialPrice: true };
  }
  return { ok: true, due: true, missingOfficialPrice: false };
}

/**
 * Expiry P&L vs premium paid, using official underlying close (never a live mid-price).
 * cashDelta = intrinsic × multiplier × qtySigned (what the OCC cash-settles / assignment is worth).
 * realizedPnl = (settlePremium − avgPremium) × multiplier × qtySigned.
 * OTM close < strike for a long call → cashDelta 0 and realizedPnl = −premium×mult×qty.
 */
export function optionExpiryRealizedPnl({
  qtySigned,
  avgPremium,
  officialClose,
  strike,
  right,
  multiplier = US_OPTION_MULTIPLIER,
}) {
  const set = optionExpirySettlement({
    qtySigned,
    spot: officialClose,
    strike,
    right,
    multiplier,
  });
  if (!set.ok) return set;
  if (!isFiniteNumber(avgPremium) || avgPremium < 0) {
    return { ok: false, error: "avgPremium must be ≥ 0 finite" };
  }
  const realized = optionUnrealizedPnl({
    qtySigned,
    avgPremium,
    markPremium: set.settlePremium,
    multiplier,
  });
  if (realized == null) return { ok: false, error: "realized non-finite" };
  return {
    ok: true,
    intrinsic: set.intrinsic,
    settlePremium: set.settlePremium,
    cashDelta: set.cashDelta,
    realizedPnl: realized,
  };
}
