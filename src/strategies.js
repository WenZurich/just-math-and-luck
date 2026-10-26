/**
 * XQ-style「策略選股（邏輯條件）」section.
 * Sidebar/chips by category · condition list · hit table/cards · export JSON.
 * Never invents metrics — renders whatever strategy-screener.json provides.
 */
import { term, escapeHtml } from "./glossary.js";
import { t, numberLocale, enumLabel } from "./i18n.js";
import { stanceBadgeHtml } from "./logic.js";

const DATA_URL = "./data/strategy-screener.json";
const WATCHLIST_KEY = "jml-watchlist";

const TW_ONLY_IDS = new Set([
  "inst-sync",
  "margin-up",
  "earnings-steady",
  "low-pe-small",
  "peter-lynch",
  "warren-buffett",
  "michael-murphy",
  "kenneth-fisher",
  "mark-minervini",
  "michael-price",
  "benjamin-graham",
  "james-oshaughnessy",
  "ultra-short",
  "ma-tangle-break",
  "new-high-momentum",
  "short-roc",
  "day-up-5",
  "pct5d-10",
  "near-high",
  "chip-main-force",
  "chip-branch",
  "chip-large-holders",
  "gooaye-tw-semicon-chain",
  "gooaye-tw-vol-breakout",
]);


/** XQ-style top tabs (legacy groups remapped). */
export const XQ_TAB_ORDER = ["大師", "基本", "籌碼", "技術", "綜合", "週期"];

const LEGACY_CAT_MAP = {
  精選: "綜合",
  價量: "技術",
  財務: "基本",
  技術: "技術",
  基本: "基本",
  籌碼: "籌碼",
  大師: "大師",
  週期: "週期",
  綜合: "綜合",
};

function catLabel(cat) {
  const base = LEGACY_CAT_MAP[cat] || cat;
  return t(`cat${base}`, base);
}

