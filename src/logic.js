/**
 * Selection Logic — professional step-by-step methodology view.
 * Thresholds mirrored from scripts/daily-scan.mjs + market-regime.mjs
 * + bookshelf-framework-2026-09-16 (operational rules only).
 */
import { escapeHtml } from "./glossary.js";
import { t, enumLabel, stanceTone } from "./i18n.js";

/** Stance → size multiplier (STANCE_SIZE_MULT) */
export const STANCE_SIZE_MULT = {
  defensive: 0.5,
  selective: 0.8,
  balanced: 1.0,
  constructive: 1.1,
  aggressive: 1.35,
  stabilize_first: 0.3,
};

/** Egg phase → dial (PHASE_TO_STANCE) */
export const PHASE_TO_STANCE = {
  euphoric: "defensive",
  late_optimism: "selective",
  mid_cycle: "balanced",
  cautious_recovery: "constructive",
  despondent: "aggressive",
  panic: "stabilize_first",
};

export function stanceBadgeHtml(stanceRaw) {
  if (!stanceRaw) {
    return `<span class="stance-badge stance-neutral">${escapeHtml(t("dataInsufficient"))}</span>`;
  }
  const tone = stanceTone(stanceRaw);
  const label = enumLabel(stanceRaw);
  return `<span class="stance-badge stance-${tone}">${escapeHtml(label)}</span>`;
}

function metricChip(label, valueHtml) {
  return `<div class="logic-metric" role="listitem">
    <span class="k">${escapeHtml(label)}</span>
    <span class="v">${valueHtml}</span>
  </div>`;
}

/**
 * Compact US/TW regime cards (Today + Logic + shared).
 */
export function renderRegimeCard(mkt, r, { detailed = false } = {}) {
  if (!r) return "";
  const incomplete = r.incomplete ? " incomplete" : "";
  const phaseRaw = r.psychologyPhase;
  const stanceRaw = r.cycleStance;
  const liqRaw = r.liquidityBias;
  const phase = phaseRaw ? enumLabel(phaseRaw) : t("dataInsufficient");
  const liq = liqRaw ? enumLabel(liqRaw) : t("dataInsufficient");
  const gaps =
    Array.isArray(r.dataGaps) && r.dataGaps.length
      ? `<div class="regime-gaps">${escapeHtml(t("dataGaps"))}: ${escapeHtml(r.dataGaps.slice(0, 5).join(", "))}${r.dataGaps.length > 5 ? "…" : ""}</div>`
      : "";
  // Scanner implication strings stay in the data file. The logic page
  // explains the same gates in plain language instead of reprinting them.
  const impl = "";
  const metrics = detailed
    ? `<div class="logic-metrics" role="list">
        ${metricChip(t("psychologyPhase"), escapeHtml(phase))}
        ${metricChip(t("liquidityBias"), escapeHtml(liq))}
      </div>
      <p class="logic-caption">${escapeHtml(t("logicRegimePlain"))}</p>`
    : `<div class="regime-meta">
        <span>${escapeHtml(t("psychologyPhase"))} <strong>${escapeHtml(phase)}</strong></span>
        <span>${escapeHtml(t("liquidityBias"))} <strong>${escapeHtml(liq)}</strong></span>
      </div>`;

  return `<div class="regime-chip${detailed ? " logic-regime-chip" : ""}${incomplete}">
    <div class="regime-chip-top">
      <div class="label">${escapeHtml(mkt)} · ${escapeHtml(t("marketRegime"))}</div>
      ${stanceBadgeHtml(stanceRaw)}
    </div>
    ${metrics}
    ${impl}
    ${gaps}
  </div>`;
}

/**
 * Live US/TW regime chips from latest.json marketRegime.
 */
export function renderLogicRegimeLive(regime) {
  if (!regime || (!regime.us && !regime.tw)) {
    return `<p class="logic-muted">${escapeHtml(t("logicNoRegime"))}</p>`;
  }
  return `<div class="regime-strip logic-regime-live" aria-label="${escapeHtml(t("regimeToday"))}">
    ${renderRegimeCard("US", regime.us, { detailed: true })}
    ${renderRegimeCard("TW", regime.tw, { detailed: true })}
  </div>`;
}

/** Compact strip for Today view */
export function renderRegimeStrip(regime) {
  if (!regime || (!regime.us && !regime.tw)) return "";
  return `<div class="regime-strip" aria-label="${escapeHtml(t("marketRegime"))}">
    ${renderRegimeCard("US", regime.us, { detailed: false })}
    ${renderRegimeCard("TW", regime.tw, { detailed: false })}
  </div>`;
}

