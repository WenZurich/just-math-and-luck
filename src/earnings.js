/**
 * 讀財報 — Mag7 + high-attention US earnings (plain language cards).
 * Data: public/data/earnings-digest.json
 * Never invents metrics; missing fields omitted (no 資料不足 badge spam).
 */
import { escapeHtml } from "./glossary.js";
import { t, numberLocale } from "./i18n.js";

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
  if (diff === 0) return { state: "today", days: 0 };
  return { state: "upcoming", days: diff };
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
    <article class="er-card${reported ? " er-card-reported" : ""}" data-ticker="${escapeHtml(row.ticker)}">
      <div class="er-card-head">
        <div>
          <div class="er-ticker">${escapeHtml(row.ticker)}</div>
          <div class="er-name">${escapeHtml(row.name || "")}</div>
        </div>
        ${badge}
      </div>
      <div>
        <div class="er-label">${escapeHtml(t("earningsWhatItDoes"))}</div>
        <p class="er-does"${row.whatItDoes ? ` title="${escapeHtml(row.whatItDoes)}"` : ""}>${
          row.whatItDoes ? escapeHtml(row.whatItDoes) : ""
        }</p>
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

export function renderEarningsSection() {
  return `
    <section class="section earnings-section" aria-label="${escapeHtml(t("earningsTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${escapeHtml(t("earningsTitle"))}</h2>
        <p class="view-lead">${escapeHtml(t("earningsLead"))}</p>
      </header>
      <p class="er-disclaimer er-disclaimer-top" role="note">${escapeHtml(t("earningsDisclaimer"))}</p>
      <div id="er-root" class="er-root">
        <p class="er-loading">${escapeHtml(t("loading"))}</p>
      </div>
    </section>`;
}

export async function initEarnings(selector = "#er-root") {
  const root = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!root) return { ok: false };
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    paint(root, data);
    return { ok: true, data };
  } catch (err) {
    root.innerHTML = `
      <div class="er-empty" role="status">
        <p>${escapeHtml(t("earningsLoadError", { msg: err.message || String(err) }))}</p>
      </div>`;
    return { ok: false, error: err };
  }
}