function fmtAsOf(iso) {
  try {
    return (
      new Date(iso).toLocaleString(numberLocale(), {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + t("taipei")
    );
  } catch {
    return iso || "—";
  }
}

function fmtNum(n, d = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(numberLocale(), {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function pctClass(n) {
  if (n == null || Number.isNaN(n)) return "flat";
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}

function fmtPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const s = n > 0 ? "+" : "";
  return `${s}${n.toFixed(2)}%`;
}

export function catOf(s) {
  const raw = s.categoryGroup || s.category || "綜合";
  return LEGACY_CAT_MAP[raw] || raw;
}

function linkJargon(text) {
  // IMPORTANT: do not name the string `t` — that shadows i18n `t()`.
  let html = escapeHtml(text);
  // Apply glossary links carefully — only known whole words already escaped
  html = html.replace(/本益比/g, () => term("pe", t("pe")));
  html = html.replace(/營益率/g, () => term("opMargin", t("opMargin")));
  html = html.replace(/毛利率/g, () => term("grossMargin", t("grossMargin")));
  html = html.replace(/外資/g, () => term("foreignInv", t("foreignInv")));
  html = html.replace(/投信/g, () => term("trustInv", t("trustInv")));
  html = html.replace(/自營商/g, () => term("dealerInv", t("dealerInv")));
  html = html.replace(/均線多頭/g, () => term("maBull", t("maBull")));
  html = html.replace(/RSI/g, () => term("rsi", t("rsi")));
  html = html.replace(/振幅/g, () => term("amplitude", t("amplitude")));
  // 張 as unit — avoid over-linking every 張 in 條件
  html = html.replace(/(\d+)\s*張/g, (_, n) => `${n}${term("zhang", t("zhang"))}`);
  html = html.replace(/＞\s*(\d+)\s*張/g, (_, n) => `＞ ${n}${term("zhang", t("zhang"))}`);
  return html;
}

function statusBadge(st) {
  if (st === "skip") return `<span class="xq-cond-st skip">${escapeHtml(t("condSkip"))}</span>`;
  if (st === "fail") return `<span class="xq-cond-st fail">${escapeHtml(t("condFail"))}</span>`;
  return `<span class="xq-cond-st pass">${escapeHtml(t("condPass"))}</span>`;
}

function metricColumns(strategyId) {
  switch (strategyId) {
    case "ma-bull":
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
        { key: "sma5", label: "SMA5", fmt: (m) => fmtNum(m.sma5) },
        { key: "sma10", label: "SMA10", fmt: (m) => fmtNum(m.sma10) },
        { key: "sma20", label: "SMA20", fmt: (m) => fmtNum(m.sma20) },
        { key: "sma60", label: "SMA60", fmt: (m) => fmtNum(m.sma60) },
        { key: "volRatioYday", label: t("metricVolRatioYday"), fmt: (m) => (m.volRatioYday != null ? fmtNum(m.volRatioYday) + "×" : "—") },
        { key: "volTodayZhang", label: t("metricVolToday"), fmt: (m) => (m.volTodayZhang != null ? fmtNum(m.volTodayZhang, 1) : m.volToday != null ? fmtNum(m.volToday, 0) : "—") },
      ];
    case "peter-lynch":
      return [
        { key: "pe", label: term("pe", t("pe")), fmt: (m) => fmtNum(m.pe, 2), rawLabel: true },
        { key: "revGrowth2yAvgPct", label: "2年營收成長均%", fmt: (m) => (m.revGrowth2yAvgPct != null ? fmtNum(m.revGrowth2yAvgPct, 1) + "%" : "—") },
        { key: "pretaxGrowth5yAvgPct", label: "5年稅前成長均%", fmt: (m) => (m.pretaxGrowth5yAvgPct != null ? fmtNum(m.pretaxGrowth5yAvgPct, 1) + "%" : "—") },
        { key: "debtRatioPct", label: t("metricDebt"), fmt: (m) => (m.debtRatioPct != null ? fmtNum(m.debtRatioPct, 1) + "%" : "—") },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => (m.avgVol5Zhang != null ? fmtNum(m.avgVol5Zhang, 1) : "—") },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
      ];
    case "chip-main-force":
      return [
        { key: "instNet1dZhang", label: "法人1日(張)", fmt: (m) => fmtNum(m.instNet1dZhang, 1) },
        { key: "instNet5dZhang", label: "法人5日(張)", fmt: (m) => fmtNum(m.instNet5dZhang, 1) },
        { key: "foreignNet5dZhang", label: t("foreign5d"), fmt: (m) => fmtNum(m.foreignNet5dZhang, 1) },
        { key: "trustNet5dZhang", label: t("trust5d"), fmt: (m) => fmtNum(m.trustNet5dZhang, 1) },
        { key: "dealerNet5dZhang", label: t("dealer5d"), fmt: (m) => fmtNum(m.dealerNet5dZhang, 1) },
      ];
    case "chip-branch":
      return [
        { key: "foreignBuyStreakDays", label: "外資連買日", fmt: (m) => (m.foreignBuyStreakDays != null ? String(m.foreignBuyStreakDays) : "—") },
        { key: "foreignNet1dZhang", label: t("foreign1d"), fmt: (m) => fmtNum(m.foreignNet1dZhang, 1), rawLabel: true },
        { key: "foreignNet5dZhang", label: t("foreign5d"), fmt: (m) => fmtNum(m.foreignNet5dZhang, 1) },
        { key: "instNet5dZhang", label: "法人5日(張)", fmt: (m) => fmtNum(m.instNet5dZhang, 1) },
      ];
    case "chip-large-holders":
      return [
        { key: "megaHolderPct", label: "大戶>100萬股%", fmt: (m) => (m.megaHolderPct != null ? fmtNum(m.megaHolderPct, 1) + "%" : "—") },
        { key: "largeHolderPct", label: "分級12–15%", fmt: (m) => (m.largeHolderPct != null ? fmtNum(m.largeHolderPct, 1) + "%" : "—") },
        { key: "megaHolderCount", label: ">100萬股人數", fmt: (m) => (m.megaHolderCount != null ? fmtNum(m.megaHolderCount, 0) : "—") },
        { key: "major10pctCount", label: "逾10%大股東家數", fmt: (m) => (m.major10pctCount != null ? fmtNum(m.major10pctCount, 0) : "—") },
        { key: "tdccAsOf", label: "集保日", fmt: (m) => m.tdccAsOf || "—" },
      ];
    case "inst-sync":
      return [
        { key: "foreignNet1dZhang", label: t("foreign1d"), fmt: (m) => fmtNum(m.foreignNet1dZhang, 1), rawLabel: true },
        { key: "trustNet1dZhang", label: t("trust1d"), fmt: (m) => fmtNum(m.trustNet1dZhang, 1), rawLabel: true },
        { key: "dealerNet1dZhang", label: t("dealer1d"), fmt: (m) => fmtNum(m.dealerNet1dZhang, 1), rawLabel: true },
        { key: "foreignNet5dZhang", label: t("foreign5d"), fmt: (m) => fmtNum(m.foreignNet5dZhang, 1) },
        { key: "trustNet5dZhang", label: t("trust5d"), fmt: (m) => fmtNum(m.trustNet5dZhang, 1) },
        { key: "dealerNet5dZhang", label: t("dealer5d"), fmt: (m) => fmtNum(m.dealerNet5dZhang, 1) },
      ];
    case "ultra-short":
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
        { key: "rsi", label: term("rsi", t("rsi")), fmt: (m) => fmtNum(m.rsi, 2), rawLabel: true },
        { key: "rsiPrev", label: "RSI昨", fmt: (m) => fmtNum(m.rsiPrev, 2) },
        { key: "ampPct", label: term("amplitude", t("amplitude")), fmt: (m) => (m.ampPct != null ? fmtNum(m.ampPct, 2) + "%" : "—"), rawLabel: true },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => (m.avgVol5Zhang != null ? fmtNum(m.avgVol5Zhang, 1) : "—") },
      ];

    case "michael-price":
      return [
        { key: "pb", label: "P/B", fmt: (m) => fmtNum(m.pb, 2) },
        { key: "directorHoldPct", label: t("metricDirector"), fmt: (m) => (m.directorHoldPct != null ? fmtNum(m.directorHoldPct, 1) + "%" : "—") },
        { key: "debtRatioPct", label: t("metricDebt"), fmt: (m) => (m.debtRatioPct != null ? fmtNum(m.debtRatioPct, 1) + "%" : "—") },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => fmtNum(m.avgVol5Zhang, 1) },
      ];
    case "michael-sivy":
    case "mark-minervini":
      return [
        { key: "pe", label: term("pe", t("pe")), fmt: (m) => fmtNum(m.pe, 2), rawLabel: true },
        { key: "roe4qPct", label: "4季ROE合計%", fmt: (m) => (m.roe4qPct != null ? fmtNum(m.roe4qPct, 1) + "%" : "—") },
        { key: "debtRatioPct", label: t("metricDebt"), fmt: (m) => (m.debtRatioPct != null ? fmtNum(m.debtRatioPct, 1) + "%" : "—") },
        { key: "revGrowth3y", label: "3年營收成長%", fmt: (m) => (Array.isArray(m.revGrowth3y) ? m.revGrowth3y.map((x) => (x != null ? x + "%" : "—")).join(" → ") : "—") },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => fmtNum(m.avgVol5Zhang, 1) },
      ];
    case "kenneth-fisher":
      return [
        { key: "revGrowth5yAvgPct", label: "5年營收成長均%", fmt: (m) => (m.revGrowth5yAvgPct != null ? fmtNum(m.revGrowth5yAvgPct, 1) + "%" : "—") },
        { key: "pretaxGrowth5yAvgPct", label: "5年稅前成長均%", fmt: (m) => (m.pretaxGrowth5yAvgPct != null ? fmtNum(m.pretaxGrowth5yAvgPct, 1) + "%" : "—") },
        { key: "debtRatioPct", label: t("metricDebt"), fmt: (m) => (m.debtRatioPct != null ? fmtNum(m.debtRatioPct, 1) + "%" : "—") },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => fmtNum(m.avgVol5Zhang, 1) },
      ];
    case "michael-murphy":
      return [
        { key: "roe4qPct", label: "4季ROE合計%", fmt: (m) => (m.roe4qPct != null ? fmtNum(m.roe4qPct, 1) + "%" : "—") },
        { key: "opMargin1qPct", label: t("metricOpQ"), fmt: (m) => (m.opMargin1qPct != null ? fmtNum(m.opMargin1qPct, 1) + "%" : "—") },
        { key: "opMargin3y", label: "3年營益率%", fmt: (m) => (Array.isArray(m.opMargin3y) ? m.opMargin3y.map((x) => (x != null ? x + "%" : "—")).join(" → ") : "—") },
        { key: "revGrowth3yAvgPct", label: "3年營收成長均%", fmt: (m) => (m.revGrowth3yAvgPct != null ? fmtNum(m.revGrowth3yAvgPct, 1) + "%" : "—") },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
      ];
    case "benjamin-graham":
      return [
        { key: "pe", label: term("pe", t("pe")), fmt: (m) => fmtNum(m.pe, 2), rawLabel: true },
        { key: "pb", label: "P/B", fmt: (m) => fmtNum(m.pb, 2) },
        { key: "debtRatioPct", label: t("metricDebt"), fmt: (m) => (m.debtRatioPct != null ? fmtNum(m.debtRatioPct, 1) + "%" : "—") },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => fmtNum(m.avgVol5Zhang, 1) },
      ];
    case "warren-buffett":
      return [
        { key: "roe4qPct", label: "4季ROE合計%", fmt: (m) => (m.roe4qPct != null ? fmtNum(m.roe4qPct, 1) + "%" : "—") },
        { key: "opMargin1qPct", label: t("metricOpQ"), fmt: (m) => (m.opMargin1qPct != null ? fmtNum(m.opMargin1qPct, 1) + "%" : "—") },
        { key: "debtRatioPct", label: t("metricDebt"), fmt: (m) => (m.debtRatioPct != null ? fmtNum(m.debtRatioPct, 1) + "%" : "—") },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => fmtNum(m.avgVol5Zhang, 1) },
      ];
    case "james-oshaughnessy":
      return [
        { key: "pe", label: term("pe", t("pe")), fmt: (m) => fmtNum(m.pe, 2), rawLabel: true },
        { key: "roe4qPct", label: "4季ROE合計%", fmt: (m) => (m.roe4qPct != null ? fmtNum(m.roe4qPct, 1) + "%" : "—") },
        { key: "roeGrowthPct", label: "ROE成長%", fmt: (m) => (m.roeGrowthPct != null ? fmtNum(m.roeGrowthPct, 1) + "%" : "—") },
        { key: "epsGrowthStreak", label: "EPS連季>10%", fmt: (m) => (m.epsGrowthStreak != null ? String(m.epsGrowthStreak) : "—") },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => fmtNum(m.avgVol5Zhang, 1) },
      ];

    case "margin-up":
      return [
        { key: "yoyPairs", label: "YoY配對", fmt: (m) => (Array.isArray(m.yoyPairs) ? m.yoyPairs.join("；") : "—") },
        { key: "yoyOmPct", label: "YoY營益成長%", fmt: (m) => (Array.isArray(m.yoyOmPct) ? m.yoyOmPct.map((x) => (x != null ? x + "%" : "—")).join(" → ") : "—") },
        { key: "yoyGmPct", label: "YoY毛利成長%", fmt: (m) => (Array.isArray(m.yoyGmPct) ? m.yoyGmPct.map((x) => (x != null ? x + "%" : "—")).join(" → ") : "—") },
        { key: "opMargins", label: term("opMargin", t("opMargin")), fmt: (m) => (Array.isArray(m.opMargins) ? m.opMargins.slice(-4).map((x) => (x != null ? x + "%" : "—")).join(" → ") : "—"), rawLabel: true },
        { key: "source", label: t("metricSource"), fmt: (m) => m.source || "—" },
      ];
    case "kostolany-cycle":
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
        { key: "pct5d", label: "5日%", fmt: (m) => fmtPct(m.pct5d), cls: (m) => pctClass(m.pct5d) },
        { key: "pct1m", label: "1月%", fmt: (m) => fmtPct(m.pct1m), cls: (m) => pctClass(m.pct1m) },
        { key: "volRatio", label: t("volRatio"), fmt: (m) => (m.volRatio != null ? fmtNum(m.volRatio) + "×" : "—") },
        { key: "psychologyPhase", label: t("psychologyPhase"), fmt: (m) => (m.psychologyPhase ? enumLabel(m.psychologyPhase) : "—") },
        { key: "cycleStance", label: t("cycleStance"), fmt: (m) => (m.cycleStance ? enumLabel(m.cycleStance) : "—") },
        { key: "liquidityBias", label: t("liquidityBias"), fmt: (m) => (m.liquidityBias ? enumLabel(m.liquidityBias) : "—") },
        { key: "tags", label: t("regimeTags"), fmt: (m) => m.tags || "—" },
        { key: "sizeMult", label: t("sizeMult"), fmt: (m) => (m.sizeMult != null ? fmtNum(m.sizeMult, 2) + "×" : "—") },
      ];
    case "ma-tangle-break":
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
        { key: "smaSpreadPct", label: "均線糾結%", fmt: (m) => (m.smaSpreadPct != null ? fmtNum(m.smaSpreadPct, 2) + "%" : "—") },
        { key: "volRatioYday", label: t("metricVolRatioYday"), fmt: (m) => (m.volRatioYday != null ? fmtNum(m.volRatioYday) + "×" : "—") },
        { key: "sma5", label: "SMA5", fmt: (m) => fmtNum(m.sma5) },
        { key: "sma20", label: "SMA20", fmt: (m) => fmtNum(m.sma20) },
      ];
    case "new-high-momentum":
    case "near-high":
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
        { key: "pct5d", label: "5日%", fmt: (m) => fmtPct(m.pct5d), cls: (m) => pctClass(m.pct5d) },
        { key: "high20", label: "20日高", fmt: (m) => fmtNum(m.high20) },
        { key: "distHigh20Pct", label: "距高%", fmt: (m) => (m.distHigh20Pct != null ? fmtNum(m.distHigh20Pct, 2) + "%" : "—") },
        { key: "volRatioYday", label: t("metricVolRatioYday"), fmt: (m) => (m.volRatioYday != null ? fmtNum(m.volRatioYday) + "×" : "—") },
      ];
    case "short-roc":
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
        { key: "roc10", label: "ROC10%", fmt: (m) => (m.roc10 != null ? fmtNum(m.roc10, 2) + "%" : "—"), cls: (m) => pctClass(m.roc10) },
        { key: "pct5d", label: "5日%", fmt: (m) => fmtPct(m.pct5d), cls: (m) => pctClass(m.pct5d) },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => (m.avgVol5Zhang != null ? fmtNum(m.avgVol5Zhang, 1) : "—") },
      ];
    case "day-up-5":
    case "pct5d-10":
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
        { key: "pct5d", label: "5日%", fmt: (m) => fmtPct(m.pct5d), cls: (m) => pctClass(m.pct5d) },
        { key: "volRatioYday", label: t("metricVolRatioYday"), fmt: (m) => (m.volRatioYday != null ? fmtNum(m.volRatioYday) + "×" : "—") },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => (m.avgVol5Zhang != null ? fmtNum(m.avgVol5Zhang, 1) : "—") },
      ];
    case "earnings-steady":
      return [
        { key: "yoyOmPct", label: "YoY營益成長%", fmt: (m) => (Array.isArray(m.yoyOmPct) ? m.yoyOmPct.map((x) => (x != null ? x + "%" : "—")).join(" → ") : "—") },
        { key: "opMargins", label: term("opMargin", t("opMargin")), fmt: (m) => (Array.isArray(m.opMargins) ? m.opMargins.slice(-4).map((x) => (x != null ? x + "%" : "—")).join(" → ") : "—"), rawLabel: true },
        { key: "source", label: t("metricSource"), fmt: (m) => m.source || "—" },
      ];
    case "low-pe-small":
      return [
        { key: "pe", label: term("pe", t("pe")), fmt: (m) => fmtNum(m.pe, 2), rawLabel: true },
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "marketCapHint", label: "市值代理", fmt: (m) => m.marketCapHint || "—" },
        { key: "avgVol5Zhang", label: "5日均量(張)", fmt: (m) => (m.avgVol5Zhang != null ? fmtNum(m.avgVol5Zhang, 1) : "—") },
      ];
    case "gooaye-tw-semicon-chain":
    case "gooaye-tw-vol-breakout":
    case "gooaye-us-risk-on":
    case "gooaye-us-fomo-filter":
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
        { key: "pct5d", label: "5日%", fmt: (m) => fmtPct(m.pct5d), cls: (m) => pctClass(m.pct5d) },
        { key: "pct1m", label: "1月%", fmt: (m) => fmtPct(m.pct1m), cls: (m) => pctClass(m.pct1m) },
        { key: "volRatio", label: t("metricVolRatioYday"), fmt: (m) => (m.volRatio != null ? fmtNum(m.volRatio) + "×" : "—") },
        { key: "aboveSma50", label: "＞SMA50", fmt: (m) => (m.aboveSma50 ? "Y" : "N") },
      ];
    default:
      return [
        { key: "price", label: t("metricPrice"), fmt: (m) => fmtNum(m.price) },
        { key: "dayPct", label: t("metricDayPct"), fmt: (m) => fmtPct(m.dayPct), cls: (m) => pctClass(m.dayPct) },
      ];
  }
}



