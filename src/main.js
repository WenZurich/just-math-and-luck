import "./style.css";
import { term, escapeHtml } from "./glossary.js";
import {
  t,
  applyDocumentLang,
  numberLocale,
  renderLangSwitcher,
  bindLangSwitcher,
  onLangChange,
} from "./i18n.js";
import {
  renderPaperSection,
  bindPaperTabs,
  loadPaperPortfolio,
} from "./paper.js";
import { initPaperDerivatives } from "./paper-derivatives.js";
import "./strategies.css";
import {
  renderStrategiesSection,
  initStrategies,
} from "./strategies.js";
import { renderLogicSection, renderRegimeStrip } from "./logic.js";
import "./research.css";
import {
  renderResearchSection,
  initResearch,
  setResearchCategory,
  normalizeResearchCategory,
} from "./research.js";
import "./options.css";
import {
  renderOptionsSection,
  initOptions,
} from "./options.js";
import "./earnings.css";
import {
  renderEarningsSection,
  initEarnings,
} from "./earnings.js";
import "./lookup.css";
import {
  renderLookupSection,
  initLookup,
} from "./lookup.js";
import "./soxl.css";
import {
  renderSoxlSection,
  initSoxl,
} from "./soxl.js";
import "./txf.css";
import {
  renderTxfSection,
  initTxf,
} from "./txf.js";
import { startLiveQuotes, stopLiveQuotes } from "./live-quotes.js";
import {
  renderUsMacroStripSlot,
  initUsMacroStrip,
} from "./us-macro.js";
import {
  renderTwMacroStripSlot,
  initTwMacroStrip,
} from "./tw-macro.js";
import "./godzilla.css";
import "./jensen.css";
import "./podcasts.css";
import "./gooaye.css";
import "./xiaojun.css";
import "./whynottv.css";
import "./zhang-junan.css";
import {
  renderPodcastsSection,
  initPodcasts,
  setPodcastCategory,
  normalizePodcastCategory,
} from "./podcasts.js";
import "./letters.css";
import {
  renderLettersSection,
  initLetters,
  setLettersCategory,
  normalizeLettersCategory,
} from "./letters.js";
import {
  renderManbaoSection,
  initManbao,
  setManbaoCategory,
  normalizeManbaoCategory,
} from "./manbao.js";

const DATA_URL = "./data/latest.json";

/** Taiwan convention: 紅漲綠跌 */
function pctClass(n) {
  if (n == null || Number.isNaN(n)) return "flat";
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}

