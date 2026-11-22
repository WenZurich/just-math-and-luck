/**
 * US Options view — McMillan strategy families (plain language) + public Yahoo screens.
 * Primary book: book-mcmillan-options-handbook（《選擇權策略完全手冊》增訂第五版）
 * Data: public/data/us-options-snapshot.json
 * Never invents metrics; missing fields omitted (prefer HV+volume when IV absent).
 */
import { escapeHtml } from "./glossary.js";
import { t, getLang, numberLocale } from "./i18n.js";

const DATA_URL = "./data/us-options-snapshot.json";
const PRIMARY_BOOK_ID = "book-mcmillan-options-handbook";

const SETUP_I18N = {
  "covered-call": ["optionsSetupCoveredCall", "optionsSetupCoveredCallBody", "optionsSetupCoveredCallWarn"],
  "protective-put": ["optionsSetupProtectivePut", "optionsSetupProtectivePutBody", "optionsSetupProtectivePutWarn"],
  "vertical-spread": ["optionsSetupVertical", "optionsSetupVerticalBody", "optionsSetupVerticalWarn"],
  "calendar-diagonal": ["optionsSetupCalendar", "optionsSetupCalendarBody", "optionsSetupCalendarWarn"],
  "straddle-strangle": ["optionsSetupStraddle", "optionsSetupStraddleBody", "optionsSetupStraddleWarn"],
  butterfly: ["optionsSetupButterfly", "optionsSetupButterflyBody", "optionsSetupButterflyWarn"],
};

function pickLocalized(map, fallback) {
  if (!map || typeof map !== "object") return fallback;
  const lang = getLang();
  return map[lang] || map["zh-Hant"] || map.en || fallback;
}

function itemTitle(book) {
  if (!book) return "";
  return pickLocalized(book.titleLocalized, book.title) || "";
}

function itemTakeaways(book) {
  if (!book) return [];
  const loc = book.plainTakeawaysLocalized;
  if (loc && typeof loc === "object") {
    const lang = getLang();
    const arr = loc[lang] || loc["zh-Hant"] || loc.en;
    if (Array.isArray(arr) && arr.length) return arr;
  }
  return Array.isArray(book.plainTakeaways) ? book.plainTakeaways : [];
}

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

function fmtPctRatio(n, d = 1) {
  if (n == null || Number.isNaN(n)) return null;
  return `${(n * 100).toFixed(d)}%`;
}

function fmtIv(n) {
  if (n == null || Number.isNaN(n)) return null;
  return `${(n * 100).toFixed(1)}%`;
}

function cell(val, suffix = "") {
  if (val == null || val === "") return "—";
  return `<span class="uo-val">${escapeHtml(String(val))}${suffix ? escapeHtml(suffix) : ""}</span>`;
}

function gateLabel(gate) {
  if (gate === "pass") return t("optionsGatePass");
  if (gate === "watch") return t("optionsGateWatch");
  if (gate === "fail") return t("optionsGateFail");
  return t("optionsGateIncomplete");
}

function gateClass(gate) {
  if (gate === "pass") return "uo-gate-pass";
  if (gate === "watch") return "uo-gate-watch";
  if (gate === "fail") return "uo-gate-fail";
  return "uo-gate-incomplete";
}

export function trendLabel(tr) {
  if (!tr || tr.incomplete || tr.label == null) return null;
  // Plain copy: the word carries the direction, so the number is shown unsigned
  // for up/down (no "下滑約 -20%" double negative); flat keeps its sign.
  const n = Number(tr.pct);
  const has = tr.pct != null && Number.isFinite(n);
  const abs = has ? Math.abs(n).toFixed(2).replace(/\.?0+$/, "") : "—";
  if (tr.label === "up") return t("optionsTrendUp", { pct: abs });
  if (tr.label === "down") return t("optionsTrendDown", { pct: abs });
  const signed = has ? `${n > 0 ? "+" : n < 0 ? "−" : ""}${abs}` : "—";
  return t("optionsTrendFlat", { pct: signed });
}

