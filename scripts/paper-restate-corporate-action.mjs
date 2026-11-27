#!/usr/bin/env node
/**
 * One-time restatement of the paper ledger for a corporate action that happened BEFORE the
 * engine had a merger rule (ROKU → FOXA, effective 2026-11-06; the ledger kept ROKU marked at its
 * frozen 11/06 close since then).
 *
 *   node scripts/paper-restate-corporate-action.mjs --id ROKU-FOXA-2026-11-06 [--dry]
 *
 * What it does (same rules as the forward engine — paper-corporate-actions.mjs + paperExitAction):
 *   1. Finds the first stored scan (public/data/YYYY-MM-DD.json) whose market close date ≥ the
 *      effective session and books the CONVERT event there (cash + whole acquirer shares + cash in
 *      lieu at the acquirer's official close on the effective date).
 *   2. Replays ONLY the acquirer lot over the following stored scans with the existing exit chain
 *      (stop → limit-up-chase → momentum-break → off-list loss → take-profit), marking it at the
 *      same-session public close (scan price if the acquirer was on the list, else Yahoo daily close
 *      for that scan's US close date — exactly how paper-held-quotes fills off-list holdings).
 *   3. Restates every dailyEquity row from the conversion date: −(source qty × the mark the old
 *      ledger used) + cash received + acquirer lot value. Trades of other tickers are NOT re-simulated
 *      (they are published fills); the cash received simply stays in the book until the next scan.
 *   4. Updates positions / cash / realized P&L / metrics and re-checks, to the cent:
 *        equity = cash + Σ qty·mark;  equity − startCash = realized + unrealized;
 *        last dailyEquity row = book equity;  cash ledger replay (incl. CONVERT cash).
 * Idempotent: refuses to run if the CONVERT event is already in the ledger.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { convertPosition, convertibleActions } from "./paper-corporate-actions.mjs";
import { loadCorporateActions } from "./listing-status.mjs";
import { paperExitAction, realizedPnl, roundHalfAway, bookMarkValue, unrealizedPnlOf, windowPerformance, sma, pctChange } from "./math-core.mjs";
import { EXIT_RULES, EXIT_TEXT } from "./paper-trade.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "public/data");
const PORTFOLIO_PATH = join(DATA, "paper-portfolio.json");
const UA = "Mozilla/5.0 (compatible; JustMathAndLuck/1.0)";
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : null; };
const ID = arg("--id");
const DRY = process.argv.includes("--dry");
const r2 = (n) => roundHalfAway(n, 2);
const taipeiDate = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
const die = (m) => { console.error(`FAIL: ${m}`); process.exit(1); };

function closeDateOf(snap, market) {
  if (market === "US") return snap.usCloseDate || (/美股為 (\d{4}-\d{2}-\d{2}) 收盤/.exec(snap.timezoneNote || "") || [])[1] || null;
  return snap.twCloseDate || (/台股為 (\d{4}-\d{2}-\d{2}) 收盤/.exec(snap.timezoneNote || "") || [])[1] || null;
}
function scanQuote(snap, ticker) {
  for (const l of [snap.top5 || [], snap.us || [], snap.tw || []]) for (const s of l) if (s?.ticker === ticker && typeof s.price === "number") return s;
  return null;
}
function heldQuote(date, asOf, ticker) {
  const fp = join(DATA, "paper-quotes", `${date}.json`);
  if (!existsSync(fp)) return null;
  const h = JSON.parse(readFileSync(fp, "utf8"));
  if (h.scanAsOf !== asOf) return null;
  return (h.quotes || []).find((q) => q.ticker === ticker && typeof q.price === "number" && q.price > 0) || null;
}
async function yahooDaily(symbol, fromYmd, toYmd) {
  const p1 = Math.floor(Date.parse(fromYmd + "T00:00:00Z") / 1000) - 60 * 86400;
  const p2 = Math.floor(Date.parse(toYmd + "T23:59:59Z") / 1000) + 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&period1=${p1}&period2=${p2}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) die(`Yahoo ${symbol} HTTP ${res.status}`);
  const r = (await res.json())?.chart?.result?.[0];
  const q = r?.indicators?.quote?.[0];
  const off = r?.meta?.gmtoffset ?? 0;
  return (r?.timestamp || [])
    .map((t, k) => ({ date: new Date((t + off) * 1000).toISOString().slice(0, 10), c: q?.close?.[k] }))
    .filter((b) => Number.isFinite(b.c));
}

async function main() {
  if (!ID) die("--id required");
  const action = convertibleActions(loadCorporateActions(ROOT)).find((a) => a.id === ID);
  if (!action) die(`no convertible action ${ID} in corporate-actions.json`);
  const market = action.market;
  const pc = action.paperConversion;
  const portfolio = JSON.parse(readFileSync(PORTFOLIO_PATH, "utf8"));
  const book = portfolio.books[market];
  if (book.trades.some((t) => t.side === "CONVERT" && t.corporateActionId === ID)) {
    console.log(`NO-OP: ${ID} already in the ${market} ledger`);
    return;
  }
  const pos = book.positions.find((p) => p.ticker === action.ticker);
  if (!pos) die(`${action.ticker} not held in ${market} book`);

  // Replay the source ticker's trades: qty must equal the held qty and nothing may trade after the deal.
  let q = 0;
  for (const t of book.trades.filter((t) => t.ticker === action.ticker)) {
    if (t.date > pc.effectiveSession && t.side === "BUY") die(`${action.ticker} bought after the deal (${t.date})`);
    q += t.side === "BUY" ? t.qty : -t.qty;
  }
  if (q !== pos.qty) die(`trade replay qty ${q} ≠ held ${pos.qty} (trimmed log?)`);

  const lastDate = taipeiDate(portfolio.lastProcessedAsOf);
  const snaps = readdirSync(DATA)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.slice(0, 10))
    .filter((d) => d <= lastDate)
    .sort()
    .map((d) => ({ date: d, snap: JSON.parse(readFileSync(join(DATA, `${d}.json`), "utf8")) }));
  const iConv = snaps.findIndex(({ snap }) => (closeDateOf(snap, market) || "") >= pc.effectiveSession);
  if (iConv < 0) die("no stored scan on/after the effective session");
  const conv0 = snaps[iConv];
  if (taipeiDate(conv0.snap.asOf) !== conv0.date) die(`snapshot ${conv0.date} asOf ${conv0.snap.asOf} date mismatch`);
  const after = snaps.slice(iConv);

  // Mark the old ledger used for the source ticker on each date (scan → held quote → carry).
  let prevMark = null;
  for (const { date, snap } of snaps.slice(0, iConv + 1).reverse()) {
    const s = scanQuote(snap, action.ticker) || heldQuote(date, snap.asOf, action.ticker);
    if (s) { prevMark = s.price; break; }
  }
  const srcMark = new Map();
  for (const { date, snap } of after) {
    const s = scanQuote(snap, action.ticker) || heldQuote(date, snap.asOf, action.ticker);
    if (s) prevMark = s.price;
    srcMark.set(date, prevMark);
  }
  if (srcMark.get(lastDate) !== pos.mark) die(`derived ${action.ticker} mark ${srcMark.get(lastDate)} ≠ ledger mark ${pos.mark}`);

  // Conversion on a mini-book that holds only the source lot (gives the exact cash / realized / new lot).
  const mini = { market, currency: book.currency, cash: 0, realizedPnl: 0, positions: [{ ...pos, mark: srcMark.get(conv0.date) }], trades: [] };
  const convTrade = convertPosition(mini, action, { date: conv0.date, asOf: conv0.snap.asOf, recordTrade: (b, t) => b.trades.push(t) });
  if (!convTrade) die("conversion refused");
  const c = convTrade.conversion;

  // Acquirer lot replay with the existing exit chain.
  const acqTicker = action.acquirerTicker;
  const bars = await yahooDaily(acqTicker, pc.effectiveSession, closeDateOf(after.at(-1).snap, market));
  const effBar = bars.find((b) => b.date === pc.effectiveSession);
  if (!effBar || roundHalfAway(effBar.c, 2) !== pc.acquirerClose) die(`Yahoo ${acqTicker} ${pc.effectiveSession} close ${effBar?.c} ≠ recorded ${pc.acquirerClose}`);
  let lot = mini.positions.find((p) => p.ticker === acqTicker) || null;
  const replay = [];
  const sales = [];
  const lotByDate = new Map();
  for (const [k, { date, snap }] of after.entries()) {
    if (!lot || lot.qty <= 0) { lotByDate.set(date, { qty: 0, mark: null }); continue; }
    const ses = closeDateOf(snap, market);
    let quote = scanQuote(snap, acqTicker);
    let source = "scan";
    if (!quote) {
      const j = bars.findIndex((b) => b.date === ses);
      if (j >= 1) {
        const closes = bars.slice(0, j + 1).map((b) => b.c);
        const price = closes[j];
        const s20 = sma(closes, 20);
        quote = { price: roundHalfAway(price, price >= 100 ? 2 : 4), dayPct: roundHalfAway(pctChange(closes[j - 1], price), 2), aboveSma20: s20 != null ? price >= s20 : undefined };
        source = `Yahoo ${acqTicker} daily close ${ses}`;
      }
    }
    // Conversion day: the lot was just created at the effective-date close; the engine has no same-day
    // quote for it in that scan (held-quotes ran before the conversion), so no sell rule runs.
    if (k === 0) quote = null;
    if (!quote) {
      lotByDate.set(date, { qty: lot.qty, mark: lot.mark });
      replay.push({ date, session: ses, price: lot.mark, action: k === 0 ? "converted (no sell rule on conversion day)" : "no same-session quote — hold" });
      continue;
    }
    lot.mark = quote.price;
    const inList = new Set((snap.us || []).map((s) => s.ticker)).has(acqTicker);
    const exit = paperExitAction(
      { mark: quote.price, avgCost: lot.avgCost, qty: lot.qty, dayPct: quote.dayPct, aboveSma20: quote.aboveSma20, limitUpStyle: false, openedOn: lot.openedOn, date, inList, lotSize: 1 },
      EXIT_RULES
    );
    const row = { date, session: ses, price: quote.price, dayPct: quote.dayPct, aboveSma20: quote.aboveSma20, inList, source, action: exit ? `${exit.reason} sell ${exit.qty}` : "hold" };
    replay.push(row);
    if (exit) {
      const rp = realizedPnl(quote.price, lot.avgCost, exit.qty);
      if (rp == null) die(`realized off-domain for ${acqTicker} ${date}`);
      sales.push({
        date, asOf: snap.asOf, side: "SELL", ticker: acqTicker, name: lot.name, qty: exit.qty, price: quote.price,
        avgCostAtSale: roundHalfAway(lot.avgCost, 6), reason: exit.reason, reasonText: EXIT_TEXT[exit.reason], realizedPnl: r2(rp),
        fromCorporateAction: ID,
      });
      lot.qty -= exit.qty;
    }
    lotByDate.set(date, { qty: lot.qty, mark: lot.qty > 0 ? lot.mark : null });
  }

  // Restate dailyEquity.
  const rows = book.dailyEquity;
  const afterDates = new Set(after.map((x) => x.date));
  for (const r of rows) if (r.date >= conv0.date && !afterDates.has(r.date)) die(`dailyEquity ${r.date} has no stored scan`);
  const restated = [];
  for (const r of rows) {
    if (r.date < conv0.date) continue;
    if (Math.abs(r2(r.cash + r.positionsValue) - r.equity) > 0.011) die(`old row ${r.date} equity ≠ cash + positionsValue`);
    const sold = sales.filter((s) => s.date <= r.date).reduce((a, s) => a + s.qty * s.price, 0);
    const l = lotByDate.get(r.date);
    const acqValue = l && l.qty > 0 ? l.qty * l.mark : 0;
    const srcValue = pos.qty * srcMark.get(r.date);
    const cash = r2(r.cash + c.cashTotal + sold);
    const pv = r2(r.positionsValue - srcValue + acqValue);
    const nr = { date: r.date, equity: r2(cash + pv), cash, positionsValue: pv };
    restated.push({ date: r.date, before: { ...r }, after: nr, srcValue: r2(srcValue), acqValue: r2(acqValue), cashIn: r2(c.cashTotal + sold) });
    Object.assign(r, nr);
  }

  // Book state.
  const saleRealized = sales.reduce((a, s) => a + s.realizedPnl, 0);
  const cashBefore = book.cash, equityBefore = book.equity, realizedBefore = book.realizedPnl;
  book.positions = book.positions.filter((p) => p.ticker !== action.ticker);
  if (lot && lot.qty > 0) book.positions.push(lot);
  book.cash = r2(book.cash + c.cashTotal + sales.reduce((a, s) => a + s.qty * s.price, 0));
  book.realizedPnl = r2(book.realizedPnl + convTrade.realizedPnl + saleRealized);
  const v = bookMarkValue(book.positions, book.cash);
  book.positionsValue = r2(v.positionsValue);
  book.equity = r2(v.equity);
  const last = rows[rows.length - 1];
  if (last.equity !== book.equity || last.cash !== book.cash) die(`last dailyEquity ${last.equity}/${last.cash} ≠ book ${book.equity}/${book.cash}`);
  const un = book.positions.reduce((a, p) => a + unrealizedPnlOf(p.mark, p.avgCost, p.qty), 0);
  if (Math.abs(book.equity - book.startCash - (book.realizedPnl + un)) > 0.02) die("identity equity − start = realized + unrealized broken");
  const expEquity = equityBefore - pos.qty * pos.mark + c.cashTotal + sales.reduce((a, s) => a + s.qty * s.price, 0) + (lot && lot.qty > 0 ? lot.qty * lot.mark : 0);
  if (Math.abs(expEquity - book.equity) > 0.011) die(`equity bridge ${expEquity} ≠ ${book.equity}`);

  // Trades: CONVERT before the conversion day's fills; acquirer SELLs after that day's other sells.
  convTrade.conversion.restatement = {
    restatedOn: new Date().toISOString().slice(0, 10),
    reason: "The engine had no merger rule when the deal closed; the ledger kept the source marked at its frozen last close. Restated from the conversion date with the same rules the engine now applies.",
    fromDate: conv0.date,
    toDate: lastDate,
    acquirerReplay: replay,
    otherTradesNote: "Fills of other tickers between these dates are unchanged (not re-simulated); the cash received stayed in the book and is available from the next scan.",
  };
  const trades = book.trades;
  const iC = trades.findIndex((t) => t.date >= conv0.date);
  trades.splice(iC < 0 ? trades.length : iC, 0, convTrade);
  for (const s of sales) {
    let i = trades.findIndex((t) => t.date > s.date || (t.date === s.date && t.side === "BUY"));
    trades.splice(i < 0 ? trades.length : i, 0, s);
  }

  // Metrics (same formulas as paper-trade computeBookMetrics).
  const totalPnl = r2(book.equity - book.startCash);
  const m = { totalPnl, totalPnlPct: roundHalfAway((totalPnl / book.startCash) * 100, 4), realizedPnl: r2(book.realizedPnl), unrealizedPnl: r2(un) };
  for (const [key, days] of [["week", 7], ["month", 30], ["quarter", 90], ["year", 365]]) {
    const w = windowPerformance(book.dailyEquity, days);
    if (!w) die(`window ${key} refused`);
    m[key] = w;
  }
  portfolio.metrics[market] = m;

  const summary = {
    id: ID, market, conversionDate: conv0.date, conversion: c, convertRealized: convTrade.realizedPnl,
    sales, saleRealized: r2(saleRealized),
    book: { cashBefore, cashAfter: book.cash, equityBefore, equityAfter: book.equity, realizedBefore, realizedAfter: book.realizedPnl, unrealizedAfter: m.unrealizedPnl },
    restated: restated.map((x) => ({ date: x.date, equityBefore: x.before.equity, equityAfter: x.after.equity, delta: r2(x.after.equity - x.before.equity) })),
    replay,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (DRY) { console.log("DRY: nothing written"); return; }
  const json = JSON.stringify(portfolio, null, 2) + "\n";
  writeFileSync(PORTFOLIO_PATH, json);
  const docs = join(ROOT, "docs/data");
  if (existsSync(join(ROOT, "docs"))) { mkdirSync(docs, { recursive: true }); writeFileSync(join(docs, "paper-portfolio.json"), json); }
  console.log(`Wrote ${PORTFOLIO_PATH}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