function fmtPct(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

function fmtNum(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(numberLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtPrice(n, currency) {
  if (n == null || Number.isNaN(n)) return "—";
  const digits = currency === "TWD" && n >= 100 ? 0 : 2;
  const prefix = currency === "USD" ? "$" : currency === "TWD" ? "NT$" : "";
  return `${prefix}${fmtNum(n, digits)}`;
}

function fmtAsOf(iso) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleString(numberLocale(), {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + t("taipei")
    );
  } catch {
    return iso;
  }
}

function smaBadges(stock) {
  const a20 = stock.aboveSma20
    ? `<span class="badge sma-on">${term("sma20", "SMA20")}↑</span>`
    : `<span class="badge sma-off">${term("sma20", "SMA20")}↓</span>`;
  const a50 = stock.aboveSma50
    ? `<span class="badge sma-on">${term("sma50", "SMA50")}↑</span>`
    : `<span class="badge sma-off">${term("sma50", "SMA50")}↓</span>`;
  return a20 + a50;
}

function screenBadges(screens) {
  if (!screens?.length) return "";
  return screens
    .map((s) => {
      const key = String(s);
      if (key === "A") return `<span class="badge screen">${term("screenA", "A")}</span>`;
      if (key === "B") return `<span class="badge screen">${term("screenB", "B")}</span>`;
      if (key === "C") return `<span class="badge screen">${term("screenC", "C")}</span>`;
      if (key === "observe") return `<span class="badge screen">${escapeHtml(t("observe"))}</span>`;
      return `<span class="badge screen">${escapeHtml(key)}</span>`;
    })
    .join("");
}



/** Official publisher pages for 「熱門」 pills (real public URLs only). */
const INDEX_OFFICIAL_URLS = {
  tw: "https://www.twse.com.tw/zh/indices/taiex/mi-5min-indices.html",
  otc: "https://www.tpex.org.tw/zh-tw/mainboard/trading/info/daily-indices.html",
  spx: "https://www.spglobal.com/spdji/en/indices/equity/sp-500/",
  nasdaq: "https://www.nasdaq.com/market-activity/index/comp",
  sox: "https://www.nasdaq.com/market-activity/index/sox",
  // CBC publishes Taipei Forex (台北外匯經紀) interbank closing USD/TWD
  usdTwd: "https://www.cbc.gov.tw/tw/lp-645-1.html",
};

function renderIndexStrip(indices) {
  const chips = [];

  const pushPct = (key, labelHtml, item) => {
    if (!item) return;
    const incomplete = item.incomplete;
    const val =
      item.value != null
        ? fmtNum(item.value, 2)
        : incomplete
          ? escapeHtml(t("dataIncomplete"))
          : "—";
    const pct =
      item.dayPct != null
        ? `<div data-lq-field="dayPct" class="pct ${pctClass(item.dayPct)}">${fmtPct(item.dayPct)}</div>`
        : "";
    const session =
      item.session === "intraday"
        ? ` · ${term("intraday", t("intraday"))}`
        : "";
    const href = INDEX_OFFICIAL_URLS[key];
    const title = href ? `title="${escapeHtml((item.name || key) + " · official ↗")}"` : "";
    const inner = `
        <div class="label">${labelHtml}${session}</div>
        <div class="value" data-lq-field="value">${val}</div>
        ${pct}`;
    if (href) {
      chips.push(`
      <a class="index-chip ${incomplete ? "incomplete" : ""}" data-lq="index" data-lq-key="${escapeHtml(key)}" href="${escapeHtml(href)}"
         target="_blank" rel="noopener noreferrer" ${title}>${inner}
      </a>`);
    } else {
      chips.push(`
      <div class="index-chip ${incomplete ? "incomplete" : ""}" data-lq="index" data-lq-key="${escapeHtml(key)}">${inner}
      </div>`);
    }
  };

  pushPct("tw", term("taiex", indices.tw?.name || t("taiex")), indices.tw);
  pushPct("otc", term("otc", indices.otc?.name || t("otc")), indices.otc);
  pushPct("spx", term("spx", indices.spx?.name || t("spx")), indices.spx);
  pushPct("nasdaq", term("nasdaq", indices.nasdaq?.name || t("nasdaq")), indices.nasdaq);
  pushPct("sox", term("sox", indices.sox?.name || t("sox")), indices.sox);

  if (indices.usdTwd) {
    const fx = indices.usdTwd;
    const show = fx.taipeiClose ?? fx.yahoo;
    const href = INDEX_OFFICIAL_URLS.usdTwd;
    const tip = [
      "USD/TWD",
      t("taipeiClose") + (fx.taipeiClose != null ? ` ${fmtNum(fx.taipeiClose, 3)}` : " —"),
      fx.yahoo != null ? `Yahoo ${fmtNum(fx.yahoo, 3)}` : null,
      "CBC / 台北外匯 official ↗",
    ]
      .filter(Boolean)
      .join(" · ");
    chips.push(`
      <a class="index-chip" data-lq="index" data-lq-key="usdTwd"
         data-lq-taipei-close="${fx.taipeiClose != null ? escapeHtml(String(fx.taipeiClose)) : ""}"
         href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"
         title="${escapeHtml(tip)}">
        <div class="label">${term("usdtwd", t("usdtwd"))}</div>
        <div class="value" data-lq-field="value">${fmtNum(show, 3)}</div>
        <div class="pct flat" data-lq-field="dayPct" style="font-size:0.7rem">
          ${escapeHtml(t("taipeiClose"))} ${fx.taipeiClose != null ? fmtNum(fx.taipeiClose, 3) : "—"}
          · Yahoo ${fx.yahoo != null ? fmtNum(fx.yahoo, 3) : "—"}
        </div>
      </a>
    `);
  }

  if (!chips.length) {
    return `<div class="index-strip index-strip--marquee"></div>`;
  }

  const group = `<div class="index-marquee-group">${chips.join("")}</div>`;
  // Duplicate track for seamless ticker loop (desktop + mobile).
  return `
    <div class="index-strip index-strip--marquee">
      <div class="index-marquee" tabindex="0">
        <div class="index-marquee-track">
          ${group}
          <div class="index-marquee-group index-marquee-group--clone" aria-hidden="true">${chips.join("")}</div>
        </div>
      </div>
    </div>`;
}

function renderTopCard(stock, rank) {
  const market =
    stock.market === "TW"
      ? term("twStock", t("twStock"))
      : stock.market === "US"
        ? term("usStock", t("usStock"))
        : escapeHtml(stock.market || "");
  const rsLabel =
    stock.rsVsIndexPp != null
      ? `<div class="metric"><div class="m-label">${term("rs", "RS")}</div><div class="m-val ${pctClass(stock.rsVsIndexPp)}">${fmtPct(stock.rsVsIndexPp)}</div></div>`
      : stock.priorClosePct != null
        ? `<div class="metric"><div class="m-label">${term("priorClose", t("priorCloseFull"))}</div><div class="m-val ${pctClass(stock.priorClosePct)}">${fmtPct(stock.priorClosePct)}</div></div>`
        : `<div class="metric"><div class="m-label">${term("rs", "RS")}</div><div class="m-val">—</div></div>`;

  return `
    <article class="pick-card" data-lq="pick" data-lq-sym="${escapeHtml(stock.ticker)}">
      <div class="rank">TOP ${rank}</div>
      <div class="head">
        <div class="ticker-block">
          <div class="ticker">${escapeHtml(stock.ticker)}</div>
          <div class="name">${escapeHtml(stock.name || "")}</div>
        </div>
        <div class="price-block">
          <div class="price" data-lq-field="price">${fmtPrice(stock.price, stock.currency)}</div>
          <div class="day-pct ${pctClass(stock.dayPct)}" data-lq-field="dayPct">${fmtPct(stock.dayPct)}</div>
        </div>
      </div>
      <div class="flags">
        <span class="badge market">${market}</span>
        ${screenBadges(stock.screens)}
        ${smaBadges(stock)}
      </div>
      <div class="metrics">
        ${rsLabel}
        <div class="metric"><div class="m-label">${term("pct5d", t("pct5d"))}</div><div class="m-val ${pctClass(stock.pct5d)}">${fmtPct(stock.pct5d)}</div></div>
        <div class="metric"><div class="m-label">${term("pct1m", t("pct1m"))}</div><div class="m-val ${pctClass(stock.pct1m)}">${fmtPct(stock.pct1m)}</div></div>
        <div class="metric"><div class="m-label">${term("volRatio", t("volRatio"))}</div><div class="m-val">${stock.volRatio != null ? fmtNum(stock.volRatio, 2) + "×" : "—"}</div></div>
      </div>
      ${(stock.business || stock.why || stock.risk) ? `<details class="fold-block card-fold"><summary>${escapeHtml(t("details"))}</summary>
        ${stock.business ? `<p class="card-text"><strong>${escapeHtml(t("business"))}</strong>　${escapeHtml(stock.business)}</p>` : ""}
        ${stock.why ? `<p class="card-text"><strong>${escapeHtml(t("reason"))}</strong>　${escapeHtml(stock.why)}</p>` : ""}
        ${stock.risk ? `<p class="card-text risk"><strong>${escapeHtml(t("risk"))}</strong>　${linkRiskText(stock.risk)}</p>` : ""}
      </details>` : ""}
    </article>
  `;
}

function linkRiskText(text) {
  let s = escapeHtml(text);
  s = s.replace(/漲停/g, term("limitUp", t("limitUp")));
  s = s.replace(/動能/g, term("momentum", t("momentum")));
  return s;
}

function tableRows(list) {
  return list
    .map((s) => {
      const rsVal = s.rsVsIndexPp ?? s.priorClosePct;
      const rsLabel =
        s.rsVsIndexPp != null
          ? fmtPct(s.rsVsIndexPp)
          : s.priorClosePct != null
            ? fmtPct(s.priorClosePct)
            : "—";
      return `
      <tr data-lq="pick" data-lq-sym="${escapeHtml(s.ticker)}">
        <td><span class="ticker">${escapeHtml(s.ticker)}</span></td>
        <td class="name-cell">${escapeHtml(s.name || "")}</td>
        <td class="num" data-lq-field="price">${fmtPrice(s.price, s.currency)}</td>
        <td class="num ${pctClass(s.dayPct)}" data-lq-field="dayPct">${fmtPct(s.dayPct)}</td>
        <td class="num ${pctClass(rsVal)}">${rsLabel}</td>
        <td class="num ${pctClass(s.pct5d)}">${fmtPct(s.pct5d)}</td>
        <td class="num ${pctClass(s.pct1m)}">${fmtPct(s.pct1m)}</td>
        <td class="num">${s.volRatio != null ? fmtNum(s.volRatio, 2) + "×" : "—"}</td>
        <td>${smaBadges(s)}</td>
        <td>${screenBadges(s.screens)}</td>
        <td class="why-cell">${escapeHtml(s.why || "")}</td>
      </tr>`;
    })
    .join("");
}

function mobileCards(list) {
  return list
    .map((s) => {
      const rs =
        s.rsVsIndexPp != null
          ? `<span class="${pctClass(s.rsVsIndexPp)}">${term("rs", "RS")} ${fmtPct(s.rsVsIndexPp)}</span>`
          : s.priorClosePct != null
            ? `<span class="${pctClass(s.priorClosePct)}">${term("priorClose", t("priorClose"))} ${fmtPct(s.priorClosePct)}</span>`
            : "";
      return `
      <div class="list-card" data-lq="pick" data-lq-sym="${escapeHtml(s.ticker)}">
        <div class="lc-head">
          <div>
            <span class="ticker" style="font-family:var(--mono);font-weight:600">${escapeHtml(s.ticker)}</span>
            <span style="color:var(--text-muted);font-size:0.85rem;margin-left:0.35rem">${escapeHtml(s.name || "")}</span>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--mono)" data-lq-field="price">${fmtPrice(s.price, s.currency)}</div>
            <div class="${pctClass(s.dayPct)}" data-lq-field="dayPct" style="font-family:var(--mono);font-weight:600">${fmtPct(s.dayPct)}</div>
          </div>
        </div>
        <div class="lc-metrics">
          ${rs}
          <span class="${pctClass(s.pct5d)}">${term("pct5d", "5d")} ${fmtPct(s.pct5d)}</span>
          <span class="${pctClass(s.pct1m)}">${term("pct1m", "1m")} ${fmtPct(s.pct1m)}</span>
          <span>${term("volRatio", t("volRatio"))} ${s.volRatio != null ? fmtNum(s.volRatio, 2) + "×" : "—"}</span>
        </div>
        <div class="flags" style="margin-bottom:0.4rem">${smaBadges(s)}${screenBadges(s.screens)}</div>
        ${s.why ? `<p class="lc-why">${escapeHtml(s.why)}</p>` : ""}
        ${s.risk && s.risk !== "—" ? `<p class="lc-why lc-risk">${escapeHtml(t("risk"))}：${linkRiskText(s.risk)}</p>` : ""}
      </div>`;
    })
    .join("");
}

function renderListHeaders() {
  return `
    <tr>
      <th>${term("ticker", t("ticker"))}</th>
      <th>${escapeHtml(t("name"))}</th>
      <th>${escapeHtml(t("price"))}</th>
      <th>${term("dayPct", t("dayPct"))}</th>
      <th>${term("rs", "RS")}／${term("priorClose", t("priorClose"))}</th>
      <th>${term("pct5d", t("pct5d"))}</th>
      <th>${term("pct1m", t("pct1m"))}</th>
      <th>${term("volRatio", t("volRatio"))}</th>
      <th>${escapeHtml(t("ma"))}</th>
      <th>${term("screening", t("screening"))}</th>
      <th>${escapeHtml(t("reason"))}</th>
    </tr>`;
}


function stockMarket(s) {
  if (!s) return "US";
  if (s.market === "TW" || s.market === "US") return s.market;
  return String(s.ticker || "").toUpperCase().endsWith(".TW") ? "TW" : "US";
}



function renderTop5ByMarket(list, marketLabel) {
  if (!list.length) {
    return `<div class="empty-state">${escapeHtml(t("emptyTop", { market: marketLabel }))}</div>`;
  }
  return `<div class="top5-grid">${list
    .map((s, i) => renderTopCard(s, i + 1))
    .join("")}</div>`;
}


function getViews() {
  return [
    { id: "today", label: t("navToday"), hash: "today" },
    { id: "logic", label: t("navLogic"), hash: "logic" },
    { id: "research", label: t("navResearch"), hash: "research" },
    { id: "strategies", label: t("navStrategies"), hash: "strategies" },
    { id: "options", label: t("navOptions"), hash: "options" },
    { id: "earnings", label: t("navEarnings"), hash: "earnings" },
    { id: "lookup", label: t("navLookup"), hash: "lookup" },
    { id: "soxl", label: t("navSoxl"), hash: "soxl" },
    { id: "txf", label: t("navTxf"), hash: "txf" },
    { id: "podcasts", label: t("navPodcasts"), hash: "podcasts" },
    { id: "letters", label: t("navLetters"), hash: "letters" },
    { id: "manbao", label: t("navManbao"), hash: "manbao" },
    { id: "paper", label: t("navPaper"), hash: "paper" },
  ];
}

/** Primary mobile bottom tabs (≤5). Secondary live under 「更多」. */
const MOBILE_PRIMARY = ["today", "strategies", "paper", "research"];
const MOBILE_MORE = ["logic", "options", "earnings", "lookup", "soxl", "txf", "podcasts", "letters", "manbao"];

const HASH_ALIASES = {
  today: "today",
  logic: "logic",
  research: "research",
  strategies: "strategies",
  options: "options",
  earnings: "earnings",
  lookup: "lookup",
  quote: "lookup",
  soxl: "soxl",
  txf: "txf",
  "futures-tw": "txf",
  台指期: "txf",
  臺指期: "txf",
  "tx-futures": "txf",
  podcasts: "podcasts",
  podcast: "podcasts",
  名人podcast: "podcasts",
  "celebrity-podcasts": "podcasts",
  godzilla: "podcasts",
  jensen: "podcasts",
  xiaojun: "podcasts",
  whynottv: "podcasts",
  "zhang-junan": "podcasts",
  zhangjunan: "podcasts",
  "張濬安": "podcasts",
  whynot: "podcasts",
  huang: "podcasts",
  "jensen-huang": "podcasts",
  "黃仁勳": "podcasts",
  nvidia: "podcasts",
  letters: "letters",
  berkshire: "letters",
  buffett: "letters",
  股東信: "letters",
  股东信: "letters",
  巴菲特: "letters",
  manbao: "manbao",
  "mann-pro": "manbao",
  曼報: "manbao",
  曼报: "manbao",
  "曼報pro": "manbao",
  "曼報Pro": "manbao",
  paper: "paper",
  // retired social → home
  social: "today",
  danmaku: "today",
  "social-digest": "today",
  giscus: "today",
  help: "logic",
  glossary: "logic",
  bookshelf: "research",
  library: "research",
  研究: "research",
  "us-options": "options",
  選擇權: "options",
  美股選擇權: "options",
  mcmillan: "options",
  "讀財報": "earnings",
  reports: "earnings",
  "us-earnings": "earnings",
  財報: "earnings",
  查股: "lookup",
  個股: "lookup",
  "stock-lookup": "lookup",
  "us-quote": "lookup",
  "tw-quote": "lookup",
  "soxl-desk": "soxl",
  semiconductor: "soxl",
  半導體: "soxl",
  三倍半導體: "soxl",
  台指期貨: "txf",
  臺股期貨: "txf",
  哥吉拉: "podcasts",
  哥吉拉心法: "podcasts",
  "godzilla-playbook": "podcasts",
  playbook: "podcasts",
  黃仁勳: "podcasts",
  "jen-hsun": "podcasts",
  etl: "podcasts",
  method: "logic",
  邏輯: "logic",
};

const NAV_ICONS = {
  today: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2zm12 8H5v10h14V10zm-2-5H7v2h10V5z"/></svg>`,
  logic: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 2h2v2h-2v-2zm3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2zm3-3h2v5h-2v-5z"/></svg>`,
  research: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM8 12h8v1.5H8V12zm0 3.5h8V17H8v-1.5zm0 3.5h5V20.5H8V19z"/></svg>`,
  strategies: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 19h16v2H4v-2zm2.5-3.5 4-4 3 3L21 6.5 19.5 5l-6 7.5-3-3L4 14.5l2.5 1z"/></svg>`,
  options: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 12a8 8 0 1 1 16 0H4zm8-6a6 6 0 0 0-5.65 4h11.3A6 6 0 0 0 12 6zm0 12a6 6 0 0 0 5.65-4H6.35A6 6 0 0 0 12 18z"/></svg>`,
  earnings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h6v-2H7z"/></svg>`,
  lookup: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 3a7 7 0 0 1 5.47 11.34l4.1 4.09-1.42 1.42-4.09-4.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>`,
  soxl: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25 9.5 9l3.5 4.5L17 8l4 9.25H3zM5 19h14v2H5v-2z"/></svg>`,
  txf: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 18h16v2H4v-2zm1.5-3.5 3.2-4.2 2.8 3.3L16 8l4 6.5H5.5zM7 4h2v2H7V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4z"/></svg>`,
  podcasts: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h3v-8H7v-1a5 5 0 0 1 10 0v1h-1v8h3a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9zm-4 11v5H5v-5h3zm11 5h-3v-5h3v5zM12 7a3 3 0 0 0-3 3v1h6v-1a3 3 0 0 0-3-3z"/></svg>`,
  letters: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm8 8.2L5.2 6.5 4 7.9l8 6.2 8-6.2-1.2-1.4L12 12.2z"/></svg>`,
  manbao: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h11l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm10 1.5V8h3.5L15 4.5zM7 11h10v1.6H7V11zm0 3.4h10v1.6H7v-1.6zM7 18h6v1.6H7V18z"/></svg>`,
  paper: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14.93V17h-2v-.07A8.01 8.01 0 0 1 5.07 13H7v-2H5.07A8.01 8.01 0 0 1 11 5.07V7h2V5.07A8.01 8.01 0 0 1 18.93 11H17v2h1.93A8.01 8.01 0 0 1 13 16.93z"/></svg>`,
  more: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 10h4v4H5v-4zm5 0h4v4h-4v-4zm5 0h4v4h-4v-4z"/></svg>`,
};

const PODCAST_DIRECT_SUB = {
  godzilla: "godzilla",
  "godzilla-playbook": "godzilla",
  playbook: "godzilla",
  "哥吉拉": "godzilla",
  "哥吉拉心法": "godzilla",
  jensen: "jensen",
  huang: "jensen",
  "jensen-huang": "jensen",
  nvidia: "jensen",
  "jen-hsun": "jensen",
  etl: "jensen",
  "黃仁勳": "jensen",
  "黄仁勋": "jensen",
  gooaye: "gooaye",
  "股癌": "gooaye",
  xiaojun: "xiaojun",
  "張小珺": "xiaojun",
  "张小珺": "xiaojun",
  whynottv: "whynottv",
  whynot: "whynottv",
  "WhynotTV": "whynottv",
  "zhang-junan": "zhang-junan",
  zhangjunan: "zhang-junan",
  "張濬安": "zhang-junan",
  "张浚安": "zhang-junan",
};

/** Parse #view or #view/sub/... plus direct aliases like #godzilla → podcasts/godzilla. */
function parseHashRoute() {
  const raw = (location.hash || "").replace(/^#/, "");
  const segments = raw.split(/[/?&]/).filter(Boolean);
  const decoded = segments.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  const first = decoded[0] || "";
  const key = first.toLowerCase();

  if (PODCAST_DIRECT_SUB[key] || PODCAST_DIRECT_SUB[first]) {
    return {
      view: "podcasts",
      sub: PODCAST_DIRECT_SUB[key] || PODCAST_DIRECT_SUB[first],
      parts: decoded.slice(1),
    };
  }

  const view = HASH_ALIASES[key] || HASH_ALIASES[first] || "today";
  const parts = decoded.slice(1);
  let sub = parts[0] || null;
  if (view === "podcasts" && sub) {
    sub = normalizePodcastCategory(sub);
  }
  let letterYear = null;
  if (view === "letters") {
    const yearSeg = parts.find((p) => /^\d{4}$/.test(p));
    const wantsSpecial = parts.some((p) => String(p).toLowerCase() === "special");
    if (wantsSpecial) letterYear = "special";
    else if (yearSeg) letterYear = yearSeg;
    const catSrc = wantsSpecial ? "special" : yearSeg || sub;
    if (catSrc) sub = normalizeLettersCategory(catSrc);
  }
  if (view === "manbao" && sub) sub = normalizeManbaoCategory(sub);
  if (view === "research" && sub) {
    // shelf deep-link: #research/shelf/<id>
    if (sub.toLowerCase() === "shelf" && parts[1]) {
      return { view, sub: "menu", shelf: parts[1], parts };
    }
    sub = normalizeResearchCategory(sub);
  }
  return { view, sub, parts, shelf: null, letterYear };
}

function parseViewFromHash() {
  return parseHashRoute().view;
}

function renderNavButton(v, variant) {
  const icon = NAV_ICONS[v.id] || "";
  return `
      <button type="button"
        class="nav-item"
        data-nav="${v.id}"
        data-variant="${variant}"
        aria-label="${escapeHtml(v.label)}"
        aria-current="false">
        <span class="nav-icon">${icon}</span>
        <span class="nav-label">${escapeHtml(v.label)}</span>
      </button>`;
}

function renderNavItems(variant) {
  return getViews().map((v) => renderNavButton(v, variant)).join("");
}

function renderMobileBottomNav() {
  const byId = Object.fromEntries(getViews().map((v) => [v.id, v]));
  const primary = MOBILE_PRIMARY.map((id) => renderNavButton(byId[id], "mobile")).join("");
  const moreBtn = `
      <button type="button"
        class="nav-item nav-more-btn"
        data-nav-more
        data-variant="mobile"
        aria-label="${escapeHtml(t("navMore"))}"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="nav-more-sheet"
        aria-current="false">
        <span class="nav-icon">${NAV_ICONS.more}</span>
        <span class="nav-label">${escapeHtml(t("navMore"))}</span>
      </button>`;
  const sheetItems = MOBILE_MORE.map((id) => {
    const v = byId[id];
    const icon = NAV_ICONS[id] || "";
    return `
        <button type="button"
          class="nav-more-item"
          data-nav="${v.id}"
          aria-label="${escapeHtml(v.label)}"
          aria-current="false">
          <span class="nav-icon">${icon}</span>
          <span class="nav-label">${escapeHtml(v.label)}</span>
        </button>`;
  }).join("");
  return `
    <nav class="nav-bottom" aria-label="${escapeHtml(t("navMain"))}">
      ${primary}
      ${moreBtn}
    </nav>
    <div id="nav-more-sheet" class="nav-more-sheet" hidden>
      <button type="button" class="nav-more-backdrop" data-more-close aria-label="${escapeHtml(t("navMoreClose"))}"></button>
      <div class="nav-more-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(t("navMore"))}">
        <div class="nav-more-grabber" aria-hidden="true"></div>
        <div class="nav-more-head">
          <h2 class="nav-more-title">${escapeHtml(t("navMore"))}</h2>
          <button type="button" class="nav-more-close" data-more-close aria-label="${escapeHtml(t("navMoreClose"))}">×</button>
        </div>
        <div class="nav-more-list">
          ${sheetItems}
        </div>
      </div>
    </div>`;
}

function renderApp(data, paper) {
  const top5 = data.top5 || [];
  const us = data.us || [];
  const tw = data.tw || [];
  const disclaimer = escapeHtml(t("disclaimer"));
  const headers = renderListHeaders();
  const logoUrl = `${import.meta.env.BASE_URL}logo.svg?v=5`;

  return `
    <header class="site-chrome">
      <div class="chrome-row">
        <div class="chrome-brand">
          <img class="brand-mark" src="${logoUrl}" width="40" height="40" alt="每日數學選股" decoding="async" />
          <div class="brand-text">
            <h1>${escapeHtml(t("siteTitle"))}</h1>
            <p class="brand-meta"><span id="brand-asof">${escapeHtml(t("dataAsOf"))} ${fmtAsOf(data.asOf)}</span><span id="lq-live-suffix" class="lq-live-suffix" hidden aria-live="polite"></span></p>
          </div>
        </div>
        <div class="chrome-actions">
          ${renderLangSwitcher()}
          <nav class="nav-desktop" aria-label="${escapeHtml(t("navMain"))}">
            ${renderNavItems("desktop")}
          </nav>
        </div>
      </div>
      <p class="disclaimer-line" role="note">${disclaimer}</p>
      <div class="market-strip-wrap" aria-label="${escapeHtml(t("marketQuotes"))}">
        <span class="market-strip-label">${escapeHtml(t("hot"))}</span>
        ${renderIndexStrip(data.indices || {})}
      </div>
      ${renderUsMacroStripSlot()}
      ${renderTwMacroStripSlot()}
    </header>

    <main class="view-host">
      <div class="view" id="view-today" data-view="today" hidden>
        <span id="today" class="view-anchor" tabindex="-1"></span>
        <header class="view-header view-header-tight">
          <h2 class="view-title">${escapeHtml(t("todayPicks"))}</h2>
        </header>
        ${renderRegimeStrip(data.marketRegime)}
        <div class="tabs market-tabs" role="tablist" aria-label="${escapeHtml(t("market"))}">
          <button type="button" class="tab-btn active" data-tab="us" role="tab" aria-selected="true">${term("usStock", t("usStock"))}（${us.length}）</button>
          <button type="button" class="tab-btn" data-tab="tw" role="tab" aria-selected="false">${term("twStock", t("twStock"))}（${tw.length}）</button>
        </div>
        <div class="panel active" id="panel-us" role="tabpanel">
          <section class="section">
            <h2 class="section-title">${escapeHtml(t("usTop"))}</h2>
            ${renderTop5ByMarket(top5.filter((s) => stockMarket(s) === "US"), t("usStock"))}
          </section>
          <section class="section">
            <h2 class="section-title">${escapeHtml(t("usList"))}</h2>
            <div class="table-wrap">
              <table class="stock-table">
                <thead>${headers}</thead>
                <tbody>${tableRows(us)}</tbody>
              </table>
            </div>
            <div class="mobile-list">${mobileCards(us)}</div>
          </section>
        </div>
        <div class="panel" id="panel-tw" role="tabpanel">
          <section class="section">
            <h2 class="section-title">${escapeHtml(t("twTop"))}</h2>
            ${renderTop5ByMarket(top5.filter((s) => stockMarket(s) === "TW"), t("twStock"))}
          </section>
          <section class="section">
            <h2 class="section-title">${escapeHtml(t("twList"))}</h2>
            <div class="table-wrap">
              <table class="stock-table">
                <thead>${headers}</thead>
                <tbody>${tableRows(tw)}</tbody>
              </table>
            </div>
            <div class="mobile-list">${mobileCards(tw)}</div>
          </section>
        </div>
      </div>
      <div class="view" id="view-logic" data-view="logic" hidden>
        <span id="logic" class="view-anchor" tabindex="-1"></span>
        ${renderLogicSection(data)}
      </div>

      <div class="view" id="view-research" data-view="research" hidden>
        <span id="research" class="view-anchor" tabindex="-1"></span>
        ${renderResearchSection()}
      </div>

      <div class="view" id="view-strategies" data-view="strategies" hidden>
        <span id="strategies" class="view-anchor" tabindex="-1"></span>
        ${renderStrategiesSection()}
      </div>

      <div class="view" id="view-options" data-view="options" hidden>
        <span id="options" class="view-anchor" tabindex="-1"></span>
        ${renderOptionsSection()}
      </div>

      <div class="view" id="view-earnings" data-view="earnings" hidden>
        <span id="earnings" class="view-anchor" tabindex="-1"></span>
        ${renderEarningsSection()}
      </div>

      <div class="view" id="view-lookup" data-view="lookup" hidden>
        <span id="lookup" class="view-anchor" tabindex="-1"></span>
        <span id="quote" class="view-anchor" tabindex="-1"></span>
        ${renderLookupSection()}
      </div>

      <div class="view" id="view-soxl" data-view="soxl" hidden>
        <span id="soxl" class="view-anchor" tabindex="-1"></span>
        ${renderSoxlSection()}
      </div>

      <div class="view" id="view-txf" data-view="txf" hidden>
        <span id="txf" class="view-anchor" tabindex="-1"></span>
        <span id="futures-tw" class="view-anchor" tabindex="-1"></span>
        ${renderTxfSection()}
      </div>

      <div class="view" id="view-podcasts" data-view="podcasts" hidden>
        <span id="podcasts" class="view-anchor" tabindex="-1"></span>
        <span id="godzilla" class="view-anchor" tabindex="-1"></span>
        <span id="jensen" class="view-anchor" tabindex="-1"></span>
        <span id="xiaojun" class="view-anchor" tabindex="-1"></span>
        <span id="whynottv" class="view-anchor" tabindex="-1"></span>
        <span id="zhang-junan" class="view-anchor" tabindex="-1"></span>
        ${renderPodcastsSection()}
      </div>

      <div class="view" id="view-letters" data-view="letters" hidden>
        <span id="letters" class="view-anchor" tabindex="-1"></span>
        ${renderLettersSection()}
      </div>

      <div class="view" id="view-manbao" data-view="manbao" hidden>
        <span id="manbao" class="view-anchor" tabindex="-1"></span>
        ${renderManbaoSection()}
      </div>

      <div class="view" id="view-paper" data-view="paper" hidden>
        <span id="paper" class="view-anchor" tabindex="-1"></span>
        ${renderPaperSection(paper)}
      </div>
    </main>

    ${renderMobileBottomNav()}

    <p class="site-footer">${escapeHtml(t("footer"))}</p>
  `;
}

let moreSheetCloseTimer = null;

function prefersReducedMotion() {
  try {
    return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function setMoreSheetOpen(root, open) {
  const sheet = root.querySelector("#nav-more-sheet");
  const btn = root.querySelector("[data-nav-more]");
  if (!sheet || !btn) return;

  if (moreSheetCloseTimer) {
    clearTimeout(moreSheetCloseTimer);
    moreSheetCloseTimer = null;
  }

  if (open) {
    sheet.hidden = false;
    // Two rAFs so display:flex paints before .is-open starts the slide/fade.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!sheet.hidden) sheet.classList.add("is-open");
      });
    });
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-more-open");
    return;
  }

  const wasVisible = sheet.classList.contains("is-open") || !sheet.hidden;
  sheet.classList.remove("is-open");
  btn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-more-open");
  if (!wasVisible || prefersReducedMotion()) {
    sheet.hidden = true;
    return;
  }
  moreSheetCloseTimer = setTimeout(() => {
    sheet.hidden = true;
    moreSheetCloseTimer = null;
  }, 340);
}

function setNavActive(root, viewId) {
  const inMore = MOBILE_MORE.includes(viewId);
  root.querySelectorAll(".nav-item[data-nav]").forEach((btn) => {
    const on = btn.dataset.nav === viewId;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-current", on ? "page" : "false");
  });
  const moreBtn = root.querySelector("[data-nav-more]");
  if (moreBtn) {
    moreBtn.classList.toggle("is-active", inMore);
    moreBtn.setAttribute("aria-current", inMore ? "true" : "false");
  }
  root.querySelectorAll(".nav-more-item").forEach((btn) => {
    const on = btn.dataset.nav === viewId;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-current", on ? "page" : "false");
  });
}

function showView(root, viewId, { updateHash = true, scrollTop = true } = {}) {
  const id = HASH_ALIASES[viewId] || "today";
  root.querySelectorAll(".view").forEach((el) => {
    const on = el.dataset.view === id;
    el.hidden = !on;
    el.classList.toggle("is-active", on);
  });
  setNavActive(root, id);
  setMoreSheetOpen(root, false);
  if (updateHash) {
    const next = `#${id}`;
    if (location.hash !== next) {
      history.replaceState(null, "", next);
    }
  }
  if (scrollTop) {
    window.scrollTo(0, 0);
  }
  return id;
}

let navHashHandler = null;
let navEscapeHandler = null;

function bindAppNav(root) {
  const go = (viewId, opts) => showView(root, viewId, opts);

  root.querySelectorAll(".nav-item[data-nav], .nav-more-item[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.nav));
  });
  root.querySelectorAll("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.jump));
  });
  const moreBtn = root.querySelector("[data-nav-more]");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => {
      const expanded = moreBtn.getAttribute("aria-expanded") === "true";
      setMoreSheetOpen(root, !expanded);
    });
  }
  root.querySelectorAll("[data-more-close]").forEach((el) => {
    el.addEventListener("click", () => setMoreSheetOpen(root, false));
  });

  if (navEscapeHandler) window.removeEventListener("keydown", navEscapeHandler);
  navEscapeHandler = (e) => {
    if (e.key === "Escape") setMoreSheetOpen(root, false);
  };
  window.addEventListener("keydown", navEscapeHandler);

  if (navHashHandler) window.removeEventListener("hashchange", navHashHandler);
  navHashHandler = () => {
    const route = parseHashRoute();
    go(route.view, { updateHash: false });
    applyCategoryRoute(route);
  };
  window.addEventListener("hashchange", navHashHandler);

  const initial = parseHashRoute();
  const nested = Boolean(initial.sub || initial.shelf);
  go(initial.view, { updateHash: !nested, scrollTop: false });
  // Category apply happens after section inits in mountUi.
  return { go };
}

