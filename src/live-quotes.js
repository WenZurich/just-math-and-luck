/**
 * Client-side near-real-time quote overlay (GitHub Pages — no always-on server).
 *
 * Architecture:
 *  - Poll public Yahoo Finance spark (batch US + TW Yahoo symbols) while the tab is visible.
 *  - Prefer TWSE MIS (mis.twse.com.tw) for TW indices (TAIEX/OTC) and TW listings when reachable.
 *  - CORS: try direct fetch first; fall back to r.jina.ai (same pattern as lookup.js).
 *  - Daily JSON remains the overnight baseline; this layer only overlays last / change.
 *  - On fetch failure: keep last-good values and show an honest stale/asOf — never invent prices.
 *
 * Intervals (Asia/Taipei clock):
 *  - TW or US cash session open → ~20s
 *    (incl. Fri US session spill into Sat early morning Taipei,
 *     and Sun evening Taipei for US open)
 *  - Off-hours / weekend → ~5 min
 *  Page Visibility API pauses the timer when the document is hidden.
 *  When a price/pct actually changes, flash the number (CSS .lq-flash).
 *  Status pill shows Taipei clock 「報價 HH:MM:SS」 on each successful poll.
 */
import { escapeHtml } from "./glossary.js";
import { t, numberLocale } from "./i18n.js";

const YAHOO_HOSTS = [
  "https://query2.finance.yahoo.com",
  "https://query1.finance.yahoo.com",
];
const JINA = "https://r.jina.ai/";
const MIS_URL =
  "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch=";

/** Map 「熱門」 chip keys → Yahoo spark symbols (OTC index has no reliable Yahoo symbol). */
const INDEX_YAHOO = {
  tw: "^TWII",
  spx: "^GSPC",
  nasdaq: "^IXIC",
  sox: "^SOX",
  usdTwd: "USDTWD=X",
};

const INDEX_MIS = {
  tw: "tse_t00.tw",
  otc: "otc_o00.tw",
};

const SPARK_CHUNK = 14;
const OPEN_MS = 20_000;
const CLOSED_MS = 5 * 60_000;

let timer = null;
let visibilityBound = false;
let lastGood = new Map(); // symbol → { price, prev, changePct, asOfMs, source, currency }
let lastSuccessAt = null;
let lastAttemptOk = false;
let running = false;
let rootEl = null;