function renderPlainTakeaways(strategy) {
  const arr = strategy.plainTakeaways;
  if (!Array.isArray(arr) || !arr.length) return "";
  const lis = arr.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  return `<div class="xq-takeaways"><h4 class="xq-takeaways-h">${escapeHtml(t("researchTakeaways"))}</h4><ul>${lis}</ul></div>`;
}

function renderCalibration(strategy) {
  const c = strategy.calibrationNotes;
  if (!c || typeof c !== "object") return "";
  const matched = Array.isArray(c.matchedXq)
    ? c.matchedXq.map((x) => escapeHtml(x)).join(" · ")
    : "";
  const differs = Array.isArray(c.stillDiffers)
    ? c.stillDiffers.map((x) => escapeHtml(x)).join(" · ")
    : "";
  const units = c.unitsNote || c.units || "";
  const parts = [];
  if (matched) parts.push(`<span class="xq-cal-m">對齊 XQ：${matched}</span>`);
  if (differs) parts.push(`<span class="xq-cal-d">仍差異：${differs}</span>`);
  if (units) parts.push(`<span class="xq-cal-u">${escapeHtml(String(units))}</span>`);
  if (!parts.length) return "";
  return `<p class="xq-calibration" title="${t("calibTitle")}">${parts.join("<br/>")}</p>`;
}