function applyCategoryRoute(route) {
  if (!route) return;
  if (route.view === "podcasts") {
    setPodcastCategory(route.sub || "menu", { syncUrl: false });
  }
  if (route.view === "research") {
    setResearchCategory(route.sub || "menu", {
      syncUrl: false,
      shelf: route.shelf || null,
    });
  }
  if (route.view === "letters") {
    setLettersCategory(route.sub || "menu", { syncUrl: false, year: route.letterYear });
  }
  if (route.view === "manbao") {
    setManbaoCategory(route.sub || "menu", { syncUrl: false });
  }
}


/** Pause/resume 「熱門」 ticker on press (CSS :hover / :active also cover pointer). */
function bindMarketMarquee(root) {
  const el = root.querySelector(".index-marquee");
  if (!el || el.dataset.marqueeBound === "1") return;
  el.dataset.marqueeBound = "1";
  const pause = () => el.classList.add("is-paused");
  const resume = () => el.classList.remove("is-paused");
  el.addEventListener("pointerdown", pause);
  el.addEventListener("pointerup", resume);
  el.addEventListener("pointercancel", resume);
  el.addEventListener("pointerleave", resume);
  el.addEventListener("touchstart", pause, { passive: true });
  el.addEventListener("touchend", resume, { passive: true });
  el.addEventListener("touchcancel", resume, { passive: true });
}

