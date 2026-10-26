/**
 * Berkshire shareholder letters — official links plus short notes.
 * Never stores letter text.
 *
 * Framing check (2026-10-03): berkshirehathaway.com sends
 * X-Frame-Options: SAMEORIGIN on both HTML (1977.html) and the 2024 PDF
 * (2024ltr.pdf). A cross-origin iframe from this site is blocked, so the
 * reader does not embed or copy the letter. It opens the official URL.
 */
import { escapeHtml } from "./glossary.js";
import { t } from "./i18n.js";

const DATA_URL = "./data/berkshire-letters.json";

const CATS = [
  { id: "early", labelKey: "lettersCatEarly" },
  { id: "nineties", labelKey: "lettersCat90" },
  { id: "twothousands", labelKey: "lettersCat00" },
  { id: "tens", labelKey: "lettersCat10" },
  { id: "recent", labelKey: "lettersCat20" },
  { id: "special", labelKey: "lettersCatSpecial" },
];

const CAT_ALIASES = {
  menu: "menu",
  early: "early",
  "1977": "early",
  nineties: "nineties",
  "1990s": "nineties",
  twothousands: "twothousands",
  "2000s": "twothousands",
  tens: "tens",
  "2010s": "tens",
  recent: "recent",
  "2020s": "recent",
  special: "special",
};

let data = null;
let active = "menu";
let activeYear = null;
let rootEl = null;

export function normalizeLettersCategory(raw) {
  if (raw == null || raw === "") return "menu";
  const s = String(raw).trim();
  const key = s.toLowerCase();
  if (CAT_ALIASES[key]) return CAT_ALIASES[key];
  if (/^\d{4}$/.test(key)) {
    const y = Number(key);
    if (y >= 1977 && y <= 1989) return "early";
    if (y >= 1990 && y <= 1999) return "nineties";
    if (y >= 2000 && y <= 2009) return "twothousands";
    if (y >= 2010 && y <= 2019) return "tens";
    if (y >= 2020 && y <= 2025) return "recent";
  }
  return "menu";
}

function hashFor(catId, year) {
  if (year === "special") return "#letters/special";
  if (year && /^\d{4}$/.test(String(year))) return `#letters/${year}`;
  if (!catId || catId === "menu") return "#letters";
  return `#letters/${catId}`;
}

function lettersIn(catId) {
  return (data?.letters || []).filter((x) => x.category === catId);
}

function latestYearIn(catId) {
  const items = lettersIn(catId).filter((x) => x.access !== "link-only");
  const latest = items.reduce((best, x) => (!best || x.year > best.year ? x : best), null);
  return latest ? String(latest.year) : null;
}

function findLetter(year) {
  if (year === "special") {
    return (data?.letters || []).find((x) => x.access === "link-only") || null;
  }
  if (year == null || !/^\d{4}$/.test(String(year))) return null;
  const y = Number(year);
  return (data?.letters || []).find((x) => x.year === y && x.access !== "link-only") || null;
}

export function setLettersCategory(catId, { syncUrl = true, year } = {}) {
  const raw = catId == null || catId === "" ? "menu" : String(catId).trim();
  const yearFromCat = /^\d{4}$/.test(raw) ? raw : null;
  const specialFromCat = raw.toLowerCase() === "special";
  const chosen = year != null && year !== "" ? String(year) : yearFromCat;

  if (chosen === "special" || (specialFromCat && !yearFromCat && chosen == null)) {
    active = "special";
    activeYear = "special";
  } else if (chosen && /^\d{4}$/.test(chosen)) {
    active = normalizeLettersCategory(chosen);
    activeYear = chosen;
  } else {
    active = normalizeLettersCategory(raw);
    if (active === "menu") activeYear = null;
    else if (active === "special") activeYear = "special";
    else activeYear = latestYearIn(active);
  }

  if (syncUrl) {
    const next = hashFor(active, activeYear);
    if (location.hash !== next) history.replaceState(null, "", next);
  }
  paint();
}

function itemTitle(item) {
  if (item.title) return item.title;
  return String(item.year);
}

function yearRail(items) {
  const years = items.filter((x) => x.access !== "link-only");
  if (years.length < 2) return "";
  const chips = years
    .slice()
    .sort((a, b) => b.year - a.year)
    .map((item) => {
      const on = String(item.year) === String(activeYear);
      return `<button type="button" class="lt-year-chip${on ? " is-on" : ""}" data-letter-year="${item.year}" aria-pressed="${on ? "true" : "false"}">${item.year}</button>`;
    })
    .join("");
  return `
    <div class="lt-year-rail" role="group" aria-label="${escapeHtml(t("lettersYearRail"))}">
      ${chips}
    </div>`;
}

