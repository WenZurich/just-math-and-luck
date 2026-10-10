#!/usr/bin/env node
/**
 * 每日數學選股掃描（美股＋台股）
 * 寫入 stock-ops-study raw + opportunity report，以及 public/data/latest.json（+dated）
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  indexFeaturesFromChart,
  seriesDelta,
  seriesRet,
  computeMarketRegime,
  scoreAdjust,
  passesScreenA,
  listSizeForStance,
  stubRegimeFromLatestIndices,
  buildKostolanyStrategyPack,
} from "./market-regime.mjs";
import {
  sma,
  pctChange,
  volumeRatio as volRatioOf,
  avgVolume,
  rsVsIndex,
  baseRankingScore,
} from "./math-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const STUDY = "/workspace/stock-ops-study";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const US_UNIVERSE = [
  ["AAPL", "Apple", "消費電子／服務與手機生態系。"],
  ["AMD", "Advanced Micro Devices", "CPU／GPU 與資料中心加速晶片。"],
  ["AMZN", "Amazon", "電商、雲端 AWS 與廣告。"],
  ["ARM", "Arm Holdings", "低功耗 CPU 架構授權。"],
  ["ASML", "ASML", "先進半導體微影設備（EUV／DUV）。"],
  ["AVGO", "Broadcom", "通訊／客製化 AI 加速 ASIC 與基礎軟體。"],
  ["CLS", "Celestica", "電子製造服務與資料中心硬體組裝。"],
  ["COIN", "Coinbase", "加密貨幣交易與託管平台。"],
  ["CRWD", "CrowdStrike", "端點與雲端資安平台（防駭、偵測與回應）。"],
  ["ESTC", "Elastic", "搜尋與可觀測性軟體（Elasticsearch）。"],
  ["FTNT", "Fortinet", "防火牆與網路資安硬體／訂閱。"],
  ["GOOGL", "Alphabet", "搜尋、YouTube、雲端與廣告。"],
  ["HOOD", "Robinhood", "零售券商與加密交易 App。"],
  ["INTC", "Intel", "CPU 與晶圓代工轉型中的半導體公司。"],
  ["ISRG", "Intuitive Surgical", "達文西手術機器人。"],
  ["LLY", "Eli Lilly", "製藥（減重／糖尿病與腫瘤等）。"],
  ["META", "Meta Platforms", "社群／短影音與 Reality Labs。"],
  ["MSFT", "Microsoft", "雲端 Azure、Office、Windows 與 AI。"],
  ["MSTR", "MicroStrategy", "商業智慧軟體；資產負債表大量持有比特幣。"],
  ["MU", "Micron", "DRAM／NAND 記憶體。"],
  ["NFLX", "Netflix", "訂閱制串流影音。"],
  ["NVDA", "NVIDIA", "AI／資料中心 GPU 與加速運算。"],
  ["OKTA", "Okta", "身分認證與存取管理（IAM）。"],
  ["PANW", "Palo Alto Networks", "網路與雲端資安平台。"],
  ["QLYS", "Qualys", "弱點掃描與雲端資安。"],
  ["ROKU", "Roku", "串流裝置與廣告平台。"],
  ["SNOW", "Snowflake", "雲端資料倉儲。"],
  ["TSM", "TSMC (ADR)", "先進製程晶圓代工（台積電 ADR）。"],
  ["ZS", "Zscaler", "雲端資安／零信任網路存取。"],
  ["PLTR", "Palantir", "數據分析與政府／企業軟體平台。"],
  ["SMCI", "Super Micro", "AI／高效能伺服器與機架。"],
  ["APP", "AppLovin", "行動廣告與應用變現平台。"],
];

const TW_UNIVERSE = [
  ["1303.TW", "南亞", "塑膠／電子材料與化工業。"],
  ["2303.TW", "聯電", "成熟製程晶圓代工。"],
  ["2308.TW", "台達電", "電源、散熱、工控與資料中心電力解決方案。"],
  ["2317.TW", "鴻海", "電子代工與組裝、電動車與伺服器。"],
  ["2330.TW", "台積電", "先進製程晶圓代工。"],
  ["2345.TW", "智邦", "網通設備與交換器 ODM／OEM。"],
  ["2379.TW", "瑞昱", "網通／多媒體 IC 設計。"],
  ["2382.TW", "廣達", "筆電與 AI 伺服器代工。"],
  ["2408.TW", "南亞科", "DRAM 記憶體。"],
  ["2454.TW", "聯發科", "手機／邊緣 AI SoC 與連線晶片。"],
  ["2468.TW", "華經", "資訊系統整合：雲端／機房、資安與數位化委外。"],
  ["2881.TW", "富邦金", "金控（銀行／壽險／證券）。"],
  ["2882.TW", "國泰金", "金控（銀行／壽險／證券）。"],
  ["2884.TW", "玉山金", "金控／銀行。"],
  ["2891.TW", "中信金", "金控（銀行／證券／壽險等）。"],
  ["3008.TW", "大立光", "高階光學鏡頭。"],
  ["3035.TW", "智原", "ASIC／IP 設計服務。"],
  ["3037.TW", "欣興", "IC 載板與印刷電路板。"],
  ["3443.TW", "創意", "特殊應用 IC 設計服務（NRE／ASIC）。"],
  ["3661.TW", "世芯-KY", "高階 ASIC 設計服務。"],
  ["3711.TW", "日月光投控", "半導體封裝測試。"],
  ["5274.TW", "信驊", "高速傳輸／BMC 等伺服器相關 IC。"],
  ["6226.TW", "光鼎", "LED 封裝與模組；布局功率半導體相關。"],
  ["6669.TW", "緯穎", "超大型資料中心／AI 伺服器與機櫃 ODM。"],
  ["3231.TW", "緯創", "電腦與伺服器代工。"],
  ["2357.TW", "華碩", "主板、筆電與電競／AI PC。"],
  ["2395.TW", "研華", "工業電腦與物聯網邊緣運算。"],
  ["3017.TW", "奇鋐", "散熱模組（筆電／伺服器）。"],
  ["3653.TW", "健策", "散熱與均溫板相關。"],
  ["2327.TW", "國巨", "被動元件（電阻等）。"],
];

function round(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function yahooChart(symbol) {
  const p2 = Math.floor(Date.now() / 1000) + 3600;
  const p1 = p2 - 420 * 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&period1=${p1}&period2=${p2}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) {
    // try .TWO for TW OTC
    return null;
  }
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r?.timestamp?.length) return null;
  const q = r.indicators?.quote?.[0] || {};
  const bars = [];
  for (let i = 0; i < r.timestamp.length; i++) {
    const c = q.close?.[i];
    if (c == null) continue;
    const t = r.timestamp[i];
    const offset = r.meta?.gmtoffset ?? 0;
    const local = new Date((t + offset) * 1000);
    const date = local.toISOString().slice(0, 10);
    bars.push({
      t,
      date,
      o: q.open?.[i] ?? c,
      h: q.high?.[i] ?? c,
      l: q.low?.[i] ?? c,
      c: Number(c),
      v: q.volume?.[i] ?? 0,
    });
  }
  if (!bars.length) return null;
  const m = r.meta || {};
  const rmt = m.regularMarketTime;
  if (rmt) {
    const offset = m.gmtoffset ?? 0;
    const local = new Date((rmt + offset) * 1000);
    const rmtDate = local.toISOString().slice(0, 10);
    const last = bars[bars.length - 1];
    const price = m.fulldayPrice ?? m.regularMarketPrice;
    if (
      price != null &&
      rmtDate > last.date &&
      Math.abs(price - last.c) / Math.max(Math.abs(last.c), 1e-9) > 1e-6
    ) {
      bars.push({
        t: rmt,
        date: rmtDate,
        o: price,
        h: m.regularMarketDayHigh ?? price,
        l: m.regularMarketDayLow ?? price,
        c: Number(price),
        v: m.regularMarketVolume ?? 0,
        appendedFromMeta: true,
      });
    } else if (
      price != null &&
      rmtDate === last.date &&
      Math.abs(price - last.c) / Math.max(Math.abs(last.c), 1e-9) > 0.0005
    ) {
      // prefer completed session meta over stale partial bar
      last.c = Number(price);
      if (m.regularMarketVolume) last.v = m.regularMarketVolume;
      last.fromMeta = true;
    }
  }
  return {
    symbol,
    name: m.shortName || m.longName || symbol,
    currency: m.currency || null,
    exchange: m.exchangeName || null,
    meta: {
      regularMarketPrice: m.regularMarketPrice,
      fulldayPrice: m.fulldayPrice,
      regularMarketChangePercent: m.regularMarketChangePercent,
      fulldayChangePercent: m.fulldayChangePercent,
      regularMarketVolume: m.regularMarketVolume,
      regularMarketTime: m.regularMarketTime
        ? new Date(m.regularMarketTime * 1000).toISOString()
        : null,
      chartPreviousClose: m.chartPreviousClose,
      gmtoffset: m.gmtoffset,
    },
    bars,
  };
}

function computeMetrics(chart) {
  const bars = chart.bars;
  if (bars.length < 25) return null;
  const closes = bars.map((b) => b.c);
  const vols = bars.map((b) => b.v || 0);
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const price = last.c;
  const prevClose = prev.c;
  const dayPct = pctChange(prevClose, price);
  const dayAbs = price - prevClose;
  const idx5 = closes.length - 1 - 5;
  const idx21 = closes.length - 1 - 21;
  const pct5d = idx5 >= 0 ? pctChange(closes[idx5], price) : null;
  const pct1m = idx21 >= 0 ? pctChange(closes[idx21], price) : null;
  const sma20 = sma(closes, 20);
  const sma50 = closes.length >= 50 ? sma(closes, 50) : null;
  const lastVol = vols[vols.length - 1];
  const prev20 = vols.slice(-21, -1);
  const avgVol20 = avgVolume(prev20, { minLen: 10 });
  const volRatio = volRatioOf(lastVol, avgVol20);
  const sma200 = closes.length >= 200 ? sma(closes, 200) : null;
  const highs = bars.map((b) => b.h ?? b.c);
  const lookbackHigh = Math.min(252, highs.length);
  let maxHigh = null;
  if (lookbackHigh >= 20) maxHigh = Math.max(...highs.slice(-lookbackHigh));
  const ddFrom252dHigh =
    maxHigh != null && maxHigh > 0 ? price / maxHigh - 1 : null;
  const pctFromSma200 =
    sma200 != null && sma200 > 0 ? price / sma200 - 1 : null;
  const idx63 = closes.length - 1 - 63;
  const pct63d = idx63 >= 0 ? pctChange(closes[idx63], price) : null;

  return {
    symbol: chart.symbol,
    name: chart.name,
    currency: chart.currency,
    exchange: chart.exchange,
    price: round(price, price >= 1000 ? 2 : price >= 100 ? 2 : 4) ?? price,
    prevClose: round(prevClose, 4),
    dayAbs: round(dayAbs, 4),
    dayPct: round(dayPct, 2),
    d5Pct: round(pct5d, 2),
    d1mPct: round(pct1m, 2),
    d63Pct: pct63d != null ? round(pct63d, 2) : null,
    sma20: round(sma20, 4),
    sma50: sma50 != null ? round(sma50, 4) : null,
    sma200: sma200 != null ? round(sma200, 4) : null,
    above20: sma20 != null ? price >= sma20 : false,
    above50: sma50 != null ? price >= sma50 : false,
    above200: sma200 != null ? price >= sma200 : false,
    ddFrom252dHigh: ddFrom252dHigh != null ? round(ddFrom252dHigh, 4) : null,
    pctFromSma200: pctFromSma200 != null ? round(pctFromSma200, 4) : null,
    volume: lastVol,
    avgVol20: avgVol20 != null ? round(avgVol20, 2) : null,
    volRatio: volRatio != null ? round(volRatio, 2) : null,
    lastBarDate: last.date,
    asOf: chart.meta.regularMarketTime,
    recent: bars.slice(-8).map((b) => ({
      date: b.date,
      c: round(b.c, 4),
      v: b.v,
    })),
    appendedFromMeta: !!last.appendedFromMeta,
    _bars: bars,
  };
}

async function fetchChartRaw(symbol, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      let chart = await yahooChart(symbol);
      if (!chart && symbol.endsWith(".TW")) {
        chart = await yahooChart(symbol.replace(".TW", ".TWO"));
      }
      return chart;
    } catch (e) {
      if (i === retries) {
        console.warn("fail", symbol, e.message);
        return null;
      }
      await sleep(400 * (i + 1));
    }
  }
  return null;
}

async function fetchOne(symbol, retries = 2) {
  const chart = await fetchChartRaw(symbol, retries);
  if (!chart) return null;
  return computeMetrics(chart);
}

function scorePick(m, indexDayPct, { preferVol = true, regime = null } = {}) {
  const score = baseRankingScore(m, indexDayPct, { preferVol });
  const adj = scoreAdjust(score, m, regime, indexDayPct);
  m._regimeNote = adj.regimeNote;
  return adj.score;
}

function passesA(m, indexDayPct, regime = null) {
  return passesScreenA(m, indexDayPct, regime);
}

function screensFor(m, indexDayPct, { forceObserve = false, regime = null } = {}) {
  if (forceObserve) return ["observe"];
  const s = [];
  if (passesA(m, indexDayPct, regime)) s.push("A");
  const volFloor =
    regime?.cycleStance === "defensive"
      ? 1.0
      : regime?.cycleStance === "aggressive"
        ? 1.1
        : 1.2;
  if (m.volRatio != null && m.volRatio >= volFloor) s.push("B");
  // mid-term momentum tag even if day weak
  if (
    !s.includes("A") &&
    (m.d1mPct ?? 0) >= 8 &&
    m.above20 &&
    m.above50 &&
    regime?.cycleStance !== "stabilize_first"
  ) {
    s.push("A");
  }
  if (!s.length) s.push("observe");
  return s;
}

function whyZh(m, indexDayPct, market, regime = null) {
  const parts = [];
  const rs = round(rsVsIndex(m.dayPct, indexDayPct ?? 0), 2);
  if (market === "TW") {
    parts.push(`日漲跌 ${fmtPct(m.dayPct)}，相對加權約 ${rs >= 0 ? "+" : ""}${rs}pp`);
  } else {
    parts.push(`日漲跌 ${fmtPct(m.dayPct)}（相對 S&P 約 ${rs >= 0 ? "+" : ""}${rs}pp）`);
  }
  if (m.d5Pct != null) parts.push(`五日約 ${fmtPct(m.d5Pct)}`);
  if (m.d1mPct != null) parts.push(`一個月約 ${fmtPct(m.d1mPct)}`);
  if (m.volRatio != null && m.volRatio >= 1.2) parts.push(`量比約 ${m.volRatio}×`);
  if (m.above20 && m.above50) parts.push("站上雙均線");
  else if (m.above20) parts.push("站上 SMA20");
  else if (m.above50) parts.push("站上 SMA50");
  if (m.above200) parts.push("站上 SMA200");
  if (m._regimeNote) {
    parts.push(m._regimeNote);
  } else if (regime?.cycleStance) {
    parts.push(
      `市場週期姿態 ${regime.cycleStance}` +
        (regime.psychologyPhase ? `（相位 ${regime.psychologyPhase}）` : "")
    );
  }
  return parts.join("；") + "。";
}

function riskZh(m) {
  const risks = [];
  if (m.dayPct >= 9.5) risks.push("接近漲停，追價風險高");
  if (m.dayPct <= -9.5) risks.push("接近跌停");
  if (m.volRatio != null && m.volRatio >= 5) risks.push("異常放量，波動風險高");
  if (!m.above50 && (m.d1mPct ?? 0) < 0) risks.push("低於 SMA50 或近月偏弱");
  if ((m.d5Pct ?? 0) >= 12 && m.dayPct < 2) risks.push("短線已大漲後追價風險");
  return risks.length ? risks.join("；") : "—";
}

function fmtPct(n) {
  if (n == null) return "—";
  const s = round(n, 2);
  return `${s >= 0 ? "+" : ""}${s}%`;
}

function toPick(m, meta, indexDayPct, market, regime = null) {
  const screens = screensFor(m, indexDayPct, {
    forceObserve: meta.forceObserve,
    regime,
  });
  const pick = {
    ticker: meta.ticker,
    name: meta.nameZh || meta.name,
    price: m.price,
    currency: market === "TW" ? "TWD" : "USD",
    dayPct: m.dayPct,
    pct5d: m.d5Pct,
    pct1m: m.d1mPct,
    volRatio: m.volRatio,
    aboveSma20: !!m.above20,
    aboveSma50: !!m.above50,
    aboveSma200: !!m.above200,
    screens,
    business: meta.business,
    why: whyZh(m, indexDayPct, market, regime),
    risk: riskZh(m),
    cycleStance: regime?.cycleStance ?? null,
    sizeMult: regime?.sizeMult ?? null,
  };
  if (market === "TW") {
    pick.rsVsIndexPp = round(rsVsIndex(m.dayPct, indexDayPct ?? 0), 2);
  }
  if (market === "US" && meta.priorClosePct != null) {
    pick.priorClosePct = meta.priorClosePct;
  }
  return pick;
}

async function main() {
  mkdirSync(STUDY, { recursive: true });
  const fetchedAt = new Date();
  const asOfIso = fetchedAt.toISOString().replace(/\.\d{3}Z$/, "Z");

  const indexSyms = [
    ["^TWII", "tw"],
    ["^GSPC", "spx"],
    ["^IXIC", "nasdaq"],
    ["^DJI", "dji"],
    ["^SOX", "sox"],
    ["USDTWD=X", "usdTwd"],
    ["^TNX", "tnx"],
    ["HYG", "hyg"],
    ["LQD", "lqd"],
  ];

  console.log("Fetching indices / rates / credit...");
  const quotes = [];
  const bySym = {};
  const chartBySym = {};
  for (const [sym] of indexSyms) {
    const chart = await fetchChartRaw(sym);
    await sleep(120);
    if (chart) {
      chartBySym[sym] = chart;
      const m = computeMetrics(chart);
      if (m) {
        // drop heavy bars from quotes dump
        const { _bars, ...rest } = m;
        quotes.push(rest);
        bySym[sym] = m;
        console.log(sym, m.price, m.dayPct, m.lastBarDate);
      }
    } else {
      console.warn("MISSING index", sym);
    }
  }

  if (!bySym["^TWII"] || !bySym["^GSPC"]) {
    const note = `# 美股＋台股機會掃描（數字優先）\n\n> **失敗**：Yahoo 指數資料不可用（${asOfIso}），未編造報價，已中止寫入 latest／commit。\n`;
    writeFileSync(join(STUDY, "opportunity-scan-2026-09-16.md"), note);
    console.error("FATAL: missing core indices");
    process.exit(2);
  }

  console.log("Fetching US...");
  const usMeta = Object.fromEntries(
    US_UNIVERSE.map(([t, n, b]) => [t, { ticker: t, name: n, nameZh: n, business: b }])
  );
  const usMetrics = [];
  for (const [t] of US_UNIVERSE) {
    const m = await fetchOne(t);
    await sleep(100);
    if (m) {
      const { _bars, ...rest } = m;
      quotes.push({ ...rest, universe: "US" });
      usMetrics.push(m);
      console.log(t, m.price, m.dayPct, m.lastBarDate);
    } else console.warn("missing US", t);
  }

  console.log("Fetching TW...");
  const twMeta = Object.fromEntries(
    TW_UNIVERSE.map(([t, n, b]) => [t, { ticker: t, name: n, nameZh: n, business: b }])
  );
  const twMetrics = [];
  for (const [t] of TW_UNIVERSE) {
    const m = await fetchOne(t);
    await sleep(100);
    if (m) {
      const { _bars, ...rest } = m;
      quotes.push({ ...rest, universe: "TW" });
      twMetrics.push(m);
      console.log(t, m.price, m.dayPct, m.lastBarDate);
    } else console.warn("missing TW", t);
  }

  const twIdx = bySym["^TWII"].dayPct;
  const spxIdx = bySym["^GSPC"].dayPct;

  // --- Market regime (US / TW strictly separate) ---
  const spxFeat = chartBySym["^GSPC"]
    ? indexFeaturesFromChart(chartBySym["^GSPC"])
    : null;
  const ndxFeat = chartBySym["^IXIC"]
    ? indexFeaturesFromChart(chartBySym["^IXIC"])
    : null;
  const twFeat = chartBySym["^TWII"]
    ? indexFeaturesFromChart(chartBySym["^TWII"])
    : null;

  const tnxChart = chartBySym["^TNX"];
  const rate = tnxChart
    ? {
        level: tnxChart.bars.at(-1)?.c ?? null,
        d5d: seriesDelta(tnxChart, 5).value,
        d20d: seriesDelta(tnxChart, 20).value,
        d60d: seriesDelta(tnxChart, 60).value,
      }
    : null;
  if (!tnxChart) console.warn("MISSING ^TNX — rate fields → 資料不足");

  const fxRet = chartBySym["USDTWD=X"]
    ? seriesRet(chartBySym["USDTWD=X"], 20)
    : { value: null, gap: true };
  const fx = { d20dRet: fxRet.value };

  let hygVsLqd20d = null;
  if (chartBySym["HYG"] && chartBySym["LQD"]) {
    const h = seriesRet(chartBySym["HYG"], 20).value;
    const l = seriesRet(chartBySym["LQD"], 20).value;
    if (h != null && l != null) hygVsLqd20d = round(h - l, 4);
  }

  const usBreadth =
    usMetrics.length > 0
      ? usMetrics.filter((m) => m.above50).length / usMetrics.length
      : null;
  const twBreadth =
    twMetrics.length > 0
      ? twMetrics.filter((m) => m.above50).length / twMetrics.length
      : null;

  const marketRegime = {
    us: computeMarketRegime({
      market: "US",
      indexFeat: spxFeat,
      secondaryFeat: ndxFeat,
      rate,
      fx: null,
      breadthProxy: usBreadth != null ? round(usBreadth, 3) : null,
      hygVsLqd20d,
    }),
    tw: computeMarketRegime({
      market: "TW",
      indexFeat: twFeat,
      secondaryFeat: null,
      rate, // US10Y as stress proxy only — not pretend TW policy rate
      fx,
      breadthProxy: twBreadth != null ? round(twBreadth, 3) : null,
      hygVsLqd20d: null, // US credit not applied to TW dial
    }),
    frameworkId: "bookshelf-framework-2026-09-16",
    note: "美／台 regime 獨立；缺值標資料不足，不捏造。",
  };
  console.log(
    "regime US",
    marketRegime.us.psychologyPhase,
    marketRegime.us.cycleStance,
    marketRegime.us.liquidityBias
  );
  console.log(
    "regime TW",
    marketRegime.tw.psychologyPhase,
    marketRegime.tw.cycleStance,
    marketRegime.tw.liquidityBias
  );

  // Score and select (weights by cycleStance)
  const usScored = usMetrics
    .map((m) => ({
      m,
      score: scorePick(m, spxIdx, { regime: marketRegime.us }),
      screens: screensFor(m, spxIdx, { regime: marketRegime.us }),
    }))
    .sort((a, b) => b.score - a.score);

  const twScored = twMetrics
    .map((m) => ({
      m,
      score: scorePick(m, twIdx, { regime: marketRegime.tw }),
      screens: screensFor(m, twIdx, { regime: marketRegime.tw }),
    }))
    .sort((a, b) => b.score - a.score);

  const usPass = usScored.filter((x) => x.screens.includes("A"));
  const twPass = twScored.filter((x) => x.screens.includes("A"));

  // Build shortlists ~8-12, ensure TSM / 2330 present; size by stance
  function takeList(scored, pass, mustTickers, n = 12) {
    const out = [];
    const seen = new Set();
    for (const x of pass) {
      if (out.length >= n) break;
      out.push(x);
      seen.add(x.m.symbol);
    }
    for (const t of mustTickers) {
      if (seen.has(t)) continue;
      const hit = scored.find((x) => x.m.symbol === t);
      if (hit) {
        if (out.length >= n) out.pop();
        // mark observe if not passing A strongly
        if (!hit.screens.includes("A")) {
          hit.forceObserve = true;
          hit.screens = ["observe"];
        }
        out.push(hit);
        seen.add(t);
      }
    }
    // fill with next best if short
    for (const x of scored) {
      if (out.length >= n) break;
      if (seen.has(x.m.symbol)) continue;
      out.push(x);
      seen.add(x.m.symbol);
    }
    return out;
  }

  const usN = listSizeForStance(marketRegime.us.cycleStance, 12);
  const twN = listSizeForStance(marketRegime.tw.cycleStance, 12);
  const usList = takeList(usScored, usPass, ["TSM"], usN);
  const twList = takeList(twScored, twPass, ["2330.TW"], twN);

  const usPicks = usList.map((x) => {
    const meta = {
      ...(usMeta[x.m.symbol] || { ticker: x.m.symbol, name: x.m.name, nameZh: x.m.name, business: "" }),
      forceObserve: x.forceObserve,
    };
    const pick = toPick(x.m, meta, spxIdx, "US", marketRegime.us);
    pick._score = x.score;
    return pick;
  });
  const twPicks = twList.map((x) => {
    const meta = {
      ...(twMeta[x.m.symbol] || { ticker: x.m.symbol, name: x.m.name, nameZh: x.m.name, business: "" }),
      forceObserve: x.forceObserve,
    };
    const pick = toPick(x.m, meta, twIdx, "TW", marketRegime.tw);
    pick._score = x.score;
    return pick;
  });

  // Top5 across markets
  const combined = [
    ...usPicks
      .filter((p) => !p.screens.includes("observe"))
      .map((p) => ({
        ...p,
        market: "US",
      })),
    ...twPicks
      .filter((p) => !p.screens.includes("observe"))
      .map((p) => ({
        ...p,
        market: "TW",
      })),
  ].sort((a, b) => (b._score ?? -1e9) - (a._score ?? -1e9));

  const top5 = combined.slice(0, 5).map(({ _score, ...rest }) => rest);
  // do not leak internal scores into published picks
  for (const p of usPicks) delete p._score;
  for (const p of twPicks) delete p._score;

  // Parity TSM / 2330
  const tw2330 = twMetrics.find((m) => m.symbol === "2330.TW");
  const tsm = usMetrics.find((m) => m.symbol === "TSM");
  const yahooFx = bySym["USDTWD=X"]?.price;
  // Prefer known Taipei close if we can; else Yahoo only
  const taipeiFx = yahooFx; // no separate CNA fetch; note in parity
  let parity = null;
  if (tw2330 && tsm && taipeiFx) {
    const implied = (tw2330.price * 5) / taipeiFx;
    const premiumPct = ((tsm.price / implied) - 1) * 100;
    parity = {
      adsRatio: "5:1",
      tw2330: tw2330.price,
      tsm: tsm.price,
      impliedUsdTaipeiFx: round(implied, 2),
      premiumPct: round(premiumPct, 2),
      note: `FX 用 Yahoo USDTWD=X ${round(yahooFx, 3)}（台北外匯官價未另取）；台股用最新收盤、美股用 9/15 收盤；非套利指令。`,
    };
  }

  const indices = {
    tw: {
      name: "台灣加權 TAIEX",
      value: bySym["^TWII"].price,
      dayPct: bySym["^TWII"].dayPct,
      dayAbs: bySym["^TWII"].dayAbs,
    },
    otc: {
      name: "櫃買",
      dayPct: null,
      value: null,
      incomplete: true,
    },
    spx: {
      name: "S&P 500",
      value: bySym["^GSPC"].price,
      dayPct: bySym["^GSPC"].dayPct,
      session: "close",
    },
    nasdaq: {
      name: "Nasdaq",
      value: bySym["^IXIC"].price,
      dayPct: bySym["^IXIC"].dayPct,
      session: "close",
    },
    sox: {
      name: "SOX",
      value: bySym["^SOX"].price,
      dayPct: bySym["^SOX"].dayPct,
      session: "close",
    },
    usdTwd: {
      taipeiClose: null,
      yahoo: yahooFx,
    },
  };
  if (bySym["^DJI"]) {
    indices.dji = {
      name: "Dow Jones",
      value: bySym["^DJI"].price,
      dayPct: bySym["^DJI"].dayPct,
      session: "close",
    };
  }

  const latest = {
    asOf: asOfIso,
    disclaimer:
      "本站內容為依公開行情的數學篩選候選，不是投資建議，亦不保證獲利。",
    timezoneNote:
      "台股為最新收盤（本機 9/16 開盤前＝9/15 收）；美股為 2026-09-15 收盤。以 asOf 為準。",
    indices,
    marketRegime,
    top5,
    us: usPicks,
    tw: twPicks,
    parity,
    method: {
      A: "動能／相對強度：日漲跌 vs 指數；5日／約1個月；SMA20／SMA50／SMA200（依 cycleStance 調整門檻）",
      B: "量能：當日量／近20日均量（防禦相位提高量比門檻）",
      C: "估值 PE（本次未取得可信即時 PE，跳過）",
      R: "市場週期：Kostolany 相位近似＋Marks 溫度＋利率／匯兌流動性（美／台分開）",
    },
  };

  // raw quotes
  const raw = {
    fetched_at_utc: fetchedAt.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC"),
    quotes,
  };

  writeFileSync(
    join(STUDY, "raw-quotes-2026-09-16.json"),
    JSON.stringify(raw, null, 2)
  );

  // opportunity markdown
  const md = buildReport({
    asOfIso,
    fetchedAt,
    indices,
    bySym,
    usPicks,
    twPicks,
    top5,
    parity,
    twIdx,
    spxIdx,
    usMetrics,
    twMetrics,
    marketRegime,
  });
  const asOfDate = asOfIso.slice(0, 10); // YYYY-MM-DD from fetch time
  writeFileSync(join(STUDY, `opportunity-scan-${asOfDate}.md`), md);

  // write public + docs
  const pub = join(ROOT, "public/data");
  const docs = join(ROOT, "docs/data");
  mkdirSync(pub, { recursive: true });
  mkdirSync(docs, { recursive: true });
  const latestJson = JSON.stringify(latest, null, 2);
  writeFileSync(join(pub, "latest.json"), latestJson);
  // Optional follow-up (rate limits): node scripts/fetch-us-options.mjs
  // Weekday with 每日數學選股: npm run fetch-earnings  (讀財報 digest)
  // try { await import('./fetch-earnings.mjs'); } — prefer separate npm run to avoid Yahoo rate limits
  writeFileSync(join(pub, `${asOfDate}.json`), latestJson);
  writeFileSync(join(docs, "latest.json"), latestJson);
  writeFileSync(join(docs, `${asOfDate}.json`), latestJson);

  // Merge 科斯托拉尼／週期 into strategy-screener.json (preserve other packs)
  const kostolanyPack = buildKostolanyStrategyPack({
    marketRegime,
    usMetrics,
    twMetrics,
    usMeta,
    twMeta,
    spxIdx,
    twIdx,
  });
  mergeStrategyPack(pub, docs, kostolanyPack);

  // Optional: FETCH_EARNINGS=1 node scripts/daily-scan.mjs  → also refresh 讀財報
  if (process.env.FETCH_EARNINGS === "1") {
    try {
      const { spawnSync } = await import("node:child_process");
      console.log("\n▶ fetch-earnings (FETCH_EARNINGS=1)…");
      const er = spawnSync(process.execPath, [join(__dirname, "fetch-earnings.mjs")], {
        stdio: "inherit",
        cwd: ROOT,
        timeout: 300000, // 5 min cap so a stalled source cannot hang the whole run
      });
      if (er.status !== 0) console.warn("fetch-earnings exited", er.status);
    } catch (e) {
      console.warn("fetch-earnings skipped:", e?.message || e);
    }
  }


  // Optional: FETCH_US_MACRO=1 → also refresh US market-moving calendar
  if (process.env.FETCH_US_MACRO === "1") {
    try {
      const { spawnSync } = await import("node:child_process");
      console.log("\n▶ fetch-us-macro (FETCH_US_MACRO=1)…");
      const mr = spawnSync(process.execPath, [join(__dirname, "fetch-us-macro-calendar.mjs")], {
        stdio: "inherit",
        cwd: ROOT,
        timeout: 300000, // 5 min cap so a stalled source cannot hang the whole run
      });
      if (mr.status !== 0) console.warn("fetch-us-macro exited", mr.status);
    } catch (e) {
      console.warn("fetch-us-macro skipped:", e?.message || e);
    }
  }

  
  // Optional: FETCH_TW_MACRO=1 → also refresh TW market-moving calendar
  if (process.env.FETCH_TW_MACRO === "1") {
    try {
      const { spawnSync } = await import("node:child_process");
      console.log("\n▶ fetch-tw-macro (FETCH_TW_MACRO=1)…");
      const tr = spawnSync(process.execPath, [join(__dirname, "fetch-tw-macro-calendar.mjs")], {
        stdio: "inherit",
        cwd: ROOT,
        timeout: 300000, // 5 min cap so a stalled source cannot hang the whole run
      });
      if (tr.status !== 0) console.warn("fetch-tw-macro exited", tr.status);
    } catch (e) {
      console.warn("fetch-tw-macro skipped:", e?.message || e);
    }
  }


  
  // Optional: FETCH_TXF=1 → also refresh Taiwan Index Futures desk
  if (process.env.FETCH_TXF === "1") {
    try {
      const { spawnSync } = await import("node:child_process");
      console.log("\n▶ fetch-txf (FETCH_TXF=1)…");
      const xr = spawnSync(process.execPath, [join(__dirname, "fetch-txf-desk.mjs")], {
        stdio: "inherit",
        cwd: ROOT,
        timeout: 300000, // 5 min cap so a stalled source cannot hang the whole run
      });
      if (xr.status !== 0) console.warn("fetch-txf exited", xr.status);
    } catch (e) {
      console.warn("fetch-txf skipped:", e?.message || e);
    }
  }

console.log("\nWrote latest.json");
  console.log("Top5:", top5.map((t) => `${t.ticker} ${t.dayPct}%`).join(", "));
  console.log("US", usPicks.length, "TW", twPicks.length);
  console.log("asOf", asOfIso);
  console.log(
    "regime",
    "US",
    marketRegime.us.cycleStance,
    "/",
    "TW",
    marketRegime.tw.cycleStance
  );
}

function mergeStrategyPack(pubDir, docsDir, pack) {
  for (const dir of [pubDir, docsDir]) {
    const fp = join(dir, "strategy-screener.json");
    if (!existsSync(fp)) {
      console.warn("skip strategy merge, missing", fp);
      continue;
    }
    let data;
    try {
      data = JSON.parse(readFileSync(fp, "utf8"));
    } catch (e) {
      console.warn("strategy-screener parse fail", e.message);
      continue;
    }
    const strategies = Array.isArray(data.strategies) ? data.strategies : [];
    const idx = strategies.findIndex((s) => s.id === pack.id);
    if (idx >= 0) strategies[idx] = pack;
    else strategies.push(pack);
    data.strategies = strategies;
    const order = data.categoryOrder || ["精選", "價量", "籌碼", "財務", "大師"];
    if (!order.includes("週期")) {
      // place 週期 before 大師
      const mi = order.indexOf("大師");
      if (mi >= 0) order.splice(mi, 0, "週期");
      else order.push("週期");
    }
    data.categoryOrder = order;
    data.kostolanyRegimeAsOf = new Date().toISOString();
    writeFileSync(fp, JSON.stringify(data, null, 2));
    console.log("Merged strategy pack", pack.id, "→", fp, "hits", pack.hits.length);
  }
}

function buildReport(ctx) {
  const {
    asOfIso,
    fetchedAt,
    indices,
    bySym,
    usPicks,
    twPicks,
    top5,
    parity,
    twIdx,
    spxIdx,
    marketRegime,
  } = ctx;
  const gen = fetchedAt.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
  const lines = [];
  lines.push("# 美股＋台股機會掃描（數字優先）");
  lines.push("");
  lines.push(`> **資料抓取時間（UTC）**：${asOfIso.replace("T", " ").replace("Z", " UTC")}`);
  lines.push(`> **報告產生時間（UTC）**：${gen}`);
  lines.push(
    `> **性質**：依公開報價做的**透明篩選候選**，不是獲利保證，亦非投資建議。`
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 1. 方法與資料來源");
  lines.push("");
  lines.push("### 實際使用的篩選（有數據才算）");
  lines.push("");
  lines.push("| 代碼 | 篩選 | 計算方式 |");
  lines.push("|------|------|----------|");
  lines.push(
    "| **A 動能／相對強度** | 1日漲跌幅 vs 本地指數；5日／約1個月（21交易日）報酬；價格是否高於 SMA20／SMA50 | Yahoo Finance `v8/finance/chart` 日線收盤序列現場計算 |"
  );
  lines.push("| **B 量能** | 當日成交量 / 近20日均量（若可得） | 同上 volume 欄位 |");
  lines.push("| **C 品質／估值** | PE 等 | **本次未取得可信即時 PE，故未使用** |");
  lines.push("");
  lines.push("### 資料來源");
  lines.push("");
  lines.push("- **報價／歷史序列**：Yahoo Finance chart API（`query1.finance.yahoo.com/v8/finance/chart/...`）");
  lines.push("- **USD/TWD**：Yahoo `USDTWD=X`（台北外匯官價本次未另取，標 null）");
  lines.push("- **TSM ADS 比例**：沿用 Citi DR **5:1**");
  lines.push("");
  lines.push("### 時段說明（重要）");
  lines.push("");
  lines.push("| 市場 | 狀態（以抓取當下） | 本報告主用價格 |");
  lines.push("|------|-------------------|----------------|");
  lines.push("| **台股 TWSE** | 2026-09-16 開盤前 | **2026-09-15 收盤價** |");
  lines.push("| **美股** | 2026-09-15 已收盤 | **2026-09-15 收盤價** |");
  lines.push("");
  lines.push("原始 JSON：`/workspace/stock-ops-study/raw-quotes-2026-09-16.json`");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 2. 指數與匯率快照");
  lines.push("");
  lines.push("### 台股（2026-09-15 收盤）");
  lines.push("");
  lines.push("| 項目 | 數值 | 來源 |");
  lines.push("|------|------|------|");
  lines.push(
    `| 台灣加權 TAIEX (^TWII) | **${fmtNum(indices.tw.value)}**，日漲跌 **${fmtPct(indices.tw.dayPct)}**（${indices.tw.dayAbs} 點） | Yahoo 收盤序列 |`
  );
  lines.push("| 櫃買 OTC | **未取得**（incomplete） | — |");
  lines.push("");
  lines.push("### 美股（2026-09-15 收盤）");
  lines.push("");
  lines.push("| 指數 | 收盤 | 日漲跌 | 約5日 | 約1個月 |");
  lines.push("|------|------|--------|-------|----------|");
  for (const [sym, key] of [
    ["^GSPC", "spx"],
    ["^IXIC", "nasdaq"],
    ["^DJI", "dji"],
    ["^SOX", "sox"],
  ]) {
    const m = bySym[sym];
    if (!m) continue;
    lines.push(
      `| ${indices[key]?.name || sym} | ${fmtNum(m.price)} | ${fmtPct(m.dayPct)} | ${fmtPct(m.d5Pct)} | ${fmtPct(m.d1mPct)} |`
    );
  }
  lines.push("");
  lines.push("### 匯率 USD/TWD");
  lines.push("");
  lines.push("| 來源 | 數值 | 備註 |");
  lines.push("|------|------|------|");
  lines.push("| 台北外匯市場收盤 | **未另取** | parity.taipeiClose=null |");
  lines.push(
    `| Yahoo \`USDTWD=X\` | **${indices.usdTwd.yahoo}**（日變約 ${fmtPct(bySym["USDTWD=X"]?.dayPct)}） | 用於 parity 折算 |`
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 2b. 市場週期 regime（美／台分開）");
  lines.push("");
  lines.push("來源：`scripts/study/bookshelf-framework-2026-09-16`（Kostolany／Marks／利率操作規則；無版權原文）。");
  lines.push("");
  if (marketRegime) {
    for (const key of ["us", "tw"]) {
      const r = marketRegime[key];
      if (!r) continue;
      lines.push(`### ${key.toUpperCase()}`);
      lines.push("");
      lines.push("| 欄位 | 值 |");
      lines.push("|------|-----|");
      lines.push(`| psychologyPhase | **${r.psychologyPhase ?? "資料不足"}** |`);
      lines.push(`| cycleStance | **${r.cycleStance ?? "資料不足"}** |`);
      lines.push(`| liquidityBias | **${r.liquidityBias ?? "資料不足"}** |`);
      lines.push(`| temperatureScore | ${r.temperatureScore ?? "資料不足"} |`);
      lines.push(`| sizeMult | ${r.sizeMult ?? "—"} |`);
      if (r.dataGaps?.length) {
        lines.push(`| dataGaps | ${r.dataGaps.join(", ")} |`);
      }
      lines.push("");
      for (const im of r.implications || []) {
        lines.push(`- ${im}`);
      }
      lines.push("");
    }
  } else {
    lines.push("資料不足：未計算 marketRegime。");
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push("## 3. 美股短名單");
  lines.push("");
  lines.push(`基準：S&P 日漲跌 **${fmtPct(spxIdx)}**。貨幣：**USD**。`);
  lines.push("");
  lines.push(
    "| Ticker | 收盤價 | 日% | 5日% | 1個月% | vs S&P(日) | >SMA20 | >SMA50 | 量比 | 篩選 | 風險 |"
  );
  lines.push(
    "|--------|--------|-----|------|--------|------------|--------|--------|------|------|------|"
  );
  for (const p of usPicks) {
    const rs = round(p.dayPct - spxIdx, 2);
    lines.push(
      `| **${p.ticker}** (${p.name}) | ${p.price} | ${fmtPct(p.dayPct)} | ${fmtPct(p.pct5d)} | ${fmtPct(p.pct1m)} | ${rs >= 0 ? "+" : ""}${rs}pp | ${p.aboveSma20 ? "Y" : "N"} | ${p.aboveSma50 ? "Y" : "N"} | ${p.volRatio ?? "—"} | ${p.screens.join("+")} | ${p.risk} |`
    );
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 4. 台股短名單");
  lines.push("");
  lines.push(`基準：加權 **${fmtPct(twIdx)}**。貨幣：**TWD**。RS = 個股日% − 加權日%。`);
  lines.push("");
  lines.push(
    "| Ticker | 收盤價 | 日% | RS vs 加權 | 5日% | 1個月% | >SMA20 | >SMA50 | 量比 | 篩選 | 風險 |"
  );
  lines.push(
    "|--------|--------|-----|------------|------|--------|--------|--------|------|------|------|"
  );
  for (const p of twPicks) {
    lines.push(
      `| **${p.ticker}** (${p.name}) | ${fmtNum(p.price)} | ${fmtPct(p.dayPct)} | ${p.rsVsIndexPp >= 0 ? "+" : ""}${p.rsVsIndexPp}pp | ${fmtPct(p.pct5d)} | ${fmtPct(p.pct1m)} | ${p.aboveSma20 ? "Y" : "N"} | ${p.aboveSma50 ? "Y" : "N"} | ${p.volRatio ?? "—"} | ${p.screens.join("+")} | ${p.risk} |`
    );
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 5. 跨市場：TSM（ADR）vs 2330.TW 平價素描");
  lines.push("");
  lines.push("**ADS 比例**：ORD:DR = **5 : 1**。");
  lines.push("");
  if (parity) {
    lines.push("| 項目 | 數值 |");
    lines.push("|------|------|");
    lines.push(`| 2330.TW 收盤 | **${fmtNum(parity.tw2330)} TWD** |`);
    lines.push(`| TSM 收盤 | **${parity.tsm} USD** |`);
    lines.push(`| Implied（Yahoo FX） | **${parity.impliedUsdTaipeiFx} USD** |`);
    lines.push(`| 溢價 | **約 ${parity.premiumPct >= 0 ? "+" : ""}${parity.premiumPct}%** |`);
    lines.push("");
    lines.push(parity.note);
  } else {
    lines.push("平價資料不足（缺 TSM 或 2330 或 FX）。");
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 6. 綜合 Top 5");
  lines.push("");
  lines.push("依相對強度 ×（量能或五日動能）排序；不是勝率預測。");
  lines.push("");
  top5.forEach((p, i) => {
    lines.push(
      `${i + 1}. **${p.ticker} ${p.name}**（${p.market}）— 日 ${fmtPct(p.dayPct)}；五日 ${fmtPct(p.pct5d)}；${p.why}`
    );
  });
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 7. 免責聲明");
  lines.push("");
  lines.push("- 本文件**不是投資建議**，不承諾、不暗示任何標的會獲利。");
  lines.push("- 所列股票僅為依公開數據可計算的**相對機會候選**；篩選通過 ≠ 未來上漲。");
  lines.push("- 台股為 9/15 收盤；美股為 9/15 收盤（Asia/Taipei 9/16 上午產出）。");
  lines.push("- 凡標 incomplete／未取得者，**故意留白**，不以猜測填補。");
  lines.push("- 交易前請自行核對交易所／券商報價、除權息、漲跌停與自身風險承受度。");
  lines.push("");
  return lines.join("\n");
}

function fmtNum(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 4 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
