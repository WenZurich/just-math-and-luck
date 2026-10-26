/**
 * 曼報 / 曼報 Pro — public summaries and member-only index links.
 * Never stores paid article bodies.
 */
import { escapeHtml } from "./glossary.js";
import { t } from "./i18n.js";

const DATA_URL = "./data/manbao.json";

const CATS = [
  { id: "about", labelKey: "manbaoCatAbout" },
  { id: "public", labelKey: "manbaoCatPublic" },
  { id: "decode", labelKey: "manbaoCatDecode" },
  { id: "tech", labelKey: "manbaoCatTech" },
  { id: "giants", labelKey: "manbaoCatGiants" },
  { id: "club", labelKey: "manbaoCatClub" },
];

const CAT_ALIASES = {
  menu: "menu",
  about: "about",
  public: "public",
  essay: "public",
  decode: "decode",
  tech: "tech",
  giants: "giants",
  club: "club",
};

let data = null;
let active = "menu";
let rootEl = null;

export function normalizeManbaoCategory(raw) {
  if (raw == null || raw === "") return "menu";
  const s = String(raw).trim();
  const key = s.toLowerCase();
  if (CAT_ALIASES[key]) return CAT_ALIASES[key];
  return "menu";
}

function hashFor(catId) {
  if (!catId || catId === "menu") return "#manbao";
  return `#manbao/${catId}`;
}

export function setManbaoCategory(catId, { syncUrl = true } = {}) {
  active = normalizeManbaoCategory(catId);
  if (syncUrl) {
    const next = hashFor(active);
    if (location.hash !== next) history.replaceState(null, "", next);
  }
  paint();
}

function menuHtml() {
  const counts = { about: 4, public: data?.essays?.length || 0 };
  for (const p of data?.posts || []) {
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  const cards = CATS.map((c) => {
    const n = counts[c.id] || 0;
    return `
      <button type="button" class="pc-menu-card" data-manbao-cat="${c.id}">
        <span class="pc-menu-title">${escapeHtml(t(c.labelKey))}</span>
        <span class="pc-menu-blurb">${n}</span>
        <span class="pc-menu-cta">${escapeHtml(t("manbaoOpen"))}</span>
      </button>`;
  }).join("");
  return `
    <div class="pc-menu" role="group">
      <p class="pc-menu-lead">${escapeHtml(t("manbaoMenuLead"))}</p>
      <p class="lt-note">${escapeHtml(data?.indexNote || "")}</p>
      <div class="pc-menu-grid">${cards}</div>
    </div>`;
}

function aboutHtml() {
  const links = [
    [data.officialSite, "manny-li.com"],
    [data.essayIndex, "essay"],
    [data.proHome, "pro.manny-li.com"],
    [data.proJoin, "join"],
    [data.proPosts, "posts"],
  ];
  return `
    <button type="button" class="lt-back" data-manbao-cat="menu">${escapeHtml(t("manbaoBack"))}</button>
    <h3 class="lt-cat-title">${escapeHtml(t("manbaoCatAbout"))}</h3>
    <div class="pc-list">
      ${links
        .map(
          ([url, label]) => `
        <article class="pc-card">
          <header class="pc-card-head">
            <h3 class="pc-card-title">${escapeHtml(label)}</h3>
          </header>
          <div class="lt-body">
            <a class="lt-official" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("manbaoOpen"))}</a>
          </div>
        </article>`
        )
        .join("")}
    </div>`;
}

function publicHtml() {
  const items = data.essays || [];
  return `
    <button type="button" class="lt-back" data-manbao-cat="menu">${escapeHtml(t("manbaoBack"))}</button>
    <h3 class="lt-cat-title">${escapeHtml(t("manbaoCatPublic"))}</h3>
    <div class="pc-list">
      ${items
        .map(
          (item) => `
        <article class="pc-card">
          <header class="pc-card-head">
            <div class="pc-card-identity">
              <span class="pc-card-badge pc-badge-featured">${escapeHtml(t("manbaoPublicBadge"))}</span>
            </div>
            <h3 class="pc-card-title">${escapeHtml(item.title)}</h3>
            <p class="pc-card-handle">${escapeHtml(item.date)}</p>
          </header>
          <div class="lt-body">
            <ul class="lt-points">${item.summary.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
            <a class="lt-official" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("manbaoOpen"))}</a>
          </div>
        </article>`
        )
        .join("")}
    </div>`;
}

function postsHtml() {
  const cat = CATS.find((c) => c.id === active);
  const items = (data.posts || []).filter((p) => p.category === active);
  const byYear = new Map();
  for (const item of items) {
    const y = (item.date || "").slice(0, 4) || "—";
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(item);
  }
  const years = [...byYear.keys()];
  const blocks = years
    .map((y) => {
      const rows = byYear
        .get(y)
        .map(
          (item) => `
        <li class="lt-pro-row">
          <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>
          <span class="lt-pro-meta">${escapeHtml(item.date)} · ${escapeHtml(t("manbaoPaywallBadge"))}</span>
        </li>`
        )
        .join("");
      return `<section class="lt-year"><h4>${escapeHtml(y)}</h4><ul class="lt-pro-list">${rows}</ul></section>`;
    })
    .join("");
  return `
    <button type="button" class="lt-back" data-manbao-cat="menu">${escapeHtml(t("manbaoBack"))}</button>
    <h3 class="lt-cat-title">${escapeHtml(t(cat?.labelKey || "manbaoTitle"))}</h3>
    <p class="lt-note">${escapeHtml(t("manbaoPaywallBadge"))} · ${items.length}</p>
    ${blocks}`;
}

function paint() {
  const host = rootEl?.querySelector("#mb-host");
  if (!host || !data) return;
  let html = menuHtml();
  if (active === "about") html = aboutHtml();
  else if (active === "public") html = publicHtml();
  else if (active !== "menu") html = postsHtml();
  host.innerHTML = html;
  host.querySelectorAll("[data-manbao-cat]").forEach((btn) => {
    btn.addEventListener("click", () => setManbaoCategory(btn.dataset.manbaoCat));
  });
}

export function renderManbaoSection() {
  return `
    <section class="section manbao-section" aria-label="${escapeHtml(t("manbaoTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${escapeHtml(t("manbaoTitle"))}</h2>
        <p class="view-lead">${escapeHtml(t("manbaoLead"))}</p>
      </header>
      <p class="pc-disclaimer" role="note">${escapeHtml(t("manbaoDisclaimer"))}</p>
      <div id="mb-root"><div id="mb-host"></div></div>
    </section>`;
}

export async function initManbao(selector, { category = "menu", syncUrl = false } = {}) {
  rootEl = document.querySelector(selector);
  if (!rootEl) return;
  if (!data) {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`manbao HTTP ${res.status}`);
    data = await res.json();
  }
  active = normalizeManbaoCategory(category);
  if (syncUrl) {
    const next = hashFor(active);
    if (location.hash !== next) history.replaceState(null, "", next);
  }
  paint();
}
