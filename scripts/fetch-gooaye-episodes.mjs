#!/usr/bin/env node
/**
 * Fetch Gooaye（股癌）full episode catalog from SoundOn RSS → public/data/gooaye-episodes.json
 * (+ docs/data when present).
 *
 * Integrity rules:
 *  - Never invent episode content, quotes, or numbers.
 *  - keyPoints are distilled ONLY from public RSS title + description/summary
 *    after stripping known sponsor / hosting boilerplate.
 *  - Thin show notes → honest short teaser bullets (not fabricated transcripts).
 *  - Full catalog is written; UI may paginate but data must not silently drop episodes.
 *
 * Manual: node scripts/fetch-gooaye-episodes.mjs
 * Optional: npm run fetch-gooaye
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public/data/gooaye-episodes.json");
const OUT_DOCS = path.join(ROOT, "docs/data/gooaye-episodes.json");

const UA =
  "Mozilla/5.0 (compatible; JustMathAndLuck/1.0; +https://github.com/WenZurich/Just-Math-and-Luck)";

const FEED_URL =
  "https://feeds.soundon.fm/podcasts/954689a5-3096-43a4-a80b-7810b219cef3.xml";
const APPLE_SHOW =
  "https://podcasts.apple.com/tw/podcast/gooaye-%E8%82%A1%E7%99%8C/id1500839292";
const SHOW_PAGE =
  "https://player.soundon.fm/p/954689a5-3096-43a4-a80b-7810b219cef3";

/** Hard cut markers — everything from here on is hosting / portal / ad tail. */
const HARD_CUT = [
  /--\s*Hosting provided by/i,
  /Hosting provided by\s*SoundOn/i,
  /股癌傳送門/,
  /linktr\.ee\/gooaye/i,
];

/** Line / paragraph is sponsor or product pitch — drop. */
const SPONSOR_RE =
  /(本集節目由|贊助播出|贊助商|限量優惠|專屬優惠|專屬折扣|折扣碼|優惠碼|優惠代碼|結帳時輸入|現折\s*\$|滿額再送|抽獎好禮|輸入折扣|nordvpn\.com|saily\.com|#NordVPN|#SailyeSIM|momoshop\.com|s\.add\.one|ALUXE|亞立詩|Bright\s*360|Dr\.?\s*情趣|TASLA|善存|益生菌|妙而舒|夏普|SHARP|台啤雲泡|葉黃素|婚鑽|裸鑽|手機殼|抗黃|保固|試穿再購買|股癌限時|Momo限時|買2送2|發票登錄|虛擬裝備|舒眠益生菌|Lactobacillus|Bifidobacterium|Wincool|物理治療師研發|中秋烤肉|三聲買|雲泡生啤酒|選購網址|購買連結|reurl\.cc|可機洗|免被套)/i;

const PRODUCT_FEATURE_RE =
  /^[✨💎🌀🎁⚡✅👍🍺🖤]|^\．|門市隨時備有|上千款|全客製|少女心爆棚|貼心外借/;

function decodeEntities(s) {
  return String(s || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      try {
        return String.fromCodePoint(code);
      } catch {
        return " ";
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      try {
        return String.fromCodePoint(parseInt(h, 16));
      } catch {
        return " ";
      }
    });
}

function stripHtml(s) {
  return decodeEntities(s)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function tagXml(block, name) {
  const cd = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${name}>`, "i")
  );
  if (cd) return cd[1];
  const plain = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i")
  );
  return plain ? plain[1] : "";
}

function attrSelf(block, name, attrName) {
  const m = block.match(
    new RegExp(`<${name}[^>]*\\s${attrName}="([^"]*)"[^>]*\\/?>`, "i")
  );
  return m ? m[1] : "";
}

function taipeiNowIso() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}

function pubDateToTaipeiYmd(pubDate) {
  if (!pubDate) return null;
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return null;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d); // YYYY-MM-DD
}

