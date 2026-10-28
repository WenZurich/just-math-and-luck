#!/usr/bin/env node
/**
 * Build SOXL desk snapshot → public/data/soxl-desk.json (+ docs/data when present).
 *
 * Seed: /workspace/soxl-research/soxl-holdings-raw.json (SEC N-PORT + researched news).
 * Live refresh attempts: Yahoo Finance quote HTML (prefer over chart API), Yahoo news RSS.
 * Never invents prices/weights — missing fields stay null; blockers recorded.
 *
 * Manual: npm run fetch-soxl
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeEntities, fetchDailyChange, fetchLatestSoxlNport, parseNportHoldings } from "./soxl-nport.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PUBLIC = path.join(ROOT, "public/data/soxl-desk.json");
const OUT_DOCS = path.join(ROOT, "docs/data/soxl-desk.json");
const SEED_CANDIDATES = [
  path.join("/workspace/soxl-research/soxl-holdings-raw.json"),
  path.join(ROOT, "../soxl-research/soxl-holdings-raw.json"),
  path.join(ROOT, "soxl-research/soxl-holdings-raw.json"),
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const YAHOO_QUOTE_URL = "https://finance.yahoo.com/quote/SOXL/";
const YAHOO_NEWS_RSS =
  "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SOXL&region=US&lang=en-US";

function round(n, d = 4) {
  if (n == null || !Number.isFinite(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadSeed() {
  for (const p of SEED_CANDIDATES) {
    if (fs.existsSync(p)) {
      return { path: p, data: JSON.parse(fs.readFileSync(p, "utf8")) };
    }
  }
  return { path: null, data: null };
}

function parseSignedNumber(text) {
  if (text == null) return null;
  const m = String(text).replace(/,/g, "").match(/([+-]?\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

/** Scrape Yahoo Finance SOXL quote page (HTML) — chart API often 429. */
async function fetchYahooQuoteHtmlViaCurl() {
  try {
    const { spawnSync } = await import("node:child_process");
    const r = spawnSync(
      "curl",
      ["-sL", "-A", UA, "--max-time", "25", YAHOO_QUOTE_URL],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }
    );
    if (r.status !== 0) return { ok: false, error: `curl exit ${r.status}: ${r.stderr || ""}` };
    const html = r.stdout || "";
    if (html.length < 5000) return { ok: false, error: `curl HTML too short (${html.length})` };
    return { ok: true, html };
  } catch (e) {
    return { ok: false, error: `curl: ${e.message || e}` };
  }
}

