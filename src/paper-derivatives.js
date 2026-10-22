/**
 * Paper derivatives for 模擬: US options + TW 台指期 (TX/MTX).
 * Strict book separation. Fills from public chains / txf-desk.json only.
 * Math via paper-derivatives-math.js (olympiad guards).
 */
import { escapeHtml } from "./glossary.js";
import { t, numberLocale, getLang } from "./i18n.js";
import {
  US_OPTION_MULTIPLIER,
  optionPremiumCashImpact,
  optionPositionMarkValue,
  optionUnrealizedPnl,
  optionExpirySettlement,
  txfMultiplier,
  futuresMarkPnlTwd,
  futuresMarginHold,
  canOpenFutures,
  canBuyOption,
  assertFinitePayload,
  strategyLabelPlain,
  isFiniteNumber,
  resolveTradeRealizedPnl,
} from "./paper-derivatives-math.js";

const STORAGE_KEY = "jml-paper-deriv-v1";
const OPT_URL = "./data/us-options-snapshot.json";
const TXF_URL = "./data/txf-desk.json";
const SERVER_URL = "./data/paper-derivatives.json";
const START_DATE = "2026-09-15";

function emptyMarketBook() {
  return {
    cashAdj: 0,
    marginHold: 0,
    realizedPnl: 0,
    positions: [],
    trades: [],
  };
}

