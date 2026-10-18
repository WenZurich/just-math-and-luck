#!/usr/bin/env node
/**
 * Refresh 張濬安 catalog from public Blogspot feed + pttweb user article pages.
 * Preserves hand-written analysis / commentSummary / analysisQuality=analyzed fields
 * (same preserve pattern as gooaye listened enrichment).
 *
 * Manual: node scripts/fetch-zhang-junan-posts.mjs
 * Optional: npm run fetch-zhang-junan
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public/data/zhang-junan-posts.json");
const OUT_DOCS = path.join(ROOT, "docs/data/zhang-junan-posts.json");

const UA =
  "Mozilla/5.0 (compatible; JustMathAndLuck/1.0; +https://github.com/WenZurich/Just-Math-and-Luck)";
const BLOG_FEED =
  "https://et220870.blogspot.com/feeds/posts/default?alt=json&max-results=500";
const PTT_USER = "https://www.pttweb.cc/user/et220870?t=article";

const PRESERVE_FIELDS = [
  "analysis",
  "commentSummary",
  "analysisQuality",
  "analyzedAt",
  "commentCount",
];

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

function stripTracking(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    [...u.searchParams.keys()].forEach((k) => {
      if (/^(utm_|fbclid|gclid|m$|spref)/i.test(k) || k === "m" || k === "spref") {
        u.searchParams.delete(k);
      }
    });
    u.hash = "";
    return u.toString().replace(/\?$/, "");
  } catch {
    return url;
  }
}

function decodeEntities(s) {
  return String(s || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => {
      try {
        return String.fromCodePoint(Number(n));
      } catch {
        return " ";
      }
    });
}

function stripHtml(s) {
  return decodeEntities(s)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Polite fetch: retries transient socket drops / 429 / 5xx with backoff (pttweb often closes idle sockets). */