function extractJson(text) {
  if (!text) return null;
  const trimmed = String(text).trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      /* continue */
    }
  }
  const md = trimmed.match(/Markdown Content:\s*(\{[\s\S]*|\[[\s\S]*)/i);
  const blob = md ? md[1].trim() : trimmed;
  const start = blob.search(/[\{\[]/);
  if (start < 0) return null;
  const slice = blob.slice(start);
  for (let end = slice.length; end > 2; end--) {
    try {
      return JSON.parse(slice.slice(0, end));
    } catch {
      /* shrink */
    }
    const cut = Math.max(slice.lastIndexOf("}", end - 2), slice.lastIndexOf("]", end - 2));
    if (cut < 8) break;
    end = cut + 2;
  }
  return null;
}

async function fetchText(url, { timeoutMs = 14000 } = {}) {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timerId = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetch(url, {
      signal: ctrl?.signal,
      headers: { Accept: "application/json,text/plain,*/*" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    if (timerId) clearTimeout(timerId);
  }
}

/** Direct then jina — mirrors lookup.js fetchYahooJson. */
async function fetchPublicJson(absoluteUrl) {
  const errors = [];
  try {
    const text = await fetchText(absoluteUrl, { timeoutMs: 10000 });
    const data = extractJson(text);
    if (data) return { ok: true, data, via: "direct" };
    errors.push("direct: non-json");
  } catch (e) {
    errors.push(`direct: ${e.message || e}`);
  }
  try {
    const text = await fetchText(`${JINA}${absoluteUrl}`, { timeoutMs: 20000 });
    const data = extractJson(text);
    if (data) return { ok: true, data, via: "jina" };
    errors.push("jina: parse");
  } catch (e) {
    errors.push(`jina: ${e.message || e}`);
  }
  return { ok: false, data: null, via: null, error: errors.slice(0, 3).join(" · ") };
}


function cssAttrEscape(sym) {
  // Attribute selector escape for tickers like BRK-B / 2330.TW
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(sym);
  return String(sym).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pctClass(n) {
  if (n == null || Number.isNaN(n)) return "flat";
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}

function fmtNum(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(numberLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtPct(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${Number(n).toFixed(digits)}%`;
}

function fmtPrice(n, currency) {
  if (n == null || Number.isNaN(n)) return "—";
  const digits = currency === "TWD" && n >= 100 ? 0 : currency === "TWD" ? 2 : 2;
  const prefix = currency === "USD" ? "$" : currency === "TWD" ? "NT$" : "";
  // paper uses US$/NT$ — detect via data-lq-money-prefix when patching
  return `${prefix}${fmtNum(n, digits)}`;
}

function fmtMoneyPaper(n, currency) {
  if (n == null || Number.isNaN(n)) return "—";
  const digits = currency === "TWD" ? 0 : 2;
  const prefix = currency === "USD" ? "US$" : currency === "TWD" ? "NT$" : "";
  return `${prefix}${fmtNum(n, digits)}`;
}

function fmtPricePaper(n, currency) {
  if (n == null || Number.isNaN(n)) return "—";
  const digits = currency === "TWD" && n >= 100 ? 0 : 2;
  const prefix = currency === "USD" ? "US$" : currency === "TWD" ? "NT$" : "";
  return `${prefix}${fmtNum(n, digits)}`;
}

/** Parts in Asia/Taipei for session clock. */
function taipeiParts(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (typ) => parts.find((p) => p.type === typ)?.value;
  return {
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: get("weekday"), // Mon..Sun
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function isWeekdayTaipei(parts = taipeiParts()) {
  return !["Sat", "Sun"].includes(parts.weekday);
}

/** Rough cash-session windows in Taipei local time (DST-aware enough for cadence, not for trading). */
export function marketSessions(now = new Date()) {
  const p = taipeiParts(now);
  const mins = p.hour * 60 + p.minute;
  const weekday = isWeekdayTaipei(p);
  // TW: 09:00–13:35
  const twOpen = weekday && mins >= 9 * 60 && mins <= 13 * 60 + 35;
  // US regular ≈ 21:30–04:00 Taipei (EDT) / 22:30–05:00 (EST) — wide window 21:00–05:15
  // Weekday evening/night covers Mon–Fri US cash; Fri session spills into Sat ≤05:15 Taipei.
  const usWeeknight = weekday && (mins >= 21 * 60 || mins <= 5 * 60 + 15);
  const usFriSpillSat = p.weekday === "Sat" && mins <= 5 * 60 + 15;
  // US Sunday evening open in Taipei (Sun ≥ 21:00) — futures / cash open
  const usSunEve = p.weekday === "Sun" && mins >= 21 * 60;
  return {
    twOpen,
    usOpen: usWeeknight || usFriSpillSat || usSunEve,
    weekday,
    parts: p,
  };
}

function refreshIntervalMs() {
  const { twOpen, usOpen } = marketSessions();
  return twOpen || usOpen ? OPEN_MS : CLOSED_MS;
}

function fmtAsOfShort(ms) {
  try {
    return (
      new Date(ms).toLocaleString(numberLocale(), {
        timeZone: "Asia/Taipei",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + t("taipei")
    );
  } catch {
    return "—";
  }
}

function yahooSymFromTicker(ticker) {
  const raw = String(ticker || "").trim().toUpperCase();
  if (!raw) return null;
  if (/^\d{4}\.(TW|TWO)$/.test(raw)) return raw;
  if (/^\d{4}$/.test(raw)) return `${raw}.TW`;
  return raw.replace(/\./g, "-");
}

function preferTwMisCode(yahooOrTicker) {
  const s = String(yahooOrTicker || "").toUpperCase();
  const m = s.match(/^(\d{4})\.(TW|TWO)$/) || s.match(/^(\d{4})$/);
  if (!m) return null;
  const code = m[1];
  const otc = /\.TWO$/.test(s);
  return otc ? `otc_${code}.tw` : `tse_${code}.tw`;
}

function remember(sym, quote) {
  if (!sym || quote?.price == null || Number.isNaN(quote.price)) return;
  lastGood.set(sym, { ...quote, asOfMs: quote.asOfMs || Date.now() });
}

function parseSparkResult(data) {
  const rows = data?.spark?.result;
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (const r of rows) {
    const sym = r?.symbol;
    const meta = (r?.response || [{}])[0]?.meta || {};
    const price = meta.regularMarketPrice;
    if (price == null || Number.isNaN(Number(price))) continue;
    const prev =
      meta.chartPreviousClose ?? meta.previousClose ?? null;
    let changePct = null;
    let change = null;
    if (prev != null && prev !== 0) {
      change = Number(price) - Number(prev);
      changePct = (change / Number(prev)) * 100;
    }
    const asOfMs =
      typeof meta.regularMarketTime === "number"
        ? meta.regularMarketTime * (meta.regularMarketTime < 1e12 ? 1000 : 1)
        : Date.now();
    out.push({
      symbol: sym,
      price: Number(price),
      prev: prev != null ? Number(prev) : null,
      change,
      changePct,
      currency: meta.currency || null,
      asOfMs,
      source: "yahoo-spark",
    });
  }
  return out;
}

async function fetchYahooSpark(symbols) {
  const uniq = [...new Set(symbols.filter(Boolean))];
  if (!uniq.length) return { ok: true, quotes: [], via: null };
  const all = [];
  let via = null;
  let anyOk = false;
  let lastErr = null;
  for (const group of chunks(uniq, SPARK_CHUNK)) {
    const path = `/v7/finance/spark?symbols=${encodeURIComponent(group.join(","))}&range=1d&interval=5m`;
    let got = null;
    for (const host of YAHOO_HOSTS) {
      const res = await fetchPublicJson(`${host}${path}`);
      if (res.ok) {
        got = res;
        break;
      }
      lastErr = res.error;
    }
    if (!got?.ok) continue;
    anyOk = true;
    via = got.via;
    all.push(...parseSparkResult(got.data));
  }
  return { ok: anyOk, quotes: all, via, error: anyOk ? null : lastErr };
}

function parseMisNum(v) {
  if (v == null || v === "" || v === "-" || v === "—" || v === "null") return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseMisPayload(data) {
  const arr = data?.msgArray;
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const m of arr) {
    const code = m?.c;
    if (!code) continue;
    const price = parseMisNum(m.z) ?? parseMisNum(m.pz) ?? parseMisNum(m.o);
    const prev = parseMisNum(m.y);
    if (price == null) continue;
    let changePct = null;
    let change = null;
    if (prev != null && prev !== 0) {
      change = price - prev;
      changePct = (change / prev) * 100;
    }
    const ex = m.ex === "otc" ? "otc" : "tse";
    let symbol;
    if (code === "t00") symbol = "__MIS_TWII";
    else if (code === "o00") symbol = "__MIS_OTC";
    else symbol = `${code}.${ex === "otc" ? "TWO" : "TW"}`;
    const tlong = parseMisNum(m.tlong);
    out.push({
      symbol,
      price,
      prev,
      change,
      changePct,
      currency: "TWD",
      asOfMs: tlong || Date.now(),
      source: "twse-mis",
      misCode: code,
      misEx: ex,
    });
  }
  return out;
}

async function fetchMis(exChList) {
  const uniq = [...new Set(exChList.filter(Boolean))];
  if (!uniq.length) return { ok: true, quotes: [], via: null };
  // MIS allows | -joined batch
  const url = `${MIS_URL}${uniq.join("|")}`;
  const res = await fetchPublicJson(url);
  if (!res.ok) return { ok: false, quotes: [], via: null, error: res.error };
  return { ok: true, quotes: parseMisPayload(res.data), via: res.via };
}

/** Collect symbols currently displayed (and always-on index set). */
function collectWatchlist(root) {
  const yahoo = new Set(Object.values(INDEX_YAHOO));
  yahoo.add("SOXL");
  const mis = new Set(Object.values(INDEX_MIS));

  root.querySelectorAll("[data-lq-sym]").forEach((el) => {
    const sym = el.getAttribute("data-lq-sym");
    const y = yahooSymFromTicker(sym);
    if (y) yahoo.add(y);
    const misCode = preferTwMisCode(sym);
    if (misCode) mis.add(misCode);
  });

  return { yahoo: [...yahoo], mis: [...mis] };
}

function setTone(el, n) {
  if (!el) return;
  el.classList.remove("up", "down", "flat", "lk-up", "lk-down", "lk-flat", "sx-up", "sx-down", "sx-flat");
  const cls = pctClass(n);
  el.classList.add(cls);
}

function flashEl(el) {
  if (!el) return;
  el.classList.remove("lq-flash");
  // retrigger CSS animation when the same element updates again
  void el.offsetWidth;
  el.classList.add("lq-flash");
  window.setTimeout(() => {
    el.classList.remove("lq-flash");
  }, 700);
}

/** Patch text; briefly flash when the visible number actually changes. */
function patchText(el, text, { flash = false } = {}) {
  if (!el) return;
  if (el.textContent !== text) {
    el.textContent = text;
    if (flash) flashEl(el);
  }
}

function fmtClockTaipei(ms = Date.now()) {
  try {
    return new Date(ms).toLocaleTimeString("en-GB", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

function applyIndexChip(root, key, quote, fxExtra) {
  const nodes = root.querySelectorAll(`[data-lq-key="${key}"]`);
  if (!nodes.length || !quote || quote.price == null) return;
  const digits = key === "usdTwd" ? 3 : 2;
  nodes.forEach((chip) => {
    chip.classList.remove("incomplete");
    const valEl = chip.querySelector("[data-lq-field='value'], .value");
    patchText(valEl, fmtNum(quote.price, digits), { flash: true });
    // Keep the chip's session date honest when a live quote replaces the close
    const dateEl = chip.querySelector("[data-lq-field='date']");
    if (dateEl && quote.asOfMs) {
      try {
        const md = new Date(quote.asOfMs).toLocaleDateString("en-US", {
          timeZone: "Asia/Taipei", month: "2-digit", day: "2-digit",
        });
        dateEl.textContent = md;
      } catch { /* keep server date */ }
    }
    let pctEl = chip.querySelector("[data-lq-field='dayPct'], .pct");
    if (key === "usdTwd") {
      // Keep CBC taipeiClose line; refresh Yahoo leg when known
      if (pctEl && fxExtra) {
        const taipei =
          fxExtra.taipeiClose != null ? fmtNum(fxExtra.taipeiClose, 3) : "—";
        pctEl.className = "pct flat";
        pctEl.style.fontSize = "0.7rem";
        pctEl.textContent = `${t("taipeiClose")} ${taipei} · Yahoo ${fmtNum(quote.price, 3)}`;
      }
    } else if (quote.changePct != null) {
      if (!pctEl) {
        pctEl = document.createElement("div");
        pctEl.className = "pct";
        pctEl.setAttribute("data-lq-field", "dayPct");
        chip.appendChild(pctEl);
      }
      pctEl.className = `pct ${pctClass(quote.changePct)}`;
      pctEl.setAttribute("data-lq-field", "dayPct");
      patchText(pctEl, fmtPct(quote.changePct), { flash: true });
    }
  });
}

function applyTickerNodes(root, sym, quote) {
  if (!quote || quote.price == null) return;
  const currency =
    quote.currency ||
    (/\.(TW|TWO)$/i.test(sym) ? "TWD" : "USD");
  const nodes = root.querySelectorAll(`[data-lq-sym="${cssAttrEscape(sym)}"]`);
  nodes.forEach((el) => {
    const role = el.getAttribute("data-lq");
    if (role === "soxl") return; // hero handled by applySoxl
    if (role === "pos") {
      applyPaperRow(el, quote, currency);
      return;
    }
    const priceEls = el.querySelectorAll("[data-lq-field='price']");
    const pctEls = el.querySelectorAll("[data-lq-field='dayPct']");
    if (priceEls.length || pctEls.length) {
      priceEls.forEach((p) => patchText(p, fmtPrice(quote.price, currency), { flash: true }));
      pctEls.forEach((p) => {
        setTone(p, quote.changePct);
        patchText(p, fmtPct(quote.changePct), { flash: true });
      });
      return;
    }
    // Fallback: pick-card / mobile card heuristics
    const price = el.querySelector(".price");
    const dayPct = el.querySelector(".day-pct");
    if (price) patchText(price, fmtPrice(quote.price, currency), { flash: true });
    if (dayPct) {
      setTone(dayPct, quote.changePct);
      patchText(dayPct, fmtPct(quote.changePct), { flash: true });
    }
  });
}

function applyPaperRow(row, quote, currency) {
  const qty = Number(row.getAttribute("data-lq-qty"));
  const avg = Number(row.getAttribute("data-lq-avg"));
  const ccy = row.getAttribute("data-lq-ccy") || currency;
  const mark = quote.price;
  const dayPct = quote.changePct;
  const cells = row.querySelectorAll("td");
  // columns: sym, qty, mark, mv, dayPnl$, dayPct, u$, u%, cost, avg, weight
  if (cells.length < 10) return;
  patchText(cells[2], fmtPricePaper(mark, ccy), { flash: true });
  if (Number.isFinite(qty)) {
    const mv = mark * qty;
    patchText(cells[3], fmtMoneyPaper(mv, ccy));
    const dayPnl =
      dayPct != null && Number.isFinite(dayPct) ? (mark * qty * dayPct) / 100 : null;
    cells[4].className = `num ${pctClass(dayPnl)}`;
    patchText(cells[4], dayPnl == null ? "—" : fmtMoneyPaper(dayPnl, ccy));
    if (Number.isFinite(avg)) {
      const u = (mark - avg) * qty;
      const r = avg ? ((mark - avg) / avg) * 100 : 0;
      cells[6].className = `num ${pctClass(u)}`;
      patchText(cells[6], fmtMoneyPaper(u, ccy));
      cells[7].className = `num ${pctClass(r)}`;
      patchText(cells[7], fmtPct(r));
    }
  }
  cells[5].className = `num ${pctClass(dayPct)}`;
  patchText(cells[5], fmtPct(dayPct), { flash: true });
  row.setAttribute("data-lq-mark", String(mark));
  if (dayPct != null) row.setAttribute("data-lq-daypct", String(dayPct));
}

function recomputePaperBookKpis(root) {
  root.querySelectorAll("[data-lq-book]").forEach((book) => {
    const id = book.getAttribute("data-lq-book");
    const cash = Number(book.getAttribute("data-lq-cash"));
    const start = Number(book.getAttribute("data-lq-start"));
    const ccy = book.getAttribute("data-lq-ccy") || (id === "TW" ? "TWD" : "USD");
    if (!Number.isFinite(cash)) return;
    let posMv = 0;
    book.querySelectorAll(".pos-row[data-lq-sym]").forEach((row) => {
      const qty = Number(row.getAttribute("data-lq-qty"));
      const mark = Number(row.getAttribute("data-lq-mark"));
      if (Number.isFinite(qty) && Number.isFinite(mark)) posMv += qty * mark;
    });
    // Also weight column refresh
    const bookMv = posMv;
    book.querySelectorAll(".pos-row[data-lq-sym]").forEach((row) => {
      const qty = Number(row.getAttribute("data-lq-qty"));
      const mark = Number(row.getAttribute("data-lq-mark"));
      const cells = row.querySelectorAll("td");
      if (cells.length >= 11 && Number.isFinite(qty) && Number.isFinite(mark) && bookMv > 0) {
        const w = ((mark * qty) / bookMv) * 100;
        patchText(cells[10], `${w.toFixed(2)}%`);
      }
    });
    const equity = cash + posMv;
    const pnl = Number.isFinite(start) ? equity - start : null;
    const pnlPct =
      Number.isFinite(start) && start !== 0 ? ((equity - start) / start) * 100 : null;
    const kpiEquity = book.querySelector("[data-lq-kpi='equity']");
    const kpiPnl = book.querySelector("[data-lq-kpi='pnl']");
    const kpiPnlPct = book.querySelector("[data-lq-kpi='pnlPct']");
    if (kpiEquity) patchText(kpiEquity, fmtMoneyPaper(equity, ccy));
    if (kpiPnl && pnl != null) {
      setTone(kpiPnl, pnl);
      patchText(kpiPnl, fmtMoneyPaper(pnl, ccy));
    }
    if (kpiPnlPct && pnlPct != null) {
      setTone(kpiPnlPct, pnlPct);
      patchText(kpiPnlPct, fmtPct(pnlPct));
    }
  });
}

function applySoxl(root, quote) {
  if (!quote || quote.price == null) return;
  const priceEl = root.querySelector("#sx-root .sx-price");
  const chgEl = root.querySelector("#sx-root .sx-chg");
  const chgpEl = root.querySelector("#sx-root .sx-chgp");
  const row = root.querySelector("#sx-root .sx-price-row");
  const session = root.querySelector("#sx-root .sx-session");
  if (priceEl) patchText(priceEl, `$${fmtNum(quote.price, 2)}`, { flash: true });
  if (chgEl) {
    if (quote.change == null || Number.isNaN(quote.change)) patchText(chgEl, "—");
    else {
      const sign = quote.change > 0 ? "+" : "";
      patchText(chgEl, `${sign}${fmtNum(quote.change, 2)}`);
    }
  }
  if (chgpEl) patchText(chgpEl, fmtPct(quote.changePct), { flash: true });
  if (row) {
    row.classList.remove("sx-up", "sx-down", "sx-flat");
    const d = pctClass(quote.changePct ?? quote.change);
    row.classList.add(d === "up" ? "sx-up" : d === "down" ? "sx-down" : "sx-flat");
  }
  if (session) {
    const asOf = fmtAsOfShort(quote.asOfMs || Date.now());
    patchText(session, `live · ${t("dataAsOf")} ${asOf}`);
  }
}

function resolveQuote(map, ticker) {
  const y = yahooSymFromTicker(ticker);
  if (y && map.has(y)) return map.get(y);
  // TW MIS may store as 2330.TW even when Yahoo used .TWO
  if (y && y.endsWith(".TW")) {
    const alt = y.replace(/\.TW$/, ".TWO");
    if (map.has(alt)) return map.get(alt);
  }
  if (y && y.endsWith(".TWO")) {
    const alt = y.replace(/\.TWO$/, ".TW");
    if (map.has(alt)) return map.get(alt);
  }
  return null;
}

function paintStatus(root, { ok, stale }) {
  // Live clock lives in .brand-meta as a suffix — never on the 熱門 strip
  const el = root.querySelector("#lq-live-suffix");
  if (!el) return;
  const clock = lastSuccessAt ? fmtClockTaipei(lastSuccessAt) : "";
  // Both TW and US cash sessions closed (nights, weekends): nothing is live,
  // so say 休市 instead of 即時 / 暫緩. 暫緩 is reserved for a failed fetch while a market is open.
  const { twOpen, usOpen } = marketSessions();
  if (!twOpen && !usOpen) {
    el.hidden = false;
    el.dataset.state = "closed";
    el.title = t("liveQuotesClosedTitle");
    el.textContent = ` · ${t("liveQuotesClosed")}`;
    return;
  }
  if (ok && !stale && clock) {
    el.hidden = false;
    el.dataset.state = "live";
    el.removeAttribute("title");
    el.textContent = ` · ${t("liveQuotesLive")} ${clock}`;
  } else if (lastSuccessAt) {
    el.hidden = false;
    el.dataset.state = "stale";
    el.title = t("liveQuotesStale");
    el.textContent = clock
      ? ` · ${t("liveQuotesStaleShort")} ${clock}`
      : ` · ${t("liveQuotesStaleShort")}`;
  } else if (!ok) {
    el.hidden = false;
    el.dataset.state = "stale";
    el.title = t("liveQuotesStale");
    el.textContent = ` · ${t("liveQuotesStaleShort")}`;
  } else {
    // pending first paint — keep brand-meta clean until a poll finishes
    el.hidden = true;
    el.dataset.state = "pending";
    el.removeAttribute("title");
    el.textContent = "";
  }
}

function mergeMaps(...lists) {
  const map = new Map(lastGood);
  for (const list of lists) {
    for (const q of list) {
      if (!q?.symbol || q.price == null) continue;
      remember(q.symbol, q);
      map.set(q.symbol, lastGood.get(q.symbol));
    }
  }
  // Alias MIS index keys onto chip keys store
  if (map.has("__MIS_TWII")) {
    const q = map.get("__MIS_TWII");
    map.set("^TWII", q);
  }
  return map;
}

async function tick() {
  if (!rootEl || document.visibilityState === "hidden") return;
  const { yahoo, mis } = collectWatchlist(rootEl);
  const [sparkRes, misRes] = await Promise.all([
    fetchYahooSpark(yahoo),
    fetchMis(mis),
  ]);
  const map = mergeMaps(sparkRes.quotes || [], misRes.quotes || []);
  const ok = sparkRes.ok || misRes.ok;
  if (ok) {
    lastSuccessAt = Date.now();
    lastAttemptOk = true;
  } else {
    lastAttemptOk = false;
  }

  // Indices — prefer MIS for TW/OTC when present
  const twQ = map.get("__MIS_TWII") || map.get("^TWII");
  const otcQ = map.get("__MIS_OTC");
  applyIndexChip(rootEl, "tw", twQ);
  applyIndexChip(rootEl, "otc", otcQ);
  applyIndexChip(rootEl, "spx", map.get("^GSPC"));
  applyIndexChip(rootEl, "nasdaq", map.get("^IXIC"));
  applyIndexChip(rootEl, "sox", map.get("^SOX"));
  const fxQ = map.get("USDTWD=X");
  const fxChip = rootEl.querySelector("[data-lq-key='usdTwd']");
  const taipeiCloseAttr = fxChip?.getAttribute("data-lq-taipei-close");
  const taipeiClose =
    taipeiCloseAttr != null && taipeiCloseAttr !== ""
      ? Number(taipeiCloseAttr)
      : null;
  applyIndexChip(rootEl, "usdTwd", fxQ, {
    taipeiClose: Number.isFinite(taipeiClose) ? taipeiClose : null,
  });

  // Every displayed ticker node
  const seen = new Set();
  rootEl.querySelectorAll("[data-lq-sym]").forEach((el) => {
    const sym = el.getAttribute("data-lq-sym");
    if (!sym || seen.has(sym)) return;
    seen.add(sym);
    const q = resolveQuote(map, sym);
    if (q) applyTickerNodes(rootEl, sym, q);
  });

  applySoxl(rootEl, map.get("SOXL"));
  recomputePaperBookKpis(rootEl);

  const age = lastSuccessAt ? Date.now() - lastSuccessAt : Infinity;
  paintStatus(rootEl, { ok, stale: !ok || age > CLOSED_MS });
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function scheduleNext() {
  clearTimer();
  if (!running) return;
  const ms = refreshIntervalMs();
  timer = window.setTimeout(async () => {
    try {
      await tick();
    } catch {
      lastAttemptOk = false;
      if (rootEl) paintStatus(rootEl, { ok: false, stale: true });
    }
    scheduleNext();
  }, ms);
}

function onVisibility() {
  if (!running) return;
  if (document.visibilityState === "hidden") {
    clearTimer();
    return;
  }
  void tick().finally(() => scheduleNext());
}

/**
 * Start live overlay on the mounted app root. Safe to call after each remount.
 * @param {ParentNode} root
 */
export async function startLiveQuotes(root) {
  stopLiveQuotes();
  rootEl = root;
  if (!rootEl) return { ok: false };
  running = true;
  if (!visibilityBound) {
    document.addEventListener("visibilitychange", onVisibility);
    visibilityBound = true;
  }
  paintStatus(rootEl, { ok: false, stale: false });
  try {
    await tick();
  } catch {
    lastAttemptOk = false;
    paintStatus(rootEl, { ok: false, stale: true });
  }
  scheduleNext();
  return { ok: lastAttemptOk, lastSuccessAt };
}

export function stopLiveQuotes() {
  running = false;
  clearTimer();
  rootEl = null;
}

/** Test helpers */
export const _test = {
  extractJson,
  parseSparkResult,
  parseMisPayload,
  yahooSymFromTicker,
  preferTwMisCode,
  marketSessions,
  refreshIntervalMs,
  chunks,
  OPEN_MS,
  CLOSED_MS,
  fmtClockTaipei,
};
