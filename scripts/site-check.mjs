#!/usr/bin/env node
/**
 * Live full-site check (headless Chrome via playwright-core).
 *
 *   npm run check:live                     # https://wenzurich.github.io/just-math-and-luck/
 *   SITE_URL=http://127.0.0.1:4173/just-math-and-luck/ npm run check:live
 *   SITE_CHECK_OUT=/tmp/x npm run check:live
 *   CHROME_PATH=/path/to/chrome npm run check:live
 *
 * Loads every route at 390px (mobile) and 1280px (desktop), opens/closes the 更多 sheet,
 * checks the three marquees (熱門 / 美國總經 / 台灣總經) exist with official links, runs lookup
 * for one US and one TW ticker, and fails on: console errors, uncaught page errors, blank
 * views/sections, any 「資料不足」/「資料不全」 text, or 4xx/5xx same-origin assets.
 *
 * Expected noise that does NOT fail: live-quotes.js tries Yahoo / TWSE MIS directly first
 * and then falls back to a CORS proxy by design, so the browser logs CORS errors for those
 * hosts. They are counted as "expectedCors" in the report.
 *
 * Screenshots + report.json go to /workspace/site-checks/YYYY-MM-DD/ (Asia/Taipei date).
 * Exit code 0 = all pass, 1 = at least one failure, 2 = could not start the browser.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { chromium } from "playwright-core";

const BASE = (process.env.SITE_URL || "https://wenzurich.github.io/just-math-and-luck/").replace(/#.*$/, "");
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
const OUT = process.env.SITE_CHECK_OUT || join("/workspace/site-checks", today);
const NAV_TIMEOUT = 45_000;
const SETTLE_MS = Number(process.env.SITE_CHECK_SETTLE_MS || 2500);
const STALE_WARN_DAYS = 3;
const STALE_FAIL_DAYS = 6;

/** Hosts whose direct-fetch CORS failures are an expected part of live-quotes.js fallback. */
const EXPECTED_CORS_HOSTS = [/(^|\.)yahoo\.com$/i, /^mis\.twse\.com\.tw$/i];
const JINA_HOST = "r.jina.ai";
/** Live-quote polling endpoints; blocked on every route except 今日 so 32 reloads don't get the proxy rate-limited. */
const LIVE_QUOTE_RE = /\/v7\/finance\/spark|mis\.twse\.com\.tw\/stock\/api\/getStockInfo/i;
const BANNED_TEXT = ["資料不足", "資料不全"];

const VIEWPORTS = [
  { id: "m390", width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { id: "d1280", width: 1280, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
];

const ROUTES = [
  { id: "today", hash: "#today", view: "today" },
  { id: "logic", hash: "#logic", view: "logic" },
  { id: "research", hash: "#research", view: "research" },
  { id: "research-paper", hash: "#research/paper", view: "research" },
  { id: "strategies", hash: "#strategies", view: "strategies" },
  { id: "options", hash: "#options", view: "options" },
  { id: "earnings", hash: "#earnings", view: "earnings" },
  { id: "lookup-us", hash: "#lookup", view: "lookup", lookup: { market: "US", q: "NVDA" } },
  { id: "lookup-tw", hash: "#lookup", view: "lookup", lookup: { market: "TW", q: "2330" } },
  { id: "soxl", hash: "#soxl", view: "soxl" },
  { id: "txf", hash: "#txf", view: "txf" },
  { id: "podcasts", hash: "#podcasts", view: "podcasts" },
  { id: "podcasts-gooaye", hash: "#podcasts/gooaye", view: "podcasts" },
  { id: "letters", hash: "#letters", view: "letters" },
  { id: "manbao", hash: "#manbao", view: "manbao" },
  { id: "paper", hash: "#paper", view: "paper" },
];

function findChrome() {
  const cands = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
  const pw = join(homedir(), ".cache/ms-playwright");
  if (existsSync(pw)) {
    for (const d of readdirSync(pw).filter((n) => n.startsWith("chromium-")).sort().reverse()) {
      cands.push(join(pw, d, "chrome-linux64/chrome"), join(pw, d, "chrome-linux/chrome"));
    }
  }
  return cands.find((p) => existsSync(p)) || null;
}

const sameOrigin = (url) => {
  try { return new URL(url).origin === new URL(BASE).origin; } catch { return false; }
};
const hostOf = (url) => { try { return new URL(url).hostname; } catch { return ""; } };
/** Host that a request really targets (unwraps https://r.jina.ai/<url>). */
const targetHost = (url) => {
  const h = hostOf(url);
  if (h === JINA_HOST) { try { return hostOf(decodeURIComponent(new URL(url).pathname.slice(1))); } catch { return h; } }
  return h;
};
const isExpectedHost = (url) => EXPECTED_CORS_HOSTS.some((re) => re.test(targetHost(url)));
const isExpectedCors = (text, locUrl) => {
  const m = String(text).match(/fetch at '([^']+)'/);
  const url = m ? m[1] : locUrl || "";
  if (!url || sameOrigin(url)) return false;
  return isExpectedHost(url);
};

const report = {
  base: BASE, startedAt: new Date().toISOString(), out: OUT,
  failures: [], warnings: [], expectedCors: 0, proxyErrors: {}, pages: [],
};
const fail = (where, msg) => { report.failures.push(`[${where}] ${msg}`); console.log(`  FAIL ${where}: ${msg}`); };
const warn = (where, msg) => { report.warnings.push(`[${where}] ${msg}`); console.log(`  warn ${where}: ${msg}`); };

async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
}