function renderConditions(strategy) {
  const list = (strategy.conditions || [])
    .map((c, i) => {
      const st = c.status || "pass";
      return `<li class="xq-cond ${st}">
        <span class="xq-cond-num">${i + 1}</span>
        <span class="xq-cond-text">${linkJargon(c.text)}</span>
        ${statusBadge(st)}
      </li>`;
    })
    .join("");
  return `<ol class="xq-cond-list">${list}</ol>`;
}

function filterHitsByMarket(hits, market) {
  if (!market || market === "ALL") return hits || [];
  return (hits || []).filter((h) => {
    const m = String(h.market || "").toUpperCase();
    if (m === market) return true;
    const tw = String(h.ticker || "").toUpperCase().endsWith(".TW");
    if (!m) return market === "TW" ? tw : !tw;
    return false;
  });
}

function renderHits(strategy, marketFilter = "TW") {
  const raw = strategy.hits || [];
  const hits = filterHitsByMarket(raw, marketFilter);
  const mktLabel = marketFilter === "US" ? t("usStock") : t("twStock");
  if (strategy.incomplete && !raw.length) {
    const label = escapeHtml(strategy.incompleteLabel || t("dataInsufficient"));
    const blockers = (strategy.blockers || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join("");
    return `<div class="xq-incomplete" role="status">
      <div class="xq-incomplete-badge">${label}</div>
      <ul>${blockers}</ul>
    </div>`;
  }
  if (!hits.length) {
    return `<div class="xq-empty"><p>${escapeHtml(mktLabel)} · ${escapeHtml(t("noHits"))}</p></div>`;
  }

  const cols = metricColumns(strategy.id);
  const head = cols
    .map((c) => `<th>${c.rawLabel ? c.label : escapeHtml(c.label)}</th>`)
    .join("");
  const body = hits
    .map((h) => {
      const m = h.metrics || {};
      const tds = cols
        .map((c) => {
          const cls = c.cls ? c.cls(m) : "";
          return `<td class="num ${cls}">${c.fmt(m)}</td>`;
        })
        .join("");
      return `<tr>
        <td><span class="ticker">${escapeHtml(h.ticker)}</span></td>
        <td class="name-cell">${escapeHtml(h.name || "")}${h.ohlcvBarDate ? `<div class="xq-bar-date">K ${escapeHtml(h.ohlcvBarDate)}</div>` : ""}
          <button type="button" class="xq-btn xq-btn-sm xq-watch-inline" data-xq-watch="${escapeHtml(h.ticker)}" data-xq-watch-name="${escapeHtml(h.name || "")}">${escapeHtml(t("addWatchlist"))}</button>
        </td>
        ${tds}
      </tr>`;
    })
    .join("");
  const cards = hits
    .map((h) => {
      const m = h.metrics || {};
      const metrics = cols
        .map((c) => {
          const cls = c.cls ? c.cls(m) : "";
          return `<div class="xq-m"><span class="xq-ml">${c.rawLabel ? c.label : escapeHtml(c.label)}</span><span class="xq-mv ${cls}">${c.fmt(m)}</span></div>`;
        })
        .join("");
      return `<article class="xq-hit-card">
        <div class="xq-hit-head">
          <div>
            <div class="ticker">${escapeHtml(h.ticker)}</div>
            <div class="name">${escapeHtml(h.name || "")}</div>
            ${h.ohlcvBarDate ? `<div class="xq-bar-date">K棒 ${escapeHtml(h.ohlcvBarDate)}</div>` : ""}
          </div>
          <div class="xq-hit-actions">
            <span class="badge market">${escapeHtml(h.market || marketFilter)}</span>
            <button type="button" class="xq-btn xq-btn-sm" data-xq-watch="${escapeHtml(h.ticker)}" data-xq-watch-name="${escapeHtml(h.name || "")}">${escapeHtml(t("addWatchlist"))}</button>
          </div>
        </div>
        <div class="xq-hit-metrics">${metrics}</div>
      </article>`;
    })
    .join("");

  return `
    <div class="xq-market-block" data-market="${escapeHtml(marketFilter)}">
      <h5 class="xq-market-title">${mktLabel}（${hits.length}）</h5>
      <div class="table-wrap xq-table-wrap">
        <table class="stock-table xq-table">
          <thead><tr><th>代碼</th><th>名稱</th>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
      <div class="xq-mobile-cards">${cards}</div>
    </div>`;
}

export function renderStrategyPanel(strategy, data, marketFilter = "TW") {
  const allHits = strategy.hits || [];
  const hits = filterHitsByMarket(allHits, marketFilter);
  const hitN = hits.length;
  const unchecked = (strategy.unchecked || [])
    .map((u) => `<li class="xq-unchecked">${escapeHtml(u)}</li>`)
    .join("");
  const notes = (strategy.notes || [])
    .map((n) => `<li>${escapeHtml(n)}</li>`)
    .join("");
  const blockers =
    !strategy.incomplete && (strategy.blockers || []).length
      ? `<ul class="xq-blockers">${(strategy.blockers || [])
          .map((b) => `<li>${escapeHtml(b)}</li>`)
          .join("")}</ul>`
      : "";

  return `
    <div class="xq-panel" data-strategy-id="${escapeHtml(strategy.id)}">
      <div class="xq-panel-head">
        <div>
          <h3 class="xq-strategy-name">${escapeHtml(strategy.name)}</h3>
          <div class="xq-tags">
            ${(strategy.xqTags || [strategy.category])
              .map((t) => `<span class="xq-tag">${escapeHtml(t)}</span>`)
              .join("")}
          </div>
        </div>
        <div class="xq-hit-count" title="${t("hitTitle")}">
          <span class="xq-hit-num">${hitN}</span>
          <span class="xq-hit-label">${escapeHtml(t("hitCount"))}</span>
        </div>
      </div>
      ${strategy.description ? `<details class="fold-block"><summary>${escapeHtml(t("strategyDetails"))}</summary><p class="xq-desc fold-p">${escapeHtml(strategy.description)}</p></details>` : ""}
      <div class="xq-meta-row">
        <span>${escapeHtml(t("sessionTwse"))} ${escapeHtml(data.sessionDate || "—")}</span>
        <span>${escapeHtml(t("ohlcvBar"))} ${escapeHtml(strategy.ohlcvBarDates?.[0] || data.ohlcvBarDate || "—")}</span>
        <span>${escapeHtml(t("generated"))} ${fmtAsOf(data.asOf)}</span>
        <span>${escapeHtml(t("universeTw"))} ${data.universe?.tw ?? "—"}</span>
        <span>${escapeHtml(t("universeUs"))} ${data.universe?.us ?? "—"}</span>
      </div>
      <h4 class="xq-sub">${escapeHtml(t("conditions"))}</h4>
      ${renderConditions(strategy)}
      ${renderCalibration(strategy)}
      ${
        strategy.incompleteFilters?.length
          ? `<p class="xq-incomplete-filters">${escapeHtml(t("incompleteFilters"))}${escapeHtml(strategy.incompleteFilters.join("、"))}</p>`
          : ""
      }
      ${unchecked ? `<ul class="xq-unchecked-list">${unchecked}</ul>` : ""}
      ${
        strategy.regimeSnapshot
          ? `<div class="xq-regime-box" role="status">
        <div class="xq-regime-title">${escapeHtml(t("regimeToday"))}</div>
        <div class="xq-regime-grid">
          ${["us", "tw"]
            .map((k) => {
              const r = strategy.regimeSnapshot[k];
              if (!r) return "";
              const phase = r.psychologyPhase ? enumLabel(r.psychologyPhase) : t("dataInsufficient");
              const stanceRaw = r.cycleStance;
              const liq = r.liquidityBias ? enumLabel(r.liquidityBias) : t("dataInsufficient");
              const gaps =
                Array.isArray(r.dataGaps) && r.dataGaps.length
                  ? `<div class="xq-regime-gaps">${escapeHtml(t("dataGaps"))}：${escapeHtml(r.dataGaps.join(", "))}</div>`
                  : "";
              return `<div class="xq-regime-card">
                <div class="xq-regime-mkt">${escapeHtml(k.toUpperCase())}</div>
                <div class="xq-regime-stance">${stanceBadgeHtml(stanceRaw)}</div>
                <div class="xq-regime-metrics">
                  <div><span class="k">${escapeHtml(t("psychologyPhase"))}</span><strong>${escapeHtml(phase)}</strong></div>
                  <div><span class="k">${escapeHtml(t("liquidityBias"))}</span><strong>${escapeHtml(liq)}</strong></div>
                  <div><span class="k">${escapeHtml(t("temperatureScore"))}</span><strong>${escapeHtml(r.temperatureScore == null ? t("dataInsufficient") : String(r.temperatureScore))}</strong></div>
                </div>
                ${gaps}
              </div>`;
            })
            .join("")}
        </div>
      </div>`
          : ""
      }
      ${notes ? `<ul class="xq-notes">${notes}</ul>` : ""}
      ${blockers}
      <div class="xq-toolbar">
        <h4 class="xq-sub">${escapeHtml(t("results"))}</h4>
        <div class="xq-actions">
          <button type="button" class="xq-btn" data-xq-copy>${escapeHtml(t("copyJson"))}</button>
          <button type="button" class="xq-btn" data-xq-csv>${escapeHtml(t("exportCsv"))}</button>
          <a class="xq-btn xq-btn-link" href="${DATA_URL}" download="strategy-screener.json">${escapeHtml(t("exportJson"))}</a>
          <button type="button" class="xq-btn" disabled title="${escapeHtml(t("backtestHint"))}">${escapeHtml(t("backtestSoon"))}</button>
        </div>
      </div>
      ${
        strategy.twOnly || TW_ONLY_IDS.has(strategy.id)
          ? `<div class="xq-market-tabs"><span class="xq-mkt-hint">${escapeHtml(t("twOnlyHint"))}</span></div>`
          : `<div class="xq-market-tabs" role="tablist" aria-label="${escapeHtml(t("hitMarket"))}">
        <button type="button" class="xq-mkt-btn${marketFilter === "TW" ? " active" : ""}" data-xq-market="TW" aria-pressed="${marketFilter === "TW"}">${escapeHtml(t("twStock"))}</button>
        <button type="button" class="xq-mkt-btn${marketFilter === "US" ? " active" : ""}" data-xq-market="US" aria-pressed="${marketFilter === "US"}">${escapeHtml(t("usStock"))}</button>
      </div>`
      }
      ${renderHits(strategy, strategy.twOnly || TW_ONLY_IDS.has(strategy.id) ? "TW" : marketFilter)}
    </div>
  `;
}

export function renderStrategiesSection(placeholder = true) {
  return `
    <section class="section xq-section" id="strategies">
      <h2 class="section-title">${term("strategyScreen", t("strategyScreen"))}</h2>
      <p class="view-lead-tight">${escapeHtml(t("strategyLead"))}</p>
      <div id="xq-root" class="xq-root" aria-label="${escapeHtml(t("strategyScreen"))}">
        ${
          placeholder
            ? `<p class="xq-loading">${escapeHtml(t("strategyLoading"))}</p>`
            : ""
        }
      </div>
    </section>
  `;
}

export async function loadStrategyScreener(url = DATA_URL) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`strategy-screener ${res.status}`);
  return res.json();
}