function bindTabs(root) {
  const buttons = root.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      buttons.forEach((b) => {
        const on = b.dataset.tab === tab;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      root.querySelectorAll(".panel").forEach((p) => {
        p.classList.toggle("active", p.id === `panel-${tab}`);
      });
    });
  });
}


/** Cached fetch for lang re-render without reload */
let cachedData = null;
let cachedPaper = null;
async function mountUi(app) {
  const data = cachedData;
  const paper = cachedPaper;
  const viewBefore = parseViewFromHash();
  app.innerHTML = renderApp(data, paper);
  document.title = t("siteTitle");
  applyDocumentLang();

  const nav = bindAppNav(app);
  const routeAtMount = parseHashRoute();
  const keepNested = Boolean(routeAtMount.sub || routeAtMount.shelf);
  showView(app, viewBefore, { updateHash: !keepNested, scrollTop: false });
  bindTabs(app);
  bindMarketMarquee(app);
  await initUsMacroStrip("#us-macro-strip");
  await initTwMacroStrip("#tw-macro-strip");
  bindPaperTabs(app);
  if (paper) await initPaperDerivatives(app, paper);
  bindLangSwitcher(app);
  await initStrategies("#xq-root");
  await initResearch("#rl-root", undefined, {
    category: routeAtMount.view === "research" ? routeAtMount.sub || "menu" : "menu",
    shelf: routeAtMount.view === "research" ? routeAtMount.shelf : null,
    syncUrl: false,
  });
  await initOptions("#uo-root");
  await initEarnings("#er-root");
  initLookup("#lk-root");
  await initSoxl("#sx-root");
  await initTxf("#txf-root");
  initPodcasts("#pc-root", {
    category: routeAtMount.view === "podcasts" ? routeAtMount.sub || "menu" : "menu",
    syncUrl: false,
  });
  await initLetters("#lt-root", {
    category: routeAtMount.view === "letters" ? routeAtMount.sub || "menu" : "menu",
    year: routeAtMount.view === "letters" ? routeAtMount.letterYear : undefined,
    syncUrl: false,
  });
  await initManbao("#mb-root", {
    category: routeAtMount.view === "manbao" ? routeAtMount.sub || "menu" : "menu",
    syncUrl: false,
  });
  void nav;
  void startLiveQuotes(app);
}

