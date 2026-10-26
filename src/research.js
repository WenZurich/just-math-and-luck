/**
 * Research library view — books + papers with market filters and strategy badges.
 * Data: public/data/research-library.json (original summaries only).
 */
import { escapeHtml } from "./glossary.js";
import { t, getLang } from "./i18n.js";

const DATA_URL = "./data/research-library.json";
const DEFAULT_BOOK_COVER = "./covers/placeholder-book.svg";
const DEFAULT_PAPER_COVER = "./covers/placeholder-paper.svg";
const DEFAULT_PODCAST_COVER = "./covers/placeholder-podcast.svg";

const STATUS_CLASS = {
  candidate: "rl-status-candidate",
  deferred: "rl-status-deferred",
  adopted: "rl-status-adopted",
  rejected: "rl-status-rejected",
};

const CANDIDATE_CLASS = {
  yes: "rl-cand-yes",
  no: "rl-cand-no",
  watch: "rl-cand-watch",
};

function statusLabel(status) {
  const map = {
    candidate: t("researchStatusCandidate"),
    deferred: t("researchStatusDeferred"),
    adopted: t("researchStatusAdopted"),
    rejected: t("researchStatusRejected"),
  };
  return map[status] || status;
}

function candidateLabel(c) {
  const map = {
    yes: t("researchCandYes"),
    no: t("researchCandNo"),
    watch: t("researchCandWatch"),
  };
  return map[c] || c;
}

function marketLabel(m) {
  if (m === "US") return t("usStock");
  if (m === "TW") return t("twStock");
  if (m === "BOTH") return t("researchMarketBoth");
  return m;
}

function typeLabel(type) {
  if (type === "paper") return t("researchTypePaper");
  if (type === "podcast") return t("researchTypePodcast");
  return t("researchTypeBook");
}

function shelfLabel(shelf, meta = {}) {
  if (!shelf) return t("researchShelfAdjacent");
  const labels = meta?.shelfLabels?.[shelf];
  if (labels && typeof labels === "object") {
    return pickLocalized(labels, shelf);
  }
  const key = {
    core_investing: "researchShelfCoreInvesting",
    value_investing: "researchShelfValueInvesting",
    business_management: "researchShelfBusiness",
    life_partner_wisdom: "researchShelfLifePartner",
    options: "researchShelfOptions",
    recent_reads: "researchShelfRecentReads",
    fi_concepts: "researchShelfFiConcepts",
    money_values: "researchShelfMoneyValues",
    investing_basics: "researchShelfInvestingBasics",
    asset_allocation: "researchShelfAssetAllocation",
    financials: "researchShelfFinancials",
    market_analysis: "researchShelfMarketAnalysis",
    econ_analysis: "researchShelfEconAnalysis",
    psych_randomness: "researchShelfPsych",
    biographies: "researchShelfBiographies",
    adjacent: "researchShelfAdjacent",
  }[shelf];
  return key ? t(key) : shelf;
}

function shelfOrder(meta = {}) {
  const fromMeta = Array.isArray(meta.shelves) ? meta.shelves : null;
  return fromMeta || [
    "core_investing",
    "value_investing",
    "business_management",
    "life_partner_wisdom",
    "options",
    "recent_reads",
    "fi_concepts",
    "money_values",
    "investing_basics",
    "asset_allocation",
    "financials",
    "market_analysis",
    "econ_analysis",
    "psych_randomness",
    "biographies",
    "adjacent",
  ];
}


function pickLocalized(map, fallback) {
  if (!map || typeof map !== "object") return fallback;
  const lang = getLang();
  return map[lang] || map.en || map["zh-Hant"] || fallback;
}

function itemTitle(item) {
  return pickLocalized(item.titleLocalized, item.title) || "";
}

function itemSummary(item) {
  return pickLocalized(item.summaryLocalized, item.summary) || "";
}

