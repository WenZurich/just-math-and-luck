/**
 * XQ-style「大師」strategies — public TW metrics only; skip name if any required field missing.
 */
import {
  avg,
  codeOfTicker,
} from "./tw-fundamentals.mjs";
import { trailingSum, growthStreak, blockGrowth } from "./math-core.mjs";

function cond(text, status = "pass") {
  return { text, status };
}

function round(n, d) {
  if (n == null || Number.isNaN(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function sharesToZhang(shares) {
  if (shares == null) return null;
  return shares / 1000;
}

function twTechOk(u, ohlcvMap, techMetrics, minZhang = 300) {
  const chart = ohlcvMap.get(u.ticker);
  if (!chart) return null;
  const m = techMetrics(chart.bars);
  if (!(m.price > 10)) return null;
  if (!(m.avgVol5 != null && m.avgVol5 > minZhang * 1000)) return null;
  return { chart, m };
}

function baseHit(u, chart, m, metrics) {
  return {
    ticker: u.ticker,
    name: u.name || chart.name,
    market: u.market,
    currency: "TWD",
    metrics: {
      price: round(m.price, 2),
      avgVol5Zhang: round(sharesToZhang(m.avgVol5), 1),
      dayPct: round(m.dayPct, 2),
      ...metrics,
    },
  };
}

function fundOf(bundle, ticker) {
  return bundle.byCode.get(codeOfTicker(ticker));
}

/** 近 N 季合計 ROE（單季 ROE 加總） */
// math-core (guarded, 2026-10-27): sums / growth below never return NaN or coerce strings; junk ⇒ null (name skipped).
// NOTE (unchanged rule): quarters without ROE/EPS are dropped first, so "last 4 quarters" means the last 4 that
// have the figure — not necessarily 4 consecutive calendar quarters.
export function sumRecentRoe(fund, n = 4) {
  if (!fund?.quarters?.length) return null;
  return trailingSum(fund.quarters.filter((q) => q.roe != null).map((q) => q.roe), n);
}

export function epsGrowthStreak(fund) {
  // consecutive QoQ EPS growth >10% counting from latest backwards
  if (!fund?.quarters?.length) return 0;
  return growthStreak(fund.quarters.filter((q) => q.eps != null).map((q) => q.eps), 0.1, { minAbsPrev: 1e-9 });
}

export function roeGrowthLatest(fund) {
  // YoY ROE growth using sum of last 4Q vs prior 4Q if possible; else last vs prior quarter
  if (!fund?.quarters?.length) return null;
  return blockGrowth(fund.quarters.filter((q) => q.roe != null).map((q) => q.roe), 4, { minAbsPrev: 1e-9 });
}

function consecutiveAnnualRevGrowth(fund, years, minG) {
  // last `years` YoY revenue growths all > minG
  const gs = fund?.revGrowthYoY || [];
  if (gs.length < years) return false;
  return gs.slice(-years).every((x) => x.g > minG);
}

function annualOmAllAbove(fund, years, minOm) {
  const ann = fund?.annual || [];
  if (ann.length < years) return false;
  return ann.slice(-years).every((a) => a.operatingMargin != null && a.operatingMargin > minOm);
}

function latestQuarterOm(fund) {
  const qs = fund?.quarters || [];
  for (let i = qs.length - 1; i >= 0; i--) {
    if (qs[i].operatingMargin != null) return qs[i].operatingMargin;
  }
  return null;
}

function masterShell(id, name, description, conditions, hits, blockers = [], calibrationNotes = null) {
  const out = {
    id,
    name,
    category: "大師",
    categoryGroup: "大師",
    xqTags: ["大師", "財務", "價量"],
    description,
    conditions,
    hits: hits.slice(0, 80),
    blockers,
    incomplete: false,
  };
  if (calibrationNotes) out.calibrationNotes = calibrationNotes;
  return out;
}

export function buildMichaelPrice(universe, ohlcvMap, techMetrics, bundle) {
  const conditions = [
    cond("股價淨值比小於1倍"),
    cond("董監持股比例大於40%"),
    cond("連續1季負債比小於20%"),
    cond("5日均量大於300張"),
    cond("股價大於10元"),
  ];
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const tech = twTechOk(u, ohlcvMap, techMetrics, 300);
    if (!tech) continue;
    const code = codeOfTicker(u.ticker);
    const pb = bundle.pb.get(code);
    const dir = bundle.directorPct.get(code);
    const debt = bundle.debtRatio.get(code);
    if (pb == null || dir == null || debt == null) continue;
    if (!(pb < 1)) continue;
    if (!(dir > 0.4)) continue;
    if (!(debt < 0.2)) continue;
    hits.push(
      baseHit(u, tech.chart, tech.m, {
        pb: round(pb, 2),
        directorHoldPct: round(dir * 100, 1),
        debtRatioPct: round(debt * 100, 1),
      })
    );
  }
  hits.sort((a, b) => (a.metrics.pb ?? 99) - (b.metrics.pb ?? 99));
  const shell = masterShell(
    "michael-price",
    "麥克普萊斯",
    "Michael Price：低股價淨值比＋高董監持股＋低負債。資料：證交所 BWIBBU／董監持股明細／合併資產負債表。",
    conditions,
    hits,
    hits.length
      ? []
      : ["宇宙內無標的同時具備 P/B、董監持股%、負債比且符合門檻（缺欄位者不捏造、直接略過）"]
  );
  shell.xqTags = ["大師", "財務", "籌碼", "價量"];
  shell.calibrationNotes = {
    matchedXq: ["PB<1", "董監持股>40%", "負債比<20%", "價量門檻"],
    stillDiffers: ["董監持股去重規則可能與 XQ 略異；缺欄略過"],
  };
  return shell;
}

export function buildMarkMinervini(universe, ohlcvMap, techMetrics, bundle) {
  // Merged former duplicate「麥克喜偉」into one Minervini-style screen
  const conditions = [
    cond("本益比小於20倍"),
    cond("近4季合計ROE大於15%"),
    cond("5日均量大於300張"),
    cond("股價大於10元"),
    cond("連續3年營收成長率大於5%"),
    cond("連續1季負債比小於30%"),
  ];
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const tech = twTechOk(u, ohlcvMap, techMetrics, 300);
    if (!tech) continue;
    const code = codeOfTicker(u.ticker);
    const pe = bundle.pe.get(code);
    const debt = bundle.debtRatio.get(code);
    const fund = fundOf(bundle, u.ticker);
    const roe4 = sumRecentRoe(fund, 4);
    if (pe == null || debt == null || roe4 == null || !fund) continue;
    if (!(pe < 20)) continue;
    if (!(roe4 > 0.15)) continue;
    if (!(debt < 0.3)) continue;
    if (!consecutiveAnnualRevGrowth(fund, 3, 0.05)) continue;
    hits.push(
      baseHit(u, tech.chart, tech.m, {
        pe: round(pe, 2),
        roe4qPct: round(roe4 * 100, 1),
        debtRatioPct: round(debt * 100, 1),
        revGrowth3y: fund.revGrowthYoY.slice(-3).map((x) => round(x.g * 100, 1)),
      })
    );
  }
  hits.sort((a, b) => (b.metrics.roe4qPct ?? 0) - (a.metrics.roe4qPct ?? 0));
  return masterShell(
    "mark-minervini",
    "馬克米納維尼",
    "Mark Minervini 風格（已合併原重複「馬克約克奇／麥克喜偉」）：成長＋合理本益比＋低負債。營收／ROE 來自 MOPS；僅台股。",
    conditions,
    hits,
    [],
    {
      matchedXq: ["PE<20", "4季ROE合計>15%", "連3年營收成長>5%", "負債比<30%", "價>10", "5日均量>300張"],
      stillDiffers: [
        "XQ 可能另含相對強度／型態條件（公開資料無完整對照）",
        "原「麥克喜偉」與本策略條件相同已合併，避免重複命中列表",
      ],
      units: "ROE／營益率內部為 ratio（0.15=15%），輸出 *100 為百分比",
    }
  );
}

export function buildKennethFisher(universe, ohlcvMap, techMetrics, bundle) {
  const conditions = [
    cond("近5年營收成長率平均大於15%"),
    cond("近5年稅前淨利成長平均大於5%"),
    cond("連續1季負債比小於30%"),
    cond("5日均量大於300張"),
    cond("股價大於10元"),
  ];
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const tech = twTechOk(u, ohlcvMap, techMetrics, 300);
    if (!tech) continue;
    const code = codeOfTicker(u.ticker);
    const debt = bundle.debtRatio.get(code);
    const fund = fundOf(bundle, u.ticker);
    if (debt == null || !fund) continue;
    if (!(debt < 0.3)) continue;
    const revGs = (fund.revGrowthYoY || []).slice(-5).map((x) => x.g);
    const pretaxGs = (fund.pretaxGrowthYoY || []).slice(-5).map((x) => x.g);
    if (revGs.length < 5 || pretaxGs.length < 5) continue;
    const revAvg = avg(revGs);
    const pretaxAvg = avg(pretaxGs);
    if (revAvg == null || pretaxAvg == null) continue;
    if (!(revAvg > 0.15)) continue;
    if (!(pretaxAvg > 0.05)) continue;
    hits.push(
      baseHit(u, tech.chart, tech.m, {
        debtRatioPct: round(debt * 100, 1),
        revGrowth5yAvgPct: round(revAvg * 100, 1),
        pretaxGrowth5yAvgPct: round(pretaxAvg * 100, 1),
      })
    );
  }
  hits.sort(
    (a, b) =>
      (b.metrics.revGrowth5yAvgPct ?? 0) - (a.metrics.revGrowth5yAvgPct ?? 0)
  );
  return masterShell(
    "kenneth-fisher",
    "肯尼斯費雪",
    "Kenneth Fisher：長期營收／稅前淨利成長＋低負債。年增率由 MOPS 年度綜合損益（Q4）計算。僅台股。",
    conditions,
    hits,
    [],
    {
      matchedXq: ["5年營收成長均>15%", "5年稅前成長均>5%", "負債比<30%", "價量門檻"],
      stillDiffers: ["缺年報序列則略過，不放水"],
    }
  );
}

