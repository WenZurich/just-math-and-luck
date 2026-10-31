/**
 * SOXL desk — quote hero, events, news, holdings + contribution estimates.
 * Data: public/data/soxl-desk.json
 * Never invents metrics; missing fields omitted.
 */
import { escapeHtml } from "./glossary.js";
import { t, numberLocale } from "./i18n.js";

const DATA_URL = "./data/soxl-desk.json";

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

function fmtPct(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const sign = n > 0 ? "+" : "";
  return `${sign}${Number(n).toFixed(d)}%`;
}

function fmtMoney(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  return `${sign}${fmtNum(n, d)}`;
}

/** Taiwan convention: 紅漲綠跌 */
function dirClass(n) {
  if (n == null || Number.isNaN(n) || n === 0) return "sx-flat";
  return n > 0 ? "sx-up" : "sx-down";
}

function isExtendedSession(session) {
  return /overnight|extended|Blue Ocean|盤後|夜盤/i.test(String(session || ""));
}

function paint(root, data) {
  const q = data?.quote || {};
  const reg = q.regularClose;
  // Finance desk: when Yahoo only has overnight/extended as "latest", show
  // the last regular close as the hero number so closed-market readers are not
  // misled. Overnight stays as a secondary line (no live overwrite of primary).
  const useRegPrimary = reg?.price != null && isExtendedSession(q.session);
  const primary = useRegPrimary
    ? {
        price: reg.price,
        change: reg.change,
        changePct: reg.changePct,
        session: reg.session || t("soxlRegularClose"),
      }
    : {
        price: q.price,
        change: q.change,
        changePct: q.changePct,
        session: q.session,
      };
  const chg = primary.change;
  const chgPct = primary.changePct;
  const dir = dirClass(chgPct ?? chg);
  const secondaryLine = useRegPrimary
    ? `<p class="sx-regular sx-overnight">${escapeHtml(t("soxlOvernight"))}: $${escapeHtml(fmtNum(q.price, 2) || "—")}
        <span class="${dirClass(q.changePct)}">${escapeHtml(fmtMoney(q.change, 2) || "")} (${escapeHtml(fmtPct(q.changePct, 2) || "")})</span>
        ${q.session ? ` · ${escapeHtml(q.session)}` : ""}</p>`
    : reg?.price != null
      ? `<p class="sx-regular">${escapeHtml(t("soxlRegularClose"))}: $${escapeHtml(fmtNum(reg.price, 2))}
          <span class="${dirClass(reg.changePct)}">${escapeHtml(fmtMoney(reg.change, 2) || "")} (${escapeHtml(fmtPct(reg.changePct, 2) || "")})</span>
          ${reg.session ? ` · ${escapeHtml(reg.session)}` : ""}</p>`
      : "";

  const hero = `
    <section class="sx-hero" aria-label="${escapeHtml(t("soxlHeroLabel"))}">
      <div class="sx-hero-main">
        <div class="sx-symbol-row">
          <span class="sx-symbol">SOXL</span>
          <span class="sx-badge">3×</span>
          <span class="sx-fund">${escapeHtml(data?.fundName || t("soxlFundFallback"))}</span>
        </div>
        <div class="sx-price-row ${dir}"${useRegPrimary ? "" : ' data-lq="soxl" data-lq-sym="SOXL"'}>
          <span class="sx-price"${useRegPrimary ? "" : ' data-lq-field="price"'}>$${escapeHtml(fmtNum(primary.price, 2) || "—")}</span>
          <span class="sx-chg">${escapeHtml(fmtMoney(chg, 2) || "—")}</span>
          <span class="sx-chgp"${useRegPrimary ? "" : ' data-lq-field="dayPct"'}>${escapeHtml(fmtPct(chgPct, 2) || "—")}</span>
        </div>
        <p class="sx-session">${escapeHtml(primary.session || "")} · ${escapeHtml(t("dataAsOf"))} ${escapeHtml(fmtAsOf(data?.asOf))}</p>
        ${secondaryLine}
      </div>
      <div class="sx-hero-side">
        <p class="sx-lev">${escapeHtml(t("soxlLeverageNote"))}</p>
        <p class="sx-hold-date"><strong>${escapeHtml(t("soxlHoldingsAsOf"))}</strong> ${escapeHtml(data?.holdingsAsOf || "—")}
          <span class="sx-muted">（${escapeHtml(t("soxlHoldingsNotSameDay"))}）</span></p>
      </div>
    </section>`;

  const events = Array.isArray(data?.events) ? data.events : [];
  const eventsHtml = events.length
    ? `<section class="sx-events" aria-label="${escapeHtml(t("soxlEventsTitle"))}">
        <h3 class="sx-h3">${escapeHtml(t("soxlEventsTitle"))}</h3>
        <ul class="sx-event-list">
          ${events
            .map(
              (e) => `<li class="sx-event sx-sev-${escapeHtml(e.severity || "info")}">
              <div class="sx-event-title">${escapeHtml(e.title || "")}</div>
              <p class="sx-event-detail">${escapeHtml(e.detail || "")}</p>
            </li>`
            )
            .join("")}
        </ul>
      </section>`
    : "";

  const news = Array.isArray(data?.news) ? data.news : [];
  const newsHtml = `
    <section class="sx-news" aria-label="${escapeHtml(t("soxlNewsTitle"))}">
      <h3 class="sx-h3">${escapeHtml(t("soxlNewsTitle"))}</h3>
      <div class="sx-news-list">
        ${
          news.length
            ? news
                .map(
                  (n) => `<a class="sx-news-card" href="${escapeHtml(n.url || "#")}" target="_blank" rel="noopener noreferrer">
              <div class="sx-news-title">${escapeHtml(n.title || "")}</div>
              ${n.published ? `<div class="sx-news-meta">${escapeHtml(n.published)}</div>` : ""}
              ${n.summary ? `<p class="sx-news-sum">${escapeHtml(n.summary)}</p>` : ""}
            </a>`
                )
                .join("")
            : `<p class="sx-empty">${escapeHtml(t("soxlNewsEmpty"))}</p>`
        }
      </div>
    </section>`;

  const holdings = Array.isArray(data?.holdings) ? data.holdings : [];
  const TYPE_KEY = { equity: "soxlTypeEquity", cash_equivalent: "soxlTypeCash", swap: "soxlTypeSwap" };
  const typeLabel = (it) => t(TYPE_KEY[it] || "soxlTypeOther");
  const mdDate = (iso) => (/^\d{4}-(\d{2})-(\d{2})$/.test(iso || "") ? `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}` : iso || "");
  const moveDay = holdings.find((h) => h.changePctAsOf)?.changePctAsOf || null;
  const rows = holdings
    .map((h) => {
      const isEquity = h.instrumentType === "equity";
      const label = h.ticker || typeLabel(h.instrumentType);
      const chgCls = dirClass(h.changePct);
      const contribCls = dirClass(h.contributionPct);
      const reasons = Array.isArray(h.reasons) ? h.reasons : [];
      const srcs = Array.isArray(h.sources) ? h.sources : [];
      const noMove = isEquity ? "—" : t("soxlNoDailyMove");
      return `<tr class="sx-row sx-row-${escapeHtml(h.instrumentType || "other")}">
        <td class="sx-cell-name">
          <div class="sx-tk">${escapeHtml(String(label))}</div>
          <div class="sx-name">${escapeHtml(h.name || "")}</div>
          ${h.instrumentType && h.ticker ? `<span class="sx-itype">${escapeHtml(typeLabel(h.instrumentType))}</span>` : ""}
        </td>
        <td class="sx-num" data-label="${escapeHtml(t("soxlColWeight"))}">${h.weightPct != null ? escapeHtml(fmtNum(h.weightPct, 2)) + "%" : "—"}</td>
        <td class="sx-num ${chgCls}" data-label="${escapeHtml(t("soxlColReturn"))}">${
          h.changePct != null
            ? `${escapeHtml(fmtPct(h.changePct, 2))}${h.changePctAsOf ? `<span class="sx-asof">${escapeHtml(t("soxlReturnAsOf", { date: mdDate(h.changePctAsOf) }))}</span>` : ""}`
            : `<span class="sx-na">${escapeHtml(noMove)}</span>`
        }</td>
        <td class="sx-num ${contribCls}" data-label="${escapeHtml(t("soxlColContrib"))}" title="${escapeHtml(t("soxlContributionHint"))}">
          ${h.contributionPct != null ? `${escapeHtml(fmtMoney(h.contributionPct, 3))} <span class="sx-unit">${escapeHtml(t("soxlPp"))}</span>*` : `<span class="sx-na">${escapeHtml(noMove)}</span>`}
        </td>
        <td class="sx-reasons" data-label="${escapeHtml(t("soxlColReasons"))}">
          <ul>${reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
          ${
            srcs.length
              ? `<div class="sx-srcs">${srcs
                  .slice(0, 3)
                  .map(
                    (u, i) =>
                      `<a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("soxlSourceN", { n: String(i + 1) }))}</a>`
                  )
                  .join(" · ")}</div>`
              : ""
          }
        </td>
      </tr>`;
    })
    .join("");

  const holdingsLead = data?.holdingsAsOf
    ? t("soxlHoldingsLeadDated", { date: data.holdingsAsOf, day: moveDay || "—" })
    : t("soxlHoldingsLead");
  const srcUrl = data?.holdingsSource?.index_url || data?.holdingsSource?.url;
  const holdingsHtml = `
    <section class="sx-holdings" aria-label="${escapeHtml(t("soxlHoldingsTitle"))}">
      <h3 class="sx-h3">${escapeHtml(t("soxlHoldingsTitle"))}</h3>
      <p class="sx-panel-lead">${escapeHtml(holdingsLead)}${
        srcUrl ? ` <a href="${escapeHtml(srcUrl)}" target="_blank" rel="noopener noreferrer">SEC N-PORT</a>` : ""
      }</p>
      <div class="sx-table-wrap">
        <table class="sx-table">
          <caption class="sx-sr-only">${escapeHtml(t("soxlHoldingsTitle"))}</caption>
          <thead>
            <tr>
              <th scope="col">${escapeHtml(t("soxlColName"))}</th>
              <th scope="col">${escapeHtml(t("soxlColWeight"))}</th>
              <th scope="col">${escapeHtml(t("soxlColReturn"))}</th>
              <th scope="col">${escapeHtml(t("soxlColContrib"))}</th>
              <th scope="col">${escapeHtml(t("soxlColReasons"))}</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="5">${escapeHtml(t("soxlHoldingsEmpty"))}</td></tr>`}</tbody>
        </table>
      </div>
      <p class="sx-footnote">* ${escapeHtml(t("soxlContributionHint"))}</p>
    </section>`;

  const up = Array.isArray(data?.overallUpReasons) ? data.overallUpReasons : [];
  const down = Array.isArray(data?.overallDownReasons) ? data.overallDownReasons : [];
  const overallHtml = `
    <section class="sx-overall" aria-label="${escapeHtml(t("soxlOverallTitle"))}">
      <h3 class="sx-h3">${escapeHtml(t("soxlOverallTitle"))}</h3>
      <div class="sx-overall-grid">
        <article class="sx-card sx-card-up">
          <h4>${escapeHtml(t("soxlWhyUp"))}</h4>
          <ul>${up.map((x) => `<li>${escapeHtml(x)}</li>`).join("") || `<li>${escapeHtml(t("earningsDataMissing"))}</li>`}</ul>
        </article>
        <article class="sx-card sx-card-down">
          <h4>${escapeHtml(t("soxlWhyDown"))}</h4>
          <ul>${down.map((x) => `<li>${escapeHtml(x)}</li>`).join("") || `<li>${escapeHtml(t("earningsDataMissing"))}</li>`}</ul>
        </article>
      </div>
    </section>`;

  const discs = Array.isArray(data?.disclaimers) ? data.disclaimers : [];
  const discHtml = discs.length
    ? `<ul class="sx-disc-list">${discs.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`
    : `<p>${escapeHtml(t("soxlDisclaimer"))}</p>`;

  root.innerHTML = `
    ${hero}
    ${eventsHtml}
    ${newsHtml}
    ${holdingsHtml}
    ${overallHtml}
    <div class="sx-disclaimer" role="note">${discHtml}</div>
  `;
}

export { renderSoxlSection } from "./section-shells.js";

export async function initSoxl(selector = "#sx-root") {
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
      <div class="sx-empty" role="status">
        <p>${escapeHtml(t("soxlLoadError", { msg: err.message || String(err) }))}</p>
      </div>`;
    return { ok: false, error: err };
  }
}