function coverSrc(item, meta) {
  if (item.coverUrl) return item.coverUrl;
  if (item.cover) return item.cover;
  if (item.type === "paper") {
    return meta?.defaultCoverPaper || DEFAULT_PAPER_COVER;
  }
  if (item.type === "podcast") {
    return meta?.defaultCoverPodcast || DEFAULT_PODCAST_COVER;
  }
  return meta?.defaultCoverBook || DEFAULT_BOOK_COVER;
}

function coverFallback(item, meta) {
  if (item.coverFallback) return item.coverFallback;
  if (item.type === "paper") {
    return meta?.defaultCoverPaper || DEFAULT_PAPER_COVER;
  }
  if (item.type === "podcast") {
    return meta?.defaultCoverPodcast || DEFAULT_PODCAST_COVER;
  }
  return meta?.defaultCoverBook || DEFAULT_BOOK_COVER;
}

function itemPlainTakeaways(item) {
  const loc = item?.plainTakeawaysLocalized;
  if (loc && typeof loc === "object") {
    const lang = getLang();
    const arr = loc[lang] || loc["zh-Hant"] || loc.en;
    if (Array.isArray(arr) && arr.length) return arr;
  }
  if (Array.isArray(item?.plainTakeaways) && item.plainTakeaways.length) {
    return item.plainTakeaways;
  }
  return [];
}

/** Human-readable takeaways only — never dump raw formulas[] / mathGateNote. */
function takeawayList(item) {
  const bullets = itemPlainTakeaways(item);
  if (!bullets.length) return "";
  return `<div class="rl-block">
    <h4 class="rl-h">${escapeHtml(t("researchTakeaways"))}</h4>
    <ul class="rl-takeaways">${bullets
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("")}</ul>
  </div>`;
}

function sourceLinks(sources) {
  if (!Array.isArray(sources) || !sources.length) return "";
  // Hide internal repo paths (scripts/study/...) from user-facing cards
  const publicSources = sources.filter((s) => /^https?:\/\//i.test(String(s)));
  if (!publicSources.length) return "";
  const links = publicSources
    .map((s) => `<a href="${escapeHtml(s)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s)}</a>`)
    .join(" · ");
  return `<div class="rl-sources"><span class="rl-k">${escapeHtml(t("researchSources"))}</span> ${links}</div>`;
}

function coverBlock(item, meta) {
  const src = coverSrc(item, meta);
  const fb = coverFallback(item, meta);
  const alt = itemTitle(item) || typeLabel(item.type);
  return `
    <div class="rl-cover-wrap">
      <img
        class="rl-cover"
        src="${escapeHtml(src)}"
        alt="${escapeHtml(alt)}"
        loading="lazy"
        decoding="async"
        data-rl-fallback="${escapeHtml(fb)}"
      />
    </div>`;
}

function bindCoverFallbacks(root) {
  root.querySelectorAll("img.rl-cover[data-rl-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      const fb = img.dataset.rlFallback;
      if (fb && img.getAttribute("src") !== fb) {
        img.setAttribute("src", fb);
      } else {
        img.classList.add("is-broken");
      }
    });
  });
}

export function renderResearchCard(item, meta = {}) {
  const status = item.status || "candidate";
  const cand = item.strategyCandidate || "watch";
  const year = item.year != null ? String(item.year) : "—";
  const authors = (item.authors || []).join(", ") || "—";
  return `
    <article class="rl-card" data-rl-id="${escapeHtml(item.id)}" data-rl-market="${escapeHtml(item.market)}" data-rl-type="${escapeHtml(item.type)}" data-rl-shelf="${escapeHtml(item.shelf || "adjacent")}">
      ${coverBlock(item, meta)}
      <div class="rl-card-body">
        <header class="rl-card-head">
          <div class="rl-badges">
            <span class="rl-badge rl-type">${escapeHtml(typeLabel(item.type))}</span>
            <span class="rl-badge rl-shelf">${escapeHtml(shelfLabel(item.shelf, meta))}</span>
            <span class="rl-badge rl-market">${escapeHtml(marketLabel(item.market))}</span>
            <span class="rl-badge ${STATUS_CLASS[status] || ""}">${escapeHtml(statusLabel(status))}</span>
            <span class="rl-badge ${CANDIDATE_CLASS[cand] || ""}" title="${escapeHtml(t("researchStrategy"))}">${escapeHtml(candidateLabel(cand))}</span>
          </div>
          <h3 class="rl-title">${escapeHtml(itemTitle(item))}</h3>
          <p class="rl-meta">${escapeHtml(authors)} · ${escapeHtml(year)}</p>
        </header>
        <p class="rl-summary">${escapeHtml(itemSummary(item))}</p>
        ${takeawayList(item)}
        ${sourceLinks(item.sources)}
      </div>
    </article>`;
}

