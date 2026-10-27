/**
 * Gooaye（股癌）-inspired strategy packs — public Yahoo/TWSE OHLCV only.
 * Themes from gooaye-framework-2026-09-16 (original summaries; no transcripts).
 * US and TW packs are separate; never invents chip/branch data.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { techSnapshotFromBars } from "./math-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function cond(text, status = "pass") {
  return { text, status };
}

function round(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

// SMA / volume ratio / day-5d-1m % / above-SMA flags: math-core.techSnapshotFromBars (guarded, 2026-10-28;
// same arithmetic as the former inline techFromBars, junk bars ⇒ null instead of NaN/Infinity)
export function techFromBars(bars) {
  return techSnapshotFromBars(bars, { minBars: 60 });
}

/** Public mega-cap / semi chain watchlists (not tips; fixed for reproducibility). */
export const TW_SEMICON_CHAIN = [
  { ticker: "2330.TW", name: "台積電" },
  { ticker: "2454.TW", name: "聯發科" },
  { ticker: "2303.TW", name: "聯電" },
  { ticker: "3711.TW", name: "日月光投控" },
  { ticker: "3034.TW", name: "聯詠" },
  { ticker: "2379.TW", name: "瑞昱" },
  { ticker: "3661.TW", name: "世芯-KY" },
  { ticker: "3035.TW", name: "智原" },
  { ticker: "3443.TW", name: "創意" },
  { ticker: "2383.TW", name: "台光電" },
  { ticker: "3189.TW", name: "景碩" },
  { ticker: "2301.TW", name: "光寶科" },
  { ticker: "2344.TW", name: "華邦電" },
  { ticker: "2408.TW", name: "南亞科" },
  { ticker: "6770.TW", name: "力積電" },
];

export const US_MEGA_TECH_SEMI = [
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "AVGO", name: "Broadcom" },
  { ticker: "TSM", name: "TSMC ADR" },
  { ticker: "AMD", name: "AMD" },
  { ticker: "ASML", name: "ASML" },
  { ticker: "AMAT", name: "Applied Materials" },
  { ticker: "LRCX", name: "Lam Research" },
  { ticker: "KLAC", name: "KLA" },
  { ticker: "MU", name: "Micron" },
  { ticker: "QCOM", name: "Qualcomm" },
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "META", name: "Meta" },
  { ticker: "AMZN", name: "Amazon" },
];

function isFomoThin(m) {
  return (
    m.dayPct != null &&
    m.dayPct >= 7 &&
    m.volRatio != null &&
    m.volRatio < 0.9 &&
    m.pct5d != null &&
    m.pct5d >= 12
  );
}

function isFatThinRocket(m) {
  return m.pct1m != null && m.pct1m >= 15 && m.volRatio != null && m.volRatio < 0.8;
}

function hitBase(ticker, name, market, m, extra = {}) {
  return {
    ticker,
    name,
    market,
    currency: market === "TW" ? "TWD" : "USD",
    metrics: {
      price: round(m.price, 2),
      dayPct: round(m.dayPct, 2),
      pct5d: round(m.pct5d, 2),
      pct1m: round(m.pct1m, 2),
      volRatio: round(m.volRatio, 2),
      aboveSma20: !!m.aboveSma20,
      aboveSma50: !!m.aboveSma50,
      aboveSma200: m.aboveSma200 == null ? null : !!m.aboveSma200,
      ...extra,
    },
  };
}

/**
 * Resolve OHLCV: prefer ohlcvMap; else null.
 */
function resolveTech(ticker, ohlcvMap) {
  const chart = ohlcvMap?.get?.(ticker) || ohlcvMap?.[ticker];
  if (!chart?.bars) return null;
  return techFromBars(chart.bars);
}