export function buildMichaelMurphy(universe, ohlcvMap, techMetrics, bundle) {
  const conditions = [
    cond("近4季合計ROE大於5%"),
    cond("連續1季營益率大於10%"),
    cond("連續3年營益率大於10%"),
    cond("5日均量大於300張"),
    cond("股價大於10元"),
    cond("近3年營收成長率平均大於5%"),
  ];
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const tech = twTechOk(u, ohlcvMap, techMetrics, 300);
    if (!tech) continue;
    const fund = fundOf(bundle, u.ticker);
    if (!fund) continue;
    const roe4 = sumRecentRoe(fund, 4);
    const om1 = latestQuarterOm(fund);
    if (roe4 == null || om1 == null) continue;
    if (!(roe4 > 0.05)) continue;
    if (!(om1 > 0.1)) continue;
    if (!annualOmAllAbove(fund, 3, 0.1)) continue;
    const revGs = (fund.revGrowthYoY || []).slice(-3).map((x) => x.g);
    if (revGs.length < 3) continue;
    const revAvg = avg(revGs);
    if (revAvg == null || !(revAvg > 0.05)) continue;
    hits.push(
      baseHit(u, tech.chart, tech.m, {
        roe4qPct: round(roe4 * 100, 1),
        opMargin1qPct: round(om1 * 100, 1),
        opMargin3y: fund.annual.slice(-3).map((a) =>
          a.operatingMargin != null ? round(a.operatingMargin * 100, 1) : null
        ),
        revGrowth3yAvgPct: round(revAvg * 100, 1),
      })
    );
  }
  hits.sort((a, b) => (b.metrics.roe4qPct ?? 0) - (a.metrics.roe4qPct ?? 0));
  return masterShell(
    "michael-murphy",
    "麥克墨非",
    "Michael Murphy：高營益率＋ROE＋營收成長。營益率＝單季營業利益/營業收入（ratio）。僅台股。",
    conditions,
    hits,
    [],
    {
      matchedXq: ["4季ROE>5%", "近季營益率>10%", "連3年營益率>10%", "3年營收成長均>5%", "價量門檻"],
      stillDiffers: ["XQ 產業／型態過濾未實作"],
      unitsNote: "opMargin/ROE 為 ratio；創見等記憶體景氣高峰季報營益率可逾70%（已對照 MOPS 營業利益÷營業收入，非錯欄）",
    }
  );
}

