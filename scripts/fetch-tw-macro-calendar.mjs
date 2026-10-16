#!/usr/bin/env node
/**
 * Fetch Taiwan market-moving calendar → public/data/tw-macro-calendar.json
 * (+ docs/data when present).
 *
 * Sources (official / public only — never invent dates):
 *   - DGBAS 預告發布時間表 (VueData on News_NoticeCalendar.aspx, Dept=4527)
 *   - MOEA 外銷訂單／工業生產 (same board, Dept=A13000000G)
 *   - CBC 理監事聯席會議預定日期 page
 *   - TWSE holidaySchedule JSON
 *
 * Manual: npm run fetch-tw-macro
 * Optional with daily-scan: FETCH_TW_MACRO=1 node scripts/daily-scan.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public/data/tw-macro-calendar.json");
const OUT_DOCS = path.join(ROOT, "docs/data/tw-macro-calendar.json");

const UA =
  "Mozilla/5.0 (compatible; JustMathAndLuck/1.0; +https://github.com/WenZurich/Just-Math-and-Luck)";
const WINDOW_PAST_DAYS = 0;
const WINDOW_FORWARD_DAYS = 35;
const MAX_EVENTS = 24;
const TZ = "Asia/Taipei";

const DGBAS_BASE =
  "https://www.stat.gov.tw/News_NoticeCalendar.aspx?n=3717&sms=11505&PageSize=10";
const CBC_SCHEDULE_URL =
  "https://www.cbc.gov.tw/tw/cp-357-189514-82841-1.html";
const CBC_HUB_URL = "https://www.cbc.gov.tw/tw/lp-357-1.html";
const TWSE_HOLIDAY_URL =
  "https://www.twse.com.tw/rwd/zh/holidaySchedule/holidaySchedule?response=json";

/** Official publisher hubs (real public URLs). */
const OFFICIAL_URLS = {
  cbcDecision: CBC_SCHEDULE_URL,
  dgbasCpi: "https://www.stat.gov.tw/cl.aspx?n=2663",
  dgbasPpi: "https://www.stat.gov.tw/cl.aspx?n=2663",
  dgbasUnemployment: "https://www.stat.gov.tw/cl.aspx?n=2700",
  dgbasGdpFlash: "https://www.stat.gov.tw/News.aspx?n=2677&sms=10980",
  dgbasGdp: "https://www.stat.gov.tw/News.aspx?n=2677&sms=10980",
  dgbasForecast: "https://www.stat.gov.tw/News.aspx?n=2677&sms=10980",
  moeaExportOrders:
    "https://www.moea.gov.tw/MNS/dos/bulletin/Bulletin.aspx?kind=5&html=1&menu_id=6724",
  moeaIndustrialProd:
    "https://www.moea.gov.tw/MNS/dos/bulletin/Bulletin.aspx?kind=6&html=1&menu_id=6725",
  twseHoliday: "https://www.twse.com.tw/zh/trading/holiday.html",
};

const EVENT_RULES = [
  { key: "dgbasCpi", re: /消費者物價指數/, high: true },
  { key: "dgbasPpi", re: /生產者物價指數|進、?出口物價|營造工程物價|服務業生產者物價/, high: false },
  { key: "dgbasUnemployment", re: /失業率|勞動力、就業人數/, high: true },
  { key: "dgbasGdpFlash", re: /國民所得概估/, high: true },
  { key: "dgbasGdp", re: /國內生產毛額|經濟成長率/, high: true },
  { key: "dgbasForecast", re: /經濟預測/, high: true },
  { key: "moeaExportOrders", re: /外銷訂單/, high: true },
  { key: "moeaIndustrialProd", re: /工業生產統計/, high: true },
];

const SHORT_NAME = {
  cbcDecision: "CBC 利率決議",
  dgbasCpi: "CPI 消費者物價",
  dgbasPpi: "PPI／物價指數",
  dgbasUnemployment: "失業率",
  dgbasGdpFlash: "GDP 概估",
  dgbasGdp: "GDP／經濟成長",
  dgbasForecast: "經濟預測",
  moeaExportOrders: "外銷訂單",
  moeaIndustrialProd: "工業生產",
  twseHoliday: "台股休市",
};

