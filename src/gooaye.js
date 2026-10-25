/**
 * Gooaye（股癌）episode library.
 * Listened episodes: stockAnalysis from audio→STT review.
 * Others: RSS show-note teasers only (notesQuality !== "listened").
 * Candidate / watch; math gate CLOSED. Not investment advice.
 */
import { escapeHtml } from "./glossary.js";
import { t } from "./i18n.js";

const DATA_URL = "./data/gooaye-episodes.json";
const PAGE_SIZE = 25;
const GOOAYE_RESEARCH_HASH = "#research/podcast";
const GOOAYE_APPLE =
  "https://podcasts.apple.com/tw/podcast/gooaye-%E8%82%A1%E7%99%8C/id1500839292";

let cache = null;
let loadPromise = null;
let visibleCount = PAGE_SIZE;
let filterQuery = "";

async function loadData() {
  if (cache) return cache;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const res = await fetch(DATA_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cache = await res.json();
    return cache;
  })().catch((err) => {
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}

function formatAsOf(asOf) {
  if (!asOf) return "";
  try {
    const d = new Date(asOf);
    if (Number.isNaN(d.getTime())) return asOf;
    return new Intl.DateTimeFormat(undefined, {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return asOf;
  }
}

function isListened(ep) {
  return ep?.notesQuality === "listened" && Array.isArray(ep.stockAnalysis) && ep.stockAnalysis.length > 0;
}

function filteredEpisodes(data) {
  const list = data?.episodes || [];
  const q = filterQuery.trim().toLowerCase();
  if (!q) return list;
  return list.filter((ep) => {
    const hay = [
      ep.title,
      ep.subtitle,
      ep.ep != null ? `ep${ep.ep}` : "",
      ep.ep != null ? String(ep.ep) : "",
      ...(ep.stockAnalysis || []),
      ...(ep.keyPoints || []),
      ...(ep.rssTeaser || []),
    ]
      .filter(Boolean)
      .join("\n")
      .toLowerCase();
    return hay.includes(q);
  });
}

function episodeCard(ep) {
  const listened = isListened(ep);
  const num =
    ep.ep != null
      ? `<span class="gy-ep-num">EP${escapeHtml(String(ep.ep))}</span>`
      : "";
  const date = ep.pubDateTw
    ? `<time class="gy-ep-date" datetime="${escapeHtml(ep.pubDateIso || ep.pubDateTw)}">${escapeHtml(ep.pubDateTw)}</time>`
    : "";
  const badge = listened
    ? `<span class="gy-ep-badge gy-ep-badge-listened">${escapeHtml(t("gooayeBadgeListened"))}</span>`
    : `<span class="gy-ep-badge gy-ep-badge-rss">${escapeHtml(t("gooayeBadgeRssOnly"))}</span>`;
  const titleText = ep.title || (ep.ep != null ? `EP${ep.ep}` : t("gooayeUntitled"));

  let body = "";
  if (listened) {
    const stock = (ep.stockAnalysis || []).filter(Boolean);
    body += `<p class="gy-ep-kicker gy-ep-kicker-stock">${escapeHtml(t("gooayeStockAnalysis"))}</p>`;
    body += `<ul class="gy-ep-points gy-ep-stock">${stock
      .map((p) => `<li>${escapeHtml(p)}</li>`)
      .join("")}</ul>`;
    const teaser = (ep.rssTeaser || ep.keyPoints || []).filter(Boolean);
    if (teaser.length) {
      body += `<details class="gy-ep-rss-details"><summary>${escapeHtml(t("gooayeRssTeaserToggle"))}</summary>`;
      body += `<ul class="gy-ep-points gy-ep-rss">${teaser
        .map((p) => `<li>${escapeHtml(p)}</li>`)
        .join("")}</ul></details>`;
    }
    if (ep.listenedAt || ep.transcriptSource) {
      const bits = [];
      if (ep.listenedAt) bits.push(t("gooayeListenedAt", { date: String(ep.listenedAt).slice(0, 16).replace("T", " ") }));
      if (ep.transcriptSource) bits.push(String(ep.transcriptSource));
      body += `<p class="gy-ep-source-note">${escapeHtml(bits.join(" · "))}</p>`;
    }
  } else {
    const points = (ep.keyPoints || []).filter(Boolean);
    // Teaser-only notes are just the host's one-line hook — don't dress it up as 重點整理.
    const hookOnly = ep.notesQuality === "teaser" && points.length > 0 && points.length <= 2;
    body += `<p class="gy-ep-kicker">${escapeHtml(t(hookOnly ? "gooayeTeaserKicker" : "gooayeKeyPoints"))}</p>`;
    if (points.length) {
      body += `<ul class="gy-ep-points">${points
        .map((p) => `<li>${escapeHtml(p)}</li>`)
        .join("")}</ul>`;
    } else {
      body += `<p class="gy-ep-empty">${escapeHtml(t("gooayeNotesThin"))}</p>`;
    }
    const thinNote =
      ep.notesQuality === "teaser" || ep.notesQuality === "title-only" || !points.length
        ? `<p class="gy-ep-source-note">${escapeHtml(t("gooayeTeaserNote"))}</p>`
        : `<p class="gy-ep-source-note">${escapeHtml(t("gooayeRssOnlyNote"))}</p>`;
    body += thinNote;
  }

  const link = ep.link
    ? `<a class="gy-ep-link" href="${escapeHtml(ep.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("gooayeListen"))}</a>`
    : "";

  return `
    <article class="gy-ep${listened ? " gy-ep-listened" : " gy-ep-rss-only"}" data-ep="${escapeHtml(String(ep.ep ?? ""))}" data-quality="${escapeHtml(listened ? "listened" : "rss-only")}">
      <header class="gy-ep-head">
        <div class="gy-ep-meta">${num}${badge}${date}</div>
        <h4 class="gy-ep-title">${escapeHtml(titleText)}</h4>
      </header>
      <div class="gy-ep-body">
        ${body}
        <div class="gy-ep-actions">${link}</div>
      </div>
    </article>`;
}

function paint(root, data, { error } = {}) {
  if (error) {
    root.innerHTML = `
      <div class="gy-error" role="alert">
        <p>${escapeHtml(t("gooayeLoadError", { msg: String(error.message || error) }))}</p>
        <a class="pc-link pc-link-ext" href="${GOOAYE_APPLE}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("podcastsGooayeApple"))}</a>
      </div>`;
    return;
  }

  const all = filteredEpisodes(data);
  const totalAll = (data.episodes || []).length;
  const slice = all.slice(0, visibleCount);
  const remaining = Math.max(0, all.length - slice.length);
  const asOf = formatAsOf(data.asOf);
  const counts = data.counts || {};

  root.innerHTML = `
    <div class="gy-toolbar">
      <div class="gy-toolbar-stats" aria-live="polite">
        <span class="gy-stat">${escapeHtml(t("gooayeEpisodeCount", { n: String(totalAll) }))}</span>
        ${
          counts.listened
            ? `<span class="gy-stat gy-stat-listened">${escapeHtml(t("gooayeListenedCount", { n: String(counts.listened) }))}</span>`
            : ""
        }
        ${asOf ? `<span class="gy-asof">${escapeHtml(t("gooayeAsOf", { date: asOf }))}</span>` : ""}
        ${
          counts.notesEmpty
            ? `<span class="gy-stat-muted">${escapeHtml(t("gooayeEmptyCount", { n: String(counts.notesEmpty) }))}</span>`
            : ""
        }
      </div>
      <label class="gy-search">
        <span class="gy-search-label">${escapeHtml(t("gooayeSearchLabel"))}</span>
        <input type="search" class="gy-search-input" data-gy-search
          placeholder="${escapeHtml(t("gooayeSearchPlaceholder"))}"
          value="${escapeHtml(filterQuery)}" autocomplete="off" />
      </label>
    </div>

    <p class="gy-source-line">
      ${escapeHtml(t("gooayeSourceLine"))}
      <a class="pc-link pc-link-ext" href="${escapeHtml(data.show?.feedUrl || "")}" target="_blank" rel="noopener noreferrer">SoundOn RSS</a>
      ·
      <a class="pc-link pc-link-ext" href="${GOOAYE_APPLE}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("podcastsGooayeApple"))}</a>
      ·
      <a class="pc-link" href="${GOOAYE_RESEARCH_HASH}">${escapeHtml(t("podcastsGotoResearch"))}</a>
    </p>

    <div class="gy-list" role="list">
      ${
        slice.length
          ? slice.map(episodeCard).join("")
          : `<p class="gy-empty">${escapeHtml(t("gooayeNoResults"))}</p>`
      }
    </div>

    <div class="gy-pager">
      ${
        remaining > 0
          ? `<button type="button" class="gy-load-more" data-gy-more>
              ${escapeHtml(t("gooayeLoadMore", { n: String(Math.min(PAGE_SIZE, remaining)), left: String(remaining) }))}
            </button>`
          : all.length
            ? `<p class="gy-pager-done">${escapeHtml(t("gooayeShowingAll", { n: String(all.length) }))}</p>`
            : ""
      }
    </div>`;

  const input = root.querySelector("[data-gy-search]");
  if (input) {
    let timer = null;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        filterQuery = input.value || "";
        visibleCount = PAGE_SIZE;
        paint(root, data);
      }, 180);
    });
  }

  const more = root.querySelector("[data-gy-more]");
  if (more) {
    more.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      paint(root, data);
    });
  }
}

