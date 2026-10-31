/**
 * 讀財報 — Mag7 + high-attention US earnings (plain language cards).
 * Data: public/data/earnings-digest.json
 * Never invents metrics; missing fields omitted (no 資料不足 badge spam).
 */
import { escapeHtml } from "./glossary.js";
import { t, numberLocale, getLang } from "./i18n.js";
import { companyZh } from "./earnings-zh.js";

const DATA_URL = "./data/earnings-digest.json";

function fmtAsOf(iso) {
  try {
    return (
      new Date(iso).toLocaleString(numberLocale(), {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + t("taipei")
    );
  } catch {
    return iso || "—";
  }
}

function fmtNum(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  return Number(n).toLocaleString(numberLocale(), {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function fmtPct(n, d = 1) {
  if (n == null || Number.isNaN(n)) return null;
  const sign = n > 0 ? "+" : "";
  return `${sign}${Number(n).toFixed(d)}%`;
}

function cell(val, suffix = "") {
  if (val == null || val === "") return null;
  return `<span class="er-val">${escapeHtml(String(val))}${suffix ? escapeHtml(suffix) : ""}</span>`;
}

function metricBlock(label, html) {
  if (!html) return "";
  return `<div class="er-metric">
          <div class="m-l">${escapeHtml(label)}</div>
          <div class="m-v">${html}</div>
        </div>`;
}

function tagLabel(tag) {
  if (tag === "mega_cap_earnings_next_14d") return t("earningsTagPrimary");
  if (tag === "yahoo_most_actives_earnings_next_14d") return t("earningsTagActives");
  if (tag === "recently_reported") return t("earningsTagRecent");
  if (tag === "calendar_highlight_within_45d") return t("earningsTagFallback");
  return tag || t("earningsTagOther");
}

function tagClass(tag) {
  if (tag === "recently_reported") return "er-badge-recent";
  if (tag === "calendar_highlight_within_45d") return "er-badge-fallback";
  if (tag?.includes("most_actives")) return "er-badge-hot";
  return "";
}

/** Today's calendar date in US Eastern (earnings dates are ET). */
function todayEt(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(now);
}

/** Whole calendar days from ymd a to ymd b (b − a); null if either is malformed. */
export function daysBetweenYmd(a, b) {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(a || "") || !re.test(b || "")) return null;
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/**
 * Yahoo keeps showing the last report date as "next" for a few days after a company reports.
 * Classify the date against today (ET) so a past date is shown as 「已公布」, never as 「下次」.
 */
export function earningsTiming(row, today = todayEt()) {
  const d = row?.nextEarningsDate;
  const diff = daysBetweenYmd(today, d);
  if (diff == null) return { state: "unknown", days: null };
  if (diff < 0) return { state: "reported", days: -diff };
  if (diff === 0) {
    // Same ET day but the numbers are already in (after-close report seen in the evening ET /
    // next morning Taipei): Yahoo's lastReport is the quarter that just ended → show 已公布,
    // never "今天公布 + 市場預估這一季" (that estimate is already the NEXT quarter's).
    if (sameDayResultIn(row)) return { state: "reported", days: 0 };
    return { state: "today", days: 0 };
  }
  return { state: "upcoming", days: diff };
}

/**
 * True when lastReport covers the quarter being reported on nextEarningsDate:
 * quarter end 0–75 days before the report date and an actual EPS present.
 * (The previous quarter is always ≥ ~100 days earlier, so it can never pass.)
 */
export function sameDayResultIn(row) {
  const lr = row?.lastReport;
  if (!lr || lr.epsActual == null || !Number.isFinite(Number(lr.epsActual))) return false;
  const gap = daysBetweenYmd(lr.quarter, row.nextEarningsDate);
  return gap != null && gap >= 0 && gap <= 75;
}

/** zh-Hant shows our plain one-liner when we have one; other languages keep Yahoo's English. */
export function whatItDoesText(row, lang = getLang()) {
  if (lang === "zh-Hant") {
    const zh = companyZh(row?.ticker);
    if (zh) return { text: zh, zh: true };
  }
  return { text: row?.whatItDoes || "", zh: false };
}

function shortDate(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
  if (!m) return ymd || "";
  let wd = "";
  try {
    wd = new Date(`${ymd}T12:00:00Z`).toLocaleDateString(numberLocale(), { weekday: "short", timeZone: "UTC" });
  } catch {
    /* ignore */
  }
  return `${Number(m[2])}/${Number(m[3])}${wd ? `（${wd}）` : ""}`;
}

/**
 * Schedule strip at the top: every company on this page grouped by report date (ET),
 * tap a ticker to jump to its card. Already-reported names are grouped as 已公布.
 */
export function scheduleGroups(rows, today = todayEt()) {
  const seen = new Set();
  const upcoming = new Map();
  const reported = [];
  for (const r of rows) {
    if (!r?.ticker || seen.has(r.ticker)) continue;
    seen.add(r.ticker);
    const tm = earningsTiming(r, today);
    if (tm.state === "reported") reported.push(r);
    else if (tm.state === "today" || tm.state === "upcoming") {
      const d = r.nextEarningsDate;
      if (!upcoming.has(d)) upcoming.set(d, { date: d, today: tm.state === "today", days: tm.days, rows: [] });
      upcoming.get(d).rows.push(r);
    }
  }
  const groups = [...upcoming.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  reported.sort((a, b) => (a.nextEarningsDate < b.nextEarningsDate ? 1 : -1));
  return { groups, reported };
}

function cardId(ticker) {
  return `er-c-${String(ticker).replace(/[^A-Za-z0-9-]/g, "")}`;
}

function chip(r) {
  return `<button type="button" class="er-chip" data-er-jump="${escapeHtml(cardId(r.ticker))}">${escapeHtml(r.ticker)}</button>`;
}

function renderSchedule(rows) {
  const { groups, reported } = scheduleGroups(rows);
  if (!groups.length && !reported.length) return "";
  const lines = groups.map(
    (g) => `<li class="er-sched-row${g.today ? " is-today" : ""}">
        <span class="er-sched-date">${escapeHtml(shortDate(g.date))}${
          g.today ? `<em>${escapeHtml(t("earningsToday"))}</em>` : `<em>${escapeHtml(t("earningsInDays", { n: g.days }))}</em>`
        }${g.rows.every((r) => r.nextEarningsDateIsEstimate) ? `<em>${escapeHtml(t("earningsEstimate"))}</em>` : ""}</span>
        <span class="er-sched-chips">${g.rows.map(chip).join("")}</span>
      </li>`
  );
  if (reported.length) {
    lines.unshift(`<li class="er-sched-row is-done">
        <span class="er-sched-date">${escapeHtml(t("earningsSchedDone"))}</span>
        <span class="er-sched-chips">${reported.map(chip).join("")}</span>
      </li>`);
  }
  return `<nav class="er-sched" aria-label="${escapeHtml(t("earningsSchedTitle"))}">
      <h3 class="er-sched-title">${escapeHtml(t("earningsSchedTitle"))}</h3>
      <p class="er-sched-lead">${escapeHtml(t("earningsSchedLead"))}</p>
      <ul class="er-sched-list">${lines.join("")}</ul>
    </nav>`;
}

function plainWatch(row, timing) {
  const parts = [];
  const lr = row.lastReport || {};
  if (timing.state === "reported") {
    // Only trust lastReport as "this" report if its quarter ended within ~100 days before the report date.
    const gap = daysBetweenYmd(lr.quarter, row.nextEarningsDate);
    const fresh = gap != null && gap >= 0 && gap <= 100;
    if (!fresh) return t("earningsReportedPending", { date: row.nextEarningsDate });
    parts.push(t("earningsReportedHead", { date: row.nextEarningsDate, q: lr.quarter }));
    if (lr.epsActual != null) {
      let s = t("earningsReportedEps", { a: fmtNum(lr.epsActual, 2) });
      if (lr.epsEstimate != null && lr.epsSurprisePct != null && Number.isFinite(lr.epsSurprisePct)) {
        const key = lr.epsSurprisePct > 0 ? "earningsBeat" : lr.epsSurprisePct < 0 ? "earningsMiss" : "earningsInline";
        s += t(key, { e: fmtNum(lr.epsEstimate, 2), p: Math.abs(lr.epsSurprisePct).toFixed(1) });
        // Actual and estimate are one same-basis pair (scripts/eps-basis.mjs); say so when GAAP differs.
        if (lr.epsGaap != null && Math.abs(Number(lr.epsGaap) - Number(lr.epsActual)) >= 0.005) {
          s += t("earningsGaapNote", { g: fmtNum(lr.epsGaap, 2) });
        }
      } else if (lr.epsBasis === "gaap-estimate-dropped") {
        s += t("earningsNoSameBasis");
      }
      parts.push(s);
    }
    parts.push(t("earningsNextUnknown"));
    return parts.join("");
  }
  if (timing.state === "upcoming" || timing.state === "today") {
    parts.push(
      timing.state === "today"
        ? t("earningsWatchToday")
        : t("earningsWatchUpcoming", { date: row.nextEarningsDate, n: timing.days })
    );
    if (row.consensusEpsNext != null) parts.push(t("earningsWatchConsensus", { e: fmtNum(row.consensusEpsNext, 2) }));
    const rev = fmtPct(row.revenueYoYPct);
    const eps = fmtPct(row.epsYoYPct);
    if (rev && eps) parts.push(t("earningsWatchTrend", { rev, eps }));
    return parts.join("");
  }
  return row.whatToWatch || "";
}

function renderCard(row, { hot = false } = {}) {
  if (!row) return "";
  const timing = earningsTiming(row);
  const reported = timing.state === "reported";
  const next =
    row.nextEarningsDate == null
      ? null
      : reported
        ? t("earningsReportedOn", { date: row.nextEarningsDate })
        : `${row.nextEarningsDate}${row.nextEarningsDateIsEstimate ? ` (${t("earningsEstimate")})` : ""}`;
  const countdown =
    timing.state === "today" ? t("earningsToday") : timing.state === "upcoming" ? t("earningsInDays", { n: timing.days }) : "";
  const nextHtml = next
    ? `${cell(next)}${countdown ? `<span class="er-sub">${escapeHtml(countdown)}</span>` : ""}`
    : null;
  const watch = plainWatch(row, timing);
  const does = whatItDoesText(row);
  const lastEps =
    row.lastReport?.epsActual != null
      ? `${fmtNum(row.lastReport.epsActual, 2)}${
          row.lastReport.quarter ? ` · ${row.lastReport.quarter}` : ""
        }`
      : null;
  const badge = reported
    ? `<span class="er-badge er-badge-recent">${escapeHtml(t("earningsTagRecent"))}</span>`
    : hot
      ? `<span class="er-badge ${tagClass(row.selectionTag)}">${escapeHtml(tagLabel(row.selectionTag))}</span>`
      : `<span class="er-badge">${escapeHtml(t("earningsMag7Badge"))}</span>`;

  return `
    <article class="er-card${reported ? " er-card-reported" : ""}" id="${escapeHtml(cardId(row.ticker))}" tabindex="-1" data-ticker="${escapeHtml(row.ticker)}">
      <div class="er-card-head">
        <div>
          <div class="er-ticker">${escapeHtml(row.ticker)}</div>
          <div class="er-name">${escapeHtml(row.name || "")}</div>
        </div>
        ${badge}
      </div>
      <div>
        <div class="er-label">${escapeHtml(t("earningsWhatItDoes"))}</div>
        <p class="er-does${does.zh ? " er-does-zh" : ""}"${!does.zh && does.text ? ` title="${escapeHtml(does.text)}"` : ""}${
          does.zh ? "" : ' lang="en"'
        }>${does.text ? escapeHtml(does.text) : ""}</p>
      </div>
      <div class="er-metrics">
        ${metricBlock(reported ? t("earningsLatestDate") : t("earningsNextDate"), nextHtml)}
        ${metricBlock(t("earningsLastEps"), cell(lastEps))}
        ${metricBlock(t("earningsRevYoy"), cell(fmtPct(row.revenueYoYPct)))}
        ${metricBlock(t("earningsEpsYoy"), cell(fmtPct(row.epsYoYPct)))}
        ${metricBlock(t("earningsPe"), cell(fmtNum(row.pe, 1)))}
        ${metricBlock(t("earningsForwardPe"), cell(fmtNum(row.forwardPe, 1)))}
      </div>
      ${
        watch
          ? `<div>
        <div class="er-label">${escapeHtml(reported ? t("earningsResultTitle") : t("earningsWhatToWatch"))}</div>
        <p class="er-watch">${escapeHtml(watch)}</p>
      </div>`
          : ""
      }
      ${
        row.blocker
          ? `<p class="er-miss">${escapeHtml(t("earningsPartialBlocker"))}: ${escapeHtml(row.blocker)}</p>`
          : ""
      }
    </article>`;
}

function paint(root, data) {
  const mag7 = Array.isArray(data?.mag7) ? data.mag7 : [];
  const hot = Array.isArray(data?.watchlistHot) ? data.watchlistHot : [];
  root.innerHTML = `
    <p class="er-meta">${escapeHtml(t("dataAsOf"))} ${escapeHtml(fmtAsOf(data?.asOf))} · ${escapeHtml(t("earningsUsFocus"))}</p>
    <p class="er-stub" role="note">${escapeHtml(t("earningsTwStub"))}</p>
    ${renderSchedule([...mag7, ...hot])}
    <div class="er-rule"><strong>${escapeHtml(t("earningsSelectionTitle"))}</strong> ${escapeHtml(t("earningsSelectionFallback"))}</div>
        <div class="er-panels">
      <section class="er-panel" aria-label="${escapeHtml(t("earningsMag7Title"))}">
        <h3 class="er-panel-title">${escapeHtml(t("earningsMag7Title"))}</h3>
        <p class="er-panel-lead">${escapeHtml(t("earningsMag7Lead"))}</p>
        <div class="er-cards">
          ${
            mag7.length
              ? mag7.map((r) => renderCard(r, { hot: false })).join("")
              : `<p class="er-empty">${escapeHtml(t("earningsEmpty"))}</p>`
          }
        </div>
      </section>
      <section class="er-panel" aria-label="${escapeHtml(t("earningsHotTitle"))}">
        <h3 class="er-panel-title">${escapeHtml(t("earningsHotTitle"))}</h3>
        <p class="er-panel-lead">${escapeHtml(t("earningsHotLead"))}</p>
        <div class="er-cards">
          ${
            hot.length
              ? hot.map((r) => renderCard(r, { hot: true })).join("")
              : `<p class="er-empty">${escapeHtml(t("earningsHotEmpty"))}</p>`
          }
        </div>
      </section>
    </div>
    <p class="er-disclaimer" role="note">${escapeHtml(t("earningsDisclaimer"))}</p>
  `;
}

export { renderEarningsSection } from "./section-shells.js";

export async function initEarnings(selector = "#er-root") {
  const root = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!root) return { ok: false };
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    paint(root, data);
    if (!root.dataset.jumpBound) {
      root.dataset.jumpBound = "1";
      root.addEventListener("click", (ev) => {
        const b = ev.target.closest?.("[data-er-jump]");
        if (!b) return;
        const card = root.querySelector(`#${b.dataset.erJump}`);
        if (!card) return;
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        card.focus({ preventScroll: true });
        card.classList.remove("er-flash");
        void card.offsetWidth;
        card.classList.add("er-flash");
      });
    }
    return { ok: true, data };
  } catch (err) {
    root.innerHTML = `
      <div class="er-empty" role="status">
        <p>${escapeHtml(t("earningsLoadError", { msg: err.message || String(err) }))}</p>
      </div>`;
    return { ok: false, error: err };
  }
}