function skewLabel(ratio) {
  if (ratio == null) return null;
  if (ratio > 1.2) return t("optionsSkewPutHeavy");
  if (ratio < 0.8) return t("optionsSkewCallHeavy");
  return t("optionsSkewBalanced");
}

function regimeLabel(regime) {
  if (regime === "iv_rich") return t("optionsRegimeIvRich");
  if (regime === "iv_cheap") return t("optionsRegimeIvCheap");
  if (regime === "iv_fair") return t("optionsRegimeIvFair");
  if (regime === "iv_only") return t("optionsRegimeIvOnly");
  return "—";
}

function primaryBook(data) {
  if (data?.primaryBook) return data.primaryBook;
  return null;
}

function renderBookBanner(data) {
  const book = primaryBook(data);
  const title = itemTitle(book) || t("optionsBookFallbackTitle");
  const takeaways = itemTakeaways(book);
  const list = takeaways.length
    ? `<ul class="uo-takeaways">${takeaways.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
    : `<p class="uo-muted">${escapeHtml(t("researchNoTakeaways"))}</p>`;
  return `
    <details class="uo-book" aria-label="${escapeHtml(t("optionsBookCite"))}">
      <summary class="uo-book-head">
        <span class="uo-book-badge">${escapeHtml(t("optionsBookBadge"))}</span>
        <span class="uo-book-title">${escapeHtml(title)}</span>
        <span class="uo-book-more">${escapeHtml(t("optionsBookMore"))}</span>
      </summary>
      <p class="uo-book-lead">${escapeHtml(t("optionsBookLead"))}</p>
      ${list}
      <p class="uo-book-link">
        <button type="button" class="uo-link-btn" data-jump="research">${escapeHtml(t("optionsGotoResearch"))}</button>
        <span class="uo-muted">· ${escapeHtml(PRIMARY_BOOK_ID)}</span>
      </p>
    </details>`;
}

function renderQualityRow(row) {
  const f = row.fundamentals || {};
  const q = row.quality || {};
  const pe = f.trailingPE ?? f.forwardPE;
  const peNote =
    f.trailingPE != null
      ? ""
      : f.forwardPE != null
        ? ` <span class="uo-hint">(${escapeHtml(t("optionsForwardPe"))})</span>`
        : "";
  return `
    <tr data-uo-ticker="${escapeHtml(row.ticker)}" class="uo-q-row">
      <td>
        <button type="button" class="uo-ticker-btn" data-uo-select="${escapeHtml(row.ticker)}">
          <span class="uo-ticker">${escapeHtml(row.ticker)}</span>
          <span class="uo-name">${escapeHtml(row.name || "")}</span>
        </button>
      </td>
      <td class="num">${cell(fmtNum(pe, 1))}${peNote}</td>
      <td class="num">${cell(fmtNum(f.priceToBook, 2))}</td>
      <td class="num">${cell(fmtNum(f.debtToEquity, 1))}</td>
      <td class="num">${cell(fmtPctRatio(f.roe))}</td>
      <td>${cell(trendLabel(f.revenueTrend))}</td>
      <td>${cell(trendLabel(f.earningsTrend))}</td>
      <td><span class="uo-gate ${gateClass(q.gate)}">${escapeHtml(gateLabel(q.gate))}</span></td>
    </tr>`;
}

function renderQualityCards(rows) {
  return rows
    .map((row) => {
      const f = row.fundamentals || {};
      const q = row.quality || {};
      const pe = f.trailingPE ?? f.forwardPE;
      return `
      <article class="uo-q-card" data-uo-ticker="${escapeHtml(row.ticker)}">
        <button type="button" class="uo-ticker-btn" data-uo-select="${escapeHtml(row.ticker)}">
          <span class="uo-ticker">${escapeHtml(row.ticker)}</span>
          <span class="uo-name">${escapeHtml(row.name || "")}</span>
        </button>
        <div class="uo-metrics">
          <div><span class="m-l">${escapeHtml(t("optionsPe"))}</span> ${cell(fmtNum(pe, 1))}</div>
          <div><span class="m-l">${escapeHtml(t("optionsPb"))}</span> ${cell(fmtNum(f.priceToBook, 2))}</div>
          <div><span class="m-l">${escapeHtml(t("optionsDebt"))}</span> ${cell(fmtNum(f.debtToEquity, 1))}</div>
          <div><span class="m-l">${escapeHtml(t("optionsRoe"))}</span> ${cell(fmtPctRatio(f.roe))}</div>
          <div><span class="m-l">${escapeHtml(t("optionsRevTrend"))}</span> ${cell(trendLabel(f.revenueTrend))}</div>
          <div><span class="m-l">${escapeHtml(t("optionsEarnTrend"))}</span> ${cell(trendLabel(f.earningsTrend))}</div>
        </div>
        <span class="uo-gate ${gateClass(q.gate)}">${escapeHtml(gateLabel(q.gate))}</span>
      </article>`;
    })
    .join("");
}

function renderGlossary() {
  return `
    <details class="uo-glossary fold-block">
      <summary>${escapeHtml(t("optionsGlossaryTitle"))}</summary>
      <dl class="uo-dl">
        <div><dt>${escapeHtml(t("optionsTermDelta"))}</dt><dd>${escapeHtml(t("optionsDefDelta"))}</dd></div>
        <div><dt>${escapeHtml(t("optionsTermIv"))}</dt><dd>${escapeHtml(t("optionsDefIv"))}</dd></div>
        <div><dt>${escapeHtml(t("optionsTermHv"))}</dt><dd>${escapeHtml(t("optionsDefHv"))}</dd></div>
        <div><dt>${escapeHtml(t("optionsTermAtm"))}</dt><dd>${escapeHtml(t("optionsDefAtm"))}</dd></div>
        <div><dt>${escapeHtml(t("optionsTermSkew"))}</dt><dd>${escapeHtml(t("optionsDefSkew"))}</dd></div>
        <div><dt>${escapeHtml(t("optionsTermProb"))}</dt><dd>${escapeHtml(t("optionsDefProb"))}</dd></div>
      </dl>
    </details>`;
}

function renderSetups(row) {
  const setups = (row.setups || []).filter((s) => SETUP_I18N[s.id]);
  if (!setups.length) {
    return `<p class="uo-muted">${escapeHtml(t("optionsNoSetups"))}</p>`;
  }
  const nAligned = setups.filter((s) => s.volAligned).length;
  const regime = setups.find((s) => s.volRegime)?.volRegime;
  // One summary line instead of repeating the same status sentence on every card.
  const summary = t("optionsSetupsSummary", {
    ticker: row.ticker || "",
    regime: regimeLabel(regime),
    n: nAligned,
    total: setups.length,
  });
  return `<p class="uo-setups-summary" role="note">${escapeHtml(summary)}</p>
  <div class="uo-setups">
    ${setups
      .map((s) => {
        const [titleK, bodyK, warnK] = SETUP_I18N[s.id];
        const tag = s.volAligned
          ? `<span class="uo-fit uo-fit-yes">${escapeHtml(t("optionsSetupFitYes"))}</span>`
          : `<span class="uo-fit uo-fit-no">${escapeHtml(t("optionsSetupFitNo"))}</span>`;
        return `
        <article class="uo-setup${s.volAligned ? " is-aligned" : ""}">
          <div class="uo-setup-head"><h4>${escapeHtml(t(titleK))}</h4>${tag}</div>
          <p>${escapeHtml(t(bodyK))}</p>
          <p class="uo-risk-shape"><span class="uo-risk-k">${escapeHtml(t("optionsRiskShape"))}</span>${escapeHtml(t(warnK))}</p>
        </article>`;
      })
      .join("")}
  </div>`;
}

function renderOptionsDetail(row) {
  if (!row) {
    return `<p class="uo-muted">${escapeHtml(t("optionsPickTicker"))}</p>`;
  }
  const o = row.options;
  const blockers = row.blockers || [];
  if (!o) {
    return `
      <div class="uo-blocker" role="status">
        <p><strong>${escapeHtml(t("optionsChainBlocked"))}</strong></p>
        <p>${escapeHtml(blockers.join(" · ") || t("optionsDataMissing"))}</p>
      </div>`;
  }
  const skew = skewLabel(o.putCallVolumeRatio);
  const ivMissing = o.atmIv == null;
  const hvMissing = o.historicalVol == null;
  const regime = (() => {
    if (ivMissing) return "unknown";
    if (hvMissing) return "iv_only";
    if (o.ivHvRatio >= 1.25) return "iv_rich";
    if (o.ivHvRatio <= 0.8) return "iv_cheap";
    return "iv_fair";
  })();

  return `
    <div class="uo-opt-head">
      <div>
        <div class="uo-ticker">${escapeHtml(row.ticker)}</div>
        <div class="uo-name">${escapeHtml(row.name || "")}</div>
      </div>
      <span class="uo-gate ${gateClass(row.quality?.gate)}">${escapeHtml(gateLabel(row.quality?.gate))}</span>
    </div>
    <p class="uo-opt-note">${escapeHtml(t("optionsMcmillanFirst"))}</p>
    <div class="uo-opt-grid">
      <div class="uo-opt-metric">
        <div class="m-l">${escapeHtml(t("optionsAtmIv"))}</div>
        <div class="m-v">${ivMissing ? cell(null) : cell(fmtIv(o.atmIv))}</div>
        <div class="uo-muted">${escapeHtml(t("optionsExpiry"))}: ${escapeHtml(o.expiration || "—")}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${escapeHtml(t("optionsHv"))}</div>
        <div class="m-v">${hvMissing ? cell(null) : cell(fmtIv(o.historicalVol))}</div>
        <div class="uo-muted">${escapeHtml(t("optionsIvHv"))}: ${o.ivHvRatio != null ? cell(fmtNum(o.ivHvRatio, 2) + "×") : cell(null)}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${escapeHtml(t("optionsVolRegime"))}</div>
        <div class="m-v">${escapeHtml(regimeLabel(regime))}</div>
        <div class="uo-muted">${skew ? escapeHtml(skew) : ""}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${escapeHtml(t("optionsCallPutVol"))}</div>
        <div class="m-v">${cell(fmtNum(o.callVolume, 0))} / ${cell(fmtNum(o.putVolume, 0))}</div>
        <div class="uo-muted">${escapeHtml(t("optionsAtmStrike"))}: ${cell(fmtNum(o.atmStrikeCall ?? o.atmStrikePut, 1))}</div>
      </div>
    </div>
    ${
      (() => {
        const soft = blockers.filter(
          (b) => !/atmIv|options fields incomplete/i.test(String(b)) || (o.historicalVol == null && !(o.callVolume || o.putVolume))
        );
        // Prefer populated HV+volume; omit IV-only incompleteness banners
        const show = soft.length ? soft : [];
        return show.length
          ? `<p class="uo-warn">${escapeHtml(t("optionsPartialBlocker"))}: ${escapeHtml(show.join(" · "))}</p>`
          : "";
      })()
    }
    <h4 class="uo-h">${escapeHtml(t("optionsEduSetups"))}</h4>
    <p class="uo-panel-lead">${escapeHtml(t("optionsEduSetupsLead"))}</p>
    ${renderSetups(row)}
    <p class="uo-disclaimer" role="note">${escapeHtml(t("optionsDisclaimer"))}</p>
    ${renderGlossary()}
  `;
}

function paint(root, data, state) {
  const rows = Array.isArray(data?.tickers) ? data.tickers : [];
  const selected = rows.find((r) => r.ticker === state.ticker) || rows[0] || null;
  if (selected) state.ticker = selected.ticker;

  root.innerHTML = `
    ${renderBookBanner(data)}
    <p class="uo-meta">${escapeHtml(t("dataAsOf"))} ${escapeHtml(fmtAsOf(data?.asOf))} · ${escapeHtml(t("optionsUsOnly"))}</p>
        <div class="uo-panels">
      <section class="uo-panel uo-panel-opt" aria-label="${escapeHtml(t("optionsViewTitle"))}">
        <h3 class="uo-panel-title">${escapeHtml(t("optionsViewTitle"))}</h3>
        <p class="uo-panel-lead">${escapeHtml(t("optionsViewLead"))}</p>
        <div class="uo-ticker-chips" role="tablist" aria-label="${escapeHtml(t("ticker"))}">
          ${rows
            .map(
              (r) => `
            <button type="button" class="uo-chip${r.ticker === state.ticker ? " is-active" : ""}" data-uo-select="${escapeHtml(r.ticker)}" role="tab" aria-selected="${r.ticker === state.ticker ? "true" : "false"}">${escapeHtml(r.ticker)}</button>`
            )
            .join("")}
        </div>
        <div class="uo-detail" id="uo-detail">
          ${renderOptionsDetail(selected)}
        </div>
      </section>
      <section class="uo-panel" aria-label="${escapeHtml(t("optionsQualityTitle"))}">
        <h3 class="uo-panel-title">${escapeHtml(t("optionsQualityTitle"))}</h3>
        <p class="uo-panel-lead">${escapeHtml(t("optionsQualityLead"))}</p>
        <div class="table-wrap uo-table-wrap">
          <table class="stock-table uo-table">
            <thead>
              <tr>
                <th>${escapeHtml(t("ticker"))}</th>
                <th>${escapeHtml(t("optionsPe"))}</th>
                <th>${escapeHtml(t("optionsPb"))}</th>
                <th>${escapeHtml(t("optionsDebt"))}</th>
                <th>${escapeHtml(t("optionsRoe"))}</th>
                <th>${escapeHtml(t("optionsRevTrend"))}</th>
                <th>${escapeHtml(t("optionsEarnTrend"))}</th>
                <th>${escapeHtml(t("optionsGate"))}</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length ? rows.map(renderQualityRow).join("") : `<tr><td colspan="8">${escapeHtml(t("optionsEmpty"))}</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="uo-mobile">${rows.length ? renderQualityCards(rows) : `<p class="uo-muted">${escapeHtml(t("optionsEmpty"))}</p>`}</div>
      </section>
    </div>
  `;

  root.querySelectorAll("[data-uo-select]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.ticker = btn.getAttribute("data-uo-select");
      const cls = btn.classList.contains("uo-chip") ? "uo-chip" : btn.closest(".uo-mobile") ? "uo-mobile-btn" : "uo-table-btn";
      paint(root, data, state);
      // innerHTML repaint drops focus; return it to the same control (keyboard / screen reader users).
      const scope =
        cls === "uo-chip" ? root.querySelectorAll(".uo-chip")
        : cls === "uo-mobile-btn" ? root.querySelectorAll(".uo-mobile [data-uo-select]")
        : root.querySelectorAll(".uo-table [data-uo-select]");
      const again = Array.from(scope).find((el) => el.getAttribute("data-uo-select") === state.ticker);
      if (again && typeof again.focus === "function") again.focus({ preventScroll: true });
    });
  });

  root.querySelectorAll("[data-uo-ticker]").forEach((el) => {
    el.classList.toggle("is-selected", el.getAttribute("data-uo-ticker") === state.ticker);
  });
}

export { renderOptionsSection } from "./section-shells.js";

export async function initOptions(selector = "#uo-root") {
  const root = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!root) return { ok: false };
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const state = { ticker: data?.tickers?.[0]?.ticker || null };
    paint(root, data, state);
    return { ok: true, data };
  } catch (err) {
    root.innerHTML = `
      <div class="uo-blocker" role="alert">
        <p>${escapeHtml(t("optionsLoadError", { msg: err.message || String(err) }))}</p>
      </div>`;
    return { ok: false, error: err };
  }
}
