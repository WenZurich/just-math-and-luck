/**
 * Paper ledger: corporate actions (merger conversion)
 * ====================================================
 * A held stock that is acquired stops trading; selling it at a frozen last close (or keeping it
 * marked there forever) would be fiction. Instead, on the first scan whose market close date is on
 * or after the deal's effective session, the position is converted exactly per the official terms:
 *
 *   qty × cashPerShare                         → cash
 *   ⌊qty × sharesPerShare⌋ acquirer shares     → new position at cost = acquirer official close
 *                                                 on the effective date (unrealized starts at 0)
 *   fraction × that close                      → cash in lieu (no fractional shares are issued)
 *
 * The event is booked as side "CONVERT" (not a SELL): realized P&L = consideration value at the
 * effective date − the source position's cost. From then on the acquirer shares are an ordinary
 * holding: marked from the scan or paper-quotes (same-session public close), and sold only by the
 * existing exit rules (stop / momentum-break / off-list loss / take-profit). No buy rule is
 * involved, so they are never added to unless the acquirer itself makes the daily list.
 *
 * Every conversion re-checks the equity identity:
 *   equity_after = equity_before − qty·mark_before + considerationValue   (to the cent)
 */
import { mergerConversion, avgCostAfterBuy, roundHalfAway, bookMarkValue } from "./math-core.mjs";

export const CONVERT_REASON = "merger-conversion";

/** Text written to the ledger (zh, like the other reasonText); the site shows a plain 4-language sentence. */
export function convertReasonText(a, conv) {
  return `併購換股：${a.ticker} 每股換 ${a.cashPerShare} 美元現金＋${a.sharesPerShare} 股 ${a.acquirerTicker}（${a.paperConversion.effectiveSession} 生效），零股 ${conv.fractionalShares} 股按 ${a.acquirerTicker} 當日收盤 ${conv.acquirerPrice} 折現`;
}

const r2 = (n) => roundHalfAway(n, 2);

function equityOf(book) {
  const v = bookMarkValue(book.positions, book.cash);
  if (!v) throw new Error(`[corp-action] ${book.market}: non-finite book — refusing to convert`);
  return v.equity;
}

/** Actions that can convert a paper position (merger with full paperConversion data). */
export function convertibleActions(actions, market) {
  return (actions || []).filter(
    (a) =>
      a &&
      a.type === "merger" &&
      a.id &&
      (!market || a.market === market) &&
      a.paperConversion &&
      /^\d{4}-\d{2}-\d{2}$/.test(a.paperConversion.effectiveSession || "") &&
      typeof a.paperConversion.acquirerClose === "number"
  );
}

/**
 * Convert one held position in place. Returns the CONVERT trade (already pushed to book.trades by
 * the caller-supplied recordTrade) or null when not applicable / refused.
 */
export function convertPosition(book, action, { date, asOf, recordTrade }) {
  const pos = book.positions.find((p) => p.ticker === action.ticker);
  if (!pos) return null;
  if ((book.trades || []).some((t) => t.side === "CONVERT" && t.corporateActionId === action.id)) {
    throw new Error(`[corp-action] ${action.id} already booked but ${action.ticker} is still held — refusing to convert twice`);
  }
  const pc = action.paperConversion;
  const conv = mergerConversion({
    qty: pos.qty,
    avgCost: pos.avgCost,
    cashPerShare: action.cashPerShare,
    sharesPerShare: action.sharesPerShare,
    acquirerPrice: pc.acquirerClose,
  });
  if (!conv) {
    console.warn(`[corp-action] ${action.id}: conversion off-domain (qty=${pos.qty} avg=${pos.avgCost}) — holding, no change`);
    return null;
  }
  const before = equityOf(book);
  const markBefore = pos.mark;
  const avgBefore = pos.avgCost;

  book.positions = book.positions.filter((p) => p !== pos);
  book.cash = r2(book.cash + conv.cashTotal);
  book.realizedPnl = r2(book.realizedPnl + conv.realizedPnl);

  if (conv.wholeShares > 0) {
    const acq = book.positions.find((p) => p.ticker === action.acquirerTicker);
    if (acq) {
      const blended = avgCostAfterBuy(acq.qty, acq.avgCost, conv.wholeShares, pc.acquirerClose);
      if (blended == null) throw new Error(`[corp-action] ${action.id}: cannot blend into existing ${action.acquirerTicker}`);
      acq.avgCost = blended;
      acq.qty += conv.wholeShares;
    } else {
      book.positions.push({
        ticker: action.acquirerTicker,
        name: action.acquirerName || action.acquirer || action.acquirerTicker,
        qty: conv.wholeShares,
        avgCost: pc.acquirerClose,
        mark: pc.acquirerClose,
        currency: book.currency,
        openedOn: date,
        lastAddDate: date,
        limitUpStyle: false,
        fromCorporateAction: action.id,
      });
    }
  }

  const after = equityOf(book);
  const expect = before - pos.qty * markBefore + conv.considerationValue;
  if (Math.abs(after - expect) > 0.011) {
    throw new Error(`[corp-action] ${action.id}: equity identity broken (after ${after} vs expected ${expect})`);
  }
  if (Math.abs(conv.costBasis + conv.realizedPnl - conv.considerationValue) > 0.005) {
    throw new Error(`[corp-action] ${action.id}: realized identity broken`);
  }

  const trade = {
    date,
    asOf,
    side: "CONVERT",
    ticker: action.ticker,
    name: pos.name || action.ticker,
    qty: conv.qty,
    price: roundHalfAway(conv.valuePerShare, 6),
    avgCostAtSale: roundHalfAway(avgBefore, 6),
    reason: CONVERT_REASON,
    reasonText: convertReasonText(action, conv),
    realizedPnl: conv.realizedPnl,
    corporateActionId: action.id,
    conversion: {
      effectiveSession: pc.effectiveSession,
      acquirerTicker: action.acquirerTicker,
      acquirer: action.acquirer || "",
      cashPerShare: action.cashPerShare,
      sharesPerShare: action.sharesPerShare,
      entitledShares: conv.entitledShares,
      wholeShares: conv.wholeShares,
      fractionalShares: conv.fractionalShares,
      acquirerPrice: conv.acquirerPrice,
      cashConsideration: conv.cashConsideration,
      cashInLieu: conv.cashInLieu,
      cashTotal: conv.cashTotal,
      stockValue: conv.stockValue,
      considerationValue: conv.considerationValue,
      costBasis: conv.costBasis,
      lastMarkBefore: markBefore,
      markValueBefore: r2(pos.qty * markBefore),
      equityDelta: r2(conv.considerationValue - pos.qty * markBefore),
      priceSources: pc.acquirerCloseSources || [],
      sources: action.sources || [],
    },
  };
  recordTrade(book, trade);
  return trade;
}

/**
 * Engine hook: convert every held position whose deal is effective by the market close date of
 * this scan (closeDate = latest.usCloseDate / TW close date).
 */
export function applyCorporateActions(book, actions, { market, closeDate, date, asOf, recordTrade }) {
  const out = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(closeDate || "")) return out;
  for (const a of convertibleActions(actions, market)) {
    if (closeDate < a.paperConversion.effectiveSession) continue;
    const t = convertPosition(book, a, { date, asOf, recordTrade });
    if (t) out.push(t);
  }
  return out;
}