export function buildOShaughnessy(universe, ohlcvMap, techMetrics, bundle) {
  const conditions = [
    cond("連續2季EPS成長率大於10%"),
    cond("本益比小於15倍"),
    cond("近4季合計ROE大於15%"),
    cond("近4季合計ROE較前期成長15%"),
    cond("5日均量大於300張"),
    cond("股價大於10元"),
    cond("連續4季EPS成長率大於10%"),
  ];
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const tech = twTechOk(u, ohlcvMap, techMetrics, 300);
    if (!tech) continue;
    const code = codeOfTicker(u.ticker);
    const pe = bundle.pe.get(code);
    const fund = fundOf(bundle, u.ticker);
    if (pe == null || !fund) continue;
    if (!(pe < 15)) continue;
    const roe4 = sumRecentRoe(fund, 4);
    const roeG = roeGrowthLatest(fund);
    const streak = epsGrowthStreak(fund);
    if (roe4 == null || roeG == null) continue;
    if (!(roe4 > 0.15)) continue;
    if (!(roeG > 0.15)) continue;
    // Need both: at least 2Q streak AND the stricter 4Q streak condition
    if (streak < 4) continue;
    hits.push(
      baseHit(u, tech.chart, tech.m, {
        pe: round(pe, 2),
        roe4qPct: round(roe4 * 100, 1),
        roeGrowthPct: round(roeG * 100, 1),
        epsGrowthStreak: streak,
      })
    );
  }
  hits.sort((a, b) => (b.metrics.roe4qPct ?? 0) - (a.metrics.roe4qPct ?? 0));
  return masterShell(
    "james-oshaughnessy",
    "詹姆士歐沙那希",
    "James O'Shaughnessy：EPS 連季成長＋低本益比＋高 ROE。EPS／ROE 由 MOPS 季報拆單季後計算。僅台股。",
    conditions,
    hits,
    [],
    {
      matchedXq: ["EPS連季>10%", "PE<15", "4季ROE>15%且成長", "價量門檻"],
      stillDiffers: ["條件同時要求4季EPS streak（偏嚴）"],
    }
  );
}


