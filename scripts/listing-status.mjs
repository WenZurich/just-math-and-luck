/**
 * Listing status for the daily scan: drop names that are no longer trading
 * =========================================================================
 * Why: ROKU was acquired by Fox and delisted after its 2026-11-06 close. Yahoo keeps
 * returning its frozen 11/06 bar (US$160.52, +0.09%, vol 4.11×), so the scan kept scoring
 * it as if it were today's quote and it reached the 美股清單 / strategy hits.
 *
 * Two independent rules (either one excludes the name at the scan step, before scoring):
 *   1. delisted   — corporate-actions.json (official sources) says the last trading date is
 *                   before the market's latest session.
 *   2. stale      — automatic: the market index (S&P 500 for US, TAIEX for TW) traded on
 *                   ≥ STALE_MIN_SESSIONS sessions after the stock's last daily bar.
 *      frozen     — automatic: the last FROZEN_MIN_SESSIONS bars are all market sessions with
 *                   the same close and zero/missing volume (a feed that pads a dead ticker).
 *
 * What is NOT dropped:
 *   - holidays: sessions are counted on the index's own bars, so a market holiday
 *     (US Thanksgiving 2026-11-26) is not a session and a half day (11/27) is a normal one;
 *   - a one- or two-day halt: 1–2 sessions behind is kept (threshold is 3);
 *   - a stock that is merely flat for a few days but still trades (volume > 0).
 * Pure functions here; no fetching. Inputs that cannot be judged (missing dates) ⇒ keep (never
 * drop a name on a data gap of our own) — except the explicit official delisting list.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const STALE_MIN_SESSIONS = 3;
export const FROZEN_MIN_SESSIONS = 5;
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;
const isYmd = (s) => typeof s === "string" && YMD_RE.test(s) && !Number.isNaN(Date.parse(s + "T00:00:00Z"));

/** corporate-actions.json → actions[] (empty when the file is missing/unreadable). */
export function loadCorporateActions(root) {
  const fp = join(root, "public/data/corporate-actions.json");
  if (!existsSync(fp)) return [];
  try {
    const j = JSON.parse(readFileSync(fp, "utf8"));
    return Array.isArray(j?.actions) ? j.actions : [];
  } catch {
    return [];
  }
}

/**
 * Official delisting that applies to a market session: the action's lastTradingDate is strictly
 * before sessionDate (on the last trading day itself the close is still a real close).
 */
export function delistingFor(actions, ticker, market, sessionDate) {
  if (!isYmd(sessionDate)) return null;
  for (const a of actions || []) {
    if (!a || a.ticker !== ticker) continue;
    if (a.market && market && a.market !== market) continue;
    if (!isYmd(a.lastTradingDate)) continue;
    if (a.lastTradingDate < sessionDate) return a;
  }
  return null;
}

/**
 * Number of market sessions (index bar dates, unique) strictly after lastBarDate.
 * null when lastBarDate is not a date or there are no valid session dates.
 */
export function sessionsBehind(lastBarDate, sessionDates) {
  if (!isYmd(lastBarDate) || !Array.isArray(sessionDates)) return null;
  const uniq = new Set(sessionDates.filter(isYmd));
  if (!uniq.size) return null;
  let n = 0;
  for (const d of uniq) if (d > lastBarDate) n++;
  return n;
}

/**
 * Trailing run of "padded" bars: consecutive last bars (newest first) that fall on market
 * sessions, have the same close as the newest bar and zero/missing volume.
 */
export function frozenRun(recent, sessionDates) {
  if (!Array.isArray(recent) || !recent.length) return 0;
  const ses = new Set((sessionDates || []).filter(isYmd));
  const last = recent[recent.length - 1];
  if (!Number.isFinite(last?.c)) return 0;
  let n = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    const b = recent[i];
    if (!b || !isYmd(b.date) || !ses.has(b.date)) break;
    if (!Number.isFinite(b.c) || b.c !== last.c) break;
    if (Number.isFinite(b.v) && b.v > 0) break;
    n++;
  }
  return n;
}

/**
 * Decide whether a scanned name may be scored today.
 *   { ok, status: "ok"|"delisted"|"stale"|"frozen", reason, sessionsBehind, frozenSessions, action }
 */