export function buildGooayeTwSemiconChain(ohlcvMap) {
  const hits = [];
  let missing = 0;
  for (const row of TW_SEMICON_CHAIN) {
    const m = resolveTech(row.ticker, ohlcvMap);
    if (!m) {
      missing++;
      continue;
    }
    if (!m.aboveSma20 || !m.aboveSma50) continue;
    if (m.volRatio == null || m.volRatio < 0.85) continue;
    if (isFomoThin(m) || isFatThinRocket(m)) continue;
    // TW liquidity proxy: avgVol5 in shares — if available require ≥ 300k (300張)
    if (m.avgVol5 != null && m.avgVol5 < 300_000) continue;
    hits.push(
      hitBase(row.ticker, row.name, "TW", m, {
        chain: "tw_semicon_mega",
        avgVol5Zhang: m.avgVol5 != null ? round(m.avgVol5 / 1000, 1) : null,
      })
    );
  }
  hits.sort((a, b) => (b.metrics.volRatio ?? 0) - (a.metrics.volRatio ?? 0));
  const incomplete = hits.length === 0 && missing === TW_SEMICON_CHAIN.length;
  return {
    id: "gooaye-tw-semicon-chain",
    name: "股癌包｜台股半導體鏈強勢",
    category: "綜合",
    categoryGroup: "綜合",
    xqTags: ["綜合", "股癌", "半導體"],
    market: "TW",
    status: "candidate",
    plainTakeaways: [
      "看一籃子權值／半導體鏈，不單壓一檔護國神山",
      "需站上短中期均線，且量能不太縮",
      "排除爆量不足的追高紅K",
    ],
    description:
      "Gooaye 公開主題近似：護國神山供應鏈／權值核心用「籃子」檢視強弱（Yahoo OHLCV）。非節目喊單、非投資建議；不含分點籌碼。",
    conditions: [
      cond("標的屬於公開可追蹤的台股半導體／權值鏈觀察清單"),
      cond("收盤站上 SMA20 與 SMA50"),
      cond("近 20 日量比大致不縮（量比 ≳ 0.85）"),
      cond("排除薄量追高／一個月噴很凶但量能發虛的標的"),
      cond("流動性足夠（5 日均量代理 ≥ 約 300 張）"),
    ],
    hits,
    blockers: incomplete ? ["觀察清單 OHLCV 皆無法取得"] : [],
    incomplete,
    incompleteLabel: incomplete ? "資料不足" : undefined,
    notes: [
      `清單 ${TW_SEMICON_CHAIN.length} 檔 · 命中 ${hits.length} · 缺行情 ${missing}`,
      "來源：scripts/study/gooaye-framework-2026-09-16（G1/G5/G9）",
    ],
    calibrationNotes: {
      status: "candidate",
      matchedXq: ["公開 Yahoo 日K／均線／量比"],
      stillDiffers: [
        "清單為公開常見大型半導體鏈代號，不是節目私房單",
        "無分點／券商籌碼；數學閘門未做完整樣本外驗證",
      ],
      source: "scripts/study/gooaye-framework-2026-09-16",
      olympiadGate: "user-ordered redesign; shipped as candidate with honest calibration",
    },
  };
}

/**
 * @param {Map|object} ohlcvMap
 * @param {{ dUs10Y_20d?: number|null, liquidityBias?: string|null }} rateCtx
 */
