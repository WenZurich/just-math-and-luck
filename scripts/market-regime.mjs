/**
 * Kostolany egg + Howard Marks temperature + rate regime (US/TW separate).
 * Operational rules only — see scripts/study/bookshelf-framework-2026-09-16.*
 * Never invents numbers; missing inputs → 資料不足 notes.
 * Pure SMA / returns / volume helpers: ./math-core.mjs (guarded by math-guards).
 */

import { sma, retChange as pctChange, volumeRatioObserved, pctFromSma, peakInWindow, drawdownFromPeak, atrPct, isFiniteNumber, priorWindowDrawdown, atrBottomQuartile as atrBottomQuartileOf, lagChange, regimeScoreAdjust, screenAPass, stanceListSize } from "./math-core.mjs";

export const PHASE_TO_STANCE = {
  euphoric: "defensive",
  late_optimism: "selective",
  mid_cycle: "balanced",
  cautious_recovery: "constructive",
  despondent: "aggressive",
  panic: "stabilize_first",
};

export const STANCE_SIZE_MULT = {
  defensive: 0.5,
  selective: 0.8,
  balanced: 1.0,
  constructive: 1.1,
  aggressive: 1.35,
  stabilize_first: 0.3,
};

function round(n, d = 4) {
  if (n == null || Number.isNaN(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

/** True range ATR% of close over last 20 bars — pure math in math-core.atrPct (guarded). */
function atrPct20(bars) {
  return atrPct(bars, { window: 20, minTr: 10 });
}

/**
 * Rich index / series features from chart bars (computeMetrics-compatible or raw bars).
 * Pass full chart with .bars preferred.
 */
export function indexFeaturesFromChart(chart) {
  if (!chart?.bars?.length) return null;
  const bars = chart.bars;
  const closes = bars.map((b) => b.c);
  const highs = bars.map((b) => b.h ?? b.c);
  const vols = bars.map((b) => b.v); // missing/0 → null inside volumeRatioObserved (never zero-filled)
  const last = bars[bars.length - 1];
  const price = last.c;
  const gaps = [];

  const sma20 = sma(closes, 20);
  const sma50 = closes.length >= 50 ? sma(closes, 50) : null;
  const sma200 = closes.length >= 200 ? sma(closes, 200) : null;
  if (sma200 == null) gaps.push("SMA200");

  const lookbackHigh = Math.min(252, highs.length);
  let maxHigh = null;
  if (lookbackHigh >= 20) {
    maxHigh = peakInWindow(highs, lookbackHigh);
  } else {
    gaps.push("dd_from_252d_high");
  }
  const ddFrom252dHigh = maxHigh != null ? drawdownFromPeak(price, maxHigh) : null;

  const pctFromSma200 = sma200 != null ? pctFromSma(price, sma200) : null;

  const idx5 = closes.length - 1 - 5;
  const idx10 = closes.length - 1 - 10;
  const idx21 = closes.length - 1 - 21;
  const idx63 = closes.length - 1 - 63;
  const ret5d = idx5 >= 0 ? pctChange(closes[idx5], price) : null;
  const ret10d = idx10 >= 0 ? pctChange(closes[idx10], price) : null;
  const ret21d = idx21 >= 0 ? pctChange(closes[idx21], price) : null;
  const ret63d = idx63 >= 0 ? pctChange(closes[idx63], price) : null;
  if (ret63d == null) gaps.push("ret_63d");

  const indexVolRatio20 = volumeRatioObserved(vols, { window: 20, minLen: 10 }).ratio;
  if (indexVolRatio20 == null) gaps.push("index_vol_ratio_20");

  const atr = atrPct20(bars);
  if (atr == null) gaps.push("ATR_pct_20");

  // ATR%(20) bottom quartile vs the trailing ~252 sessions — math-core.atrBottomQuartile (guarded)
  const atrQ = atrBottomQuartileOf(bars, { window: 20, minTr: 10 });
  const atrBottomQuartile = atrQ.flag;
  if (atrQ.gap) gaps.push("ATR_pct_20_quartile");

  const near52wHigh =
    ddFrom252dHigh != null ? ddFrom252dHigh >= -0.02 : null;

  // prior 10d drawdown for K6 — math-core.priorWindowDrawdown (guarded; order-blind min/max − 1, see note there)
  const prior10dDd = priorWindowDrawdown(closes, 10);

  const dayPct =
    closes.length >= 2
      ? pctChange(closes[closes.length - 2], price) * 100
      : null;

  return {
    price,
    lastBarDate: last.date,
    dayPct: dayPct != null ? round(dayPct, 2) : null,
    sma20: sma20 != null ? round(sma20, 4) : null,
    sma50: sma50 != null ? round(sma50, 4) : null,
    sma200: sma200 != null ? round(sma200, 4) : null,
    aboveSma20: sma20 != null ? price >= sma20 : null,
    aboveSma50: sma50 != null ? price >= sma50 : null,
    aboveSma200: sma200 != null ? price >= sma200 : null,
    ddFrom252dHigh: ddFrom252dHigh != null ? round(ddFrom252dHigh, 4) : null,
    pctFromSma200: pctFromSma200 != null ? round(pctFromSma200, 4) : null,
    ret5d: ret5d != null ? round(ret5d, 4) : null,
    ret10d: ret10d != null ? round(ret10d, 4) : null,
    ret21d: ret21d != null ? round(ret21d, 4) : null,
    ret63d: ret63d != null ? round(ret63d, 4) : null,
    indexVolRatio20:
      indexVolRatio20 != null ? round(indexVolRatio20, 3) : null,
    atrPct20: atr != null ? round(atr, 4) : null,
    atrBottomQuartile,
    near52wHigh,
    prior10dDd: prior10dDd != null ? round(prior10dDd, 4) : null,
    dataGaps: gaps,
  };
}

/** Yield / FX level change in percentage points (or FX relative change). */
export function seriesDelta(chart, days) {
  if (!chart?.bars?.length) return { value: null, gap: true };
  const r = lagChange(chart.bars.map((b) => b.c), days, "diff"); // math-core (guarded)
  return r.gap ? r : { value: round(r.value, 4), gap: false };
}

export function seriesRet(chart, days) {
  if (!chart?.bars?.length) return { value: null, gap: true };
  const r = lagChange(chart.bars.map((b) => b.c), days, "ret"); // math-core (guarded)
  return r.gap ? r : { value: round(r.value, 4), gap: false };
}

/**
 * Marks temperature −2…+2 from available proxies only.
 */
export function temperatureScore(feat, rate, opts = {}) {
  let score = 0;
  let used = 0;
  const gaps = [];

  if (isFiniteNumber(feat?.pctFromSma200)) {
    used++;
    if (feat.pctFromSma200 >= 0.12) score += 1;
    else if (feat.pctFromSma200 >= 0.05) score += 0.5;
    else if (feat.pctFromSma200 <= -0.15) score -= 1;
    else if (feat.pctFromSma200 <= -0.08) score -= 0.5;
  } else gaps.push("pct_from_SMA200");

  if (isFiniteNumber(feat?.ddFrom252dHigh)) {
    used++;
    if (feat.ddFrom252dHigh >= -0.01) score += 0.75;
    else if (feat.ddFrom252dHigh <= -0.15) score -= 1;
    else if (feat.ddFrom252dHigh <= -0.1) score -= 0.5;
  } else gaps.push("dd_from_252d_high");

  if (feat?.near52wHigh === true && feat?.atrBottomQuartile === true) {
    used++;
    score += 1; // M5 compressed vol near highs
  } else if (feat?.atrBottomQuartile == null && feat?.near52wHigh) {
    gaps.push("ATR_pct_20_quartile");
  }

  if (isFiniteNumber(rate?.d20d)) {
    used++;
    if (rate.d20d >= 0.25) score -= 0.75; // rising yields cooler for risk assets
    else if (rate.d20d <= -0.15) score += 0.5;
  } else gaps.push("d_US10Y_20d");

  if (isFiniteNumber(opts.breadthProxy)) {
    used++;
    if (opts.breadthProxy >= 0.7) score += 0.5;
    else if (opts.breadthProxy <= 0.3) score -= 0.5;
  } else gaps.push("breadth_proxy");

  if (opts.skipCredit) {
    /* TW: US credit ETF not applied */
  } else if (isFiniteNumber(opts.hygVsLqd20d)) {
    used++;
    if (opts.hygVsLqd20d > 0.01) score += 0.25;
    else if (opts.hygVsLqd20d < -0.01) score -= 0.25;
  } else gaps.push("HYG_vs_LQD_20d");

  if (used === 0) return { score: null, gaps, used: 0 };
  const clamped = Math.max(-2, Math.min(2, round(score, 2)));
  return { score: clamped, gaps, used };
}

/**
 * Egg / psychology phase proxy from index features + rates.
 */
export function psychologyPhaseFrom(feat, rate, tempScore) {
  const gaps = [];
  if (!feat) {
    return { phase: null, gaps: ["index_features"] };
  }

  const dd = feat.ddFrom252dHigh;
  const vol = feat.indexVolRatio20;
  const ret5 = feat.ret5d;
  const ret10 = feat.ret10d;
  const priorDd = feat.prior10dDd;
  const above20 = feat.aboveSma20;

  // Panic: sharp short plunge + extreme volume
  if (
    ((ret5 != null && ret5 <= -0.06) || (ret10 != null && ret10 <= -0.08)) &&
    vol != null &&
    vol >= 2.0
  ) {
    return { phase: "panic", gaps };
  }
  if (priorDd != null && priorDd <= -0.08 && vol != null && vol >= 2.0 && above20 === false) {
    return { phase: "panic", gaps };
  }

  // Euphoric: near highs + elevated vol OR compressed ATR near highs + hot temp
  if (
    dd != null &&
    dd >= -0.015 &&
    ((vol != null && vol >= 1.5) ||
      (feat.atrBottomQuartile === true && (tempScore ?? 0) >= 1))
  ) {
    return { phase: "euphoric", gaps };
  }

  // Despondent
  if (
    dd != null &&
    (dd <= -0.15 || (dd <= -0.1 && vol != null && vol >= 1.4))
  ) {
    return { phase: "despondent", gaps };
  }

  // Late optimism
  if (dd != null && dd >= -0.02 && (tempScore ?? 0) >= 0.75) {
    return { phase: "late_optimism", gaps };
  }

  // Cautious recovery
  if (
    dd != null &&
    dd > -0.1 &&
    dd <= -0.03 &&
    (feat.aboveSma50 === true || above20 === true)
  ) {
    return { phase: "cautious_recovery", gaps };
  }

  // Mid-cycle default when we have enough structure
  if (dd != null || feat.pctFromSma200 != null) {
    return { phase: "mid_cycle", gaps };
  }

  gaps.push("psychologyPhase");
  return { phase: null, gaps };
}

export function liquidityBiasFrom(rate, fx, market) {
  const gaps = [];
  const implications = [];

  if (rate?.d20d == null && rate?.d60d == null) {
    gaps.push("US10Y_deltas");
  }

  let bias = "neutral";
  // R2 fast yield spike
  if (rate?.d20d != null && rate.d20d >= 0.25) {
    bias = "risk_off";
    implications.push("R2：美債殖利率 20 日上升偏快，流動性偏緊／防禦");
  } else if (rate?.d60d != null && rate.d60d <= -0.25) {
    bias = "risk_on";
    implications.push("R3：美債殖利率 60 日趨降，資金面偏寬鬆（滯後敘事）");
  } else if (rate?.d20d != null && rate.d20d <= -0.1) {
    bias = "risk_on";
  } else if (rate?.d20d != null && rate.d20d >= 0.1) {
    bias = "risk_off";
  }

  if (market === "TW") {
    if (fx?.d20dRet == null) {
      gaps.push("d_USDTWD_20d");
    } else if (fx.d20dRet >= 0.02) {
      // USD strength vs TWD = risk-off stress for TW often
      if (bias === "risk_on") bias = "neutral";
      else bias = "risk_off";
      implications.push("R4：USD/TWD 20 日偏升，台股風險溢價／資金壓力訊號");
    } else if (fx.d20dRet <= -0.015) {
      implications.push("R4：USD/TWD 20 日偏降，台幣相對偏強（非利率本體）");
    }
  }

  if (rate?.level == null) gaps.push("US10Y_level");

  return { bias, gaps, implications };
}

function dialFromPhase(phase, rateSpike, panicReclaim) {
  if (!phase) return null;
  let stance = PHASE_TO_STANCE[phase] || "balanced";
  // Conflict C1: rate spike caps dial at selective unless panic
  if (rateSpike && stance !== "stabilize_first") {
    const order = [
      "aggressive",
      "constructive",
      "balanced",
      "selective",
      "defensive",
      "stabilize_first",
    ];
    const capIdx = order.indexOf("selective");
    const curIdx = order.indexOf(stance);
    if (curIdx >= 0 && curIdx < capIdx) stance = "selective";
  }
  // After panic reclaim (K6), lean toward aggressive
  if (phase === "panic" && panicReclaim) {
    stance = "aggressive";
  }
  return stance;
}

function buildImplications(phase, stance, liq, feat, market) {
  const out = [...(liq.implications || [])];
  if (phase) {
    out.push(
      `Kostolany 心理相位近似：${phase} → 篩選姿態 ${stance || "—"}（${market}）`
    );
  }
  if (stance === "defensive" || stance === "selective") {
    out.push("Marks 偏熱／偏高：提高品質與趨勢門檻、縮小可進場宇宙");
  }
  if (stance === "aggressive" || stance === "constructive") {
    out.push("Marks 偏冷／修復：允許早段 RS＋放量進場（仍受 SMA200／穩定門檻約束）");
  }
  if (stance === "stabilize_first") {
    out.push("恐慌相位：先觀察穩定（收復 SMA20）再放大部位");
  }
  if (feat?.ddFrom252dHigh != null) {
    out.push(
      `指數距 252 日高點約 ${(feat.ddFrom252dHigh * 100).toFixed(1)}%`
    );
  }
  return out;
}

/**
 * Compute one market regime object.
 */
export function computeMarketRegime({
  market,
  indexFeat,
  secondaryFeat = null, // e.g. Nasdaq for US
  rate = null, // { level, d5d, d20d, d60d }
  fx = null, // { d20dRet } for TW
  breadthProxy = null,
  hygVsLqd20d = null,
}) {
  const dataGaps = [];
  if (!indexFeat) {
    return {
      market,
      psychologyPhase: null,
      cycleStance: null,
      liquidityBias: null,
      temperatureScore: null,
      sizeMult: null,
      eggProxy: null,
      dial: null,
      implications: ["資料不足：缺少指數序列，無法計算 regime"],
      features: {},
      dataGaps: ["index"],
      incomplete: true,
      incompleteLabel: "資料不足",
    };
  }

  const temp = temperatureScore(indexFeat, rate, {
    breadthProxy,
    hygVsLqd20d,
    skipCredit: market === "TW",
  });
  dataGaps.push(...temp.gaps);

  const egg = psychologyPhaseFrom(indexFeat, rate, temp.score);
  dataGaps.push(...egg.gaps);

  // Secondary index (Nasdaq) can tip euphoria if SPX mid but NDX extreme
  let phase = egg.phase;
  if (
    market === "US" &&
    secondaryFeat?.ddFrom252dHigh != null &&
    secondaryFeat.ddFrom252dHigh >= -0.01 &&
    secondaryFeat.indexVolRatio20 != null &&
    secondaryFeat.indexVolRatio20 >= 1.5 &&
    phase === "mid_cycle"
  ) {
    phase = "late_optimism";
  }

  const liq = liquidityBiasFrom(rate, fx, market);
  dataGaps.push(...liq.gaps);

  const rateSpike = rate?.d20d != null && rate.d20d >= 0.25;
  const panicReclaim =
    phase === "panic" &&
    indexFeat.prior10dDd != null &&
    indexFeat.prior10dDd <= -0.08 &&
    indexFeat.aboveSma20 === true;

  let stance = dialFromPhase(phase, rateSpike, panicReclaim);
  // If yields scream defensive and phase mid — already capped; also if euphoric + risk_on still defensive
  if (liq.bias === "risk_off" && stance === "aggressive") {
    stance = "constructive";
  }
  if (liq.bias === "risk_on" && stance === "defensive" && phase !== "euphoric") {
    // don't override euphoria
  }

  const sizeMult = stance ? STANCE_SIZE_MULT[stance] : null;
  const implications = buildImplications(phase, stance, liq, indexFeat, market);
  if (temp.score == null) {
    implications.push("資料不足：Marks 溫度分數缺足夠代理變數");
  }
  if (!phase) {
    implications.push("資料不足：心理相位無法判定");
  }

  const uniqGaps = [...new Set(dataGaps.filter(Boolean))];

  return {
    market,
    psychologyPhase: phase,
    cycleStance: stance,
    liquidityBias: liq.bias,
    temperatureScore: temp.score,
    sizeMult,
    eggProxy: phase,
    dial: stance,
    implications,
    features: {
      ddFrom252dHigh: indexFeat.ddFrom252dHigh,
      pctFromSma200: indexFeat.pctFromSma200,
      indexVolRatio20: indexFeat.indexVolRatio20,
      atrPct20: indexFeat.atrPct20,
      atrBottomQuartile: indexFeat.atrBottomQuartile,
      ret5d: indexFeat.ret5d,
      ret21d: indexFeat.ret21d,
      ret63d: indexFeat.ret63d,
      aboveSma20: indexFeat.aboveSma20,
      aboveSma50: indexFeat.aboveSma50,
      aboveSma200: indexFeat.aboveSma200,
      prior10dDd: indexFeat.prior10dDd,
      us10y: rate?.level ?? null,
      dUs10y5d: rate?.d5d ?? null,
      dUs10y20d: rate?.d20d ?? null,
      dUs10y60d: rate?.d60d ?? null,
      dUsdtwd20d: fx?.d20dRet ?? null,
      breadthProxy,
      hygVsLqd20d,
      lastBarDate: indexFeat.lastBarDate,
    },
    dataGaps: uniqGaps,
    incomplete: !phase || !stance,
    incompleteLabel: !phase || !stance ? "資料不足" : undefined,
  };
}

/**
 * Ranking / screen dial helpers — US/TW separate callers. Pure math lives in math-core (guarded by
 * math-guards since 2026-10-29): regimeScoreAdjust / screenAPass / stanceListSize.
 */
export function scoreAdjust(baseScore, m, regime, indexDayPct) {
  return regimeScoreAdjust(baseScore, m, regime);
}

export function passesScreenA(m, indexDayPct, regime) {
  return screenAPass(m, indexDayPct, regime);
}

export function listSizeForStance(stance, defaultN = 12) {
  return stanceListSize(stance, defaultN);
}

/**
 * Stub regime from already-published latest.json index fields (no new Yahoo).
 */
export function stubRegimeFromLatestIndices(indices, market) {
  const gaps = ["live_yahoo_regime_scan"];
  const implications = ["資料不足：以既有指數欄位粗估；完整 regime 待下次成功掃描"];
  let dayPct = null;
  let d5 = null;
  let d1m = null;
  if (market === "US") {
    dayPct = indices?.spx?.dayPct ?? null;
    d5 = null;
    d1m = null;
  } else {
    dayPct = indices?.tw?.dayPct ?? null;
  }
  if (dayPct == null) {
    return {
      market,
      psychologyPhase: null,
      cycleStance: null,
      liquidityBias: null,
      temperatureScore: null,
      sizeMult: null,
      eggProxy: null,
      dial: null,
      implications: ["資料不足：latest.json 指數欄位不足"],
      features: {},
      dataGaps: gaps,
      incomplete: true,
      incompleteLabel: "資料不足",
      stub: true,
    };
  }
  let phase = "mid_cycle";
  if (dayPct <= -6) phase = "panic";
  else if (dayPct <= -2.5) phase = "despondent";
  else if (dayPct >= 2) phase = "late_optimism";
  const stance = PHASE_TO_STANCE[phase];
  implications.push(`粗估相位 ${phase}（僅依單日指數漲跌 ${dayPct}%；缺 DD／量／利率）`);
  gaps.push("dd_from_252d_high", "index_vol_ratio_20", "d_US10Y_20d", "SMA200");
  return {
    market,
    psychologyPhase: phase,
    cycleStance: stance,
    liquidityBias: "neutral",
    temperatureScore: null,
    sizeMult: STANCE_SIZE_MULT[stance],
    eggProxy: phase,
    dial: stance,
    implications,
    features: {
      dayPct,
      d5Pct: d5,
      d1mPct: d1m,
      note: "stub_from_latest_indices",
    },
    dataGaps: gaps,
    incomplete: true,
    incompleteLabel: "資料不足",
    stub: true,
  };
}

/**
 * Build strategy-screener pack for 科斯托拉尼／週期.
 */
export function buildKostolanyStrategyPack({
  marketRegime,
  usMetrics,
  twMetrics,
  usMeta,
  twMeta,
  spxIdx,
  twIdx,
}) {
  const conditions = [
    { text: "先判定該市場 psychologyPhase／cycleStance（美／台分開）", status: "pass" },
    { text: "防禦／高潮：雙均線＋量比門檻提高；薄量高 RS 降權（K5）", status: "pass" },
    { text: "積極／低迷：允許 SMA200 上方早段 RS＋放量（K2 firm-hands）", status: "pass" },
    { text: "恐慌：需收復 SMA20 才進積極桶（K6）", status: "pass" },
    { text: "利率／USD/TWD 僅作流動性偏誤，不捏造缺值", status: "pass" },
  ];

  const hits = [];
  const pushHits = (metrics, metaMap, market, idxDay, regime) => {
    const stance = regime?.cycleStance;
    for (const m of metrics) {
      const tags = [];
      if (
        (m.d1mPct ?? 0) < 0 &&
        m.volRatio != null &&
        m.volRatio >= 1.5 &&
        m.above200
      ) {
        tags.push("firm_hands");
      }
      if (
        (m.d1mPct ?? 0) >= 8 &&
        m.volRatio != null &&
        m.volRatio < 0.8
      ) {
        tags.push("thin_rs_demote");
      }
      const passA = passesScreenA(m, idxDay, regime);
      const interesting =
        passA ||
        tags.includes("firm_hands") ||
        (stance === "stabilize_first" && m.above20);

      if (!interesting) continue;
      if (tags.includes("thin_rs_demote") && (stance === "defensive" || stance === "selective")) {
        continue;
      }

      const meta = metaMap[m.symbol] || {};
      hits.push({
        ticker: m.symbol,
        name: meta.nameZh || meta.name || m.name,
        market,
        currency: market === "TW" ? "TWD" : "USD",
        metrics: {
          price: m.price,
          dayPct: m.dayPct,
          pct5d: m.d5Pct,
          pct1m: m.d1mPct,
          volRatio: m.volRatio,
          aboveSma20: !!m.above20,
          aboveSma50: !!m.above50,
          aboveSma200: !!m.above200,
          cycleStance: stance || null,
          psychologyPhase: regime?.psychologyPhase || null,
          liquidityBias: regime?.liquidityBias || null,
          tags: tags.join(",") || (passA ? "screen_A" : ""),
          sizeMult: regime?.sizeMult ?? null,
        },
      });
    }
  };

  pushHits(usMetrics, usMeta, "US", spxIdx, marketRegime?.us);
  pushHits(twMetrics, twMeta, "TW", twIdx, marketRegime?.tw);

  hits.sort((a, b) => {
    const va = (a.metrics.volRatio ?? 0) + Math.abs(a.metrics.dayPct ?? 0);
    const vb = (b.metrics.volRatio ?? 0) + Math.abs(b.metrics.dayPct ?? 0);
    return vb - va;
  });

  const usR = marketRegime?.us;
  const twR = marketRegime?.tw;
  const notes = [];
  if (usR) {
    notes.push(
      `US phase=${usR.psychologyPhase ?? "資料不足"} stance=${usR.cycleStance ?? "資料不足"} liq=${usR.liquidityBias ?? "資料不足"} temp=${usR.temperatureScore ?? "資料不足"}`
    );
    if (usR.dataGaps?.length) notes.push(`US 資料缺口：${usR.dataGaps.join(", ")}`);
  }
  if (twR) {
    notes.push(
      `TW phase=${twR.psychologyPhase ?? "資料不足"} stance=${twR.cycleStance ?? "資料不足"} liq=${twR.liquidityBias ?? "資料不足"} temp=${twR.temperatureScore ?? "資料不足"}`
    );
    if (twR.dataGaps?.length) notes.push(`TW 資料缺口：${twR.dataGaps.join(", ")}`);
  }

  const incomplete =
    !usR?.psychologyPhase && !twR?.psychologyPhase;

  return {
    id: "kostolany-cycle",
    name: "科斯托拉尼／週期",
    category: "大師",
    categoryGroup: "週期",
    xqTags: ["週期", "大師", "價量"],
    description:
      "André Kostolany 雞蛋理論相位近似＋Howard Marks 市場溫度＋利率／匯兌流動性偏誤。美股與台股 regime 分開計算；依 cycleStance 調整動能／量能門檻。公開行情可計算規則，非投資建議。",
    conditions,
    hits: hits.slice(0, 80),
    blockers: incomplete
      ? ["資料不足：兩市場皆無法判定 psychologyPhase"]
      : [],
    incomplete,
    incompleteLabel: incomplete ? "資料不足" : undefined,
    notes,
    regimeSnapshot: {
      us: usR
        ? {
            psychologyPhase: usR.psychologyPhase,
            cycleStance: usR.cycleStance,
            liquidityBias: usR.liquidityBias,
            temperatureScore: usR.temperatureScore,
            implications: usR.implications,
            dataGaps: usR.dataGaps,
          }
        : null,
      tw: twR
        ? {
            psychologyPhase: twR.psychologyPhase,
            cycleStance: twR.cycleStance,
            liquidityBias: twR.liquidityBias,
            temperatureScore: twR.temperatureScore,
            implications: twR.implications,
            dataGaps: twR.dataGaps,
          }
        : null,
    },
    calibrationNotes: {
      matchedXq: [
        "公開 Yahoo 指數／個股／^TNX／USDTWD 可算特徵",
        "美／台 dial 獨立（R4 匯兌為唯一自動連動）",
      ],
      stillDiffers: [
        "相位為代理變數，非書中敘事原文",
        "HYG/LQD、廣度缺值時誠實標資料不足",
      ],
      source: "scripts/study/bookshelf-framework-2026-09-16",
    },
  };
}