export function mountStrategies(selector, data) {
  const root = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!root || !data?.strategies?.length) {
    if (root) {
      root.innerHTML = `<div class="xq-empty"><p>${escapeHtml(t("strategyEmpty"))}</p></div>`;
    }
    return;
  }

  // Prefer XQ tab order; include any extra groups so nothing orphans.
  const order = [...XQ_TAB_ORDER];
  for (const c of data.categoryOrder || []) {
    const mapped = LEGACY_CAT_MAP[c] || c;
    if (!order.includes(mapped)) order.push(mapped);
  }
  const byCat = new Map(order.map((c) => [c, []]));
  const orphans = [];
  for (const s of data.strategies) {
    const c = catOf(s);
    if (!byCat.has(c)) {
      byCat.set(c, []);
      order.push(c);
    }
    byCat.get(c).push(s);
  }
  for (const [c, list] of byCat) {
    if (!list.length && !XQ_TAB_ORDER.includes(c)) orphans.push(c);
  }
  void orphans;

  // Default: first non-empty tab's first strategy
  let activeTab = order.find((c) => (byCat.get(c) || []).length) || order[0];
  let activeId = (byCat.get(activeTab) || [])[0]?.id || data.strategies[0].id;
  let marketFilter = "TW";

  const chipHtml = (list, selectedId) =>
    list
      .map((s) => {
        const n = (s.hits || []).length;
        const inc = s.incomplete ? " incomplete" : "";
        const active = s.id === selectedId ? " active" : "";
        return `<button type="button" class="xq-chip${active}${inc}" data-xq-id="${escapeHtml(
          s.id
        )}" aria-pressed="${s.id === selectedId}">
          <span class="xq-chip-name">${escapeHtml(s.name)}</span>
          <span class="xq-chip-n">${s.incomplete ? escapeHtml(t("incomplete")) : escapeHtml(t("hitsTotal", { n }))}</span>
        </button>`;
      })
      .join("");

  const tabsHtml = () =>
    order
      .map((cat) => {
        const list = byCat.get(cat) || [];
        if (!list.length) return "";
        const on = cat === activeTab ? " active" : "";
        return `<button type="button" class="xq-tab${on}" data-xq-tab="${escapeHtml(cat)}" role="tab" aria-selected="${cat === activeTab}">
          <span>${escapeHtml(catLabel(cat))}</span>
          <span class="xq-tab-n">${list.length}</span>
        </button>`;
      })
      .join("");

  const sideNav = () =>
    data.strategies
      .map((s) => {
        const n = (s.hits || []).length;
        const active = s.id === activeId ? " active" : "";
        const inc = s.incomplete ? " incomplete" : "";
        return `<button type="button" class="xq-side-item${active}${inc}" data-xq-id="${escapeHtml(
          s.id
        )}">
          <span>${escapeHtml(s.name)}</span>
          <span class="xq-side-n">${s.incomplete ? escapeHtml(t("incomplete")) : escapeHtml(t("hitsTotal", { n }))}</span>
        </button>`;
      })
      .join("");

  const paintShell = () => {
    const list = byCat.get(activeTab) || [];
    const strategy = data.strategies.find((x) => x.id === activeId) || list[0] || data.strategies[0];
    activeId = strategy.id;
    root.innerHTML = `
      <div class="xq-layout">
        <aside class="xq-sidebar" aria-label="${escapeHtml(t("strategyList"))}">
          <div class="xq-side-title">${escapeHtml(t("navStrategies"))}</div>
          ${sideNav()}
        </aside>
        <div class="xq-main">
          <div class="xq-tabs" role="tablist" aria-label="${escapeHtml(t("strategyCat"))}">${tabsHtml()}</div>
          <div class="xq-chips" aria-label="${escapeHtml(t("strategyList"))}">
            <div class="xq-chip-row">${chipHtml(list, activeId)}</div>
          </div>
          <div class="xq-panel-host">${renderStrategyPanel(strategy, data, marketFilter)}</div>
        </div>
      </div>
      <p class="xq-foot">${escapeHtml((data.disclaimer || "").split("。")[0] + (data.disclaimer ? "。" : ""))}</p>
      <div class="xq-toast" id="xq-toast" hidden role="status"></div>
    `;
  };

  const activateStrategy = (id) => {
    const s = data.strategies.find((x) => x.id === id);
    if (!s) return;
    activeId = id;
    const tab = catOf(s);
    if (tab !== activeTab) activeTab = tab;
    paintShell();
  };

  const activateTab = (tab) => {
    const list = byCat.get(tab) || [];
    if (!list.length) return;
    activeTab = tab;
    if (!list.some((s) => s.id === activeId)) activeId = list[0].id;
    paintShell();
  };

  const showToast = (msg, ms = 2200) => {
    const el = root.querySelector("#xq-toast");
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.hidden = true;
    }, ms);
  };

  const copyTextFallback = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const downloadText = (filename, text, mime) => {
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      return true;
    } catch {
      try {
        const uri = `data:${mime || "text/plain"};charset=utf-8,${encodeURIComponent(text)}`;
        const a = document.createElement("a");
        a.href = uri;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return true;
      } catch {
        return false;
      }
    }
  };

  const loadWatchlist = () => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const saveWatchlist = (arr) => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(arr.slice(0, 200)));
    } catch {
      /* ignore quota */
    }
  };

  const addWatch = (ticker, name) => {
    if (!ticker) return;
    const list = loadWatchlist();
    if (list.some((x) => x.ticker === ticker)) {
      showToast(t("watchlistExists", { ticker }));
      return;
    }
    list.unshift({ ticker, name: name || ticker, addedAt: new Date().toISOString() });
    saveWatchlist(list);
    showToast(t("watchlistAdded", { ticker }));
  };

  // Event delegation — survives panel re-renders; no per-button rebind needed.
  root.onclick = async (ev) => {
    // Prefer closest()-capable node (text nodes / cross-realm instanceof break happy-dom & some webviews)
    const raw = ev.target;
    const tEl =
      raw && typeof raw.closest === "function"
        ? raw
        : raw && raw.parentElement && typeof raw.parentElement.closest === "function"
          ? raw.parentElement
          : null;
    if (!tEl) return;

    const tabBtn = tEl.closest("[data-xq-tab]");
    if (tabBtn && root.contains(tabBtn)) {
      ev.preventDefault();
      activateTab(tabBtn.getAttribute("data-xq-tab"));
      return;
    }

    const idBtn = tEl.closest("[data-xq-id]");
    if (idBtn && root.contains(idBtn)) {
      ev.preventDefault();
      activateStrategy(idBtn.getAttribute("data-xq-id"));
      return;
    }

    const mktBtn = tEl.closest("[data-xq-market]");
    if (mktBtn && root.contains(mktBtn)) {
      ev.preventDefault();
      marketFilter = mktBtn.getAttribute("data-xq-market") || "TW";
      paintShell();
      return;
    }

    const copyBtn = tEl.closest("[data-xq-copy]");
    if (copyBtn && root.contains(copyBtn)) {
      ev.preventDefault();
      const ok = await copyTextFallback(JSON.stringify(data, null, 2));
      showToast(ok ? t("copied") : t("copyFailed"));
      return;
    }

    const csvBtn = tEl.closest("[data-xq-csv]");
    if (csvBtn && root.contains(csvBtn)) {
      ev.preventDefault();
      const id =
        root.querySelector(".xq-panel")?.getAttribute("data-strategy-id") || activeId;
      const s = data.strategies.find((x) => x.id === id);
      if (!s) return;
      const filtered = filterHitsByMarket(
        s.hits || [],
        s.twOnly || TW_ONLY_IDS.has(s.id) ? "TW" : marketFilter
      );
      const csv = hitsToCsv({ ...s, hits: filtered });
      if (!csv) {
        showToast(t("noHitsExport"));
        return;
      }
      const body = "\uFEFF" + csv;
      const ok = downloadText(`${s.id}-hits.csv`, body, "text/csv;charset=utf-8");
      if (ok) showToast(t("csvDownloaded"));
      else {
        const uri = `data:text/csv;charset=utf-8,${encodeURIComponent(body)}`;
        showToast(t("csvBlocked"));
        try {
          window.open(uri, "_blank");
        } catch {
          /* ignore */
        }
      }
      return;
    }

    const watchBtn = tEl.closest("[data-xq-watch]");
    if (watchBtn && root.contains(watchBtn)) {
      ev.preventDefault();
      addWatch(
        watchBtn.getAttribute("data-xq-watch"),
        watchBtn.getAttribute("data-xq-watch-name")
      );
    }
  };

  paintShell();
}