export function buildGooayeUsRiskOn(ohlcvMap, rateCtx = {}) {
  const d20 = rateCtx.dUs10Y_20d;
  let regime = "neutral";
  if (d20 != null && Number.isFinite(d20)) {
    if (d20 <= 0) regime = "risk_on";
    else if (d20 >= 0.25) regime = "risk_off";
    else regime = "selective";
  } else if (rateCtx.liquidityBias === "risk_on") regime = "risk_on";
  else if (rateCtx.liquidityBias === "risk_off") regime = "risk_off";

  const volFloor = regime === "risk_off" ? 1.1 : regime === "selective" ? 0.95 : 0.85;
  const hits = [];
  let missing = 0;
  for (const row of US_MEGA_TECH_SEMI) {
    const m = resolveTech(row.ticker, ohlcvMap);
    if (!m) {
      missing++;
      continue;
    }
    if (regime === "risk_off" && !(m.aboveSma50 && m.aboveSma200)) continue;
    if (regime !== "risk_off" && !m.aboveSma50) continue;
    if (m.volRatio == null || m.volRatio < volFloor) continue;
    if (isFomoThin(m) || isFatThinRocket(m)) continue;
    if (m.avgVol5 != null && m.avgVol5 < 500_000) continue;
    hits.push(
      hitBase(row.ticker, row.name, "US", m, {
        rateRegime: regime,
        dUs10Y_20d: d20 ?? null,
        volFloor,
      })
    );
  }
  hits.sort((a, b) => (b.metrics.volRatio ?? 0) - (a.metrics.volRatio ?? 0));
  const rateSkip = d20 == null && !rateCtx.liquidityBias;
  return {
    id: "gooaye-us-risk-on",
    name: "股癌包｜美股利率／風險偏好代理",
    category: "綜合",
    categoryGroup: "綜合",
    xqTags: ["綜合", "股癌", "利率"],
    market: "US",
    status: "candidate",
    plainTakeaways: [
      "用美債利率方向當風險偏好溫度計（只影響美股包）",
      "偏風險偏好時看大型科技／半導體是否仍站上均線且有量",
      "利率急升時提高門檻，不跟薄量追高",
    ],
    description:
      "Gooaye 總經／聯準會主題近似：美債殖利率 20 日變化作 risk-on／off 代理，再篩美股大型科技與半導體（與台股包分開）。非投資建議。",
    conditions: [
      cond(
        rateSkip
          ? "美債 20 日變化缺值 → 以中性門檻篩選（不捏造利率）"
          : `美債 20 日變化約 ${d20 != null ? round(d20, 3) + "pp" : "—"} → 代理區間「${regime}」`,
        rateSkip ? "skip" : "pass"
      ),
      cond("標的為公開大型科技／半導體觀察清單（美股）"),
      cond(regime === "risk_off" ? "需同時站上 SMA50 與 SMA200" : "收盤站上 SMA50"),
      cond(`量比需高於本區間門檻（約 ${volFloor}×）`),
      cond("排除薄量追高與發虛噴出"),
    ],
    hits,
    blockers: [],
    incomplete: false,
    notes: [
      `rateRegime=${regime} dUs10Y_20d=${d20 ?? "資料不足"} · hits=${hits.length} · missing=${missing}`,
      "來源：gooaye-framework G4/G5/G2；台美不混包",
    ],
    calibrationNotes: {
      status: "candidate",
      matchedXq: ["^TNX 變化＋Yahoo 美股日K"],
      stillDiffers: ["利率門檻為啟發式代理，非節目參數", "未使用選擇權／信用利差完整模型"],
      source: "scripts/study/gooaye-framework-2026-09-16",
      olympiadGate: "user-ordered redesign; candidate until longer calibration",
    },
  };
}