async function remount() {
  const app = document.getElementById("app");
  if (!app || !cachedData) return;
  stopLiveQuotes();
  await mountUi(app);
}

async function main() {
  const app = document.getElementById("app");
  applyDocumentLang();
  const loading = document.getElementById("loading");
  if (loading) loading.textContent = t("loading");
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cachedData = await res.json();
    cachedPaper = await loadPaperPortfolio();
    await mountUi(app);
    if (!main._langHooked) {
      main._langHooked = true;
      onLangChange(() => {
        void remount();
      });
    }
  } catch (err) {
    app.innerHTML = `<div class="error">${escapeHtml(t("loadError", { msg: err.message }))}</div>`;
  }
}


/** PWA: register service worker (GitHub Pages base path) */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const base = import.meta.env.BASE_URL || "/";
  const swUrl = `${base}sw.js`;
  const SW_RELOAD_KEY = "jml-sw-controller-reload";
  // One-time reload when a new SW takes control so open tabs pick up hashed bundles.
  // sessionStorage guard prevents a reload loop; cleared after the post-reload load.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    try {
      if (sessionStorage.getItem(SW_RELOAD_KEY) === "1") {
        sessionStorage.removeItem(SW_RELOAD_KEY);
        return;
      }
      sessionStorage.setItem(SW_RELOAD_KEY, "1");
    } catch {
      /* private mode — still attempt a single reload */
    }
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(swUrl, { scope: base }).catch(() => {
      /* quiet — SW optional */
    });
  });
}