function hitsToCsv(strategy) {
  const hits = strategy.hits || [];
  if (!hits.length) return "";
  const metricKeys = [
    ...new Set(hits.flatMap((h) => Object.keys(h.metrics || {}))),
  ];
  const headers = ["ticker", "name", "market", "ohlcvBarDate", ...metricKeys];
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = hits.map((h) => {
    const m = h.metrics || {};
    return [
      h.ticker,
      h.name,
      h.market,
      h.ohlcvBarDate || "",
      ...metricKeys.map((k) => {
        const v = m[k];
        return Array.isArray(v) ? v.join("|") : v;
      }),
    ]
      .map(esc)
      .join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export async function initStrategies(selector = "#xq-root") {
  const resolveRoot = () =>
    typeof selector === "string" ? document.querySelector(selector) : selector;

  try {
    let root = resolveRoot();
    if (!root) {
      // View may not be in DOM yet — wait one frame then retry once.
      await new Promise((r) => requestAnimationFrame(r));
      root = resolveRoot();
    }
    if (!root) {
      console.warn("initStrategies: #xq-root missing");
      return { ok: false, error: new Error("xq-root missing") };
    }
    const data = await loadStrategyScreener();
    // Re-query after await — remount may have replaced the node.
    root = resolveRoot();
    if (!root) {
      return { ok: false, error: new Error("xq-root gone after fetch") };
    }
    mountStrategies(root, data);
    return { ok: true, data };
  } catch (err) {
    const root = resolveRoot();
    if (root) {
      root.innerHTML = `<div class="xq-empty"><p>${escapeHtml(
        t("strategyLoadError", { msg: err.message })
      )}</p></div>`;
    }
    return { ok: false, error: err };
  }
}