export function renderResearchSection(placeholder = true) {
  return `
    <section class="section research-section" aria-labelledby="research-heading">
      <header class="view-header view-header-tight">
        <h2 class="view-title" id="research-heading">${escapeHtml(t("researchTitle"))}</h2>
        <p class="view-lead view-lead-tight">${escapeHtml(t("researchLead"))}</p>
      </header>
      <p class="rl-banner" role="note">${escapeHtml(t("researchMathGateBanner"))}</p>
      <div id="rl-root" class="rl-root" data-placeholder="${placeholder ? "1" : "0"}">
        <p class="rl-loading">${escapeHtml(t("loading"))}</p>
      </div>
    </section>`;
}

function filterItems(items, { market, type, shelf, status, candidate }) {
  return items.filter((it) => {
    if (type && type !== "all" && it.type !== type) return false;
    if (shelf && shelf !== "all" && (it.shelf || "adjacent") !== shelf) return false;
    if (status && status !== "all" && (it.status || "candidate") !== status) return false;
    if (candidate && candidate !== "all" && (it.strategyCandidate || "watch") !== candidate) {
      return false;
    }
    if (!market || market === "all") return true;
    if (market === "US") return it.market === "US" || it.market === "BOTH";
    if (market === "TW") return it.market === "TW" || it.market === "BOTH";
    return true;
  });
}

function mathGateBannerText(data) {
  const loc = data?.meta?.mathGateLocalized;
  if (loc && typeof loc === "object") {
    return pickLocalized(loc, data?.meta?.mathGate) || t("researchMathGateBanner");
  }
  return data?.meta?.mathGate || t("researchMathGateBanner");
}

/** Category menu entries — only real data dimensions. */
export const RESEARCH_MENU = [
  { id: "book", titleKey: "researchCatBooks", type: "book" },
  { id: "paper", titleKey: "researchCatPapers", type: "paper" },
  { id: "podcast", titleKey: "researchCatPodcasts", type: "podcast" },
  { id: "us", titleKey: "researchCatUs", market: "US" },
  { id: "tw", titleKey: "researchCatTw", market: "TW" },
  { id: "candidate", titleKey: "researchCatCandidate", status: "candidate" },
  { id: "watch", titleKey: "researchCatWatch", candidate: "watch" },
];

const RESEARCH_CAT_ALIASES = {
  menu: "menu",
  all: "menu",
  index: "menu",
  book: "book",
  books: "book",
  paper: "paper",
  papers: "paper",
  podcast: "podcast",
  podcasts: "podcast",
  us: "us",
  tw: "tw",
  candidate: "candidate",
  watch: "watch",
  watching: "watch",
};

let researchRootEl = null;
let researchDataCache = null;
let researchState = {
  category: "menu",
  market: "all",
  type: "all",
  shelf: "all",
  status: "all",
  candidate: "all",
};

export function normalizeResearchCategory(raw) {
  if (raw == null || raw === "") return "menu";
  const s = String(raw).trim();
  const lower = s.toLowerCase();
  if (RESEARCH_CAT_ALIASES[lower]) return RESEARCH_CAT_ALIASES[lower];
  if (RESEARCH_MENU.some((c) => c.id === lower)) return lower;
  return "menu";
}