function pubDateToIso(pubDate) {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Extract public (non-sponsor) show-note text from RSS description. */
function extractPublicNotes(rawDesc) {
  let t = stripHtml(rawDesc || "");
  for (const re of HARD_CUT) {
    const m = t.match(re);
    if (m && m.index != null) t = t.slice(0, m.index);
  }
  t = t.trim();

  // Cut at first strong sponsor opener mid-string
  const open = t.search(
    /本集節目由|現在只要下載\s*Saily|現在搜尋\s*https?:\/\/nordvpn|NordVPN\s*限量|Dr\.?\s*情趣|【NordVPN】|【SHARP|政府普發一萬/i
  );
  if (open > 0) t = t.slice(0, open).trim();
  else if (open === 0) t = "";

  const lines = t
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const kept = [];
  let sawSponsorLine = false;
  for (const line of lines) {
    if (SPONSOR_RE.test(line) || PRODUCT_FEATURE_RE.test(line)) {
      sawSponsorLine = true;
      continue;
    }
    if (/^https?:\/\//i.test(line)) {
      sawSponsorLine = true;
      continue;
    }
    if (/URL:\s*https?/i.test(line) || /bit\.ly\//i.test(line)) {
      sawSponsorLine = true;
      continue;
    }
    // leftover footnote junk from ads
    if (/^[#*^‘'`]/.test(line) && line.length < 80) continue;
    if (/數量有限，送完為止/.test(line)) continue;
    if (/活動詳情與贈品/.test(line)) continue;
    if (/還有\d+天試用期/.test(line)) continue;
    if (/購買\d+年方案/.test(line)) continue;
    // Once a sponsor block appeared, later lines are almost always more pitch
    if (sawSponsorLine) continue;
    kept.push(line);
  }

  // Gooaye modern format: short hook line, then long product pitch without "本集節目由".
  // If first line is a short teaser and the remainder looks commercial, keep teaser only.
  // Short hook followed by any sponsor block → the lines between hook and ad
  // are almost always the ad's lead-in copy (e.g. EP708「每天都要蓋的…」).
  if (kept.length >= 2 && sawSponsorLine && kept[0].length <= 30) {
    return kept[0];
  }
  if (kept.length >= 2) {
    const first = kept[0];
    const rest = kept.slice(1).join(" ");
    const commercialHits = (
      rest.match(
        /折|優惠|贊助|抽|禮券|方案|活動|限量|品牌|保固|配件|推薦|手刀|買進|結帳|傳送門|投資組合在升級|保養|枕頭|啤酒|烤肉|鑽戒|手機|鏡頭|洗髮|內衣|家電|除濕|透明殼|發黃|防摔|換殼|支架|磁吸|益生菌|VPN|eSIM|婚戒|珍珠|發票|登錄|選購|網址|reurl|可機洗|免被套|新色|收納|棉被/g
      ) || []
    ).length;
    // Short hook + any commercial residue → teaser only (do not invent episode body).
    if (first.length <= 60 && (commercialHits >= 1 || rest.length > 120)) {
      return first;
    }
  }

  return kept.join("\n").trim();
}

function titleSubtitle(title) {
  const m = String(title || "").match(/^EP\s*\d+\s*\|\s*(.*)$/i);
  if (m) return m[1].trim();
  const m2 = String(title || "").match(/^EP\s*\d+\s*(.*)$/i);
  return (m2 ? m2[1] : String(title || "")).trim();
}

function isMostlyEmoji(s) {
  const cleaned = s.replace(/\s+/g, "");
  if (!cleaned) return true;
  // strip emoji / symbols / punctuation; if little left, treat as emoji-only
  const core = cleaned.replace(
    /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{So}\p{Sk}\uFE0F\u200D．（）()\[\]|·•★☆♪♫]+/gu,
    ""
  );
  return core.length <= 1;
}

function bulletsFromPublic(title, publicNotes) {
  const pts = [];
  const sub = titleSubtitle(title);

  if (publicNotes) {
    const parts = publicNotes
      .split(/(?<=[。！？!?])\s*|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2);

    for (let p of parts) {
      if (SPONSOR_RE.test(p) || PRODUCT_FEATURE_RE.test(p)) continue;
      if (/^https?:\/\//i.test(p)) continue;
      if (p.length > 160) {
        p = p.slice(0, 140).replace(/[，,、\s]+$/u, "") + "…";
      }
      if (!pts.includes(p)) pts.push(p);
      if (pts.length >= 6) break;
    }
  }

  if (!pts.length && sub && !isMostlyEmoji(sub)) {
    pts.push(sub);
  }

  return pts;
}

function parseEpisodeNumber(block, title) {
  const epTag = tagXml(block, "itunes:episode");
  if (epTag && /^\d+$/.test(epTag.trim())) return Number(epTag.trim());
  const m = String(title || "").match(/\bEP\s*(\d+)\b/i);
  return m ? Number(m[1]) : null;
}

function parseDurationSec(block) {
  const raw = tagXml(block, "itunes:duration").trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return Number(raw);
  const parts = raw.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

async function fetchFeed() {
  const res = await fetch(FEED_URL, {
    headers: {
      "User-Agent": UA,
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  if (!res.ok) throw new Error(`RSS HTTP ${res.status}`);
  return await res.text();
}

function parseItems(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
  const episodes = [];
  let thinCount = 0;
  let titleOnlyCount = 0;
  let skippedEmpty = 0;

  for (const block of items) {
    const title = stripHtml(tagXml(block, "title"));
    const link = stripHtml(tagXml(block, "link"));
    const guid = stripHtml(tagXml(block, "guid")) || link;
    const pubDate = stripHtml(tagXml(block, "pubDate"));
    const desc =
      tagXml(block, "description") ||
      tagXml(block, "content:encoded") ||
      tagXml(block, "itunes:summary") ||
      "";
    const publicNotes = extractPublicNotes(desc);
    const keyPoints = bulletsFromPublic(title, publicNotes);
    const ep = parseEpisodeNumber(block, title);
    const durationSec = parseDurationSec(block);
    const subtitle = titleSubtitle(title);

    let notesQuality = "rich";
    if (!keyPoints.length) {
      notesQuality = "empty";
      skippedEmpty += 1;
    } else if (!publicNotes || publicNotes.length < 28) {
      notesQuality = publicNotes ? "teaser" : "title-only";
      if (notesQuality === "teaser") thinCount += 1;
      else titleOnlyCount += 1;
    } else if (keyPoints.length <= 1 && publicNotes.length < 60) {
      notesQuality = "teaser";
      thinCount += 1;
    }

    episodes.push({
      id: guid || `ep-${ep ?? episodes.length}`,
      ep,
      title,
      subtitle: subtitle || null,
      pubDate: pubDate || null,
      pubDateIso: pubDateToIso(pubDate),
      pubDateTw: pubDateToTaipeiYmd(pubDate),
      durationSec,
      link: link || null,
      appleShowUrl: APPLE_SHOW,
      keyPoints,
      notesQuality,
      source: "soundon-rss",
    });
  }

  // Newest first (RSS usually already is); stable sort by pubDateIso then ep
  episodes.sort((a, b) => {
    const ta = a.pubDateIso ? Date.parse(a.pubDateIso) : 0;
    const tb = b.pubDateIso ? Date.parse(b.pubDateIso) : 0;
    if (tb !== ta) return tb - ta;
    return (b.ep || 0) - (a.ep || 0);
  });

  return { episodes, thinCount, titleOnlyCount, skippedEmpty };
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}



/** Fields written by listen-gooaye-episodes.mjs — keep across RSS re-fetches. */
const PRESERVE_LISTENED = [
  "stockAnalysis",
  "rssTeaser",
  "notesQuality",
  "listenedAt",
  "transcriptSource",
  "markets",
  "hostViewsOnly",
];

function loadPreviousByEp() {
  const map = new Map();
  if (!fs.existsSync(OUT_PUBLIC)) return map;
  try {
    const prev = JSON.parse(fs.readFileSync(OUT_PUBLIC, "utf8"));
    for (const ep of prev.episodes || []) {
      if (ep?.ep == null) continue;
      if (ep.notesQuality === "listened" && Array.isArray(ep.stockAnalysis) && ep.stockAnalysis.length) {
        map.set(ep.ep, ep);
      }
    }
  } catch (e) {
    console.warn("Could not read previous gooaye-episodes.json for merge:", e.message);
  }
  return map;
}

function mergeListened(episodes, prevByEp) {
  let kept = 0;
  for (const ep of episodes) {
    const prev = prevByEp.get(ep.ep);
    if (!prev) continue;
    if (!ep.rssTeaser && Array.isArray(prev.rssTeaser)) ep.rssTeaser = prev.rssTeaser;
    else if (!ep.rssTeaser && Array.isArray(ep.keyPoints) && ep.keyPoints.length) {
      ep.rssTeaser = [...ep.keyPoints];
    }
    for (const k of PRESERVE_LISTENED) {
      if (k === "rssTeaser") continue;
      if (prev[k] !== undefined) ep[k] = prev[k];
    }
    ep.notesQuality = "listened";
    kept += 1;
  }
  return kept;
}

async function main() {
  console.log("Fetching Gooaye SoundOn RSS…");
  console.log(" ", FEED_URL);
  const xml = await fetchFeed();
  const { episodes, thinCount, titleOnlyCount, skippedEmpty } = parseItems(xml);
  const prevByEp = loadPreviousByEp();
  const keptListened = mergeListened(episodes, prevByEp);
  if (keptListened) console.log(`  preserved listened enrichment for ${keptListened} episode(s)`);

  if (!episodes.length) {
    console.error("No episodes parsed — refusing to overwrite last-good file.");
    process.exit(1);
  }

  const withPoints = episodes.filter((e) => e.keyPoints.length > 0);
  const emptyNotes = episodes.filter((e) => !e.keyPoints.length);

  const payload = {
    id: "gooaye-episodes",
    asOf: taipeiNowIso(),
    timezone: "Asia/Taipei",
    status: "candidate",
    mathGate: "closed",
    disclaimer:
      "Not investment advice. Candidate/watch; math gate closed. Episodes with notesQuality=listened include 股票重點分析 after public audio download + speech-to-text review. RSS-only episodes are show-note teasers only. Host views; no invented tickers, prices, or quotes.",
    show: {
      name: "Gooaye 股癌",
      host: "謝孟恭",
      appleId: "1500839292",
      appleUrl: APPLE_SHOW,
      soundonUrl: SHOW_PAGE,
      feedUrl: FEED_URL,
    },
    sources: [
      { type: "rss", url: FEED_URL, label: "SoundOn RSS" },
      { type: "apple", url: APPLE_SHOW, label: "Apple Podcasts" },
    ],
    counts: {
      total: episodes.length,
      withKeyPoints: withPoints.length,
      notesTeaser: thinCount,
      notesTitleOnly: titleOnlyCount,
      notesEmpty: emptyNotes.length,
      listened: episodes.filter((e) => e.notesQuality === "listened").length,
      rssOnly: episodes.filter((e) => e.notesQuality !== "listened").length,
    },
    episodes,
  };

  writeJson(OUT_PUBLIC, payload);
  console.log(`Wrote ${OUT_PUBLIC}`);
  console.log(
    `  episodes=${episodes.length} withKeyPoints=${withPoints.length} teaser=${thinCount} titleOnly=${titleOnlyCount} empty=${emptyNotes.length}`
  );

  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    writeJson(OUT_DOCS, payload);
    console.log(`Wrote ${OUT_DOCS}`);
  }

  if (emptyNotes.length) {
    console.log(
      `Note: ${emptyNotes.length} episode(s) had no usable public text after sponsor strip (still listed; keyPoints=[]).`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
