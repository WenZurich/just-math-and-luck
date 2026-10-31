/**
 * Section shells (load speed, 2026-10-31).
 * The static header/disclaimer/root markup for 查股, 選擇權, 財報日, SOXL and 台指期 lives here so
 * main.js can paint every view's shell from the entry bundle, while the heavy logic modules
 * (lookup.js, options.js, earnings.js, soxl.js, txf.js) load as separate chunks on first visit.
 * Markup is moved verbatim; each module re-exports its render function for tests/back-compat.
 */
import { escapeHtml } from "./glossary.js";
import { t } from "./i18n.js";

export function renderLookupSection() {
  return `
    <section class="section lookup-section" aria-label="${escapeHtml(t("lookupTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${escapeHtml(t("lookupTitle"))}</h2>
        <p class="view-lead">${escapeHtml(t("lookupLead"))}</p>
      </header>
      <p class="lk-disclaimer lk-disclaimer-top" role="note">${escapeHtml(t("lookupDisclaimer"))}</p>
      <div class="lk-market-tabs" role="tablist" aria-label="${escapeHtml(t("market"))}">
        <button type="button" class="lk-tab is-active" data-lk-market="US" role="tab" aria-selected="true">${escapeHtml(t("usStock"))}</button>
        <button type="button" class="lk-tab" data-lk-market="TW" role="tab" aria-selected="false">${escapeHtml(t("twStock"))}</button>
      </div>
      <form class="lk-form" data-lk-form>
        <label class="lk-label" for="lk-input">${escapeHtml(t("lookupInputLabel"))}</label>
        <div class="lk-row">
          <input id="lk-input" class="lk-input" name="symbol" type="text" autocomplete="off" spellcheck="false"
            placeholder="${escapeHtml(t("lookupPlaceholderUs"))}" data-lk-input />
          <button type="submit" class="lk-submit">${escapeHtml(t("lookupSearch"))}</button>
        </div>
        <p class="lk-hint" data-lk-hint>${escapeHtml(t("lookupHintUs"))}</p>
      </form>
      <div id="lk-root" class="lk-root" aria-live="polite">
        <p class="lk-muted">${escapeHtml(t("lookupIdle"))}</p>
      </div>
    </section>`;
}

export function renderOptionsSection() {
  return `
    <section class="section options-section" aria-label="${escapeHtml(t("optionsTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${escapeHtml(t("optionsTitle"))}</h2>
        <p class="view-lead">${escapeHtml(t("optionsLead"))}</p>
      </header>
      <p class="uo-disclaimer uo-disclaimer-top" role="note">${escapeHtml(t("optionsDisclaimer"))}</p>
      <div id="uo-root" class="uo-root">
        <p class="uo-loading">${escapeHtml(t("loading"))}</p>
      </div>
    </section>`;
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

export function renderSoxlSection() {
  return `
    <section class="section soxl-section" aria-label="${escapeHtml(t("soxlTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${escapeHtml(t("soxlTitle"))}</h2>
        <p class="view-lead">${escapeHtml(t("soxlLead"))}</p>
      </header>
      <p class="sx-disclaimer sx-disclaimer-top" role="note">${escapeHtml(t("soxlDisclaimer"))}</p>
      <div id="sx-root" class="sx-root">
        <p class="sx-loading">${escapeHtml(t("loading"))}</p>
      </div>
    </section>`;
}

export function renderTxfSection() {
  return `
    <section class="section txf-section" aria-label="${escapeHtml(t("txfTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${escapeHtml(t("txfTitle"))}</h2>
        <p class="view-lead">${escapeHtml(t("txfLead"))}</p>
      </header>
      <p class="txf-disclaimer txf-disclaimer-top" role="note">${escapeHtml(t("txfDisclaimer"))}</p>
      <div id="txf-root" class="txf-root">
        <p class="txf-loading">${escapeHtml(t("loading"))}</p>
      </div>
    </section>`;
}