export function buildGooayeTwVolBreakout(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe || []) {
    if (u.market !== "TW") continue;
    const m = resolveTech(u.ticker, ohlcvMap);
    if (!m) continue;
    if (!m.aboveSma20) continue;
    if (m.volRatio == null || m.volRatio < 1.5) continue;
    if (m.avgVol5 != null && m.avgVol5 < 300_000) continue;
    if (isFomoThin(m)) continue;
    // Prefer constructive breakouts: day not limit-euphoria without volume already handled
    hits.push(
      hitBase(u.ticker, u.name || u.ticker, "TW", m, {
        avgVol5Zhang: m.avgVol5 != null ? round(m.avgVol5 / 1000, 1) : null,
        pack: "vol_breakout",
      })
    );
  }
  hits.sort((a, b) => (b.metrics.volRatio ?? 0) - (a.metrics.volRatio ?? 0));
  return {
    id: "gooaye-tw-vol-breakout",
    name: "股癌包｜台股量能突破（去 FOMO）",
    category: "技術",
    categoryGroup: "技術",
    xqTags: ["技術", "股癌", "價量"],
    market: "TW",
    status: "adopted",
    plainTakeaways: [
      "放量且站上短均線，才比較像有人真的在接力",
      "紅K很兇但量發虛 → 當散戶追價雜訊濾掉",
      "法人同步另見「法人同步做多」；本包不含分點籌碼",
    ],
    description:
      "Gooaye 風險／散戶心理主題近似：量能突破＋去薄量追高。與既有「法人同步做多」並存；本包純 OHLCV，不發明籌碼。",
    conditions: [
      cond("台股宇宙；收盤站上 SMA20"),
      cond("量比 ≳ 1.5（相對近 20 日均量）"),
      cond("5 日均量代理 ≥ 約 300 張"),
      cond("排除「大漲＋薄量＋五日已噴」的追價型態"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
    notes: ["可與 inst-sync 並讀；G11 的籌碼半邊不在此包捏造", "status=adopted（OHLCV 規則單純、可重現）"],
    calibrationNotes: {
      status: "adopted",
      matchedXq: ["量比突破＋均線", "FOMO 薄量降權"],
      stillDiffers: ["未接分點／券商；門檻非 XQ 專有條件一字不差"],
      source: "scripts/study/gooaye-framework-2026-09-16",
      olympiadGate: "OHLCV-only; math-guards cover SMA/volRatio primitives",
    },
  };
}

export function buildGooayeUsFomoFilter(universe, ohlcvMap) {
  const hits = [];
  for (const u of universe || []) {
    if (u.market !== "US") continue;
    const m = resolveTech(u.ticker, ohlcvMap);
    if (!m) continue;
    if (!m.aboveSma50) continue;
    if (m.volRatio == null || m.volRatio < 1.0) continue;
    if (m.avgVol5 != null && m.avgVol5 < 500_000) continue;
    if (isFomoThin(m) || isFatThinRocket(m)) continue;
    // quality momentum: modest positive 5d not required but prefer not crashed
    if (m.pct5d != null && m.pct5d < -8) continue;
    hits.push(hitBase(u.ticker, u.name || u.ticker, "US", m, { pack: "us_fomo_filter" }));
  }
  hits.sort((a, b) => (b.metrics.volRatio ?? 0) - (a.metrics.volRatio ?? 0));
  return {
    id: "gooaye-us-fomo-filter",
    name: "股癌包｜美股去 FOMO 動能",
    category: "技術",
    categoryGroup: "技術",
    xqTags: ["技術", "股癌", "價量"],
    market: "US",
    status: "candidate",
    plainTakeaways: [
      "只要站上中期均線、量能不虛的動能",
      "濾掉薄量噴出與一個月發虛火箭",
      "與台股包分開，不混成世界心情分數",
    ],
    description:
      "Gooaye 散戶心理／風險控管主題近似（美股宇宙）：有量的均線上方動能，去掉薄量追高。候選狀態，待更長樣本校正。",
    conditions: [
      cond("美股宇宙；收盤站上 SMA50"),
      cond("量比 ≳ 1.0"),
      cond("流動性足夠（5 日均量 ≳ 50 萬股）"),
      cond("排除薄量追高與發虛噴出；五日大跌過深者不進"),
    ],
    hits: hits.slice(0, 80),
    blockers: [],
    incomplete: false,
    notes: ["G2/G6；candidate"],
    calibrationNotes: {
      status: "candidate",
      matchedXq: ["均線＋量比＋流動性"],
      stillDiffers: ["FOMO 門檻啟發式", "宇宙取決於當日掃描清單"],
      source: "scripts/study/gooaye-framework-2026-09-16",
      olympiadGate: "user-ordered; candidate",
    },
  };
}

export function gooayeUniverseBoost() {
  return [
    ...TW_SEMICON_CHAIN.map((r) => ({ ticker: r.ticker, name: r.name, market: "TW" })),
    ...US_MEGA_TECH_SEMI.map((r) => ({ ticker: r.ticker, name: r.name, market: "US" })),
  ];
}

export function buildAllGooayePacks({ universe, ohlcvMap, rateCtx }) {
  return [
    buildGooayeTwSemiconChain(ohlcvMap),
    buildGooayeUsRiskOn(ohlcvMap, rateCtx || {}),
    buildGooayeTwVolBreakout(universe, ohlcvMap),
    buildGooayeUsFomoFilter(universe, ohlcvMap),
  ];
}

/** Merge packs into strategy-screener.json without full rescreen. */
export function mergeGooayePacksIntoScreener(screenerPath, packs) {
  const data = JSON.parse(fs.readFileSync(screenerPath, "utf8"));
  const strategies = data.strategies || [];
  for (const pack of packs) {
    const idx = strategies.findIndex((s) => s.id === pack.id);
    if (idx >= 0) strategies[idx] = pack;
    else strategies.push(pack);
  }
  if (!data.categoryOrder) data.categoryOrder = ["大師", "基本", "籌碼", "技術", "綜合", "週期"];
  data.strategies = strategies;
  data.gooayePacksAsOf = new Date().toISOString();
  fs.writeFileSync(screenerPath, JSON.stringify(data, null, 2));
  return data;
}

export function loadFrameworkMeta() {
  const p = path.join(__dirname, "study/gooaye-framework-2026-09-16.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