/** @deprecated Merged into buildMarkMinervini — kept for import safety. */
export function buildMichaelSivy() {
  return null;
}

export function buildBenjaminGraham(universe, ohlcvMap, techMetrics, bundle) {
  const conditions = [
    cond("本益比小於15倍"),
    cond("股價淨值比小於1.5倍"),
    cond("連續1季負債比小於50%"),
    cond("5日均量大於300張"),
    cond("股價大於10元"),
  ];
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const tech = twTechOk(u, ohlcvMap, techMetrics, 300);
    if (!tech) continue;
    const code = codeOfTicker(u.ticker);
    const pe = bundle.pe.get(code);
    const pb = bundle.pb.get(code);
    const debt = bundle.debtRatio.get(code);
    if (pe == null || pb == null || debt == null) continue;
    if (!(pe < 15)) continue;
    if (!(pb < 1.5)) continue;
    if (!(debt < 0.5)) continue;
    hits.push(
      baseHit(u, tech.chart, tech.m, {
        pe: round(pe, 2),
        pb: round(pb, 2),
        debtRatioPct: round(debt * 100, 1),
      })
    );
  }
  hits.sort((a, b) => (a.metrics.pb ?? 99) - (b.metrics.pb ?? 99));
  return masterShell(
    "benjamin-graham",
    "班哲明格拉罕",
    "Benjamin Graham 近似：便宜本益比＋低股價淨值比＋可控負債。公開 BWIBBU／資產負債表。僅台股。",
    conditions,
    hits,
    [],
    {
      matchedXq: ["PE<15", "PB<1.5", "負債比<50%", "價>10", "5日均量>300張"],
      stillDiffers: ["XQ 可能另含流動比率／連續盈餘年數"],
    }
  );
}

export function buildWarrenBuffett(universe, ohlcvMap, techMetrics, bundle) {
  const conditions = [
    cond("近4季合計ROE大於15%"),
    cond("連續1季營益率大於10%"),
    cond("連續1季負債比小於40%"),
    cond("5日均量大於300張"),
    cond("股價大於10元"),
  ];
  const hits = [];
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const tech = twTechOk(u, ohlcvMap, techMetrics, 300);
    if (!tech) continue;
    const code = codeOfTicker(u.ticker);
    const debt = bundle.debtRatio.get(code);
    const fund = fundOf(bundle, u.ticker);
    if (debt == null || !fund) continue;
    const roe4 = sumRecentRoe(fund, 4);
    const om1 = latestQuarterOm(fund);
    if (roe4 == null || om1 == null) continue;
    if (!(roe4 > 0.15)) continue;
    if (!(om1 > 0.1)) continue;
    if (!(debt < 0.4)) continue;
    hits.push(
      baseHit(u, tech.chart, tech.m, {
        roe4qPct: round(roe4 * 100, 1),
        opMargin1qPct: round(om1 * 100, 1),
        debtRatioPct: round(debt * 100, 1),
      })
    );
  }
  hits.sort((a, b) => (b.metrics.roe4qPct ?? 0) - (a.metrics.roe4qPct ?? 0));
  return masterShell(
    "warren-buffett",
    "華倫巴菲特",
    "Warren Buffett 近似：高 ROE＋高營益率＋低負債。ROE／營益率由 MOPS 季報推算（ratio）。僅台股。",
    conditions,
    hits,
    [],
    {
      matchedXq: ["4季ROE合計>15%", "近季營益率>10%", "負債比<40%", "價>10", "5日均量>300張"],
      stillDiffers: ["XQ 可能含經濟護城河／持股年數等非公開量化條件"],
      unitsNote: "營益率、ROE 內部為 ratio（0.75=75%），非再乘一次；創見 115 季報高營益率經 MOPS 核對屬實",
    }
  );
}