function ymdInTz(date, timeZone = TZ) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Build ISO at Asia/Taipei local wall time (no DST). */
function taipeiIso(ymd, hm = "16:00") {
  const [hh, mm] = String(hm || "16:00").split(":").map((x) => Number(x) || 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${ymd}T${pad(hh)}:${pad(mm)}:00+08:00`;
}

function classifyName(name) {
  for (const rule of EVENT_RULES) {
    if (rule.re.test(name || "")) return rule;
  }
  return null;
}

function parseDayToken(dstr) {
  const m = String(dstr || "").match(/(\d{1,2})/);
  return m ? Number(m[1]) : null;
}

function safeDate(year, month, day) {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const d = Math.min(Math.max(1, day), last);
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const GOV_TLS_AGENT = new https.Agent({ rejectUnauthorized: false });

function needsGovTlsRelax(url) {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return (
      h === "www.stat.gov.tw" ||
      h.endsWith(".stat.gov.tw") ||
      h === "www.moea.gov.tw" ||
      h.endsWith(".moea.gov.tw")
    );
  } catch {
    return false;
  }
}

/** Node fetch fails on incomplete gov.tw cert chains; use https for those hosts only. */
function fetchTextRelaxed(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || 443,
        path: `${u.pathname}${u.search}`,
        method: "GET",
        agent: GOV_TLS_AGENT,
        headers: { Accept: "text/html,application/json,*/*", "User-Agent": UA },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const next = new URL(res.headers.location, url).href;
            fetchTextRelaxed(next).then(resolve, reject);
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`HTTP ${res.statusCode} ${url}`));
            return;
          }
          resolve(body);
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function fetchText(url) {
  if (needsGovTlsRelax(url)) return fetchTextRelaxed(url);
  const res = await fetch(url, {
    headers: { Accept: "text/html,application/json,*/*", "User-Agent": UA },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function extractVueData(html) {
  const m = html.match(/var VueData = (\{[\s\S]*?\})\s*;?\s*<\/script>/);
  if (!m) return null;
  return JSON.parse(m[1]);
}

async function fetchDgbasDept(dept, maxPages = 4) {
  const items = [];
  let yearRoc = null;
  for (let page = 1; page <= maxPages; page++) {
    const url = `${DGBAS_BASE}&Dept=${encodeURIComponent(dept)}&page=${page}`;
    const html = await fetchText(url);
    const data = extractVueData(html);
    if (!data || !Array.isArray(data.list) || !data.list.length) break;
    yearRoc = data.year;
    items.push(...data.list);
    if (data.list.length < 10) break;
  }
  return { yearRoc, items };
}

function expandDgbasItems(items, yearRoc, fromYmd, toYmd) {
  if (!yearRoc || !items?.length) return [];
  const gregYear = Number(yearRoc) + 1911;
  const out = [];
  for (const it of items) {
    const rule = classifyName(it.name);
    if (!rule) continue;
    // Prefer CPI over other price indices on same day (skip non-CPI price noise unless high)
    if (rule.key === "dgbasPpi") continue;
    const timedatas = it.timedatas || [];
    for (let mi = 0; mi < timedatas.length; mi++) {
      const month = mi + 1;
      for (const slot of timedatas[mi] || []) {
        const day = parseDayToken(slot.date);
        if (!day) continue;
        const dayTw = safeDate(gregYear, month, day);
        if (dayTw < fromYmd || dayTw > toYmd) continue;
        const hm = slot.time || "16:00";
        const scheduledAt = taipeiIso(dayTw, hm);
        const link =
          (Array.isArray(it.links) && it.links[0]?.url) ||
          OFFICIAL_URLS[rule.key] ||
          it.ContentUrl ||
          null;
        out.push({
          id: `${rule.key}-${scheduledAt}`,
          eventKey: rule.key,
          eventName: it.name,
          shortName: SHORT_NAME[rule.key] || String(it.name).slice(0, 40),
          importance: rule.high ? "high" : "med",
          highImpact: Boolean(rule.high),
          scheduledAt: new Date(scheduledAt).toISOString(),
          dayTw,
          periodLabel: slot.notice || null,
          source: it.DeptName || "dgbas",
          officialUrl: link && /^https?:\/\//i.test(link) ? link : OFFICIAL_URLS[rule.key],
        });
      }
    }
  }
  return out;
}

async function fetchCbcMeetings(fromYmd, toYmd) {
  const html = await fetchText(CBC_SCHEDULE_URL);
  const out = [];
  // ROC dates like 115年12月17日
  const re = /(\d{2,3})年\s*(\d{1,2})月\s*(\d{1,2})日/g;
  let m;
  const seen = new Set();
  while ((m = re.exec(html))) {
    const roc = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (roc < 100 || roc > 200) continue;
    const greg = roc + 1911;
    const dayTw = safeDate(greg, month, day);
    if (dayTw < fromYmd || dayTw > toYmd) continue;
    if (seen.has(dayTw)) continue;
    seen.add(dayTw);
    // CBC board meetings typically morning; press conference after — use 10:00 Taipei
    const scheduledAt = new Date(taipeiIso(dayTw, "10:00")).toISOString();
    out.push({
      id: `cbcDecision-${scheduledAt}`,
      eventKey: "cbcDecision",
      eventName: "中央銀行理監事聯席會議（貨幣政策）",
      shortName: SHORT_NAME.cbcDecision,
      importance: "high",
      highImpact: true,
      scheduledAt,
      dayTw,
      periodLabel: null,
      source: "cbc",
      officialUrl: OFFICIAL_URLS.cbcDecision,
    });
  }
  return out;
}

async function fetchTwseHolidays(fromYmd, toYmd) {
  const res = await fetch(TWSE_HOLIDAY_URL, {
    headers: { Accept: "application/json", "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`TWSE holiday HTTP ${res.status}`);
  const json = await res.json();
  if (json.stat !== "ok" || !Array.isArray(json.data)) {
    throw new Error("TWSE holiday: unexpected payload");
  }
  const out = [];
  for (const row of json.data) {
    const dayTw = String(row[0] || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dayTw)) continue;
    if (dayTw < fromYmd || dayTw > toYmd) continue;
    const name = String(row[1] || "休市").trim();
    const note = String(row[2] || "").trim();
    // Skip "開始交易日" / settlement-only noise — keep closed-market holidays
    if (/開始交易/.test(name)) continue;
    if (/僅辦理結算/.test(name) || /僅辦理結算/.test(note)) continue;
    const scheduledAt = new Date(taipeiIso(dayTw, "09:00")).toISOString();
    out.push({
      id: `twseHoliday-${dayTw}`,
      eventKey: "twseHoliday",
      eventName: `台股休市 · ${name}`,
      shortName: `${SHORT_NAME.twseHoliday} · ${name}`.slice(0, 40),
      importance: "med",
      highImpact: false,
      scheduledAt,
      dayTw,
      periodLabel: note || null,
      source: "twse",
      officialUrl: OFFICIAL_URLS.twseHoliday,
    });
  }
  return out;
}

function dedupeSort(events) {
  const map = new Map();
  for (const e of events) {
    const k = `${e.eventKey}|${e.dayTw}`;
    if (!map.has(k)) map.set(k, e);
  }
  return [...map.values()]
    .sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)))
    .slice(0, MAX_EVENTS);
}

function writeJson(fp, payload) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function main() {
  const asOf = new Date().toISOString();
  const todayTw = ymdInTz(new Date(), TZ);
  const fromYmd = addDaysYmd(todayTw, -WINDOW_PAST_DAYS);
  const toYmd = addDaysYmd(todayTw, WINDOW_FORWARD_DAYS);

  console.log(`▶ fetch-tw-macro-calendar ${fromYmd} → ${toYmd} (Taipei window)`);

  let events = [];
  const sourceNotes = [];
  try {
    const dgbas = await fetchDgbasDept("4527");
    const moea = await fetchDgbasDept("A13000000G");
    const fromDgbas = expandDgbasItems(dgbas.items, dgbas.yearRoc, fromYmd, toYmd);
    const fromMoea = expandDgbasItems(moea.items, moea.yearRoc, fromYmd, toYmd);
    events.push(...fromDgbas, ...fromMoea);
    sourceNotes.push("DGBAS NoticeCalendar", "MOEA via DGBAS board");
    console.log(`  DGBAS events: ${fromDgbas.length}, MOEA: ${fromMoea.length}`);
  } catch (err) {
    console.error("DGBAS/MOEA fetch failed:", err?.message || err);
    if (fs.existsSync(OUT_PUBLIC)) {
      console.error(`Keeping last-good ${OUT_PUBLIC} (not overwritten).`);
    }
    process.exit(1);
  }

  try {
    const cbc = await fetchCbcMeetings(fromYmd, toYmd);
    events.push(...cbc);
    sourceNotes.push("CBC board schedule");
    console.log(`  CBC meetings in window: ${cbc.length}`);
  } catch (err) {
    console.warn("CBC schedule skipped:", err?.message || err);
  }

  try {
    const hol = await fetchTwseHolidays(fromYmd, toYmd);
    events.push(...hol);
    sourceNotes.push("TWSE holidaySchedule");
    console.log(`  TWSE holidays in window: ${hol.length}`);
  } catch (err) {
    console.warn("TWSE holidays skipped:", err?.message || err);
  }

  events = dedupeSort(events);
  if (!events.length) {
    console.error("No TW macro events in window — refusing to overwrite with empty.");
    if (fs.existsSync(OUT_PUBLIC)) {
      console.error(`Keeping last-good ${OUT_PUBLIC}.`);
    }
    process.exit(1);
  }

  const payload = {
    asOf,
    market: "TW",
    timezone: TZ,
    timezoneLabel: "台北時間",
    window: { from: fromYmd, to: toYmd },
    source: {
      name: "DGBAS / CBC / TWSE / MOEA",
      url: `${DGBAS_BASE}&Dept=4527`,
      docs: "https://www.stat.gov.tw/News_NoticeCalendar.aspx?n=3717&Dept=4527",
      cbc: CBC_HUB_URL,
      twse: "https://www.twse.com.tw/zh/trading/holiday.html",
      notes: sourceNotes,
    },
    stale: false,
    events,
    refreshHint: "npm run fetch-tw-macro  （可選 FETCH_TW_MACRO=1 接在 daily-scan 後）",
  };

  writeJson(OUT_PUBLIC, payload);
  console.log(`wrote ${OUT_PUBLIC} (${events.length} events, asOf ${asOf})`);
  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    writeJson(OUT_DOCS, payload);
    console.log(`wrote ${OUT_DOCS}`);
  }
  for (const e of events.slice(0, 16)) {
    console.log(`  ${e.dayTw}  [${e.importance}] ${e.shortName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