function step(n, title, body) {
  return `<section class="logic-step" id="logic-step-${n}">
    <header class="logic-step-head">
      <span class="logic-step-num" aria-hidden="true">${n}</span>
      <h3 class="logic-step-title">${escapeHtml(title)}</h3>
    </header>
    <div class="logic-step-body">${body}</div>
  </section>`;
}

function kvTable(rows) {
  return `<div class="logic-table-wrap"><table class="logic-table">
    <tbody>
      ${rows
        .map(
          ([k, v]) =>
            `<tr><th scope="row">${escapeHtml(k)}</th><td>${v}</td></tr>`
        )
        .join("")}
    </tbody>
  </table></div>`;
}

function rule(id) {
  const row = (labelKey, bodyKey) =>
    `<div><dt>${escapeHtml(t(labelKey))}</dt><dd>${escapeHtml(t(bodyKey))}</dd></div>`;
  return `<article class="logic-rule">
    <h4 class="logic-rule-title">${escapeHtml(t(`logic${id}Title`))}</h4>
    <dl class="logic-rule-dl">
      ${row("logicLblDoes", `logic${id}Does`)}
      ${row("logicLblWhen", `logic${id}When`)}
      ${row("logicLblRefuse", `logic${id}Refuse`)}
      ${row("logicLblExample", `logic${id}Example`)}
    </dl>
  </article>`;
}

/**
 * Full Logic view — plain-language rules. Thresholds match market-regime,
 * daily-scan, math-core, and paper-trade. No new gates.
 */
export function renderLogicSection(data) {
  const regime = data?.marketRegime;
  const phaseNote = {
    defensive: "logicPhaseDefensive",
    selective: "logicPhaseSelective",
    balanced: "logicPhaseBalanced",
    constructive: "logicPhaseConstructive",
    aggressive: "logicPhaseAggressive",
    stabilize_first: "logicPhaseStabilize",
  };
  const phaseRows = Object.entries(PHASE_TO_STANCE).map(([phase, stance]) => [
    enumLabel(phase),
    `${stanceBadgeHtml(stance)} <span class="logic-phase-note">${escapeHtml(t(phaseNote[stance]))}</span>`,
  ]);

  return `
    <header class="view-header">
      <h2 class="view-title">${escapeHtml(t("logicTitle"))}</h2>
      <p class="logic-subtitle">${escapeHtml(t("logicSubtitle"))}</p>
      <p class="logic-intro">${escapeHtml(t("logicLead"))}</p>
    </header>

    <section class="logic-live section" aria-labelledby="logic-live-h">
      <h3 id="logic-live-h" class="section-title">${escapeHtml(t("regimeToday"))}</h3>
      ${renderLogicRegimeLive(regime)}
    </section>

    <div class="logic-pipeline">
      ${step(1, t("logicStep1"), `
        <p class="logic-lead">${escapeHtml(t("logicStep1Lead"))}</p>
        ${kvTable(phaseRows)}
        <p class="logic-caption">${escapeHtml(t("logicStep1Caption"))}</p>
        ${rule("Sep")}
        ${rule("Mood")}
        ${rule("Rates")}
      `)}

      ${step(2, t("logicStep2"), `
        <p class="logic-lead">${escapeHtml(t("logicStep2Lead"))}</p>
        ${rule("Bal")}
        ${rule("Sel")}
        ${rule("Def")}
        ${rule("Agg")}
        ${rule("Con")}
        ${rule("Stab")}
        ${rule("Vol")}
        ${rule("Back")}
      `)}

      ${step(3, t("logicStep3"), `
        <p class="logic-lead">${escapeHtml(t("logicStep3Lead"))}</p>
        ${rule("Xq")}
        <p class="logic-jump"><button type="button" class="logic-link-btn" data-jump="strategies">${escapeHtml(t("logicOpenStrategies"))}</button></p>
      `)}

      ${step(4, t("logicStep4"), `
        <p class="logic-lead">${escapeHtml(t("logicStep4Lead"))}</p>
        ${rule("Rank")}
        ${rule("Hot")}
        ${rule("Firm")}
        ${rule("Panic")}
        ${rule("Count")}
      `)}

      ${step(5, t("logicStep5"), `
        <p class="logic-lead">${escapeHtml(t("logicStep5Lead"))}</p>
        ${rule("Why")}
      `)}

      ${step(6, t("logicStep6"), `
        <p class="logic-lead">${escapeHtml(t("logicStep6Lead"))}</p>
        ${rule("Buy")}
        ${rule("Sell")}
        <p class="logic-jump"><button type="button" class="logic-link-btn" data-jump="paper">${escapeHtml(t("logicOpenPaper"))}</button></p>
      `)}
    </div>

    <p class="logic-footnote" role="note">${escapeHtml(t("logicFootnote"))}</p>
  `;
}
