/**
 * Plain-language 選股理由 (display only).
 *
 * The daily scan writes a compact reason string per pick, e.g.
 *   「日漲跌 +5.85%（相對 S&P 約 +7.06pp）；五日約 +8.07%；量比約 1.88×；站上雙均線；
 *     站上 SMA200；市場週期姿態 balanced（相位 mid_cycle）。」
 * That string mixes jargon (pp, SMA200, ×) and raw English enum tokens. This module turns it
 * into short everyday-Chinese bullet points for the UI. It never recomputes anything: every
 * number shown is copied character-for-character from the scan's own string; only the words
 * around it change (and a leading +/− becomes 漲/跌 or 強/弱). Unknown segments pass through.
 */
import { enumLabel } from "./i18n.js";

const NUM = "([+\\-−]?\\d+(?:\\.\\d+)?)";
const abs = (s) => String(s).replace(/^[+\-−]/, "");
const neg = (s) => /^[\-−]/.test(String(s));
const zero = (s) => Number(abs(s)) === 0;

/** 「漲 5.85%」/「跌 1.2%」/「持平」 */
function move(n) {
  if (zero(n)) return "持平";
  return `${neg(n) ? "跌" : "漲"} ${abs(n)}%`;
}
/** 「強 7.06 個百分點」/「弱 2 個百分點」 */
function rel(n) {
  if (zero(n)) return "差不多";
  return `${neg(n) ? "弱" : "強"} ${abs(n)} 個百分點`;
}

const REGIME_NOTES = {
  "週期偏防禦：提高雙均線／品質門檻": "大盤偏保守，今天挑得比較嚴：要站上兩條平均線、體質也要較好",
  "週期偏熱：量能不足的高 RS 降權": "大盤偏熱：漲得比大盤多、但成交量跟不上的股票，排名往後放",
  "週期偏熱：縮量上漲降權": "大盤偏熱：上漲但成交量變少的股票，排名往後放",
  "週期偏積極：早段放量相對強度加權": "大盤偏積極：剛開始放量、又比大盤強的股票，排名往前放",
  "週期偏積極：放寬進場節奏": "大盤偏積極，今天進場條件稍微放寬",
  "週期偏積極：價弱量增（firm-hands）加權": "大盤偏積極：價格雖弱、但成交量變大（有人在承接）的股票，排名往前放",
};

const RULES = [
  [new RegExp(`^日漲跌 ${NUM}%（相對 S&P 約 ${NUM}pp）$`), (m) => `今天${move(m[1])}，比 S&P 500 ${rel(m[2])}`],
  [new RegExp(`^日漲跌 ${NUM}%，相對加權約 ${NUM}pp$`), (m) => `今天${move(m[1])}，比加權指數${rel(m[2])}`],
  [new RegExp(`^五日約 ${NUM}%$`), (m) => `近 5 個交易日${move(m[1])}`],
  [new RegExp(`^一個月約 ${NUM}%$`), (m) => `近一個月${move(m[1])}`],
  [new RegExp(`^量比約 ${NUM}×$`), (m) => `成交量約是近 20 日平均的 ${abs(m[1])} 倍`],
  [/^站上雙均線$/, () => "股價在近 20 日、近 50 日的平均價之上"],
  [/^站上 SMA(\d+)$/, (m) => (m[1] === "200" ? "在近 200 日的長期平均價之上" : `股價在近 ${m[1]} 日的平均價之上`)],
  [
    /^週期偏積極：允許站上 SMA(\d+) 但低於 SMA(\d+)$/,
    (m) => `大盤偏積極：股價只要回到近 ${m[1]} 日平均價之上就可以，還沒回到近 ${m[2]} 日平均價也收`,
  ],
  [
    /^市場週期姿態 ([a-z_]+)(?:（相位 ([a-z_]+)）)?$/,
    (m) => (m[2] ? `市場心情「${enumLabel(m[2])}」，今天用「${enumLabel(m[1])}」的標準挑股` : `今天用「${enumLabel(m[1])}」的標準挑股`),
  ],
];

function plainSegment(seg) {
  const s = seg.trim();
  if (!s) return "";
  if (REGIME_NOTES[s]) return REGIME_NOTES[s];
  for (const [re, fn] of RULES) {
    const m = s.match(re);
    if (m) return fn(m);
  }
  // Legacy one-off phrasings: at least drop the jargon units.
  return s.replace(/SMA(\d+)/g, "近 $1 日平均價").replace(/(\d)pp/g, "$1 個百分點");
}

/** Array of plain-language reason lines (may be empty). */
export function whyPoints(why) {
  if (!why) return [];
  return String(why)
    .replace(/[。.]\s*$/, "")
    .split("；")
    .map(plainSegment)
    .filter(Boolean);
}

/** `<ul class="why-list">…</ul>` (escaped) or "" */
export function whyListHtml(why, escapeHtml) {
  const pts = whyPoints(why);
  if (!pts.length) return "";
  return `<ul class="why-list">${pts.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`;
}
