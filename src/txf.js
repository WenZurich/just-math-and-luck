/**
 * 台指期 desk — TAIEX spot vs TX futures, contracts, OI, 三大法人, calendar, PCR.
 * Data: public/data/txf-desk.json (official TAIFEX / TWSE). Never invents metrics.
 */
import { escapeHtml } from "./glossary.js";
import { t, numberLocale } from "./i18n.js";

const DATA_URL = "./data/txf-desk.json";

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

function fmtInt(n) {
  if (n == null || Number.isNaN(n)) return null;
  return Number(n).toLocaleString(numberLocale(), { maximumFractionDigits: 0 });
}

function fmtPct(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const sign = n > 0 ? "+" : "";
  return `${sign}${Number(n).toFixed(d)}%`;
}

function fmtSigned(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const sign = n > 0 ? "+" : "";
  return `${sign}${fmtNum(n, d)}`;
}

/** Taiwan convention: 紅漲綠跌 */
function dirClass(n) {
  if (n == null || Number.isNaN(n) || n === 0) return "txf-flat";
  return n > 0 ? "txf-up" : "txf-down";
}

function monthLabel(m) {
  if (!m) return "—";
  const s = String(m);
  if (/^\d{6}$/.test(s)) return `${s.slice(0, 4)}/${s.slice(4, 6)}`;
  return s;
}

/** Near month just rolled: say which contract expired and its official final settlement. */
function expiredNote(data) {
  const tx = data?.contracts?.TX;
  const ex = tx?.expiredOnSession;
  const fsp = data?.calendar?.recentSettlement;
  if (!ex?.month || !tx?.near?.month) return "";
  const p = fsp && fsp.deliveryMonth === ex.month && fsp.finalSettlementPrice > 0
    ? fmtNum(fsp.finalSettlementPrice, 0) : null;
  if (!p) return "";
  return `<p class="txf-session txf-expired-note">${escapeHtml(t("txfExpiredNote", {
    m: monthLabel(ex.month), d: ex.lastTradingDay || fsp.finalSettlementDay || "—", p, n: monthLabel(tx.near.month),
  }))}</p>`;
}

function paintHero(data) {
  const tx = data?.contracts?.TX;
  const near = tx?.near || {};
  const spot = data?.spot || {};
  const basis = data?.basis || {};
  const chg = near.change;
  const chgPct = near.changePct;
  const dir = dirClass(chgPct ?? chg);

  return `
    <section class="txf-hero" aria-label="${escapeHtml(t("txfHeroLabel"))}">
      <div class="txf-hero-main">
        <div class="txf-symbol-row">
          <span class="txf-symbol">TX</span>
          <span class="txf-badge">${escapeHtml(t("txfNearBadge"))}</span>
          <span class="txf-fund">${escapeHtml(tx?.nameZh || t("txfTitle"))} · ${escapeHtml(monthLabel(near.month))}</span>
        </div>
        <div class="txf-price-row ${dir}">
          <span class="txf-price">${escapeHtml(fmtNum(near.last, 0) || "—")}</span>
          <span class="txf-chg">${escapeHtml(fmtSigned(chg, 0) || "—")}</span>
          <span class="txf-chgp">${escapeHtml(fmtPct(chgPct, 2) || "—")}</span>
        </div>
        <p class="txf-session">${escapeHtml(t("txfSettle"))}: ${escapeHtml(fmtNum(near.settle, 0) || "—")}
          · ${escapeHtml(t("txfVolume"))}: ${escapeHtml(fmtInt(near.volume) || "—")}
          · ${escapeHtml(t("txfOI"))}: ${escapeHtml(fmtInt(near.openInterest) || "—")}
        </p>
        ${expiredNote(data)}
        <p class="txf-session">${escapeHtml(t("dataAsOf"))} ${escapeHtml(fmtAsOf(data?.asOf))}
          · ${escapeHtml(t("txfSessionDate"))}: ${escapeHtml(data?.sessionDate || "—")}</p>
      </div>
      <div class="txf-hero-side">
        <div class="txf-side-row" data-lq-key="tw" data-lq-sym="^TWII">
          <span class="txf-side-label">${escapeHtml(t("txfSpotLabel"))}</span>
          <span class="txf-side-val ${dirClass(spot.changePct)}" data-lq-field="value">${escapeHtml(fmtNum(spot.last, 2) || "—")}</span>
          <span class="txf-side-chg ${dirClass(spot.changePct)}">${escapeHtml(fmtPct(spot.changePct, 2) || "—")}</span>
        </div>
        <div class="txf-side-row">
          <span class="txf-side-label">${escapeHtml(t("txfBasisLabel"))}</span>
          <span class="txf-side-val ${dirClass(basis.basisPoints)}">${escapeHtml(fmtSigned(basis.basisPoints, 1) || "—")}</span>
          <span class="txf-side-chg ${dirClass(basis.basisPct)}">${escapeHtml(fmtPct(basis.basisPct, 3) || "—")}</span>
        </div>
        <p class="txf-side-note">${escapeHtml(basis.noteZh || t("txfBasisHint"))}</p>
        <p class="txf-side-note">${escapeHtml(t("txfMultiplierShort", { n: String(tx?.multiplierTwdPerPoint ?? 200) }))}</p>
      </div>
    </section>`;
}