function readerHtml(item) {
  if (!item) {
    return `<p class="lt-note">${escapeHtml(t("lettersMissing"))}</p>`;
  }
  const read = item.access === "read";
  const badge = read ? t("lettersReadBadge") : t("lettersLinkBadge");
  const badgeClass = read ? "pc-badge-featured" : "pc-badge-stub";
  const bullets = read
    ? `<ul class="lt-points">${item.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
    : `<p class="lt-linkonly">${escapeHtml(t("lettersLinkOnlyNote"))}</p>`;
  const pdf = String(item.url || "").toLowerCase().endsWith(".pdf");
  const openLabel = pdf ? t("lettersReaderOpenPdf") : t("lettersReaderOpen");
  const domId = item.access === "link-only" ? `letter-${item.year}-special` : `letter-${item.year}`;
  return `
    <article class="lt-reader" id="${domId}">
      <header class="lt-reader-head">
        <span class="pc-card-badge ${badgeClass}">${escapeHtml(badge)}</span>
        <h3 class="lt-reader-title">${escapeHtml(itemTitle(item))}</h3>
        <p class="lt-reader-by">${escapeHtml(t("lettersAuthor"))}：${escapeHtml(item.author)}</p>
      </header>
      ${bullets}
      <div class="lt-reader-stage" role="region" aria-label="${escapeHtml(t("lettersReaderRegion"))}">
        <p class="lt-reader-note">${escapeHtml(t("lettersReaderNote"))}</p>
        <a class="lt-reader-open" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(openLabel)}</a>
        <p class="lt-reader-src">${escapeHtml(t("lettersOfficialHost"))}</p>
      </div>
    </article>`;
}

function menuHtml() {
  const counts = {};
  for (const item of data?.letters || []) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }
  const cards = CATS.map((c) => {
    const n = counts[c.id] || 0;
    return `
      <button type="button" class="pc-menu-card" data-letter-cat="${c.id}">
        <span class="pc-menu-title">${escapeHtml(t(c.labelKey))}</span>
        <span class="pc-menu-blurb">${n}</span>
        <span class="pc-menu-cta">${escapeHtml(t("lettersOpen"))}</span>
      </button>`;
  }).join("");
  return `
    <div class="pc-menu" role="group">
      <p class="pc-menu-lead">${escapeHtml(t("lettersMenuLead"))}</p>
      <div class="pc-menu-grid">${cards}</div>
    </div>`;
}

function detailHtml() {
  const items = lettersIn(active);
  const cat = CATS.find((c) => c.id === active);
  const item = findLetter(activeYear);
  return `
    <button type="button" class="lt-back" data-letter-cat="menu">${escapeHtml(t("lettersBack"))}</button>
    <h3 class="lt-cat-title">${escapeHtml(t(cat?.labelKey || "lettersTitle"))}</h3>
    ${yearRail(items)}
    ${readerHtml(item)}`;
}

function paint() {
  const host = rootEl?.querySelector("#lt-host");
  if (!host || !data) return;
  host.innerHTML = active === "menu" ? menuHtml() : detailHtml();
  host.querySelectorAll("[data-letter-cat]").forEach((btn) => {
    btn.addEventListener("click", () => setLettersCategory(btn.dataset.letterCat));
  });
  host.querySelectorAll("[data-letter-year]").forEach((btn) => {
    btn.addEventListener("click", () => setLettersCategory(btn.dataset.letterYear));
  });
}

export function renderLettersSection() {
  return `
    <section class="section letters-section" aria-label="${escapeHtml(t("lettersTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${escapeHtml(t("lettersTitle"))}</h2>
        <p class="view-lead">${escapeHtml(t("lettersLead"))}</p>
      </header>
      <p class="pc-disclaimer" role="note">${escapeHtml(t("lettersDisclaimer"))}</p>
      <div id="lt-root"><div id="lt-host"></div></div>
    </section>`;
}

export async function initLetters(selector, { category = "menu", year, syncUrl = false } = {}) {
  rootEl = document.querySelector(selector);
  if (!rootEl) return;
  if (!data) {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`letters HTTP ${res.status}`);
    data = await res.json();
  }
  setLettersCategory(category, { syncUrl, year });
}
