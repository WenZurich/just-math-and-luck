/**
 * Taiwan market-moving macro calendar strip (under 「美股大事」).
 * Horizontal marquee (same UX as index-marquee) with clickable official release links.
 * Data: public/data/tw-macro-calendar.json  — refresh via npm run fetch-tw-macro
 */
import { t, numberLocale } from "./i18n.js";
import { escapeHtml } from "./glossary.js";

const DATA_URL = "./data/tw-macro-calendar.json";
const REFRESH_MS = 15 * 60 * 1000; // near-real-time while page open
const STALE_MS = 36 * 60 * 60 * 1000; // honest stale note if asOf older than ~36h

let refreshTimer = null;

function eventLabel(ev) {
  const key = ev?.eventKey ? `twMacroEvent_${ev.eventKey}` : null;
  if (key) {
    const localized = t(key, "");
    if (localized && localized !== key) return localized;
  }
  return ev?.shortName || ev?.eventName || "—";
}

function ymdInTz(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (typ) => parts.find((p) => p.type === typ)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function fmtChipWhen(iso, timeZone) {
  try {
    const d = new Date(iso);
    const datePart = d.toLocaleDateString(numberLocale(), {
      timeZone,
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
    const timePart = d.toLocaleTimeString(numberLocale(), {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { datePart, timePart };
  } catch {
    return { datePart: "—", timePart: "" };
  }
}

function fmtAsOfShort(iso) {
  try {
    return new Date(iso).toLocaleString(numberLocale(), {
      timeZone: "Asia/Taipei",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso || "—";
  }
}

function pickHighlight(events, todayTw) {
  let nextId = null;
  for (const ev of events) {
    if (ev.dayTw >= todayTw) {
      nextId = ev.id;
      break;
    }
  }
  return nextId;
}

function renderChip(ev, { todayTw, nextId, timeZone }) {
  const label = escapeHtml(eventLabel(ev));
  const { datePart, timePart } = fmtChipWhen(ev.scheduledAt, timeZone);
  const isToday = ev.dayTw === todayTw;
  const isNext = ev.id === nextId;
  const isPast = ev.dayTw < todayTw;
  const classes = [
    "macro-chip",
    ev.highImpact || ev.importance === "high" ? "macro-chip--high" : "",
    isToday ? "macro-chip--today" : "",
    isNext && !isToday ? "macro-chip--next" : "",
    isPast ? "macro-chip--past" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const badges = [];
  if (isToday) badges.push(`<span class="macro-chip-tag">${escapeHtml(t("macroToday"))}</span>`);
  else if (isNext) badges.push(`<span class="macro-chip-tag macro-chip-tag--next">${escapeHtml(t("macroNext"))}</span>`);
  if (ev.highImpact || ev.importance === "high") {
    badges.push(`<span class="macro-chip-tag macro-chip-tag--high">${escapeHtml(t("macroHighImpact"))}</span>`);
  }

  const titleBits = [ev.eventName, ev.periodLabel, `${ev.dayTw} ${timePart} 台北`, ev.officialUrl ? "↗ official" : null]
    .filter(Boolean)
    .join(" · ");

  const when = timePart
    ? `${escapeHtml(datePart)} ${escapeHtml(timePart)}`
    : escapeHtml(datePart);

  const inner = `
      <span class="macro-chip-when">${when}</span>
      <span class="macro-chip-name">${label}</span>
      ${badges.length ? `<span class="macro-chip-tags">${badges.join("")}</span>` : ""}`;

  const href = typeof ev.officialUrl === "string" && /^https?:\/\//i.test(ev.officialUrl)
    ? ev.officialUrl
    : null;

  if (href) {
    return `
    <a class="${classes}" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"
       title="${escapeHtml(titleBits)}" data-event-id="${escapeHtml(ev.id)}">${inner}
    </a>`;
  }

  return `
    <span class="${classes}" title="${escapeHtml(titleBits)}" data-event-id="${escapeHtml(ev.id)}">${inner}
    </span>`;
}

function bindMacroMarquee(root) {
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

function paint(root, data) {
  if (!root) return;
  const timeZone = data?.timezone || "Asia/Taipei";
  const todayTw = ymdInTz(new Date(), timeZone);
  const events = Array.isArray(data?.events) ? data.events : [];
  const nextId = pickHighlight(events, todayTw);

  const asOf = data?.asOf || null;
  const ageMs = asOf ? Date.now() - Date.parse(asOf) : NaN;
  const stale =
    Boolean(data?.stale) ||
    (!Number.isNaN(ageMs) && ageMs > STALE_MS);

  let meta = `${escapeHtml(t("twMacroTz"))}`;
  if (asOf) {
    meta += ` · ${escapeHtml(t("macroAsOf"))} ${escapeHtml(fmtAsOfShort(asOf))}`;
  }
  if (stale) {
    meta += ` · ${escapeHtml(t("macroStale"))}`;
  }

  if (!events.length) {
    root.innerHTML = `
      <div class="macro-strip" role="region" aria-label="${escapeHtml(t("twMacroTitle"))}">
        <div class="macro-strip-side">
          <span class="macro-strip-label">${escapeHtml(t("twMacroTitle"))}</span>
          <span class="macro-strip-meta">${meta}</span>
        </div>
        <p class="macro-strip-empty">${escapeHtml(t("twMacroEmpty"))}</p>
      </div>`;
    return;
  }

  const chips = events.map((ev) => renderChip(ev, { todayTw, nextId, timeZone }));
  const group = `<div class="index-marquee-group">${chips.join("")}</div>`;
  const clone = `<div class="index-marquee-group index-marquee-group--clone" aria-hidden="true" inert>${chips.join("").replace(/<a /g, '<a tabindex="-1" ')}</div>`;

  root.innerHTML = `
    <div class="macro-strip" role="region" aria-label="${escapeHtml(t("twMacroTitle"))}">
      <div class="macro-strip-side">
        <span class="macro-strip-label">${escapeHtml(t("twMacroTitle"))}</span>
        <span class="macro-strip-meta" title="${meta}">${meta}</span>
      </div>
      <div class="index-strip index-strip--marquee macro-strip-marquee">
        <div class="index-marquee" tabindex="0">
          <div class="index-marquee-track">
            ${group}
            ${clone}
          </div>
        </div>
      </div>
    </div>`;

  bindMacroMarquee(root);
}

export function renderTwMacroStripSlot() {
  return `<div id="tw-macro-strip" class="tw-macro-strip-host" aria-live="polite"></div>`;
}

async function loadMacro(bust = false) {
  const url = bust ? `${DATA_URL}?t=${Date.now()}` : DATA_URL;
  const res = await fetch(url, { cache: bust ? "no-store" : "default" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function initTwMacroStrip(selector = "#tw-macro-strip") {
  const root =
    typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!root) return { ok: false };

  const paintSafe = async (bust) => {
    try {
      const data = await loadMacro(bust);
      paint(root, data);
      return { ok: true, data };
    } catch (err) {
      root.innerHTML = `
        <div class="macro-strip macro-strip--error" role="status">
          <div class="macro-strip-side">
            <span class="macro-strip-label">${escapeHtml(t("twMacroTitle"))}</span>
          </div>
          <p class="macro-strip-empty">${escapeHtml(
            t("twMacroLoadError", { msg: err.message || String(err) })
          )}</p>
        </div>`;
      return { ok: false, error: err };
    }
  };

  const first = await paintSafe(false);

  if (refreshTimer) {
    window.clearInterval(refreshTimer);
    refreshTimer = null;
  }
  refreshTimer = window.setInterval(() => {
    void paintSafe(true);
  }, REFRESH_MS);

  return first;
}

/** Re-paint from last fetch is not cached here — remount reloads. */
export function stopTwMacroStripRefresh() {
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