function contractRows(block) {
  const rows = [];
  if (block?.near) rows.push({ tag: t("txfNearBadge"), c: block.near });
  if (block?.next) rows.push({ tag: t("txfNextBadge"), c: block.next });
  return rows
    .map(({ tag, c }) => {
      const dir = dirClass(c.changePct ?? c.change);
      return `<tr>
        <td><span class="txf-pill">${escapeHtml(tag)}</span> ${escapeHtml(monthLabel(c.month))}</td>
        <td class="txf-num ${dir}">${escapeHtml(fmtNum(c.last, 0) || "—")}</td>
        <td class="txf-num">${escapeHtml(fmtNum(c.settle, 0) || "—")}</td>
        <td class="txf-num ${dir}">${escapeHtml(fmtSigned(c.change, 0) || "—")} (${escapeHtml(fmtPct(c.changePct, 2) || "—")})</td>
        <td class="txf-num">${escapeHtml(fmtInt(c.volume) || "—")}</td>
        <td class="txf-num">${escapeHtml(fmtInt(c.openInterest) || "—")}</td>
        <td class="txf-num">${escapeHtml(c.lastTradingDay || "—")}</td>
      </tr>`;
    })
    .join("");
}

function paintContracts(data) {
  const blocks = [
    ["TX", data?.contracts?.TX],
    ["MTX", data?.contracts?.MTX],
    ["TMF", data?.contracts?.TMF],
  ].filter(([, b]) => b?.near);

  const sections = blocks
    .map(([code, b]) => {
      const m = b.margin || {};
      return `
      <article class="txf-contract-card">
        <header class="txf-contract-head">
          <h4>${escapeHtml(code)} · ${escapeHtml(b.nameZh || "")}</h4>
          <p class="txf-muted">${escapeHtml(t("txfMultLabel"))}: NT$${escapeHtml(fmtInt(b.multiplierTwdPerPoint) || "—")}${escapeHtml(t("txfPerPoint"))}
            · ${escapeHtml(t("txfMarginInitial"))}: NT$${escapeHtml(fmtInt(m.initial) || "—")}
            · ${escapeHtml(t("txfMarginMaint"))}: NT$${escapeHtml(fmtInt(m.maintenance) || "—")}</p>
        </header>
        <div class="txf-table-wrap" role="region" tabindex="0" aria-label="${escapeHtml(code)} ${escapeHtml(b.nameZh || "")}">
          <table class="txf-table">
            <thead>
              <tr>
                <th>${escapeHtml(t("txfColMonth"))}</th>
                <th>${escapeHtml(t("txfColLast"))}</th>
                <th>${escapeHtml(t("txfColSettle"))}</th>
                <th>${escapeHtml(t("txfColChange"))}</th>
                <th>${escapeHtml(t("txfColVolume"))}</th>
                <th>${escapeHtml(t("txfColOI"))}</th>
                <th>${escapeHtml(t("txfColLTD"))}</th>
              </tr>
            </thead>
            <tbody>${contractRows(b)}</tbody>
          </table>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="txf-panel" aria-label="${escapeHtml(t("txfContractsTitle"))}">
      <h3 class="txf-h3">${escapeHtml(t("txfContractsTitle"))}</h3>
      <p class="txf-panel-lead">${escapeHtml(t("txfContractsLead"))}</p>
      ${sections}
    </section>`;
}

function paintInstitutional(data) {
  const inst = data?.institutional;
  if (!inst?.byContract) return "";
  const codes = ["TX", "MTX", "TMF"].filter((c) => (inst.byContract[c] || []).length);
  if (!codes.length) return "";

  const tables = codes
    .map((code) => {
      const rows = (inst.byContract[code] || [])
        .map((r) => {
          const net = r.openInterestNet;
          return `<tr>
            <td>${escapeHtml(r.partyZh || "—")}</td>
            <td class="txf-num">${escapeHtml(fmtInt(r.openInterestLong) || "—")}</td>
            <td class="txf-num">${escapeHtml(fmtInt(r.openInterestShort) || "—")}</td>
            <td class="txf-num ${dirClass(net)}">${escapeHtml(fmtInt(net) || "—")}</td>
            <td class="txf-num ${dirClass(r.tradingVolumeNet)}">${escapeHtml(fmtInt(r.tradingVolumeNet) || "—")}</td>
          </tr>`;
        })
        .join("");
      return `
        <article class="txf-inst-card">
          <h4>${escapeHtml(code)}</h4>
          <div class="txf-table-wrap" role="region" tabindex="0" aria-label="${escapeHtml(code)}">
            <table class="txf-table">
              <thead>
                <tr>
                  <th>${escapeHtml(t("txfColParty"))}</th>
                  <th>${escapeHtml(t("txfColLongOI"))}</th>
                  <th>${escapeHtml(t("txfColShortOI"))}</th>
                  <th>${escapeHtml(t("txfColNetOI"))}</th>
                  <th>${escapeHtml(t("txfColNetVol"))}</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </article>`;
    })
    .join("");

  return `
    <section class="txf-panel" aria-label="${escapeHtml(t("txfInstTitle"))}">
      <h3 class="txf-h3">${escapeHtml(t("txfInstTitle"))}</h3>
      <p class="txf-panel-lead">${escapeHtml(t("txfInstLead", { date: inst.asOf || "—" }))}</p>
      <div class="txf-inst-grid">${tables}</div>
      <p class="txf-footnote">${escapeHtml(t("txfInstFoot"))}</p>
    </section>`;
}

function paintCalendar(data) {
  const cal = data?.calendar || {};
  const rs = cal.recentSettlement;
  const pcr = data?.putCallRatio;
  return `
    <section class="txf-panel" aria-label="${escapeHtml(t("txfCalendarTitle"))}">
      <h3 class="txf-h3">${escapeHtml(t("txfCalendarTitle"))}</h3>
      <div class="txf-cal-grid">
        <article class="txf-cal-card">
          <h4>${escapeHtml(t("txfNextLTD"))}</h4>
          <p class="txf-cal-big">${escapeHtml(cal.nextNearLastTradingDay || "—")}</p>
          <p class="txf-muted">${escapeHtml(t("txfNearMonth"))}: ${escapeHtml(monthLabel(cal.nextNearMonth))}
            · ${escapeHtml(t("txfNextMonth"))}: ${escapeHtml(monthLabel(cal.nextNextMonth))}（${escapeHtml(cal.nextNextLastTradingDay || "—")}）</p>
          <p class="txf-muted">${escapeHtml(cal.ruleZh || t("txfLTDRule"))}</p>
        </article>
        <article class="txf-cal-card">
          <h4>${escapeHtml(t("txfRecentSettle"))}</h4>
          <p class="txf-cal-big">${escapeHtml(rs ? fmtNum(rs.finalSettlementPrice, 0) : "—")}</p>
          <p class="txf-muted">${escapeHtml(rs?.finalSettlementDay || "—")} · ${escapeHtml(rs?.deliveryMonth || "")}</p>
          <p class="txf-muted">${escapeHtml(rs?.contractName || "")}</p>
        </article>
        ${
          pcr
            ? `<article class="txf-cal-card">
          <h4>${escapeHtml(t("txfPcrTitle"))}</h4>
          <p class="txf-cal-big">${escapeHtml(fmtNum(pcr.putCallVolumeRatioPct, 2) || "—")}%</p>
          <p class="txf-muted">${escapeHtml(t("txfPcrVol"))}: P ${escapeHtml(fmtInt(pcr.putVolume) || "—")} / C ${escapeHtml(fmtInt(pcr.callVolume) || "—")}</p>
          <p class="txf-muted">${escapeHtml(t("txfPcrOI"))}: ${escapeHtml(fmtNum(pcr.putCallOIRatioPct, 2) || "—")}% · ${escapeHtml(t("dataAsOf"))} ${escapeHtml(pcr.asOf || "—")}</p>
        </article>`
            : ""
        }
      </div>
    </section>`;
}

function paintExplainer() {
  return `
    <section class="txf-panel" aria-label="${escapeHtml(t("txfExplainTitle"))}">
      <h3 class="txf-h3">${escapeHtml(t("txfExplainTitle"))}</h3>
      <ul class="txf-explain">
        <li>${escapeHtml(t("txfExplain1"))}</li>
        <li>${escapeHtml(t("txfExplain2"))}</li>
        <li>${escapeHtml(t("txfExplain3"))}</li>
        <li>${escapeHtml(t("txfExplain4"))}</li>
      </ul>
    </section>`;
}

function paintSources(data) {
  const srcs = Array.isArray(data?.sourcesDetail) ? data.sourcesDetail : [];
  if (!srcs.length) return "";
  return `
    <section class="txf-panel txf-sources" aria-label="${escapeHtml(t("txfSourcesTitle"))}">
      <h3 class="txf-h3">${escapeHtml(t("txfSourcesTitle"))}</h3>
      <ul class="txf-src-list">
        ${srcs
          .map(
            (s) =>
              `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label || s.url)}</a></li>`
          )
          .join("")}
      </ul>
    </section>`;
}

function paint(root, data) {
  const discs = Array.isArray(data?.disclaimers) ? data.disclaimers : [];
  const discHtml = discs.length
    ? `<ul class="txf-disc-list">${discs.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`
    : `<p>${escapeHtml(t("txfDisclaimer"))}</p>`;

  root.innerHTML = `
    ${paintHero(data)}
    ${paintContracts(data)}
    ${paintInstitutional(data)}
    ${paintCalendar(data)}
    ${paintExplainer()}
    ${paintSources(data)}
    <div class="txf-disclaimer" role="note">${discHtml}</div>
  `;
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

export async function initTxf(selector = "#txf-root") {
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
      <div class="txf-empty" role="status">
        <p>${escapeHtml(t("txfLoadError", { msg: err.message || String(err) }))}</p>
      </div>`;
    return { ok: false, error: err };
  }
}