function applyCategoryToState(state, catId) {
  const cat = RESEARCH_MENU.find((c) => c.id === catId);
  state.category = !cat ? "menu" : catId;
  state.market = "all";
  state.type = "all";
  state.shelf = "all";
  state.status = "all";
  state.candidate = "all";
  if (!cat) return state;
  if (cat.type) state.type = cat.type;
  if (cat.market) state.market = cat.market;
  if (cat.status) state.status = cat.status;
  if (cat.candidate) state.candidate = cat.candidate;
  return state;
}

function countForMenuItem(items, cat) {
  return filterItems(items, {
    market: cat.market || "all",
    type: cat.type || "all",
    shelf: "all",
    status: cat.status || "all",
    candidate: cat.candidate || "all",
  }).length;
}

function researchHash(state) {
  if (!state || state.category === "menu") return "#research";
  if (state.shelf && state.shelf !== "all") return `#research/shelf/${encodeURIComponent(state.shelf)}`;
  return `#research/${state.category}`;
}

function syncResearchHash(state) {
  const next = researchHash(state);
  if (location.hash !== next) history.replaceState(null, "", next);
}

function categoryTabsHtml(state) {
  const items = [
    { id: "menu", label: t("researchCatMenu") },
    ...RESEARCH_MENU.map((c) => ({ id: c.id, label: t(c.titleKey) })),
  ];
  return items
    .map((it) => {
      const on = it.id === state.category ? " is-active" : "";
      return `<button type="button" class="rl-tab${on}" data-rl-cat="${escapeHtml(it.id)}" role="tab" aria-selected="${it.id === state.category}">${escapeHtml(it.label)}</button>`;
    })
    .join("");
}

function categoryMenuHtml(items) {
  const cards = RESEARCH_MENU.map((c) => {
    const n = countForMenuItem(items, c);
    return `
      <button type="button" class="rl-menu-card" data-rl-cat="${escapeHtml(c.id)}" aria-label="${escapeHtml(t(c.titleKey))}">
        <h3 class="rl-menu-title">${escapeHtml(t(c.titleKey))}</h3>
        <p class="rl-menu-count">${n}</p>
        <span class="rl-menu-cta">${escapeHtml(t("researchOpenCategory"))}</span>
      </button>`;
  }).join("");
  return `
    <div class="rl-menu" role="group" aria-label="${escapeHtml(t("researchCategories"))}">
      <p class="rl-menu-lead">${escapeHtml(t("researchMenuLead"))}</p>
      <div class="rl-menu-grid">${cards}</div>
    </div>`;
}