async function checkView(page, where, view) {
  const r = await page.evaluate(({ view, banned }) => {
    const el = document.querySelector(`#view-${view}`);
    const vis = (n) => { const s = getComputedStyle(n); const b = n.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" && b.height > 0 && b.width > 0; };
    if (!el) return { missing: true };
    const text = (el.innerText || "").trim();
    const blankSections = [];
    el.querySelectorAll("section").forEach((s, i) => {
      if (!vis(s)) return;
      const t = (s.innerText || "").trim();
      const media = s.querySelector("img,svg,canvas,video,iframe");
      if (t.length < 2 && !media) blankSections.push(s.className || s.id || `section#${i}`);
    });
    const bodyText = document.body.innerText || "";
    const bannedHits = banned.filter((b) => bodyText.includes(b)).map((b) => {
      const i = bodyText.indexOf(b);
      return `${b} … 「${bodyText.slice(Math.max(0, i - 30), i + 20).replace(/\s+/g, " ")}」`;
    });
    const loading = /載入中|Loading…|Loading\.\.\./.test(text);
    return { active: el.classList.contains("is-active") && vis(el), textLen: text.length, blankSections, bannedHits, loading };
  }, { view, banned: BANNED_TEXT });
  if (r.missing) return fail(where, `#view-${view} not found`);
  if (!r.active) fail(where, `#view-${view} is not the visible active view`);
  if (r.textLen < 40) fail(where, `#view-${view} looks blank (${r.textLen} chars)`);
  for (const s of r.blankSections) fail(where, `blank section: ${s}`);
  for (const b of r.bannedHits) fail(where, `banned text: ${b}`);
  if (r.loading) warn(where, "still shows a loading message after settle");
  return r;
}

async function checkLookup(page, where, { market, q }) {
  await page.click(`[data-lk-market="${market}"]`);
  await page.fill("[data-lk-input]", q);
  await page.click(".lk-submit");
  try {
    await page.waitForFunction(() => {
      const r = document.querySelector("#lk-root");
      return r && !r.querySelector(".lk-loading") && !r.querySelector(".lk-muted:only-child");
    }, null, { timeout: 40_000 });
  } catch { return fail(where, `lookup ${market} ${q} did not finish in 40s`); }
  const r = await page.evaluate(() => {
    const root = document.querySelector("#lk-root");
    return { empty: root.querySelector(".lk-empty")?.innerText?.trim() || null,
      badge: root.querySelector(".lk-badge")?.className || "", textLen: (root.innerText || "").trim().length };
  });
  if (r.empty) fail(where, `lookup ${market} ${q} error: ${r.empty}`);
  else if (!r.badge.includes(market === "TW" ? "lk-badge-tw" : "lk-badge-us")) fail(where, `lookup ${market} ${q} wrong/missing market badge`);
  else if (r.textLen < 40) fail(where, `lookup ${market} ${q} result looks blank`);
}

async function checkMarquees(page, where) {
  const r = await page.evaluate(() => {
    const strips = [
      { id: "熱門", el: document.querySelector(".market-strip-wrap") },
      { id: "美國總經", el: document.querySelector("#us-macro-strip") },
      { id: "台灣總經", el: document.querySelector("#tw-macro-strip") },
    ];
    return strips.map(({ id, el }) => {
      if (!el) return { id, missing: true };
      const links = [...el.querySelectorAll('a[href^="http"]')].map((a) => a.href);
      return { id, missing: false, hasMarquee: Boolean(el.querySelector(".index-marquee-track")),
        textLen: (el.innerText || "").trim().length, links: [...new Set(links)] };
    });
  });
  for (const s of r) {
    if (s.missing) { fail(where, `marquee ${s.id} missing`); continue; }
    if (!s.hasMarquee) fail(where, `marquee ${s.id} has no scrolling track`);
    if (s.textLen < 10) fail(where, `marquee ${s.id} is empty`);
    if (!s.links.length) fail(where, `marquee ${s.id} has no official https links`);
  }
  return r.map((s) => ({ id: s.id, linkHosts: [...new Set((s.links || []).map(hostOf))] }));
}

async function checkMoreSheet(page, where, shot) {
  const btn = await page.$("[data-nav-more]");
  if (!btn || !(await btn.isVisible())) return fail(where, "更多 button not visible");
  await btn.click();
  try {
    await page.waitForFunction(() => { const s = document.querySelector("#nav-more-sheet");
      return s && !s.hidden && s.classList.contains("is-open") && getComputedStyle(s).display !== "none"; }, null, { timeout: 4000 });
  } catch { return fail(where, "更多 sheet did not open"); }
  await page.waitForTimeout(400);
  const items = await page.$$eval("#nav-more-sheet .nav-more-item", (n) => n.length);
  if (items < 3) fail(where, `更多 sheet has only ${items} items`);
  await page.screenshot({ path: shot });
  await page.click("#nav-more-sheet .nav-more-close");
  try {
    await page.waitForFunction(() => { const s = document.querySelector("#nav-more-sheet");
      return s && s.hidden && !s.classList.contains("is-open"); }, null, { timeout: 4000 });
  } catch { fail(where, "更多 sheet did not close"); }
}

async function checkData(where) {
  try {
    const res = await fetch(new URL("data/latest.json", BASE), { cache: "no-store" });
    if (!res.ok) return fail(where, `data/latest.json HTTP ${res.status}`);
    const j = await res.json();
    const ageDays = (Date.now() - Date.parse(j.asOf)) / 86_400_000;
    report.dataAsOf = j.asOf; report.timezoneNote = j.timezoneNote;
    if (!Number.isFinite(ageDays)) fail(where, "latest.json asOf is not a date");
    else if (ageDays > STALE_FAIL_DAYS) fail(where, `latest.json asOf ${j.asOf} is ${ageDays.toFixed(1)} days old`);
    else if (ageDays > STALE_WARN_DAYS) warn(where, `latest.json asOf ${j.asOf} is ${ageDays.toFixed(1)} days old`);
    const usBad = (j.us || []).filter((p) => /^\d{4}/.test(p.ticker) || /\.TWO?$/i.test(p.ticker));
    const twBad = (j.tw || []).filter((p) => !/^\d{4}/.test(String(p.ticker)));
    if (usBad.length) fail(where, `TW tickers in US list: ${usBad.map((p) => p.ticker).join(",")}`);
    if (twBad.length) fail(where, `non-TW tickers in TW list: ${twBad.map((p) => p.ticker).join(",")}`);
    if (!(j.us || []).length || !(j.tw || []).length) fail(where, "US or TW pick list is empty");
  } catch (e) { fail(where, `latest.json fetch failed: ${e.message}`); }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const exe = findChrome();
  if (!exe) { console.error("No Chrome/Chromium found. Set CHROME_PATH."); process.exit(2); }
  console.log(`site-check ${BASE}\nbrowser ${exe}\nout ${OUT}`);
  let browser;
  try {
    browser = await chromium.launch({ executablePath: exe, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  } catch (e) { console.error("browser launch failed:", e.message); process.exit(2); }

  await checkData("data");

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile, hasTouch: vp.hasTouch, locale: "zh-TW", timezoneId: "Asia/Taipei",
      serviceWorkers: "block",
    });
    await ctx.addInitScript(() => { try { localStorage.setItem("site-lang", "zh-Hant"); } catch {} });
    const page = await ctx.newPage();
    page.setDefaultTimeout(NAV_TIMEOUT);
    let where = vp.id;
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const text = m.text(); const loc = m.location()?.url || "";
      if (isExpectedCors(text, loc)) { report.expectedCors++; return; }
      fail(where, `console error: ${text.slice(0, 300)}${loc ? ` (${loc})` : ""}`);
    });
    page.on("pageerror", (e) => fail(where, `uncaught error: ${String(e.message || e).slice(0, 300)}`));
    page.on("response", (r) => {
      if (r.status() < 400) return;
      if (sameOrigin(r.url())) fail(where, `HTTP ${r.status()} ${r.url()}`);
      else if (isExpectedHost(r.url())) {
        const k = `${hostOf(r.url())} HTTP ${r.status()}`;
        report.proxyErrors[k] = (report.proxyErrors[k] || 0) + 1;
      } else warn(where, `third-party HTTP ${r.status()} ${r.url()}`);
    });
    page.on("requestfailed", (r) => {
      if (sameOrigin(r.url())) fail(where, `request failed ${r.failure()?.errorText} ${r.url()}`);
    });

    let blockLiveQuotes = false;
    await page.route(LIVE_QUOTE_RE, (r) => (blockLiveQuotes ? r.abort("blockedbyclient") : r.continue()));

    for (const route of ROUTES) {
      where = `${vp.id}/${route.id}`;
      blockLiveQuotes = route.id !== "today";
      console.log(`- ${where}`);
      const t0 = Date.now();
      try {
        // Force a full load per route so errors are attributed to the right page.
        await page.goto("about:blank");
        await page.goto(BASE + route.hash, { waitUntil: "load", timeout: NAV_TIMEOUT });
        await settle(page);
        if (route.lookup) await checkLookup(page, where, route.lookup);
        const r = await checkView(page, where, route.view);
        const entry = { viewport: vp.id, route: route.id, ms: Date.now() - t0, textLen: r?.textLen };
        if (route.id === "today") {
          entry.marquees = await checkMarquees(page, where);
          if (vp.isMobile) await checkMoreSheet(page, `${vp.id}/more`, join(OUT, `${vp.id}-more-open.png`));
        }
        await page.screenshot({ path: join(OUT, `${vp.id}-${route.id}.png`), fullPage: true });
        report.pages.push(entry);
      } catch (e) {
        fail(where, `navigation/check threw: ${e.message.split("\n")[0]}`);
        await page.screenshot({ path: join(OUT, `${vp.id}-${route.id}-ERROR.png`) }).catch(() => {});
      }
    }
    await ctx.close();
  }
  await browser.close();

  report.finishedAt = new Date().toISOString();
  report.ok = report.failures.length === 0;
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(`\n${report.ok ? "PASS" : "FAIL"}: ${report.pages.length} page checks, ${report.failures.length} failures, ${report.warnings.length} warnings, ${report.expectedCors} expected live-quote CORS/blocked errors ignored`);
  const proxy = Object.entries(report.proxyErrors).map(([k, n]) => `${k} ×${n}`).join(", ");
  if (proxy) console.log(`  (fallback proxy / Yahoo errors, not counted as failures: ${proxy})`);
  for (const f of report.failures) console.log(`  ✗ ${f}`);
  for (const w of report.warnings) console.log(`  ! ${w}`);
  console.log(`report ${join(OUT, "report.json")}`);
  process.exit(report.ok ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(2); });