export function buildPeterLynch(universe, ohlcvMap, techMetrics, bundle) {
  const conditions = [
    cond("本益比小於20倍"),
    cond("近2年平均營收成長大於25%（缺資料則略過該檔）"),
    cond("近5年稅前淨利成長平均大於5%（缺資料則略過該檔）"),
    cond("連續1季負債比小於30%"),
    cond("5日均量大於300張"),
    cond("股價大於10元"),
  ];
  const hits = [];
  let skippedMissing = 0;
  for (const u of universe) {
    if (u.market !== "TW") continue;
    const tech = twTechOk(u, ohlcvMap, techMetrics, 300);
    if (!tech) continue;
    const code = codeOfTicker(u.ticker);
    const pe = bundle.pe.get(code);
    const debt = bundle.debtRatio.get(code);
    const fund = fundOf(bundle, u.ticker);
    if (pe == null || debt == null || !fund) {
      skippedMissing++;
      continue;
    }
    const revGs = (fund.revGrowthYoY || []).slice(-2).map((x) => x.g);
    const pretaxGs = (fund.pretaxGrowthYoY || []).slice(-5).map((x) => x.g);
    if (revGs.length < 2 || pretaxGs.length < 5) {
      skippedMissing++;
      continue;
    }
    const revAvg2 = avg(revGs);
    const pretaxAvg5 = avg(pretaxGs);
    if (revAvg2 == null || pretaxAvg5 == null) {
      skippedMissing++;
      continue;
    }
    if (!(pe < 20)) continue;
    if (!(revAvg2 > 0.25)) continue;
    if (!(pretaxAvg5 > 0.05)) continue;
    if (!(debt < 0.3)) continue;
    hits.push(
      baseHit(u, tech.chart, tech.m, {
        pe: round(pe, 2),
        revGrowth2yAvgPct: round(revAvg2 * 100, 1),
        pretaxGrowth5yAvgPct: round(pretaxAvg5 * 100, 1),
        debtRatioPct: round(debt * 100, 1),
      })
    );
  }
  hits.sort((a, b) => (a.metrics.pe ?? 99) - (b.metrics.pe ?? 99));
  const shell = masterShell(
    "peter-lynch",
    "彼得林區",
    "Peter Lynch 近似（台股公開資料）：便宜本益比＋近2年營收成長均＞25%＋近5年稅前淨利成長均＞5%＋低負債。缺任一必要欄位則略過該檔，不放水。",
    conditions,
    hits,
    hits.length
      ? []
      : ["宇宙內無標的同時具備 PE／2年營收成長／5年稅前成長／負債比且過門檻（缺欄位者不捏造）"],
    {
      matchedXq: ["PE<20", "近2年營收成長均>25%", "近5年稅前淨利成長均>5%", "負債比<30%", "價>10", "5日均量>300張"],
      stillDiffers: [
        "XQ 可能另有 PEG／產業分類；此處用 MOPS 年增率代替",
        "美股不納入本策略（財務大師僅台股）",
      ],
      skippedMissingFields: skippedMissing,
    }
  );
  return shell;
}

export function buildAllMasters(universe, ohlcvMap, techMetrics, bundle) {
  return [
    buildPeterLynch(universe, ohlcvMap, techMetrics, bundle),
    buildBenjaminGraham(universe, ohlcvMap, techMetrics, bundle),
    buildWarrenBuffett(universe, ohlcvMap, techMetrics, bundle),
    buildOShaughnessy(universe, ohlcvMap, techMetrics, bundle),
    buildMichaelMurphy(universe, ohlcvMap, techMetrics, bundle),
    buildKennethFisher(universe, ohlcvMap, techMetrics, bundle),
    buildMarkMinervini(universe, ohlcvMap, techMetrics, bundle),
    buildMichaelPrice(universe, ohlcvMap, techMetrics, bundle),
  ].filter(Boolean);
}