function paint(root, data, state, { syncUrl = true } = {}) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const meta = data?.meta || {};
  const order = shelfOrder(meta);
  if (syncUrl) syncResearchHash(state);

  if (state.category === "menu") {
    root.innerHTML = `
      <div class="rl-tabs-wrap">
        <div class="rl-tabs" role="tablist" aria-label="${escapeHtml(t("researchCategories"))}">
          ${categoryTabsHtml(state)}
        </div>
      </div>
      ${categoryMenuHtml(items)}`;
    bindResearchChrome(root, data, state);
    return;
  }

  const filtered = filterItems(items, state);
  const books = filtered.filter((i) => i.type === "book");
  const papers = filtered.filter((i) => i.type === "paper");
  const podcasts = filtered.filter((i) => i.type === "podcast");
  const metaNote = meta.mathGate
    ? `<p class="rl-meta-line">${escapeHtml(mathGateBannerText(data))}</p>`
    : "";

  const shelfChips = [
    `<button type="button" class="rl-filter rl-shelf-chip${state.shelf === "all" ? " is-active" : ""}" data-rl-shelf="all">${escapeHtml(t("researchFilterAll"))}</button>`,
    ...order.map((s) => {
      const count = filterItems(items, { ...state, shelf: s }).length;
      if (!count) return "";
      return `<button type="button" class="rl-filter rl-shelf-chip${state.shelf === s ? " is-active" : ""}" data-rl-shelf="${escapeHtml(s)}">${escapeHtml(shelfLabel(s, meta))} <span class="rl-chip-count">${count}</span></button>`;
    }),
  ].join("");

  const statusChips = [
    ["all", t("researchFilterAll")],
    ["candidate", t("researchStatusCandidate")],
    ["deferred", t("researchStatusDeferred")],
    ["adopted", t("researchStatusAdopted")],
    ["rejected", t("researchStatusRejected")],
  ]
    .map(([id, label]) => {
      const count = filterItems(items, { ...state, status: id === "all" ? "all" : id }).length;
      if (id !== "all" && !items.some((it) => (it.status || "candidate") === id)) return "";
      return `<button type="button" class="rl-filter${state.status === id ? " is-active" : ""}" data-rl-status="${id}">${escapeHtml(label)}${id === "all" ? "" : ` <span class="rl-chip-count">${count}</span>`}</button>`;
    })
    .join("");

  function renderGrouped(list) {
    if (!list.length) return `<p class="rl-empty">${escapeHtml(t("researchEmpty"))}</p>`;
    if (state.shelf && state.shelf !== "all") {
      return `<div class="rl-grid">${list.map((b) => renderResearchCard(b, meta)).join("")}</div>`;
    }
    const shelvesInList = order.filter((s) => list.some((it) => (it.shelf || "adjacent") === s));
    if (!shelvesInList.length) {
      return `<div class="rl-grid">${list.map((b) => renderResearchCard(b, meta)).join("")}</div>`;
    }
    return shelvesInList
      .map((s) => {
        const group = list.filter((it) => (it.shelf || "adjacent") === s);
        return `<section class="rl-shelf-group" data-shelf="${escapeHtml(s)}" aria-label="${escapeHtml(shelfLabel(s, meta))}">
          <h4 class="rl-shelf-title">${escapeHtml(shelfLabel(s, meta))} <span class="rl-list-count">(${group.length})</span></h4>
          <div class="rl-grid">${group.map((b) => renderResearchCard(b, meta)).join("")}</div>
        </section>`;
      })
      .join("");
  }

  const showBooks = state.type === "all" || state.type === "book";
  const showPapers = state.type === "all" || state.type === "paper";
  const showPodcasts = state.type === "all" || state.type === "podcast";

  const lists = [];
  if (showBooks) {
    lists.push(`<section class="rl-list" aria-label="${escapeHtml(t("researchTypeBook"))}">
        <h3 class="rl-list-title">${escapeHtml(t("researchTypeBook"))} <span class="rl-list-count">(${books.length})</span></h3>
        ${renderGrouped(books)}
      </section>`);
  }
  if (showPapers) {
    lists.push(`<section class="rl-list" aria-label="${escapeHtml(t("researchTypePaper"))}">
        <h3 class="rl-list-title">${escapeHtml(t("researchTypePaper"))} <span class="rl-list-count">(${papers.length})</span></h3>
        <div class="rl-grid">
          ${papers.length ? papers.map((p) => renderResearchCard(p, meta)).join("") : `<p class="rl-empty">${escapeHtml(t("researchEmpty"))}</p>`}
        </div>
      </section>`);
  }
  if (showPodcasts) {
    lists.push(`<section class="rl-list" aria-label="${escapeHtml(t("researchTypePodcast"))}">
        <h3 class="rl-list-title">${escapeHtml(t("researchTypePodcast"))} <span class="rl-list-count">(${podcasts.length})</span></h3>
        <div class="rl-grid">
          ${podcasts.length ? podcasts.map((p) => renderResearchCard(p, meta)).join("") : `<p class="rl-empty">${escapeHtml(t("researchEmpty"))}</p>`}
        </div>
      </section>`);
  }

  const marketToolbar =
    state.category === "us" || state.category === "tw"
      ? ""
      : `<div class="rl-filter-group" role="group" aria-label="${escapeHtml(t("market"))}">
        <button type="button" class="rl-filter${state.market === "all" ? " is-active" : ""}" data-rl-market="all">${escapeHtml(t("researchFilterAll"))}</button>
        <button type="button" class="rl-filter${state.market === "US" ? " is-active" : ""}" data-rl-market="US">${escapeHtml(t("usStock"))}</button>
        <button type="button" class="rl-filter${state.market === "TW" ? " is-active" : ""}" data-rl-market="TW">${escapeHtml(t("twStock"))}</button>
      </div>`;

  // Hide status chip row when already drilled into status/candidate categories
  const statusToolbar =
    state.category === "candidate" || state.category === "watch"
      ? ""
      : `<div class="rl-filter-group" role="group" aria-label="${escapeHtml(t("researchStatusFilters"))}">
        ${statusChips}
      </div>`;

  root.innerHTML = `
    <div class="rl-tabs-wrap">
      <div class="rl-tabs" role="tablist" aria-label="${escapeHtml(t("researchCategories"))}">
        ${categoryTabsHtml(state)}
      </div>
    </div>
    <div class="rl-toolbar" role="toolbar" aria-label="${escapeHtml(t("researchFilters"))}">
      ${marketToolbar}
      ${statusToolbar}
    </div>
    <div class="rl-shelf-scroll" role="group" aria-label="${escapeHtml(t("researchShelfFilters"))}">
      ${shelfChips}
    </div>
    ${metaNote}
    <p class="rl-counts">${escapeHtml(t("researchCounts", { books: books.length, papers: papers.length, podcasts: podcasts.length, total: filtered.length }))}</p>
    <div class="rl-lists">
      ${lists.join("")}
    </div>`;

  bindCoverFallbacks(root);
  bindResearchChrome(root, data, state);
}