/** Discreet mobile "Add to Home Screen" hint — not noisy */
const PWA_HINT_KEY = "jml-pwa-hint-dismissed";
function isStandaloneDisplay() {
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if (window.navigator.standalone === true) return true;
  } catch {
    /* ignore */
  }
  return false;
}
function isMobileLike() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}
function maybeShowInstallHint() {
  if (isStandaloneDisplay()) return;
  if (!isMobileLike()) return;
  try {
    if (localStorage.getItem(PWA_HINT_KEY) === "1") return;
  } catch {
    return;
  }
  if (document.getElementById("pwa-install-hint")) return;

  const bar = document.createElement("div");
  bar.id = "pwa-install-hint";
  bar.className = "pwa-install-hint";
  bar.setAttribute("role", "status");
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  const tip = isIOS
    ? "可「分享 → 加入主畫面」離線開啟"
    : "可加入主畫面，離線也能開";
  bar.innerHTML = `<span class="pwa-install-hint__text">${tip}</span><button type="button" class="pwa-install-hint__close" aria-label="關閉">×</button>`;
  document.body.appendChild(bar);
  const dismiss = () => {
    bar.remove();
    try {
      localStorage.setItem(PWA_HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };
  bar.querySelector(".pwa-install-hint__close")?.addEventListener("click", dismiss);
  // Auto-fade after a while so it stays discreet
  window.setTimeout(() => {
    if (bar.isConnected) bar.classList.add("pwa-install-hint--fade");
  }, 8000);
  window.setTimeout(() => {
    if (bar.isConnected) dismiss();
  }, 12000);
}

registerServiceWorker();
main();
window.setTimeout(() => {
  try {
    maybeShowInstallHint();
  } catch {
    /* ignore */
  }
}, 2500);