function emptyState() {
  return {
    version: 1,
    startDate: START_DATE,
    cumulative: true,
    US: emptyMarketBook(),
    TW: emptyMarketBook(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return emptyState();
    return {
      ...emptyState(),
      ...parsed,
      US: { ...emptyMarketBook(), ...(parsed.US || {}) },
      TW: { ...emptyMarketBook(), ...(parsed.TW || {}) },
    };
  } catch {
    return emptyState();
  }
}

function saveState(state) {
  const check = assertFinitePayload({
    US: { cashAdj: state.US.cashAdj, marginHold: state.US.marginHold, realizedPnl: state.US.realizedPnl },
    TW: { cashAdj: state.TW.cashAdj, marginHold: state.TW.marginHold, realizedPnl: state.TW.realizedPnl },
  });
  if (!check.ok) {
    console.error("paper-deriv blocked save:", check.error);
    return false;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return true;
}

function roundMoney(n, digits = 2) {
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function taipeiYmd(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
  } catch {
    return String(iso || "").slice(0, 10);
  }
}

function todayYmd() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
}

function fmtNum(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(numberLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtMoney(n, currency) {
  if (n == null || Number.isNaN(n)) return "—";
  const digits = currency === "TWD" ? 0 : 2;
  const prefix = currency === "USD" ? "US$" : currency === "TWD" ? "NT$" : "";
  return `${prefix}${fmtNum(n, digits)}`;
}

function pctClass(n) {
  if (n == null || Number.isNaN(n)) return "flat";
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}

function posKeyOpt(p) {
  return `${p.underlying}|${p.expiry}|${p.strike}|${p.right}`;
}

function posKeyFut(p) {
  return `${p.code}|${p.month}`;
}

/** —— data loaders —— */
export async function loadOptionsSnapshot() {
  try {
    const res = await fetch(OPT_URL);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function loadTxfDesk() {
  try {
    const res = await fetch(TXF_URL);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.market !== "TW" || !data?.contracts) return null;
    return data;
  } catch {
    return null;
  }
}

export async function loadServerBook() {
  try {
    const res = await fetch(SERVER_URL);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.version !== 1 || data.booksSeparate !== true) return null;
    const book = {
      version: 1,
      startDate: data.startDate || START_DATE,
      asOf: data.asOf || null,
      noteZh: data.noteZh || "",
      noteEn: data.noteEn || "",
      US: { ...emptyMarketBook(), ...(data.US || {}) },
      TW: { ...emptyMarketBook(), ...(data.TW || {}) },
    };
    const check = assertFinitePayload({
      US: { cashAdj: book.US.cashAdj, marginHold: book.US.marginHold, realizedPnl: book.US.realizedPnl },
      TW: { cashAdj: book.TW.cashAdj, marginHold: book.TW.marginHold, realizedPnl: book.TW.realizedPnl },
    });
    if (!check.ok) return null;
    const usOk = (book.US.positions || []).some((p) => p.asset === "option" && Number.isInteger(p.qtySigned) && p.qtySigned !== 0);
    const twOk = (book.TW.positions || []).some(
      (p) => p.asset === "futures" && (p.code === "TX" || p.code === "MTX") && Number.isInteger(p.qtySigned) && p.qtySigned !== 0
    );
    if (!usOk || !twOk) return null;
    return book;
  } catch {
    return null;
  }
}

function stripServerOrigin(state) {
  for (const m of ["US", "TW"]) {
    state[m].positions = (state[m].positions || []).filter((p) => p.origin !== "server");
    state[m].trades = (state[m].trades || []).filter((tr) => tr.origin !== "server");
  }
}

/** Server book is what every device sees. Local ticket fills stay in localStorage only. */
function mergeDisplay(user, server) {
  if (!server) return user;
  const out = emptyState();
  out.startDate = user.startDate || server.startDate || START_DATE;
  out.serverAsOf = server.asOf || null;
  out.noteZh = server.noteZh || "";
  out.noteEn = server.noteEn || "";
  for (const m of ["US", "TW"]) {
    const sBook = server[m] || emptyMarketBook();
    const uBook = user[m];
    const digits = m === "TW" ? 0 : 2;
    const sPos = (sBook.positions || []).map((p) => ({ ...p, origin: "server" }));
    const uPos = (uBook.positions || []).filter((p) => p.origin !== "server");
    out[m] = {
      cashAdj: roundMoney((sBook.cashAdj || 0) + (uBook.cashAdj || 0), digits),
      marginHold: roundMoney((sBook.marginHold || 0) + (uBook.marginHold || 0), digits),
      realizedPnl: roundMoney((sBook.realizedPnl || 0) + (uBook.realizedPnl || 0), digits),
      positions: [...sPos, ...uPos],
      trades: [
        ...(sBook.trades || []).map((tr) => ({ ...tr, origin: "server" })),
        ...(uBook.trades || []).filter((tr) => tr.origin !== "server"),
      ],
      summaryZh: sBook.summaryZh || "",
      summaryEn: sBook.summaryEn || "",
    };
  }
  return out;
}

function serverBanner(state, market) {
  const book = state?.[market];
  if (!book) return "";
  const lang = getLang();
  const summary = lang === "en" || lang === "ja" ? book.summaryEn || book.summaryZh : book.summaryZh || book.summaryEn;
  if (!summary && !state.noteZh) return "";
  const note = lang === "en" || lang === "ja" ? state.noteEn || state.noteZh : state.noteZh || state.noteEn;
  return `<p class="paper-deriv-server">${escapeHtml(t("paperDerivServerBook"))}${
    summary ? ` ${escapeHtml(summary)}` : ""
  }${note ? ` ${escapeHtml(note)}` : ""}</p>`;
}

function fillMetaHtml(p) {
  const lang = getLang();
  const src = lang === "en" || lang === "ja" ? p.fillSourceEn || p.fillSource : p.fillSource || p.fillSourceEn;
  const asOf = p.openedAsOf || p.lastTradeAsOf || "";
  return `${src ? `<span class="pos-name">${escapeHtml(src)}</span>` : ""}${
    asOf ? `<span class="pos-name">asOf ${escapeHtml(asOf)}</span>` : ""
  }`;
}

function stockQty(paper, market, ticker) {
  const book = paper?.books?.[market];
  const pos = (book?.positions || []).find((p) => p.ticker === ticker);
  return pos?.qty || 0;
}

function freeCash(paper, market, state) {
  const book = paper?.books?.[market];
  const base = typeof book?.cash === "number" ? book.cash : 0;
  const m = state[market];
  return roundMoney(base + (m.cashAdj || 0) - (m.marginHold || 0), market === "TW" ? 0 : 2);
}

function findPremium(chain, right, strike) {
  if (!chain) return null;
  const list = right === "put" ? chain.puts : chain.calls;
  if (!Array.isArray(list)) return null;
  const row = list.find((c) => c.strike === strike && isFiniteNumber(c.premium) && c.premium >= 0);
  return row || null;
}

function markOptionPositions(state, optSnap) {
  const byTicker = new Map((optSnap?.tickers || []).map((r) => [r.ticker, r]));
  const asOf = optSnap?.asOf || null;
  const remaining = [];
  for (const p of state.US.positions) {
    if (p.asset !== "option") continue;
    const row = byTicker.get(p.underlying);
    const chain = row?.options?.paperChain;
    const spot = row?.options?.asOfUnderlying ?? row?.price ?? null;
    // Expiry settlement when past expiry or chain gone on/after expiry
    const expired =
      p.expiry && todayYmd() > p.expiry
        ? true
        : p.expiry && (!chain || chain.expiration !== p.expiry) && todayYmd() >= p.expiry;
    if (expired && isFiniteNumber(spot)) {
      const set = optionExpirySettlement({
        qtySigned: p.qtySigned,
        spot,
        strike: p.strike,
        right: p.right,
      });
      if (set.ok) {
        // Close vs avg: realize (settle − avg) × mult × qty
        const closeImpact = optionPremiumCashImpact({
          side: p.qtySigned > 0 ? "sell" : "buy",
          premium: set.settlePremium,
          contracts: Math.abs(p.qtySigned),
        });
        if (closeImpact.ok) {
          const realized = optionUnrealizedPnl({
            qtySigned: p.qtySigned,
            avgPremium: p.avgPremium,
            markPremium: set.settlePremium,
          });
          state.US.cashAdj = roundMoney(state.US.cashAdj + closeImpact.cashDelta);
          if (isFiniteNumber(realized)) {
            state.US.realizedPnl = roundMoney(state.US.realizedPnl + realized);
          }
          state.US.trades.push({
            date: todayYmd(),
            asOf,
            market: "US",
            asset: "option",
            side: p.qtySigned > 0 ? "SELL" : "BUY",
            underlying: p.underlying,
            right: p.right,
            expiry: p.expiry,
            strike: p.strike,
            qty: Math.abs(p.qtySigned),
            premium: set.settlePremium,
            reason: "expiry-settle",
            reasonText: t("paperDerivExpirySettle"),
            realizedPnl: realized ?? 0,
          });
          continue; // drop position
        }
      }
    }
    const hit = findPremium(chain, p.right, p.strike);
    if (hit) {
      p.markPremium = hit.premium;
      p.markAsOf = asOf;
      p.markSource = "chain";
    } else if (!isFiniteNumber(p.markPremium)) {
      p.markPremium = p.avgPremium;
      p.markSource = "last-fill";
      p.markAsOf = p.lastTradeAsOf || asOf;
    } else {
      p.markSource = p.markSource || "stored";
    }
    if (isFiniteNumber(spot)) p.spot = spot;
    remaining.push(p);
  }
  state.US.positions = remaining;
}

function markFuturesPositions(state, txf) {
  if (!txf?.contracts) return;
  const remaining = [];
  for (const p of state.TW.positions) {
    if (p.asset !== "futures") continue;
    const spec = txf.contracts[p.code];
    if (!spec) {
      remaining.push(p);
      continue;
    }
    const monthRow =
      (spec.near && spec.near.month === p.month && spec.near) ||
      (spec.next && spec.next.month === p.month && spec.next) ||
      (spec.listed || []).find((x) => x.month === p.month) ||
      null;
    const ltd = monthRow?.lastTradingDay;
    // Expired month: TAIFEX's official final settlement price (published the same day) wins
    // over the day's last trade; otherwise daily settle, then last.
    const fsp = txf.calendar?.recentSettlement;
    const officialFinal =
      fsp && fsp.deliveryMonth === p.month && String(fsp.contract || "").split("/").includes(p.code) &&
      isFiniteNumber(fsp.finalSettlementPrice) && fsp.finalSettlementPrice > 0
        ? fsp.finalSettlementPrice
        : null;
    const settleOrLast =
      (ltd && todayYmd() > ltd && officialFinal) ||
      (isFiniteNumber(monthRow?.settle) && monthRow.settle) ||
      (isFiniteNumber(monthRow?.last) && monthRow.last) ||
      null;

    if (ltd && todayYmd() > ltd && isFiniteNumber(settleOrLast)) {
      // Settle / close at last public settle or last
      const realized = futuresMarkPnlTwd({
        entryPrice: p.avgPrice,
        markPrice: settleOrLast,
        code: p.code,
        contractsSigned: p.qtySigned,
      });
      const hold = futuresMarginHold({
        contracts: Math.abs(p.qtySigned),
        initialMarginPerContract: p.initialMarginPerContract,
      });
      if (isFiniteNumber(realized)) {
        state.TW.cashAdj = roundMoney(state.TW.cashAdj + realized, 0);
        state.TW.realizedPnl = roundMoney(state.TW.realizedPnl + realized, 0);
      }
      if (isFiniteNumber(hold)) {
        state.TW.marginHold = roundMoney(Math.max(0, state.TW.marginHold - hold), 0);
      }
      state.TW.trades.push({
        date: todayYmd(),
        asOf: txf.asOf,
        market: "TW",
        asset: "futures",
        side: p.qtySigned > 0 ? "SELL" : "BUY",
        code: p.code,
        month: p.month,
        qty: Math.abs(p.qtySigned),
        price: settleOrLast,
        reason: "expiry-settle",
        reasonText: t("paperDerivFutSettle"),
        realizedPnl: realized ?? 0,
        flagged: !officialFinal && !isFiniteNumber(monthRow?.settle),
      });
      continue;
    }

    if (isFiniteNumber(monthRow?.last)) {
      p.mark = monthRow.last;
      p.markSource = "desk-last";
    } else if (isFiniteNumber(monthRow?.settle)) {
      p.mark = monthRow.settle;
      p.markSource = "desk-settle";
    } else {
      p.markSource = "last-fill";
      if (!isFiniteNumber(p.mark)) p.mark = p.avgPrice;
    }
    p.markAsOf = txf.asOf;
    if (isFiniteNumber(monthRow?.settle)) p.settle = monthRow.settle;
    remaining.push(p);
  }
  state.TW.positions = remaining;
}

/** —— trade actions —— */
export function tradeUsOption({
  paper,
  state,
  optSnap,
  underlying,
  right,
  strike,
  expiry,
  side, // buy | sell
  contracts,
}) {
  if (right !== "call" && right !== "put") return { ok: false, error: t("paperDerivBadRight") };
  if (!Number.isInteger(contracts) || contracts <= 0) return { ok: false, error: t("paperDerivBadQty") };
  if (side !== "buy" && side !== "sell") return { ok: false, error: t("paperDerivBadSide") };

  const row = (optSnap?.tickers || []).find((r) => r.ticker === underlying);
  const chain = row?.options?.paperChain;
  if (!chain || !Array.isArray(chain.calls)) {
    return { ok: false, error: t("paperDerivNoChain") };
  }
  if (expiry && chain.expiration && expiry !== chain.expiration) {
    return { ok: false, error: t("paperDerivExpiryMismatch") };
  }
  const useExpiry = chain.expiration;
  const hit = findPremium(chain, right, Number(strike));
  if (!hit) return { ok: false, error: t("paperDerivNoPremium") };
  const premium = hit.premium;
  if (!isFiniteNumber(premium) || premium < 0) return { ok: false, error: t("paperDerivNoPremium") };

  const free = freeCash(paper, "US", state);
  // Closing existing opposite reduces need for cash / creates credit as appropriate
  const key = `${underlying}|${useExpiry}|${Number(strike)}|${right}`;
  let existing = state.US.positions.find((p) => posKeyOpt(p) === key);

  const signedDelta = side === "buy" ? contracts : -contracts;

  // If reducing/closing, realized path
  if (existing && Math.sign(existing.qtySigned) !== 0 && Math.sign(existing.qtySigned) !== Math.sign(signedDelta)) {
    const closeQty = Math.min(Math.abs(existing.qtySigned), contracts);
    const impact = optionPremiumCashImpact({ side, premium, contracts: closeQty });
    if (!impact.ok) return { ok: false, error: impact.error };
    // For closing long (sell): need no cash; for closing short (buy): need debit
    if (side === "buy") {
      const gate = canBuyOption({ freeCash: free, premium, contracts: closeQty });
      if (!gate.ok) return { ok: false, error: t("paperDerivNeedCash", { need: fmtMoney(gate.need || impact.notional, "USD") }) };
    }
    const realized = optionUnrealizedPnl({
      qtySigned: existing.qtySigned > 0 ? closeQty : -closeQty,
      avgPremium: existing.avgPremium,
      markPremium: premium,
    });
    state.US.cashAdj = roundMoney(state.US.cashAdj + impact.cashDelta);
    if (isFiniteNumber(realized)) state.US.realizedPnl = roundMoney(state.US.realizedPnl + realized);
    existing.qtySigned += existing.qtySigned > 0 ? -closeQty : closeQty;
    if (existing.qtySigned === 0) {
      state.US.positions = state.US.positions.filter((p) => p !== existing);
      existing = null;
    }
    state.US.trades.push({
      date: todayYmd(),
      asOf: optSnap?.asOf,
      market: "US",
      asset: "option",
      side: side === "buy" ? "BUY" : "SELL",
      underlying,
      right,
      expiry: useExpiry,
      strike: Number(strike),
      qty: closeQty,
      premium,
      reason: "user-close",
      reasonText: t("paperDerivUserClose"),
      realizedPnl: realized ?? 0,
    });
    const leftover = contracts - closeQty;
    if (leftover <= 0) {
      if (!saveState(state)) return { ok: false, error: t("paperDerivMathBlock") };
      return { ok: true, premium, closed: closeQty };
    }
    // fall through to open leftover
    contracts = leftover;
  }

  // Opening / adding
  if (side === "buy") {
    const gate = canBuyOption({ freeCash: freeCash(paper, "US", state), premium, contracts });
    if (!gate.ok) {
      return { ok: false, error: t("paperDerivNeedCash", { need: fmtMoney(gate.need || premium * US_OPTION_MULTIPLIER * contracts, "USD") }) };
    }
  }

  const impact = optionPremiumCashImpact({ side, premium, contracts });
  if (!impact.ok) return { ok: false, error: impact.error };
  state.US.cashAdj = roundMoney(state.US.cashAdj + impact.cashDelta);

  const qtySigned = side === "buy" ? contracts : -contracts;
  if (!existing) {
    existing = {
      asset: "option",
      underlying,
      name: row?.name || underlying,
      right,
      expiry: useExpiry,
      strike: Number(strike),
      qtySigned,
      avgPremium: premium,
      markPremium: premium,
      markAsOf: optSnap?.asOf,
      markSource: "fill",
      lastTradeAsOf: optSnap?.asOf,
      openedOn: todayYmd(),
      currency: "USD",
      multiplier: US_OPTION_MULTIPLIER,
    };
    state.US.positions.push(existing);
  } else {
    // same direction add — weighted avg
    const newQty = existing.qtySigned + qtySigned;
    const absOld = Math.abs(existing.qtySigned);
    const absAdd = Math.abs(qtySigned);
    existing.avgPremium = (existing.avgPremium * absOld + premium * absAdd) / (absOld + absAdd);
    existing.qtySigned = newQty;
    existing.markPremium = premium;
    existing.lastTradeAsOf = optSnap?.asOf;
  }

  const stockQ = stockQty(paper, "US", underlying);
  const label = strategyLabelPlain({
    stockQty: stockQ,
    optionRight: right,
    optionQtySigned: existing.qtySigned,
    underlying,
  });

  state.US.trades.push({
    date: todayYmd(),
    asOf: optSnap?.asOf,
    market: "US",
    asset: "option",
    side: side === "buy" ? "BUY" : "SELL",
    underlying,
    right,
    expiry: useExpiry,
    strike: Number(strike),
    qty: contracts,
    premium,
    reason: "user-open",
    reasonText: label ? strategyLabelText(label) : t("paperDerivUserOpen"),
    strategy: label,
    realizedPnl: 0,
  });

  if (!saveState(state)) return { ok: false, error: t("paperDerivMathBlock") };
  return { ok: true, premium, strategy: label };
}

export function tradeTwFutures({
  paper,
  state,
  txf,
  code,
  month,
  side, // buy | sell  (buy=long, sell=short to open / close)
  contracts,
}) {
  code = String(code || "").toUpperCase();
  if (code !== "TX" && code !== "MTX") return { ok: false, error: t("paperDerivBadCode") };
  if (!Number.isInteger(contracts) || contracts <= 0) return { ok: false, error: t("paperDerivBadQty") };
  if (side !== "buy" && side !== "sell") return { ok: false, error: t("paperDerivBadSide") };

  const spec = txf?.contracts?.[code];
  if (!spec) return { ok: false, error: t("paperDerivNoTxf") };
  const mult = txfMultiplier(code);
  if (mult == null || mult !== spec.multiplierTwdPerPoint) {
    return { ok: false, error: t("paperDerivBadMult") };
  }
  const monthRow =
    (spec.near && spec.near.month === month && spec.near) ||
    (spec.next && spec.next.month === month && spec.next) ||
    (spec.listed || []).find((x) => x.month === month);
  if (!monthRow) return { ok: false, error: t("paperDerivNoMonth") };
  const price =
    (isFiniteNumber(monthRow.last) && monthRow.last) ||
    (isFiniteNumber(monthRow.settle) && monthRow.settle) ||
    null;
  if (!isFiniteNumber(price) || !(price > 0)) return { ok: false, error: t("paperDerivNoFutPrice") };

  const initialMargin = typeof spec.margin?.initial === "number" ? spec.margin.initial : null;
  if (!isFiniteNumber(initialMargin) || !(initialMargin > 0)) {
    return { ok: false, error: t("paperDerivNoMargin") };
  }

  const key = `${code}|${month}`;
  let existing = state.TW.positions.find((p) => posKeyFut(p) === key);
  const signedDelta = side === "buy" ? contracts : -contracts;

  // Close / reduce opposite
  if (existing && Math.sign(existing.qtySigned) !== Math.sign(signedDelta)) {
    const closeQty = Math.min(Math.abs(existing.qtySigned), contracts);
    const signedClose = existing.qtySigned > 0 ? closeQty : -closeQty;
    const realized = futuresMarkPnlTwd({
      entryPrice: existing.avgPrice,
      markPrice: price,
      code,
      contractsSigned: signedClose,
    });
    if (!isFiniteNumber(realized)) return { ok: false, error: t("paperDerivMathBlock") };
    const holdRelease = futuresMarginHold({
      contracts: closeQty,
      initialMarginPerContract: existing.initialMarginPerContract || initialMargin,
    });
    state.TW.cashAdj = roundMoney(state.TW.cashAdj + realized, 0);
    state.TW.realizedPnl = roundMoney(state.TW.realizedPnl + realized, 0);
    if (isFiniteNumber(holdRelease)) {
      state.TW.marginHold = roundMoney(Math.max(0, state.TW.marginHold - holdRelease), 0);
    }
    existing.qtySigned += existing.qtySigned > 0 ? -closeQty : closeQty;
    if (existing.qtySigned === 0) {
      state.TW.positions = state.TW.positions.filter((p) => p !== existing);
      existing = null;
    } else {
      existing.mark = price;
    }
    state.TW.trades.push({
      date: todayYmd(),
      asOf: txf.asOf,
      market: "TW",
      asset: "futures",
      side: side === "buy" ? "BUY" : "SELL",
      code,
      month,
      qty: closeQty,
      price,
      reason: "user-close",
      reasonText: t("paperDerivUserClose"),
      realizedPnl: realized,
    });
    const leftover = contracts - closeQty;
    if (leftover <= 0) {
      if (!saveState(state)) return { ok: false, error: t("paperDerivMathBlock") };
      return { ok: true, price, closed: closeQty };
    }
    contracts = leftover;
  }

  // Open / add
  const gate = canOpenFutures({
    freeCash: freeCash(paper, "TW", state),
    contracts,
    initialMarginPerContract: initialMargin,
  });
  if (!gate.ok) {
    return {
      ok: false,
      error: t("paperDerivNeedMargin", { need: fmtMoney(gate.hold || initialMargin * contracts, "TWD") }),
    };
  }
  const hold = gate.hold;
  state.TW.marginHold = roundMoney(state.TW.marginHold + hold, 0);
  const qtySigned = side === "buy" ? contracts : -contracts;
  if (!existing) {
    existing = {
      asset: "futures",
      code,
      name: spec.nameZh || code,
      month,
      qtySigned,
      avgPrice: price,
      mark: price,
      markAsOf: txf.asOf,
      markSource: "fill",
      openedOn: todayYmd(),
      currency: "TWD",
      multiplier: mult,
      initialMarginPerContract: initialMargin,
      lastTradingDay: monthRow.lastTradingDay || null,
    };
    state.TW.positions.push(existing);
  } else {
    const absOld = Math.abs(existing.qtySigned);
    const absAdd = Math.abs(qtySigned);
    existing.avgPrice = (existing.avgPrice * absOld + price * absAdd) / (absOld + absAdd);
    existing.qtySigned += qtySigned;
    existing.mark = price;
  }

  state.TW.trades.push({
    date: todayYmd(),
    asOf: txf.asOf,
    market: "TW",
    asset: "futures",
    side: side === "buy" ? "BUY" : "SELL",
    code,
    month,
    qty: contracts,
    price,
    reason: "user-open",
    reasonText: t("paperDerivUserOpen"),
    realizedPnl: 0,
    marginHold: hold,
  });

  if (!saveState(state)) return { ok: false, error: t("paperDerivMathBlock") };
  return { ok: true, price, marginHold: hold };
}

/** —— render —— */
function strategyLabelText(code) {
  if (!code) return "";
  const key = `paperDerivStrategy_${String(code).replace(/-/g, "_")}`;
  const v = t(key);
  return v === key ? code : v;
}

function renderUsOptionRows(positions, paper) {
  if (!positions.length) {
    return `<tr><td colspan="9" class="empty-cell">${escapeHtml(t("paperDerivNoOptPos"))}</td></tr>`;
  }
  return positions
    .map((p) => {
      const u = optionUnrealizedPnl({
        qtySigned: p.qtySigned,
        avgPremium: p.avgPremium,
        markPremium: p.markPremium,
      });
      const mv = optionPositionMarkValue({ qty: p.qtySigned, markPremium: p.markPremium });
      const label = strategyLabelPlain({
        stockQty: stockQty(paper, "US", p.underlying),
        optionRight: p.right,
        optionQtySigned: p.qtySigned,
        underlying: p.underlying,
      });
      const side = p.qtySigned > 0 ? t("paperDerivLong") : t("paperDerivShort");
      return `<tr>
        <td class="pos-sym"><span class="ticker">${escapeHtml(p.underlying)}</span>
          <span class="pos-name">${escapeHtml(p.right.toUpperCase())} ${escapeHtml(String(p.strike))} ${escapeHtml(p.expiry || "")}${p.contractSymbol ? ` · ${escapeHtml(p.contractSymbol)}` : ""}</span>
          ${label ? `<span class="deriv-tag">${escapeHtml(strategyLabelText(label))}</span>` : ""}
          ${fillMetaHtml(p)}
        </td>
        <td class="num">${escapeHtml(side)} ${Math.abs(p.qtySigned)}</td>
        <td class="num">${fmtNum(p.avgPremium, 2)}</td>
        <td class="num">${fmtNum(p.markPremium, 2)}</td>
        <td class="num">${fmtMoney(mv, "USD")}</td>
        <td class="num ${pctClass(u)}">${fmtMoney(u, "USD")}</td>
        <td class="num">${escapeHtml(p.markSource || "—")}</td>
        <td class="num">${escapeHtml((p.markAsOf || "").slice(0, 16) || "—")}</td>
        <td class="num">×${US_OPTION_MULTIPLIER}</td>
      </tr>`;
    })
    .join("");
}

function renderTwFutRows(positions) {
  if (!positions.length) {
    return `<tr><td colspan="9" class="empty-cell">${escapeHtml(t("paperDerivNoFutPos"))}</td></tr>`;
  }
  return positions
    .map((p) => {
      const u = futuresMarkPnlTwd({
        entryPrice: p.avgPrice,
        markPrice: p.mark,
        code: p.code,
        contractsSigned: p.qtySigned,
      });
      const side = p.qtySigned > 0 ? t("paperDerivLong") : t("paperDerivShort");
      const hold = futuresMarginHold({
        contracts: Math.abs(p.qtySigned),
        initialMarginPerContract: p.initialMarginPerContract,
      });
      return `<tr>
        <td class="pos-sym"><span class="ticker">${escapeHtml(p.code)}</span>
          <span class="pos-name">${escapeHtml(p.name || "")} ${escapeHtml(p.month)} · ${escapeHtml(p.qtySigned > 0 ? t("paperDerivLong") : t("paperDerivShort"))} ${Math.abs(p.qtySigned)}</span>
          ${fillMetaHtml(p)}
        </td>
        <td class="num">${escapeHtml(side)} ${Math.abs(p.qtySigned)}${escapeHtml(t("paperDerivContracts"))}</td>
        <td class="num">${fmtNum(p.avgPrice, 0)}</td>
        <td class="num">${fmtNum(p.mark, 0)}</td>
        <td class="num ${pctClass(u)}">${fmtMoney(u, "TWD")}</td>
        <td class="num">${fmtMoney(hold, "TWD")}</td>
        <td class="num">NT$${p.multiplier}/pt</td>
        <td class="num">${escapeHtml(p.markSource || "—")}</td>
        <td class="num">${escapeHtml(p.lastTradingDay || "—")}</td>
      </tr>`;
    })
    .join("");
}

function renderUsTicket(optSnap) {
  const tickers = (optSnap?.tickers || []).filter((r) => r?.options?.paperChain?.calls?.length);
  if (!tickers.length) {
    return `<p class="paper-deriv-missing">${escapeHtml(t("paperDerivNoChain"))}</p>`;
  }
  const opts = tickers
    .map((r) => `<option value="${escapeHtml(r.ticker)}">${escapeHtml(r.ticker)} · ${escapeHtml(r.name || "")}</option>`)
    .join("");
  return `
    <form class="paper-deriv-form" data-deriv-form="us-opt" autocomplete="off">
      <div class="pdf-row">
        <label>${escapeHtml(t("paperDerivUnderlying"))}
          <select name="underlying" required>${opts}</select>
        </label>
        <label>${escapeHtml(t("paperDerivRight"))}
          <select name="right"><option value="call">Call</option><option value="put">Put</option></select>
        </label>
        <label>${escapeHtml(t("paperDerivStrike"))}
          <select name="strike" required></select>
        </label>
        <label>${escapeHtml(t("qty"))}
          <input name="qty" type="number" min="1" step="1" value="1" required />
        </label>
      </div>
      <div class="pdf-row pdf-meta">
        <span data-field="expiry">—</span>
        <span data-field="premium">—</span>
        <span data-field="debit">—</span>
      </div>
      <div class="pdf-actions">
        <button type="submit" name="side" value="buy" class="pdf-btn buy">${escapeHtml(t("buy"))}</button>
        <button type="submit" name="side" value="sell" class="pdf-btn sell">${escapeHtml(t("sell"))}</button>
      </div>
      <p class="pdf-msg" data-msg hidden></p>
    </form>`;
}

function renderTwTicket(txf) {
  if (!txf?.contracts?.TX) {
    return `<p class="paper-deriv-missing">${escapeHtml(t("paperDerivNoTxf"))}</p>`;
  }
  const codes = ["TX", "MTX"]
    .filter((c) => txf.contracts[c])
    .map((c) => {
      const sp = txf.contracts[c];
      return `<option value="${c}">${escapeHtml(c)} · ${escapeHtml(sp.nameZh || "")} · NT$${sp.multiplierTwdPerPoint}/pt</option>`;
    })
    .join("");
  return `
    <form class="paper-deriv-form" data-deriv-form="tw-fut" autocomplete="off">
      <div class="pdf-row">
        <label>${escapeHtml(t("paperDerivFutCode"))}
          <select name="code" required>${codes}</select>
        </label>
        <label>${escapeHtml(t("paperDerivMonth"))}
          <select name="month" required></select>
        </label>
        <label>${escapeHtml(t("qty"))}
          <input name="qty" type="number" min="1" step="1" value="1" required />
        </label>
      </div>
      <div class="pdf-row pdf-meta">
        <span data-field="price">—</span>
        <span data-field="margin">—</span>
        <span data-field="mult">—</span>
      </div>
      <div class="pdf-actions">
        <button type="submit" name="side" value="buy" class="pdf-btn buy">${escapeHtml(t("paperDerivLong"))} / ${escapeHtml(t("buy"))}</button>
        <button type="submit" name="side" value="sell" class="pdf-btn sell">${escapeHtml(t("paperDerivShort"))} / ${escapeHtml(t("sell"))}</button>
      </div>
      <p class="paper-deriv-margin-note">${escapeHtml(t("paperDerivMarginNote"))}</p>
      <p class="pdf-msg" data-msg hidden></p>
    </form>`;
}


function renderDerivFills(trades, currency) {
  const rows = [...(trades || [])].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 20);
  if (!rows.length) return "";
  const body = rows
    .map((tr) => {
      const side = String(tr.side || "").toUpperCase();
      const isOpen = side === "BUY" || tr.reason === "server-open" || tr.reason === "user-open";
      const label =
        tr.asset === "option"
          ? `${tr.underlying || ""} ${String(tr.right || "").toUpperCase()} ${tr.strike ?? ""} ${tr.expiry || ""}`
          : `${tr.code || ""} ${tr.month || ""}`;
      const px = tr.premium != null ? tr.premium : tr.price;
      let rpHtml = "—";
      let rpCls = "flat";
      if (isOpen || side === "BUY") {
        rpHtml = escapeHtml(t("realizedOpenOnly"));
      } else {
        const r = resolveTradeRealizedPnl({ ...tr, side: side === "SELL" || side === "CLOSE" ? "SELL" : tr.side });
        if (r.status === "ok" && isFiniteNumber(r.value)) {
          rpHtml = fmtMoney(r.value, currency);
          rpCls = pctClass(r.value);
        } else if (r.status === "missing-cost") {
          rpHtml = escapeHtml(t("costMissing"));
        } else {
          rpHtml = escapeHtml(t("realizedOpenOnly"));
        }
      }
      return `<tr>
        <td>${escapeHtml(tr.date || "")}</td>
        <td>${escapeHtml(label.trim() || "—")}</td>
        <td>${escapeHtml(side === "BUY" ? t("buy") : side === "SELL" ? t("sell") : side)}</td>
        <td class="num">${tr.qty?.toLocaleString(numberLocale()) ?? "—"}</td>
        <td class="num">${fmtNum(px, currency === "TWD" ? 0 : 2)}</td>
        <td class="num ${rpCls}">${rpHtml}</td>
        <td class="why-cell">${escapeHtml(tr.reasonText || tr.reason || "")}</td>
      </tr>`;
    })
    .join("");
  return `
    <div class="paper-deriv-fills">
      <h5>${escapeHtml(t("paperDerivFills"))}</h5>
      <p class="paper-deriv-open-note">${escapeHtml(t("realizedOpenOnly"))} ≠ ${escapeHtml(t("realizedPnl"))}</p>
      <div class="table-wrap">
        <table class="stock-table paper-table">
          <thead>
            <tr>
              <th>${escapeHtml(t("tradeDate"))}</th>
              <th>${escapeHtml(t("paperDerivContract"))}</th>
              <th>${escapeHtml(t("buy"))}/${escapeHtml(t("sell"))}</th>
              <th class="num">${escapeHtml(t("qty"))}</th>
              <th class="num">${escapeHtml(t("price"))}</th>
              <th class="num">${escapeHtml(t("realizedPnl"))}</th>
              <th>${escapeHtml(t("note"))}</th>
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>`;
}

export function renderDerivOverlay(market, paper, state, { optSnap, txf }) {
  const book = paper?.books?.[market];
  if (!book) return "";
  const m = state[market];
  const free = freeCash(paper, market, state);
  if (market === "US") {
    const optPos = (m.positions || []).filter((p) => p.asset === "option");
    let optMv = 0;
    let optUpnl = 0;
    for (const p of optPos) {
      const mv = optionPositionMarkValue({ qty: p.qtySigned, markPremium: p.markPremium });
      const u = optionUnrealizedPnl({
        qtySigned: p.qtySigned,
        avgPremium: p.avgPremium,
        markPremium: p.markPremium,
      });
      if (isFiniteNumber(mv)) optMv += mv;
      if (isFiniteNumber(u)) optUpnl += u;
    }
    return `
      <div class="paper-deriv" data-deriv-market="US">
        <div class="paper-deriv-head">
          <h4>${escapeHtml(t("paperDerivUsTitle"))}</h4>
          <p class="paper-deriv-lead">${escapeHtml(t("paperDerivUsLead"))}</p>
          ${serverBanner(state, "US")}
        </div>
        <div class="paper-deriv-kpis">
          <div><div class="k-label">${escapeHtml(t("paperDerivFreeCash"))}</div><div class="k-val">${fmtMoney(free, "USD")}</div></div>
          <div><div class="k-label">${escapeHtml(t("paperDerivOptMv"))}</div><div class="k-val">${fmtMoney(optMv, "USD")}</div></div>
          <div><div class="k-label">${escapeHtml(t("unrealizedPnl"))}</div><div class="k-val ${pctClass(optUpnl)}">${fmtMoney(optUpnl, "USD")}</div></div>
          <div><div class="k-label">${escapeHtml(t("realizedPnl"))}</div><div class="k-val ${pctClass(m.realizedPnl)}">${fmtMoney(m.realizedPnl, "USD")}</div></div>
        </div>
        ${renderUsTicket(optSnap)}
        <p class="paper-deriv-open-note">${escapeHtml(t("unrealizedPnl"))} · ${escapeHtml(t("realizedOpenOnly"))}</p>
        <div class="pos-scroll" role="region">
          <table class="pos-table deriv-table">
            <thead><tr>
              <th>${escapeHtml(t("paperDerivContract"))}</th>
              <th class="num">${escapeHtml(t("qty"))}</th>
              <th class="num">${escapeHtml(t("avgCost"))}</th>
              <th class="num">${escapeHtml(t("mark"))}</th>
              <th class="num">${escapeHtml(t("mktValue"))}</th>
              <th class="num">${escapeHtml(t("unrealizedPnl"))}</th>
              <th class="num">${escapeHtml(t("paperDerivMarkSrc"))}</th>
              <th class="num">asOf</th>
              <th class="num">mult</th>
            </tr></thead>
            <tbody>${renderUsOptionRows(optPos, paper)}</tbody>
          </table>
        </div>
        ${renderDerivFills(m.trades, "USD")}
      </div>`;
  }

  // TW futures
  const futPos = (m.positions || []).filter((p) => p.asset === "futures");
  let upnl = 0;
  for (const p of futPos) {
    const u = futuresMarkPnlTwd({
      entryPrice: p.avgPrice,
      markPrice: p.mark,
      code: p.code,
      contractsSigned: p.qtySigned,
    });
    if (isFiniteNumber(u)) upnl += u;
  }
  const session = txf?.sessionDate || "—";
  return `
    <div class="paper-deriv" data-deriv-market="TW">
      <div class="paper-deriv-head">
        <h4>${escapeHtml(t("paperDerivTwTitle"))}</h4>
        <p class="paper-deriv-lead">${escapeHtml(t("paperDerivTwLead", { session }))}</p>
        ${serverBanner(state, "TW")}
      </div>
      <div class="paper-deriv-kpis">
        <div><div class="k-label">${escapeHtml(t("paperDerivFreeCash"))}</div><div class="k-val">${fmtMoney(free, "TWD")}</div></div>
        <div><div class="k-label">${escapeHtml(t("paperDerivMarginHold"))}</div><div class="k-val">${fmtMoney(m.marginHold, "TWD")}</div></div>
        <div><div class="k-label">${escapeHtml(t("unrealizedPnl"))}</div><div class="k-val ${pctClass(upnl)}">${fmtMoney(upnl, "TWD")}</div></div>
        <div><div class="k-label">${escapeHtml(t("realizedPnl"))}</div><div class="k-val ${pctClass(m.realizedPnl)}">${fmtMoney(m.realizedPnl, "TWD")}</div></div>
      </div>
      ${renderTwTicket(txf)}
      <p class="paper-deriv-open-note">${escapeHtml(t("unrealizedPnl"))} · ${escapeHtml(t("realizedOpenOnly"))}</p>
      <div class="pos-scroll" role="region">
        <table class="pos-table deriv-table pos-table">
          <thead><tr>
            <th>${escapeHtml(t("paperDerivContract"))}</th>
            <th class="num">${escapeHtml(t("qty"))}</th>
            <th class="num">${escapeHtml(t("avgCost"))}</th>
            <th class="num">${escapeHtml(t("mark"))}</th>
            <th class="num">${escapeHtml(t("unrealizedPnl"))}</th>
            <th class="num">${escapeHtml(t("paperDerivMarginHold"))}</th>
            <th class="num">mult</th>
            <th class="num">${escapeHtml(t("paperDerivMarkSrc"))}</th>
            <th class="num">${escapeHtml(t("paperDerivLastDay"))}</th>
          </tr></thead>
          <tbody>${renderTwFutRows(futPos)}</tbody>
        </table>
      </div>
      ${renderDerivFills(m.trades, "TWD")}
    </div>`;
}

function fillUsStrikes(form, optSnap) {
  const under = form.underlying.value;
  const right = form.right.value;
  const row = (optSnap?.tickers || []).find((r) => r.ticker === under);
  const chain = row?.options?.paperChain;
  const strikeSel = form.strike;
  strikeSel.innerHTML = "";
  if (!chain) return;
  const list = right === "put" ? chain.puts : chain.calls;
  for (const c of list || []) {
    const o = document.createElement("option");
    o.value = String(c.strike);
    o.textContent = `${c.strike} · ${c.premium}`;
    o.dataset.premium = String(c.premium);
    strikeSel.appendChild(o);
  }
  form.querySelector('[data-field="expiry"]').textContent = `${t("optionsExpiry")}: ${chain.expiration || "—"}`;
  updateUsPremiumMeta(form);
}

function updateUsPremiumMeta(form) {
  const opt = form.strike.selectedOptions[0];
  const premium = opt ? Number(opt.dataset.premium) : NaN;
  const qty = Number(form.qty.value);
  const premEl = form.querySelector('[data-field="premium"]');
  const debEl = form.querySelector('[data-field="debit"]');
  if (!isFiniteNumber(premium) || !Number.isInteger(qty) || qty <= 0) {
    premEl.textContent = "—";
    debEl.textContent = "—";
    return;
  }
  premEl.textContent = `${t("paperDerivPremium")}: US$${fmtNum(premium, 2)}`;
  const notional = premium * US_OPTION_MULTIPLIER * qty;
  debEl.textContent = `${t("paperDerivCashImpact")}: US$${fmtNum(notional, 2)} (×${US_OPTION_MULTIPLIER})`;
}

function fillTwMonths(form, txf) {
  const code = form.code.value;
  const spec = txf?.contracts?.[code];
  const monthSel = form.month;
  monthSel.innerHTML = "";
  if (!spec) return;
  const months = [];
  if (spec.near?.month) months.push({ ...spec.near, label: `${spec.near.month} (${t("paperDerivNear")})` });
  if (spec.next?.month && spec.next.month !== spec.near?.month) {
    months.push({ ...spec.next, label: `${spec.next.month} (${t("paperDerivNext")})` });
  }
  for (const m of months) {
    const o = document.createElement("option");
    o.value = m.month;
    o.textContent = m.label;
    o.dataset.last = String(m.last ?? "");
    o.dataset.settle = String(m.settle ?? "");
    monthSel.appendChild(o);
  }
  updateTwMeta(form, txf);
}

function updateTwMeta(form, txf) {
  const code = form.code.value;
  const spec = txf?.contracts?.[code];
  const opt = form.month.selectedOptions[0];
  const qty = Number(form.qty.value);
  const priceEl = form.querySelector('[data-field="price"]');
  const marginEl = form.querySelector('[data-field="margin"]');
  const multEl = form.querySelector('[data-field="mult"]');
  if (!spec || !opt) {
    priceEl.textContent = marginEl.textContent = multEl.textContent = "—";
    return;
  }
  const last = Number(opt.dataset.last);
  const settle = Number(opt.dataset.settle);
  const px = isFiniteNumber(last) && last > 0 ? last : settle;
  priceEl.textContent = `${t("mark")}: ${isFiniteNumber(px) ? fmtNum(px, 0) : "—"}`;
  multEl.textContent = `× NT$${spec.multiplierTwdPerPoint}/pt`;
  const initial = spec.margin?.initial;
  if (isFiniteNumber(initial) && Number.isInteger(qty) && qty > 0) {
    marginEl.textContent = `${t("paperDerivMarginHold")}: ${fmtMoney(initial * qty, "TWD")}`;
  } else marginEl.textContent = "—";
}

function showMsg(form, text, ok) {
  const el = form.querySelector("[data-msg]");
  if (!el) return;
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("ok", !!ok);
  el.classList.toggle("err", !!text && !ok);
}

/**
 * Init paper derivatives after paper section is in DOM.
 * Marks positions, injects UI into each book panel, binds tickets.
 */
export async function initPaperDerivatives(root, paper) {
  if (!root || !paper?.books) return;
  const [optSnap, txf, serverRaw] = await Promise.all([
    loadOptionsSnapshot(),
    loadTxfDesk(),
    loadServerBook(),
  ]);
  const user = loadState();
  stripServerOrigin(user);
  markOptionPositions(user, optSnap);
  markFuturesPositions(user, txf);
  saveState(user);

  const server = serverRaw ? structuredClone(serverRaw) : null;
  if (server) {
    markOptionPositions(server, optSnap);
    markFuturesPositions(server, txf);
  }
  const state = mergeDisplay(user, server);

  const usPanel = root.querySelector("#paper-panel-US");
  const twPanel = root.querySelector("#paper-panel-TW");
  if (usPanel) {
    let host = usPanel.querySelector('[data-deriv-market="US"]');
    const html = renderDerivOverlay("US", paper, state, { optSnap, txf });
    if (host) host.outerHTML = html;
    else usPanel.insertAdjacentHTML("beforeend", html);
  }
  if (twPanel) {
    let host = twPanel.querySelector('[data-deriv-market="TW"]');
    const html = renderDerivOverlay("TW", paper, state, { optSnap, txf });
    if (host) host.outerHTML = html;
    else twPanel.insertAdjacentHTML("beforeend", html);
  }

  const usForm = root.querySelector('[data-deriv-form="us-opt"]');
  if (usForm && optSnap) {
    const refresh = () => fillUsStrikes(usForm, optSnap);
    usForm.underlying.addEventListener("change", refresh);
    usForm.right.addEventListener("change", refresh);
    usForm.strike.addEventListener("change", () => updateUsPremiumMeta(usForm));
    usForm.qty.addEventListener("input", () => updateUsPremiumMeta(usForm));
    refresh();
    usForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const side = ev.submitter?.value || "buy";
      const res = tradeUsOption({
        paper,
        state: user,
        optSnap,
        underlying: usForm.underlying.value,
        right: usForm.right.value,
        strike: Number(usForm.strike.value),
        expiry: optSnap.tickers.find((r) => r.ticker === usForm.underlying.value)?.options?.paperChain
          ?.expiration,
        side,
        contracts: Number(usForm.qty.value),
      });
      if (!res.ok) {
        showMsg(usForm, res.error || t("paperDerivFail"), false);
        return;
      }
      showMsg(usForm, t("paperDerivFillOk", { px: fmtNum(res.premium, 2) }), true);
      initPaperDerivatives(root, paper);
    });
  }

  const twForm = root.querySelector('[data-deriv-form="tw-fut"]');
  if (twForm && txf) {
    const refresh = () => fillTwMonths(twForm, txf);
    twForm.code.addEventListener("change", refresh);
    twForm.month.addEventListener("change", () => updateTwMeta(twForm, txf));
    twForm.qty.addEventListener("input", () => updateTwMeta(twForm, txf));
    refresh();
    twForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const side = ev.submitter?.value || "buy";
      const res = tradeTwFutures({
        paper,
        state: user,
        txf,
        code: twForm.code.value,
        month: twForm.month.value,
        side,
        contracts: Number(twForm.qty.value),
      });
      if (!res.ok) {
        showMsg(twForm, res.error || t("paperDerivFail"), false);
        return;
      }
      showMsg(twForm, t("paperDerivFillOk", { px: fmtNum(res.price, 0) }), true);
      initPaperDerivatives(root, paper);
    });
  }
}

/** Expose for smoke / tests */
export const _test = {
  loadState,
  saveState,
  emptyState,
  freeCash,
  mergeDisplay,
  stripServerOrigin,
  STORAGE_KEY,
  SERVER_URL,
};