async function fetchText(url, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html,application/json,*/*" },
      });
      if (res.ok) return await res.text();
      lastErr = new Error(`HTTP ${res.status} for ${url}`);
      if (res.status !== 429 && res.status < 500) throw lastErr;
    } catch (e) {
      lastErr = e;
      if (/^HTTP 4\d\d/.test(e?.message || "") && !/^HTTP 429/.test(e.message)) throw e;
    }
    if (i < attempts - 1) await sleep(1500 * (i + 1));
  }
  throw lastErr;
}

function blogSeries(title, text) {
  if (/年度總結|年總結/.test(title)) return "年度覆盤";
  if (/Monthly|月報|半年報|近況|久違|退伍|練功/i.test(title)) return "月報／生涯";
  if (/股|太陽能|冥燈|噴出|滿倉|先盛|出師|悽慘|反指標/.test(title)) return "早期股市日誌";
  if (/poker|NL\d+|PLO|hands|FTP|牌/i.test(text) && !/台指|已實現|淨值/.test(text)) {
    return "撲克／生活";
  }
  if (/股|期|當沖|淨值|資產/.test(text)) return "交易心法／覆盤";
  return "其他";
}

function pttSeries(board) {
  const FIN = new Set(["Stock", "Broker", "Loan", "home-sale", "money", "Trading"]);
  const POKER = new Set(["Poker", "NTU-Poker"]);
  if (FIN.has(board)) return "財經相關";
  if (POKER.has(board)) return "撲克";
  return "其他看板";
}

async function fetchBlogPosts() {
  const raw = await fetchText(BLOG_FEED);
  const j = JSON.parse(raw);
  const entries = j?.feed?.entry || [];
  return entries.map((e) => {
    const links = (e.link || []).filter((l) => l.rel === "alternate");
    const url = stripTracking(links[0]?.href || "");
    const title = stripHtml(e.title?.$t || "");
    const publishedAt = e.published?.$t || null;
    const content = e.content?.$t || e.summary?.$t || "";
    const text = stripHtml(content);
    const idDate = (publishedAt || "").slice(0, 10);
    const slug = title.replace(/[^\w\u4e00-\u9fff]+/g, "-").slice(0, 40);
    return {
      id: `blog-${idDate}-${slug}`,
      source: "blog",
      group: "blog",
      series: blogSeries(title, text),
      url,
      title,
      publishedAt,
      analysis: [
        "目錄已更新；此篇尚待人工讀後分析。重新整理腳本不會覆蓋既有「已讀分析」欄位。",
      ],
      commentSummary: null,
      analysisQuality: "title-only",
      analyzedAt: null,
      bodyPreview: text.slice(0, 400),
    };
  });
}

async function fetchPttCatalog() {
  const posts = [];
  const seen = new Set();
  for (let page = 0; page < 40; page++) {
    const url = page
      ? `${PTT_USER}&page=${page}`
      : PTT_USER;
    if (page) await sleep(600);
    const html = await fetchText(url);
    if (html.includes("_cf_chl") || html.includes("Just a moment")) {
      throw new Error(`Cloudflare challenge on PTT page ${page}`);
    }
    const blocks = html.split('<div class="thread-item').slice(1);
    let added = 0;
    for (const b of blocks) {
      const hm = b.match(/href="(\/bbs\/([A-Za-z0-9_-]+)\/(M\.[^"]+))"/);
      const tm = b.match(/class="thread-title"[^>]*>([^<]+)/);
      const pm = b.match(/class="thread-posttime"[^>]*>([^<]+)/);
      if (!hm || !tm) continue;
      const path = hm[1];
      if (seen.has(path)) continue;
      seen.add(path);
      const board = hm[2];
      const aid = hm[3].replace(/\/$/, "");
      const title = decodeEntities(tm[1]).trim();
      const publishedAtRaw = pm ? pm[1].trim() : null;
      let publishedAt = null;
      const m = publishedAtRaw && publishedAtRaw.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
      if (m) publishedAt = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+08:00`;
      posts.push({
        id: `ptt-${board}-${aid}`,
        source: "ptt",
        group: "ptt",
        series: pttSeries(board),
        board,
        url: `https://www.pttweb.cc${path}`,
        pttUrl: `https://www.ptt.cc${path}.html`,
        title,
        publishedAt,
        publishedAtRaw,
        analysis: [
          "目錄已更新；此篇尚待人工讀後分析（含留言）。重新整理腳本不會覆蓋既有「已讀分析」欄位。",
        ],
        commentSummary: null,
        commentCount: 0,
        analysisQuality: "title-only",
        analyzedAt: null,
        deleted: false,
      });
      added += 1;
    }
    console.log(`  PTT page ${page}: +${added} (total ${posts.length})`);
    if (added === 0 && page > 0) break;
  }
  return posts;
}

function loadPrevious() {
  const map = new Map();
  try {
    if (!fs.existsSync(OUT_PUBLIC)) return map;
    const prev = JSON.parse(fs.readFileSync(OUT_PUBLIC, "utf8"));
    for (const post of prev.posts || []) {
      if (post?.id) map.set(post.id, post);
      if (post?.url) map.set(post.url, post);
    }
  } catch (e) {
    console.warn("Could not read previous zhang-junan-posts.json:", e.message);
  }
  return map;
}

function mergePreserved(posts, prevById) {
  let kept = 0;
  for (const post of posts) {
    const prev = prevById.get(post.id) || prevById.get(post.url);
    if (!prev) continue;
    if (prev.analysisQuality === "analyzed" && Array.isArray(prev.analysis) && prev.analysis.length) {
      for (const f of PRESERVE_FIELDS) {
        if (prev[f] !== undefined) post[f] = prev[f];
      }
      kept += 1;
    }
  }
  return kept;
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function main() {
  console.log("Fetching blog feed…");
  const blog = await fetchBlogPosts();
  console.log(`  blog posts: ${blog.length}`);
  console.log("Fetching PTT catalog…");
  const ptt = await fetchPttCatalog();
  console.log(`  ptt posts: ${ptt.length}`);

  const posts = [...blog, ...ptt].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  const prev = loadPrevious();
  const kept = mergePreserved(posts, prev);
  if (kept) console.log(`  preserved analyzed enrichment for ${kept} post(s)`);

  const counts = {
    total: posts.length,
    blog: posts.filter((p) => p.source === "blog").length,
    ptt: posts.filter((p) => p.source === "ptt").length,
    analyzed: posts.filter((p) => p.analysisQuality === "analyzed").length,
    titleOnly: posts.filter((p) => p.analysisQuality !== "analyzed").length,
    pttWithComments: posts.filter(
      (p) => p.source === "ptt" && (p.commentCount || 0) > 0
    ).length,
  };

  const payload = {
    id: "zhang-junan-posts",
    person: {
      name: "張濬安",
      nameEn: "Zhang Junan",
      blogAuthor: "Andy Chang",
      blog: "https://et220870.blogspot.com/",
      pttId: "et220870",
      pttUser: "https://www.pttweb.cc/user/et220870",
    },
    asOf: taipeiNowIso(),
    timezone: "Asia/Taipei",
    status: "candidate",
    mathGate: "closed",
    disclaimer:
      "候選／觀察；數學閘關閉。標「已讀分析」者：已讀公開正文（部落格全文或 PTT 原文＋留言）後撰寫重點。標「僅標題」者：公開頁正文不可讀或已刪。作者觀點；非投資建議。不納入選股清單。",
    sources: {
      blogIndex: "https://et220870.blogspot.com/",
      blogFeed: BLOG_FEED,
      pttUser: PTT_USER,
    },
    counts,
    posts,
  };

  writeJson(OUT_PUBLIC, payload);
  console.log(`Wrote ${OUT_PUBLIC}`);
  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    writeJson(OUT_DOCS, payload);
    console.log(`Wrote ${OUT_DOCS}`);
  }
  console.log("counts", counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