function bindResearchChrome(root, data, state) {
  root.querySelectorAll("[data-rl-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyCategoryToState(state, btn.dataset.rlCat);
      paint(root, data, state, { syncUrl: true });
    });
  });
  root.querySelectorAll("[data-rl-market]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.market = btn.dataset.rlMarket;
      paint(root, data, state, { syncUrl: false });
    });
  });
  root.querySelectorAll("[data-rl-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.status = btn.dataset.rlStatus;
      paint(root, data, state, { syncUrl: false });
    });
  });
  root.querySelectorAll("[data-rl-shelf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.shelf = btn.dataset.rlShelf;
      syncResearchHash(state);
      paint(root, data, state, { syncUrl: false });
    });
  });
}

export async function loadResearchLibrary(url = DATA_URL) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function setResearchCategory(raw, { syncUrl = true, shelf = null } = {}) {
  if (!researchRootEl || !researchDataCache) return { ok: false, reason: "not-ready" };
  applyCategoryToState(researchState, normalizeResearchCategory(raw));
  if (shelf) researchState.shelf = shelf;
  paint(researchRootEl, researchDataCache, researchState, { syncUrl });
  return { ok: true, category: researchState.category, state: { ...researchState } };
}

export function getResearchCategory() {
  return researchState.category;
}

export async function initResearch(selector = "#rl-root", url = DATA_URL, opts = {}) {
  const root = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!root) return { ok: false, reason: "missing-root" };
  researchRootEl = root;
  try {
    const data = await loadResearchLibrary(url);
    researchDataCache = data;
    researchState = {
      category: "menu",
      market: "all",
      type: "all",
      shelf: "all",
      status: "all",
      candidate: "all",
    };
    applyCategoryToState(researchState, normalizeResearchCategory(opts.category ?? "menu"));
    if (opts.shelf) researchState.shelf = opts.shelf;
    paint(root, data, researchState, { syncUrl: opts.syncUrl !== false });
    return { ok: true, data };
  } catch (err) {
    root.innerHTML = `<p class="rl-error">${escapeHtml(t("researchLoadError", { msg: err.message }))}</p>`;
    return { ok: false, error: err };
  }
}
