/**
 * Paper-derivatives ledger engine: auto-settle expired options and futures
 * at official settlement / official close. Never invents prices.
 *
 * Pure (no I/O). The daily runner looks up official quotes and passes them in.
 * Math is in paper-derivatives-math.js and is verified by scripts/math-guards.mjs.
 */
import {
  isFiniteNumber,
  isYmd,
  canSettleExpiredContract,
  optionExpiryRealizedPnl,
  optionPremiumCashImpact,
  futuresMarkPnlTwd,
  futuresMarginHold,
  txfMultiplier,
  assertFinitePayload,
  US_OPTION_MULTIPLIER,
} from "./paper-derivatives-math.js";

function roundMoney(n, digits = 2) {
  if (!Number.isFinite(n)) return null;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function cloneBook(book) {
  return structuredClone(book);
}

function emptyMarketBook() {
  return { cashAdj: 0, marginHold: 0, realizedPnl: 0, positions: [], trades: [] };
}

function optionKey(p) {
  return `${p.underlying}|${p.expiry}|${p.strike}|${String(p.right || "").toLowerCase()}`;
}

function futuresKey(p) {
  return `${String(p.code || "").toUpperCase()}|${p.month}`;
}

function findOptionQuote(quotes, p) {
  const list = quotes?.options || [];
  const right = String(p.right || "").toLowerCase();
  return (
    list.find(
      (q) =>
        q.underlying === p.underlying &&
        q.expiry === p.expiry &&
        isFiniteNumber(q.officialClose) &&
        q.officialClose >= 0
    ) ||
    list.find(
      (q) =>
        q.underlying === p.underlying &&
        q.expiry === p.expiry &&
        (q.right == null || String(q.right).toLowerCase() === right) &&
        isFiniteNumber(q.officialClose)
    ) ||
    null
  );
}

function findFuturesQuote(quotes, p) {
  const list = quotes?.futures || [];
  const code = String(p.code || "").toUpperCase();
  return (
    list.find(
      (q) =>
        String(q.code || "").toUpperCase() === code &&
        q.month === p.month &&
        isFiniteNumber(q.officialSettlement) &&
        q.officialSettlement > 0
    ) || null
  );
}

function alreadySettledOption(trades, p) {
  return (trades || []).some(
    (tr) =>
      tr.reason === "expiry-settle" &&
      tr.asset === "option" &&
      tr.underlying === p.underlying &&
      tr.expiry === p.expiry &&
      Number(tr.strike) === Number(p.strike) &&
      String(tr.right || "").toLowerCase() === String(p.right || "").toLowerCase()
  );
}

function alreadySettledFutures(trades, p) {
  return (trades || []).some(
    (tr) =>
      tr.reason === "expiry-settle" &&
      tr.asset === "futures" &&
      String(tr.code || "").toUpperCase() === String(p.code || "").toUpperCase() &&
      tr.month === p.month
  );
}

/**
 * Apply official expiry settlements to a paper-derivatives book.
 * Idempotent: a contract already closed with reason "expiry-settle" is left alone.
 * Missing official prices → position stays open and is listed in skipped.
 *
 * @param {object} book paper-derivatives.json root
 * @param {{ asOfYmd: string, asOfIso?: string, options?: object[], futures?: object[] }} quotes
 * @returns {{ ok: boolean, book: object, settled: object[], skipped: object[], error?: string }}
 */
export function settleExpiredDerivatives(book, quotes = {}) {
  if (!book || typeof book !== "object") {
    return { ok: false, book: null, settled: [], skipped: [], error: "book required" };
  }
  const asOfYmd = quotes.asOfYmd;
  if (!isYmd(asOfYmd)) {
    return { ok: false, book: book, settled: [], skipped: [], error: "quotes.asOfYmd must be YYYY-MM-DD" };
  }
  const out = cloneBook(book);
  const settled = [];
  const skipped = [];

  // —— US options ——
  {
    const mkt = out.US || (out.US = emptyMarketBook());
    const remaining = [];
    for (const p of mkt.positions || []) {
      if (p.asset !== "option") {
        remaining.push(p);
        continue;
      }
      if (!Number.isInteger(p.qtySigned) || p.qtySigned === 0) {
        skipped.push({ market: "US", asset: "option", key: optionKey(p), reason: "invalid-qty" });
        remaining.push(p);
        continue;
      }
      if (alreadySettledOption(mkt.trades, p)) {
        skipped.push({ market: "US", asset: "option", key: optionKey(p), reason: "already-settled" });
        continue; // drop stale open row
      }
      const q = findOptionQuote(quotes, p);
      const gate = canSettleExpiredContract(p.expiry, asOfYmd, {
        officialPrice: q?.officialClose,
        requirePositivePrice: false,
      });
      if (!gate.ok) {
        skipped.push({ market: "US", asset: "option", key: optionKey(p), reason: gate.error || "bad-dates" });
        remaining.push(p);
        continue;
      }
      if (!gate.due) {
        remaining.push(p);
        continue;
      }
      if (gate.missingOfficialPrice) {
        skipped.push({
          market: "US",
          asset: "option",
          key: optionKey(p),
          reason: "missing-official-close",
        });
        remaining.push(p);
        continue;
      }
      const multiplier = isFiniteNumber(p.multiplier) && p.multiplier > 0 ? p.multiplier : US_OPTION_MULTIPLIER;
      if (multiplier !== US_OPTION_MULTIPLIER) {
        skipped.push({ market: "US", asset: "option", key: optionKey(p), reason: "multiplier-mismatch" });
        remaining.push(p);
        continue;
      }
      const math = optionExpiryRealizedPnl({
        qtySigned: p.qtySigned,
        avgPremium: p.avgPremium,
        officialClose: q.officialClose,
        strike: p.strike,
        right: p.right,
        multiplier,
      });
      if (!math.ok) {
        skipped.push({ market: "US", asset: "option", key: optionKey(p), reason: math.error || "math-failed" });
        remaining.push(p);
        continue;
      }
      const closeImpact = optionPremiumCashImpact({
        side: p.qtySigned > 0 ? "sell" : "buy",
        premium: math.settlePremium,
        contracts: Math.abs(p.qtySigned),
        multiplier,
      });
      if (!closeImpact.ok || closeImpact.cashDelta !== math.cashDelta) {
        skipped.push({ market: "US", asset: "option", key: optionKey(p), reason: "cash-identity-failed" });
        remaining.push(p);
        continue;
      }
      const cashDelta = roundMoney(math.cashDelta, 2);
      const realized = roundMoney(math.realizedPnl, 2);
      if (cashDelta == null || realized == null) {
        skipped.push({ market: "US", asset: "option", key: optionKey(p), reason: "non-finite-round" });
        remaining.push(p);
        continue;
      }
      mkt.cashAdj = roundMoney((mkt.cashAdj || 0) + cashDelta, 2);
      mkt.realizedPnl = roundMoney((mkt.realizedPnl || 0) + realized, 2);
      const tradeDate = p.expiry;
      mkt.trades = [...(mkt.trades || []), {
        date: tradeDate,
        asOf: quotes.asOfIso || `${tradeDate}T20:00:00-04:00`,
        market: "US",
        asset: "option",
        origin: p.origin || "server",
        side: p.qtySigned > 0 ? "SELL" : "BUY",
        underlying: p.underlying,
        name: p.name || "",
        right: p.right,
        expiry: p.expiry,
        strike: p.strike,
        qty: Math.abs(p.qtySigned),
        premium: math.settlePremium,
        officialClose: q.officialClose,
        cashDelta,
        reason: "expiry-settle",
        reasonText: math.settlePremium === 0
          ? `到期結算：官方收盤 ${q.officialClose} 相對履約價 ${p.strike} 為價外，權利金歸零。實現損益 US$${realized.toFixed(2)}。`
          : `到期結算：官方收盤 ${q.officialClose}，內在價值 ${math.settlePremium}。實現損益 US$${realized.toFixed(2)}。`,
        realizedPnl: realized,
        source: q.source || "official-close",
        sourceUrl: q.sourceUrl || null,
        contractSymbol: p.contractSymbol || null,
        multiplier,
      }];
      settled.push({
        market: "US",
        asset: "option",
        key: optionKey(p),
        officialClose: q.officialClose,
        settlePremium: math.settlePremium,
        cashDelta,
        realizedPnl: realized,
        sourceUrl: q.sourceUrl || null,
      });
    }
    mkt.positions = remaining;
  }

  // —— TW futures ——
  {
    const mkt = out.TW || (out.TW = emptyMarketBook());
    const remaining = [];
    for (const p of mkt.positions || []) {
      if (p.asset !== "futures") {
        remaining.push(p);
        continue;
      }
      if (!Number.isInteger(p.qtySigned) || p.qtySigned === 0) {
        skipped.push({ market: "TW", asset: "futures", key: futuresKey(p), reason: "invalid-qty" });
        remaining.push(p);
        continue;
      }
      if (alreadySettledFutures(mkt.trades, p)) {
        skipped.push({ market: "TW", asset: "futures", key: futuresKey(p), reason: "already-settled" });
        continue;
      }
      const officialMult = txfMultiplier(p.code);
      if (officialMult == null) {
        skipped.push({ market: "TW", asset: "futures", key: futuresKey(p), reason: "unknown-contract-code" });
        remaining.push(p);
        continue;
      }
      if (isFiniteNumber(p.multiplier) && p.multiplier !== officialMult) {
        skipped.push({ market: "TW", asset: "futures", key: futuresKey(p), reason: "multiplier-mismatch" });
        remaining.push(p);
        continue;
      }
      const ltd = p.lastTradingDay;
      const q = findFuturesQuote(quotes, p);
      const gate = canSettleExpiredContract(ltd, asOfYmd, {
        officialPrice: q?.officialSettlement,
        requirePositivePrice: true,
      });
      if (!gate.ok) {
        skipped.push({ market: "TW", asset: "futures", key: futuresKey(p), reason: gate.error || "bad-dates" });
        remaining.push(p);
        continue;
      }
      if (!gate.due) {
        remaining.push(p);
        continue;
      }
      if (gate.missingOfficialPrice) {
        skipped.push({
          market: "TW",
          asset: "futures",
          key: futuresKey(p),
          reason: "missing-official-settlement",
        });
        remaining.push(p);
        continue;
      }
      const realizedRaw = futuresMarkPnlTwd({
        entryPrice: p.avgPrice,
        markPrice: q.officialSettlement,
        code: p.code,
        contractsSigned: p.qtySigned,
      });
      const hold = futuresMarginHold({
        contracts: Math.abs(p.qtySigned),
        initialMarginPerContract: p.initialMarginPerContract,
      });
      if (!isFiniteNumber(realizedRaw) || hold == null) {
        skipped.push({ market: "TW", asset: "futures", key: futuresKey(p), reason: "math-failed" });
        remaining.push(p);
        continue;
      }
      const realized = roundMoney(realizedRaw, 0);
      const holdR = roundMoney(hold, 0);
      if (realized == null || holdR == null) {
        skipped.push({ market: "TW", asset: "futures", key: futuresKey(p), reason: "non-finite-round" });
        remaining.push(p);
        continue;
      }
      mkt.cashAdj = roundMoney((mkt.cashAdj || 0) + realized, 0);
      mkt.realizedPnl = roundMoney((mkt.realizedPnl || 0) + realized, 0);
      mkt.marginHold = roundMoney(Math.max(0, (mkt.marginHold || 0) - holdR), 0);
      const tradeDate = q.finalSettlementDay && isYmd(q.finalSettlementDay) ? q.finalSettlementDay : ltd;
      mkt.trades = [...(mkt.trades || []), {
        date: tradeDate,
        asOf: quotes.asOfIso || `${tradeDate}T13:45:00+08:00`,
        market: "TW",
        asset: "futures",
        origin: p.origin || "server",
        side: p.qtySigned > 0 ? "SELL" : "BUY",
        code: p.code,
        name: p.name || "",
        month: p.month,
        qty: Math.abs(p.qtySigned),
        price: q.officialSettlement,
        officialSettlement: q.officialSettlement,
        reason: "expiry-settle",
        reasonText: `到期結算：期交所 ${p.code} ${p.month} 最後結算價 ${q.officialSettlement}。保證金釋放 NT$${holdR.toLocaleString("en-US")}，實現損益 NT$${realized.toLocaleString("en-US")}。`,
        realizedPnl: realized,
        marginHold: 0,
        marginReleased: holdR,
        source: q.source || "official-final-settlement",
        sourceUrl: q.sourceUrl || null,
        sessionDate: q.finalSettlementDay || ltd,
        multiplier: officialMult,
      }];
      settled.push({
        market: "TW",
        asset: "futures",
        key: futuresKey(p),
        officialSettlement: q.officialSettlement,
        realizedPnl: realized,
        marginReleased: holdR,
        sourceUrl: q.sourceUrl || null,
      });
    }
    mkt.positions = remaining;
  }

  const check = assertFinitePayload({
    US: { cashAdj: out.US?.cashAdj, marginHold: out.US?.marginHold, realizedPnl: out.US?.realizedPnl },
    TW: { cashAdj: out.TW?.cashAdj, marginHold: out.TW?.marginHold, realizedPnl: out.TW?.realizedPnl },
  });
  if (!check.ok) {
    return { ok: false, book, settled: [], skipped, error: check.error };
  }
  if (quotes.asOfIso) out.asOf = quotes.asOfIso;
  return { ok: true, book: out, settled, skipped };
}

export { optionKey, futuresKey, roundMoney };