async function fetchYahooQuoteHtml() {
  try {
    let html = null;
    let err = null;
    try {
      const res = await fetch(YAHOO_QUOTE_URL, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });
      if (!res.ok) {
        err = `Yahoo quote HTML HTTP ${res.status}`;
      } else {
        html = await res.text();
      }
    } catch (e) {
      err = `Yahoo quote HTML: ${e.message || e}`;
    }
    if (!html || html.length < 5000) {
      const viaCurl = await fetchYahooQuoteHtmlViaCurl();
      if (viaCurl.ok) html = viaCurl.html;
      else return { ok: false, error: `${err || "fetch empty"}; fallback ${viaCurl.error}` };
    }
    const price = parseSignedNumber(
      html.match(/data-testid="qsp-price"[^>]*>\s*([\d,.]+)/)?.[1]
    );
    const change = parseSignedNumber(
      html.match(/data-testid="qsp-price-change"[^>]*>\s*([+\-\d,.]+)/)?.[1]
    );
    const changePct = parseSignedNumber(
      html.match(/data-testid="qsp-price-change-percent"[^>]*>\s*\(?([+\-\d,.]+)%/)?.[1]
    );
    const overnightPrice = parseSignedNumber(
      html.match(/data-testid="qsp-overnight-price"[^>]*>\s*([\d,.]+)/)?.[1]
    );
    const overnightChange = parseSignedNumber(
      html.match(/data-testid="qsp-overnight-price-change"[^>]*>\s*([+\-\d,.]+)/)?.[1]
    );
    const overnightChangePct = parseSignedNumber(
      html.match(
        /data-testid="qsp-overnight-price-change-percent"[^>]*>\s*\(?([+\-\d,.]+)%/
      )?.[1]
    );
    const closeNotice =
      html.match(/data-testid="qsp-price"[\s\S]{0,600}?At close:\s*([^<]+)/i)?.[1]?.trim() ||
      null;

    if (price == null && overnightPrice == null) {
      return { ok: false, error: "Yahoo quote HTML: no price fields parsed" };
    }

    return {
      ok: true,
      source: YAHOO_QUOTE_URL,
      regular: {
        price: round(price, 2),
        change: round(change, 2),
        changePct: round(changePct, 2),
        session: closeNotice ? `NYSE Arca regular close (${closeNotice})` : "NYSE Arca regular close",
      },
      overnight:
        overnightPrice != null
          ? {
              price: round(overnightPrice, 2),
              change: round(overnightChange, 2),
              changePct: round(overnightChangePct, 2),
              session: "overnight / extended (Yahoo)",
            }
          : null,
    };
  } catch (e) {
    return { ok: false, error: `Yahoo quote HTML: ${e.message || e}` };
  }
}

async function fetchYahooNewsRss() {
  try {
    const res = await fetch(YAHOO_NEWS_RSS, {
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return { ok: false, error: `Yahoo news RSS HTTP ${res.status}`, items: [] };
    const xml = await res.text();
    const items = [];
    const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    for (const block of blocks.slice(0, 12)) {
      const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim();
      const summary = block
        .match(/<description>([\s\S]*?)<\/description>/)?.[1]
        ?.replace(/<!\[CDATA\[|\]\]>/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const pub = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
      let published = null;
      if (pub) {
        const d = new Date(pub);
        if (!Number.isNaN(d.getTime())) published = d.toISOString().slice(0, 10);
      }
      if (title && link) {
        items.push({
          title,
          summary: summary ? summary.slice(0, 280) : null,
          url: link,
          published,
          source: "Yahoo Finance news RSS",
        });
      }
    }
    return { ok: true, items };
  } catch (e) {
    return { ok: false, error: `Yahoo news RSS: ${e.message || e}`, items: [] };
  }
}

/** Map researched headlines → plain-language per-holding reasons (citations only). */
/** Set from the seed in main(): the official N-PORT filing the weights come from. */
let NPORT_URL = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=S000027920&type=NPORT-P";
let NPORT_DATE = null;

const holdingReasonMap = () => ({
  MU: [
    {
      text: "2026 年 9 月報導把 SOXL 急漲連結到記憶體循環展望與美光股價走強（3x 日槓桿會放大半導體指數波動）。",
      sources: [
        "https://www.fool.com/investing/2026/09/21/why-direxion-daily-semiconductor-bull-3x-etf-just/",
        "https://www.weex.com/news/detail/soxl-stock-jumped-12-yesterday-three-companies-explain-the-entire-move-dmqllbso2t8pzjgltaciadyh",
      ],
    },
  ],
  AMD: [
    {
      text: "2026 年 9 月報導提到 AMD 市值里程碑與半導體族群同步上漲，被視為支撐 SOXL 的成分動能之一。",
      sources: [
        "https://www.fool.com/investing/2026/09/21/why-direxion-daily-semiconductor-bull-3x-etf-just/",
        "https://www.weex.com/news/detail/soxl-stock-jumped-12-yesterday-three-companies-explain-the-entire-move-dmqllbso2t8pzjgltaciadyh",
      ],
    },
  ],
  INTC: [
    {
      text: "2026 年 9 月報導指出英特爾走勢與市場對產業／政策預期有關，並被列為解釋 SOXL 近期波動的成分之一。",
      sources: [
        "https://www.fool.com/investing/2026/09/21/why-direxion-daily-semiconductor-bull-3x-etf-just/",
        "https://www.weex.com/news/detail/soxl-stock-jumped-12-yesterday-three-companies-explain-the-entire-move-dmqllbso2t8pzjgltaciadyh",
      ],
    },
  ],
  NVDA: [
    {
      text: "NVIDIA 為半導體／AI 硬體權值之一；SOXL 透過 ICE Semiconductor 指數（含股票部位與指數交換）放大族群日報酬。",
      sources: [
        NPORT_URL,
        "https://www.fool.com/investing/2026/09/21/why-direxion-daily-semiconductor-bull-3x-etf-just/",
      ],
    },
  ],
  AMAT: [
    {
      text: "應用材料屬半導體設備鏈；設備股隨資本支出與製程需求預期波動，會進入指數／交換部位的日報酬。",
      sources: [
        NPORT_URL,
      ],
    },
  ],
});

function reasonsForHolding(h) {
  const reasons = [];
  const sources = new Set();
  const map = holdingReasonMap();
  if (h.ticker && map[h.ticker]) {
    for (const r of map[h.ticker]) {
      reasons.push(r.text);
      (r.sources || []).forEach((s) => sources.add(s));
    }
  }
  if (h.instrument_type === "swap") {
    reasons.push(
      "此列為 ICE Semiconductor Index 交換合約（swap）部位：SOXL 用交換取得約 3 倍日曝險，權重來自 SEC N-PORT，非個股直接持股。"
    );
    sources.add(
      NPORT_URL
    );
  }
  if (h.instrument_type === "cash_equivalent") {
    reasons.push(
      "現金／國庫約當現金部位：槓桿 ETF 常保留大量現金／附買回等以配合交換保證金與日結算；本身通常不是「漲跌主因」。"
    );
    sources.add(
      NPORT_URL
    );
  }
  if (!reasons.length) {
    reasons.push(
      "近期沒有公開報導特別點名這檔；權重來自 SEC 官方持股季報（不是今天即時），漲跌取最近一個美股交易日收盤。"
    );
    sources.add(
      NPORT_URL
    );
  }
  return { reasons, sources: [...sources] };
}

function buildEvents(quote, seed) {
  const events = [];
  const reg = quote?.regularClose || seed?.quote?.regular_close;
  if (reg?.changePct != null && Math.abs(reg.changePct) >= 5) {
    events.push({
      type: "anomaly",
      severity: "high",
      title: `正規盤大波動 ${reg.changePct > 0 ? "+" : ""}${reg.changePct}%`,
      detail: `Yahoo 顯示 SOXL 正規收盤約 $${reg.price}（${reg.changePct > 0 ? "+" : ""}${reg.changePct}% / ${reg.change > 0 ? "+" : ""}${reg.change}）。3x 日槓桿 ETF 波動遠大於半導體指數本身。`,
      sources: [reg.source || YAHOO_QUOTE_URL],
    });
  }
  events.push({
    type: "structure",
    severity: "info",
    title: `持股權重日期：SEC N-PORT ${seed?.holdings_asof || "—"}（官方季報，非當日）`,
    detail: `下方持股權重來自美國證管會（SEC）最新公開的 SOXL N-PORT 持股申報（統計到 ${seed?.holdings_asof || "—"}${seed?.holdings_source?.filing_date ? `，${seed.holdings_source.filing_date} 公告` : ""}）。現金與指數交換常佔淨資產大宗；日權重會變動，勿當成今日即時持股。`,
    sources: [seed?.holdings_source?.url || NPORT_URL],
  });
  const skHynixNews = (seed?.news || []).find((n) => /SK Hynix|SK Hanik|海力士/i.test(n.title + (n.summary || "")));
  if (skHynixNews) {
    events.push({
      type: "rebalance",
      severity: "info",
      title: "媒體：SK Hynix ADR  reportedly 納入 SOXL",
      detail: skHynixNews.summary || skHynixNews.title,
      sources: [skHynixNews.url],
    });
  }
  const divNews = (seed?.news || []).find((n) => /dividend|配息|分配/i.test(n.title + (n.summary || "")));
  if (divNews) {
    events.push({
      type: "dividend",
      severity: "info",
      title: "配息公告（媒體）",
      detail: divNews.summary || divNews.title,
      sources: [divNews.url],
    });
  }
  if (quote?.session && /overnight|extended|Blue Ocean/i.test(quote.session)) {
    events.push({
      type: "session",
      severity: "info",
      title: "目前顯示隔夜／延長時段報價",
      detail: `最新報價時段：${quote.session}。正規收盤另見 hero 備註。`,
      sources: [quote.source || YAHOO_QUOTE_URL],
    });
  }
  return events;
}

function buildOverallReasons(seed, holdings) {
  const up = [];
  const down = [];
  up.push(
    "半導體指數成分（如美光、AMD、英特爾等）同步上漲時，SOXL 以約 3 倍日槓桿放大指數日報酬（見 Motley Fool／WEEX 對近期急漲的整理）。"
  );
  up.push(
    "基金透過 ICE Semiconductor Index 交換合約取得槓桿曝險；指數上漲日，交換部位損益會主導 ETF 淨值方向（SEC N-PORT 可見交換權重）。"
  );
  down.push(
    "反向亦然：指數單日下跌時，3x 日重置會放大虧損；連續下跌日還有複利／路徑依賴，報酬不會等於「3 × 區間漲跌」。"
  );
  down.push(
    "高波動、隔夜與延長時段報價、以及現金／保證金結構變動，都可能讓 SOXL 偏離「單純加總個股權重×漲跌」的直覺估算。"
  );
  const equityUp = holdings.filter(
    (h) => h.instrumentType === "equity" && h.changePct != null && h.changePct > 0
  );
  if (equityUp.length) {
    const names = equityUp
      .slice(0, 4)
      .map((h) => `${h.ticker}（權重 ${Number(h.weightPct).toFixed(2)}%、漲 ${Number(h.changePct).toFixed(2)}%）`)
      .join("、");
    const day = equityUp[0].changePctAsOf ? `（${equityUp[0].changePctAsOf} 美股收盤）` : "";
    up.push(`持股中最近一個交易日${day}上漲的個股包括：${names}（貢獻＝權重×漲跌，僅估算）。`);
  }
  const newsDrop = (seed?.news || []).find((n) => /Dropped|下跌|跌/i.test(n.title));
  if (newsDrop) {
    down.push(`近期亦有「為何下跌」類報導可對照情緒反轉：${newsDrop.title}`);
  }
  return { overallUpReasons: up, overallDownReasons: down };
}

function mergeNews(seedNews, rssItems) {
  const out = [];
  const seen = new Set();
  const push = (n) => {
    const key = (n.url || n.title || "").toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push({
      title: decodeEntities(n.title),
      summary: n.summary ? decodeEntities(n.summary) || null : null,
      url: n.url,
      published: n.published || null,
    });
  };
  for (const n of seedNews || []) push(n);
  for (const n of rssItems || []) push(n);
  return out.slice(0, 16);
}

/**
 * Newer official holdings: EDGAR (site SEC contact from sec-contact.mjs) or a locally downloaded official primary_doc.xml
 * (`--nport-file path --accession 0001193125-26-404435 --filed 2026-09-28`). Only ever moves the snapshot forward.
 */
async function refreshHoldingsFromSec(seed, seedPath, blockers) {
  const argv = process.argv.slice(2);
  const arg = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
  let latest = null;
  try {
    const file = arg("--nport-file");
    if (file) {
      const acc = arg("--accession");
      if (!acc) throw new Error("--accession required with --nport-file");
      const parsed = parseNportHoldings(fs.readFileSync(file, "utf8"));
      if (parsed.seriesId !== "S000027920") throw new Error(`series mismatch ${parsed.seriesId}`);
      const dir = `https://www.sec.gov/Archives/edgar/data/1424958/${acc.replace(/-/g, "")}`;
      latest = { ...parsed, accession: acc, filingDate: arg("--filed"), url: `${dir}/${acc}.txt`, indexUrl: `${dir}/${acc}-index.htm` };
    } else {
      latest = await fetchLatestSoxlNport();
    }
  } catch (e) {
    console.warn(`SEC N-PORT refresh skipped: ${e.message || e}`);
    if (!/No real SEC contact/.test(String(e.message))) blockers.push(`SEC N-PORT refresh: ${e.message || e}`);
    return;
  }
  if (!latest?.repPdDate || (seed.holdings_asof && latest.repPdDate <= seed.holdings_asof)) {
    console.log(`SEC N-PORT: seed already at ${seed.holdings_asof}`);
    return;
  }
  console.log(`SEC N-PORT: ${seed.holdings_asof} → ${latest.repPdDate} (${latest.accession})`);
  seed.holdings_asof = latest.repPdDate;
  seed.holdings_source = {
    type: "SEC N-PORT-P",
    accession: latest.accession,
    url: latest.url,
    index_url: latest.indexUrl,
    filing_date: latest.filingDate || null,
    net_assets_usd: latest.netAssets,
    positions_reported: latest.holdingsCount,
    note: `Official SOXL filing for period ended ${latest.repPdDate}; top ${latest.holdings.length} positions by SEC-reported percent of net assets (swap rows can be negative and fall outside the top list).`,
  };
  seed.holdings = latest.holdings;
  seed.retrieved_at = new Date().toISOString();
  if (seedPath) fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
}

async function main() {
  const blockers = [];
  const sourcesUsed = [];
  const seedInfo = loadSeed();
  if (!seedInfo.data) {
    console.error("No seed at", SEED_CANDIDATES.join(" | "));
    process.exit(1);
  }
  const seed = seedInfo.data;
  sourcesUsed.push(`Research seed: ${seedInfo.path}`);
  await refreshHoldingsFromSec(seed, seedInfo.path, blockers);
  NPORT_URL = seed.holdings_source?.url || NPORT_URL;
  NPORT_DATE = seed.holdings_asof || null;
  if (seed.holdings_source?.url) sourcesUsed.push(`SEC N-PORT: ${seed.holdings_source.url}`);
  sourcesUsed.push(`Yahoo quote page: ${YAHOO_QUOTE_URL}`);

  for (const b of seed.blockers || []) {
    blockers.push(`${b.url}: ${b.status} — ${b.impact}`);
  }

  console.log("Refreshing Yahoo quote HTML…");
  const liveQuote = await fetchYahooQuoteHtml();
  await sleep(200);
  console.log("Fetching Yahoo news RSS…");
  const liveNews = await fetchYahooNewsRss();

  let quote;
  const asOfNow = new Date().toISOString();

  if (liveQuote.ok) {
    sourcesUsed.push(`Yahoo quote HTML refresh @ ${asOfNow}`);
    // Prefer overnight as "latest" when present; keep regular close nested.
    if (liveQuote.overnight?.price != null) {
      quote = {
        price: liveQuote.overnight.price,
        change: liveQuote.overnight.change,
        changePct: liveQuote.overnight.changePct,
        currency: "USD",
        session: liveQuote.overnight.session,
        source: liveQuote.source,
        regularClose: liveQuote.regular?.price != null ? liveQuote.regular : null,
      };
    } else {
      quote = {
        price: liveQuote.regular.price,
        change: liveQuote.regular.change,
        changePct: liveQuote.regular.changePct,
        currency: "USD",
        session: liveQuote.regular.session,
        source: liveQuote.source,
        regularClose: null,
      };
    }
  } else {
    blockers.push(`Yahoo quote HTML: ${liveQuote.error}`);
    // Fall back to seed (prefer overnight as latest)
    const o = seed.quote;
    quote = {
      price: o.price,
      change: o.change,
      changePct: o.change_pct,
      currency: o.currency || "USD",
      session: o.session || null,
      source: o.source || YAHOO_QUOTE_URL,
      regularClose: o.regular_close
        ? {
            price: o.regular_close.price,
            change: o.regular_close.change,
            changePct: o.regular_close.change_pct,
            session: o.regular_close.session,
            source: o.regular_close.source,
          }
        : null,
    };
    sourcesUsed.push("Quote from research seed (live HTML refresh failed)");
  }

  if (!liveNews.ok) {
    blockers.push(liveNews.error);
  } else {
    sourcesUsed.push(YAHOO_NEWS_RSS);
  }

  // Per-holding return = last completed US session close vs the prior close (Yahoo chart), fetched today.
  // The seed's old recent_change_pct is never shown (it was a one-off research snapshot).
  const dayChanges = new Map();
  for (const h of seed.holdings || []) {
    if (h.instrument_type !== "equity" || !h.ticker || dayChanges.has(h.ticker)) continue;
    const d = await fetchDailyChange(h.ticker, { ua: UA });
    dayChanges.set(h.ticker, d);
    if (!d) blockers.push(`Yahoo chart ${h.ticker}: no completed daily close pair`);
    await sleep(120);
  }
  const holdings = (seed.holdings || []).map((h) => {
    const weightPct = round(h.weight_pct, 4);
    const d = h.ticker ? dayChanges.get(h.ticker) : null;
    const changePct = d ? round(d.changePct, 2) : null;
    // Estimate: weight% × return% / 100 → contribution in percentage points of basket (NOT 3x ETF points)
    const contributionPct =
      weightPct != null && changePct != null ? round((weightPct * changePct) / 100, 4) : null;
    const { reasons, sources } = reasonsForHolding(h);
    if (d?.source) sources.push(d.source);
    return {
      ticker: h.ticker || null,
      name: h.name,
      weightPct,
      price: d ? round(d.close, 2) : null,
      changePct,
      changePctAsOf: d?.date || null,
      contributionPct,
      contributionNote:
        contributionPct != null
          ? "estimate = weightPct × changePct / 100 (basket pts; SOXL is ~3× daily — not equal to ETF pts)"
          : null,
      instrumentType: h.instrument_type || null,
      reasons,
      sources,
    };
  });
  if (dayChanges.size) sourcesUsed.push(`Yahoo chart daily closes for ${dayChanges.size} equity holdings`);

  const news = mergeNews(seed.news, liveNews.items);
  const { overallUpReasons, overallDownReasons } = buildOverallReasons(seed, holdings);
  const events = buildEvents(
    {
      ...quote,
      regularClose: quote.regularClose || (liveQuote.ok ? liveQuote.regular : seed.quote?.regular_close),
    },
    seed
  );

  const payload = {
    market: "US",
    ticker: "SOXL",
    fundName: seed.fund || "Direxion Daily Semiconductor Bull 3X Shares",
    asOf: asOfNow,
    quote: {
      price: quote.price,
      change: quote.change,
      changePct: quote.changePct,
      currency: quote.currency || "USD",
      session: quote.session || null,
      source: quote.source || YAHOO_QUOTE_URL,
      regularClose: quote.regularClose || null,
    },
    holdingsAsOf: seed.holdings_asof || null,
    holdingsSource: seed.holdings_source || null,
    holdingsFreshnessNote: `Holdings weights are from the latest public SOXL SEC N-PORT (period ended ${seed.holdings_asof || "—"}), not a same-day Direxion CSV. Cash + index swaps dominate reported net assets; daily weights change.`,
    leverageNote:
      "SOXL seeks ~3× the daily performance of the ICE Semiconductor Index. Contribution ≈ weight × return is an unlevered basket estimate only; ETF moves are magnified and path-dependent.",
    events,
    news,
    holdings,
    overallUpReasons,
    overallDownReasons,
    disclaimers: [
      "非投資建議。SOXL 為 3 倍日槓桿 ETF，波動與虧損風險極高，不適合長期持有假設。",
      `持股權重來自 SEC N-PORT（截至 ${seed.holdings_asof || "—"}），不是今日即時持股；貢獻度為估算（權重×漲跌），未直接等於 ETF 點數。`,
      "報價來自公開 Yahoo Finance 頁面；缺欄不捏造。",
    ],
    sourcesUsed,
    blockers,
    recentPublicCrosscheck: seed.recent_public_crosscheck || null,
    // Keep blockers for ops logs only — never surface raw URL/HTTP errors in the UI.
    sessionBlocker: null,
  };

  const json = JSON.stringify(payload, null, 2) + "\n";
  fs.mkdirSync(path.dirname(OUT_PUBLIC), { recursive: true });
  fs.writeFileSync(OUT_PUBLIC, json);
  console.log("Wrote", OUT_PUBLIC);
  if (fs.existsSync(path.dirname(OUT_DOCS))) {
    fs.mkdirSync(path.dirname(OUT_DOCS), { recursive: true });
    fs.writeFileSync(OUT_DOCS, json);
    console.log("Wrote", OUT_DOCS);
  }
  console.log(
    `SOXL quote ${payload.quote.price} (${payload.quote.changePct}%) asOf ${payload.asOf}; holdings ${payload.holdings.length}; news ${payload.news.length}; blockers ${blockers.length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