function shellHtml() {
  return `
    <article class="pc-card pc-card-gooaye" id="podcast-gooaye" data-podcast="gooaye">
      <header class="pc-card-head pc-card-head-gooaye">
        <div class="pc-card-identity">
          <span class="pc-card-badge pc-badge-library">${escapeHtml(t("gooayeLibraryBadge"))}</span>
          <span class="pc-card-badge pc-badge-tw">${escapeHtml(t("podcastsGooayeMarket"))}</span>
          <span class="pc-card-badge pc-badge-candidate">${escapeHtml(t("godzillaBadgeCandidate"))}</span>
          <span class="pc-card-badge pc-badge-watch">${escapeHtml(t("godzillaBadgeWatch"))}</span>
        </div>
        <h3 class="pc-card-title">${escapeHtml(t("podcastsGooayeTitle"))}</h3>
        <p class="pc-card-blurb">${escapeHtml(t("podcastsGooayeLead"))}</p>
      </header>
      <div class="pc-card-body">
        <p class="gy-disclaimer" role="note">${escapeHtml(t("gooayeDisclaimer"))}</p>
        <div id="gy-root" class="gy-root" aria-busy="true">
          <p class="gy-loading">${escapeHtml(t("gooayeLoading"))}</p>
        </div>
      </div>
    </article>`;
}

export function gooayeDetailHtml() {
  return shellHtml();
}

export async function initGooaye(selector = "#gy-root") {
  const root =
    typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!root) return { ok: false, reason: "missing-root" };

  visibleCount = PAGE_SIZE;
  filterQuery = "";

  try {
    const data = await loadData();
    root.setAttribute("aria-busy", "false");
    paint(root, data);
    return { ok: true, count: data.episodes?.length || 0 };
  } catch (err) {
    root.setAttribute("aria-busy", "false");
    paint(root, null, { error: err });
    return { ok: false, reason: String(err?.message || err) };
  }
}