export function listingCheck({ ticker, market, lastBarDate, recent = null, sessionDates, actions = [] }) {
  const sessionDate = Array.isArray(sessionDates) ? sessionDates.filter(isYmd).sort().at(-1) || null : null;
  const behind = sessionsBehind(lastBarDate, sessionDates);
  const frozen = frozenRun(recent, sessionDates);
  const base = { ticker, market, lastBarDate: lastBarDate ?? null, sessionDate, sessionsBehind: behind, frozenSessions: frozen };
  const act = delistingFor(actions, ticker, market, sessionDate);
  if (act) {
    return {
      ...base,
      ok: false,
      status: "delisted",
      reason: `官方公告 ${act.lastTradingDate} 是最後交易日（${act.type === "merger" ? `被 ${act.acquirer || act.acquirerTicker || "收購方"} 併購` : "下市"}）`,
      action: { ticker: act.ticker, lastTradingDate: act.lastTradingDate, suspendedFrom: act.suspendedFrom ?? null, sources: act.sources || [] },
    };
  }
  if (behind != null && behind >= STALE_MIN_SESSIONS) {
    return { ...base, ok: false, status: "stale", reason: `最後一根日K ${lastBarDate}，之後大盤已交易 ${behind} 個交易日都沒有成交資料` };
  }
  if (frozen >= FROZEN_MIN_SESSIONS) {
    return { ...base, ok: false, status: "frozen", reason: `最後 ${frozen} 個交易日收盤價完全相同且無成交量` };
  }
  return { ...base, ok: true, status: "ok", reason: "" };
}

/**
 * Split scan metrics into kept / excluded. metrics[i] needs { symbol, lastBarDate, recent }.
 */
export function filterListed(metrics, { market, sessionDates, actions }) {
  const kept = [];
  const excluded = [];
  for (const m of metrics || []) {
    const r = listingCheck({ ticker: m.symbol, market, lastBarDate: m.lastBarDate, recent: m.recent, sessionDates, actions });
    if (r.ok) kept.push(m);
    else excluded.push({ ...r, lastPrice: m.price ?? null });
  }
  return { kept, excluded };
}

/**
 * Session dates for a market from a panel of daily bar-date lists (one list per ticker):
 * a date is a session when at least minShare of the tickers that have data around it traded.
 * Used where no index chart is at hand (strategy packs). Holidays have no bars ⇒ not sessions.
 */
export function sessionDatesFromPanel(barDateLists, { minShare = 0.5, minTickers = 3 } = {}) {
  const lists = (barDateLists || []).filter((l) => Array.isArray(l) && l.length);
  if (lists.length < minTickers) return [];
  const count = new Map();
  for (const l of lists) for (const d of new Set(l.filter(isYmd))) count.set(d, (count.get(d) || 0) + 1);
  return [...count.entries()].filter(([, n]) => n / lists.length >= minShare).map(([d]) => d).sort();
}

/**
 * Remove hits of names that are delisted / stale from strategy packs (in place on a copy).
 *   lastBarDateOf(hit) → YYYY-MM-DD | null;  sessionDatesByMarket = { US: [...], TW: [...] }
 * Returns { strategies, removed: [{ id, ticker, market, status, reason }] }.
 */
export function filterStrategyHits(strategies, { actions = [], sessionDatesByMarket = {}, lastBarDateOf = (h) => h?.ohlcvBarDate ?? null } = {}) {
  const removed = [];
  const out = (strategies || []).map((s) => {
    if (!Array.isArray(s?.hits) || !s.hits.length) return s;
    const hits = s.hits.filter((h) => {
      const market = h?.market || (/\.(TW|TWO)$/i.test(h?.ticker || "") ? "TW" : "US");
      const r = listingCheck({ ticker: h?.ticker, market, lastBarDate: lastBarDateOf(h), sessionDates: sessionDatesByMarket[market] || [], actions });
      if (!r.ok) removed.push({ id: s.id, ticker: h.ticker, market, status: r.status, reason: r.reason });
      return r.ok;
    });
    return hits.length === s.hits.length ? s : { ...s, hits };
  });
  return { strategies: out, removed };
}
