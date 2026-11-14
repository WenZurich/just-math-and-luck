#!/usr/bin/env node
/**
 * Auto-settle expired paper options / 台指期 at official close or TAIFEX
 * final settlement price. Writes public/data/paper-derivatives.json
 * (and docs/data when present). Never invents prices; never touches
 * stock-picking math or the equity paper book (paper-portfolio.json).
 *
 * Hooked from `npm run paper` so future daily runs settle leftovers.
 *
 * Manual: node scripts/paper-settle-derivatives.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { settleExpiredDerivatives } from "../src/paper-derivatives-settle.js";
import { isYmd, isFiniteNumber } from "../src/paper-derivatives-math.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BOOK_PATH = join(ROOT, "public/data/paper-derivatives.json");
const DOCS_DATA = join(ROOT, "docs/data");
const TXF_PATH = join(ROOT, "public/data/txf-desk.json");
const TZ = "Asia/Taipei";

/** Official prices looked up for this book (primary URLs, not invented). */
const OFFICIAL_OPTIONS = [
  {
    underlying: "NVDA",
    expiry: "2026-10-30",
    officialClose: 204.64,
    source: "NVIDIA official stock quote & chart (XNAS:NVDA close 2026-10-30)",
    sourceUrl: "https://investor.nvidia.com/stock-info/stock-quote-and-chart/",
  },
];

const OFFICIAL_FUTURES = [
  {
    code: "TX",
    month: "202610",
    officialSettlement: 46650,
    finalSettlementDay: "2026-10-21",
    source: "TAIFEX 指數期貨最後結算價（臺股期貨 TX/MTX/TMF 契約月份 202610）",
    sourceUrl:
      "https://www.taifex.com.tw/cht/5/futIndxFSP?commodityIds=1&end_month=10&end_year=2026&start_month=10&start_year=2026",
  },
];

function taipeiYmd(d = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

function taipeiIso(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const g = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  return `${g.year}-${g.month}-${g.day}T${g.hour}:${g.minute}:${g.second}+08:00`;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Desk recentSettlement can fill a just-expired listed month; never overrides a verified official row. */
function quotesFromTxfDesk(existingFutures) {
  if (!existsSync(TXF_PATH)) return existingFutures;
  try {
    const txf = loadJson(TXF_PATH);
    const fsp = txf?.calendar?.recentSettlement;
    if (!fsp || !isFiniteNumber(fsp.finalSettlementPrice) || !(fsp.finalSettlementPrice > 0)) {
      return existingFutures;
    }
    const codes = String(fsp.contract || "")
      .split("/")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const month = fsp.deliveryMonth;
    if (!month || !codes.length) return existingFutures;
    const out = [...existingFutures];
    for (const code of codes) {
      const already = out.some((q) => String(q.code).toUpperCase() === code && q.month === month);
      if (already) continue;
      out.push({
        code,
        month,
        officialSettlement: fsp.finalSettlementPrice,
        finalSettlementDay: fsp.finalSettlementDay || null,
        source: "TAIFEX OpenAPI FinalSettlementPriceIndexFutures via txf-desk.json",
        sourceUrl: "https://openapi.taifex.com.tw/v1/FinalSettlementPriceIndexFutures",
      });
    }
    return out;
  } catch {
    return existingFutures;
  }
}

function summarizeUs(book) {
  const pos = (book.US.positions || []).filter((p) => p.asset === "option" && p.qtySigned);
  const lastSettle = [...(book.US.trades || [])].reverse().find((t) => t.reason === "expiry-settle");
  if (pos.length) {
    return {
      zh: book.US.summaryZh,
      en: book.US.summaryEn,
    };
  }
  if (lastSettle) {
    const close = lastSettle.officialClose;
    const pnl = lastSettle.realizedPnl;
    return {
      zh: `已到期結算：${lastSettle.underlying} ${lastSettle.expiry} ${lastSettle.strike} ${String(lastSettle.right).toUpperCase()} ${lastSettle.qty} 口，官方收盤 ${close}，實現損益 US$${Number(pnl).toFixed(2)}。來源 ${lastSettle.sourceUrl || lastSettle.source || ""}。選擇權現金調整 US$${Number(book.US.cashAdj).toFixed(2)}。`,
      en: `Expired and settled: ${lastSettle.qty} ${lastSettle.underlying} ${lastSettle.expiry} ${lastSettle.strike} ${lastSettle.right} at official close ${close}. Realized P&L US$${Number(pnl).toFixed(2)}. Source ${lastSettle.sourceUrl || lastSettle.source || ""}. Option cashAdj US$${Number(book.US.cashAdj).toFixed(2)}.`,
    };
  }
  return { zh: book.US.summaryZh, en: book.US.summaryEn };
}

function summarizeTw(book) {
  const pos = (book.TW.positions || []).filter((p) => p.asset === "futures" && p.qtySigned);
  const lastSettle = [...(book.TW.trades || [])].reverse().find((t) => t.reason === "expiry-settle");
  if (pos.length) {
    return { zh: book.TW.summaryZh, en: book.TW.summaryEn };
  }
  if (lastSettle) {
    const pnl = lastSettle.realizedPnl;
    const released = lastSettle.marginReleased;
    return {
      zh: `已到期結算：${lastSettle.code} ${lastSettle.month} ${lastSettle.qty} 口，期交所最後結算價 ${lastSettle.officialSettlement ?? lastSettle.price}。保證金已釋放 NT$${Number(released || 0).toLocaleString("en-US")}，實現損益 NT$${Number(pnl).toLocaleString("en-US")}。來源 ${lastSettle.sourceUrl || lastSettle.source || ""}。占用保證金現為 NT$0。`,
      en: `Expired and settled: ${lastSettle.qty} ${lastSettle.code} ${lastSettle.month} at official final settlement ${lastSettle.officialSettlement ?? lastSettle.price}. Margin released NT$${Number(released || 0).toLocaleString("en-US")}; realized P&L NT$${Number(pnl).toLocaleString("en-US")}. Source ${lastSettle.sourceUrl || lastSettle.source || ""}. Margin hold is now NT$0.`,
    };
  }
  return { zh: book.TW.summaryZh, en: book.TW.summaryEn };
}

function main() {
  if (!existsSync(BOOK_PATH)) {
    console.error("FAIL: missing public/data/paper-derivatives.json");
    process.exit(1);
  }
  const book = loadJson(BOOK_PATH);
  if (book.version !== 1 || book.booksSeparate !== true) {
    console.error("FAIL: paper-derivatives.json must be v1 and booksSeparate");
    process.exit(1);
  }
  if (book.screenerMathGate !== "closed") {
    console.error("FAIL: will not run while screener math gate is not closed");
    process.exit(1);
  }

  const asOfYmd = taipeiYmd();
  const asOfIso = taipeiIso();
  const quotes = {
    asOfYmd,
    asOfIso,
    options: OFFICIAL_OPTIONS,
    futures: quotesFromTxfDesk(OFFICIAL_FUTURES),
  };

  const result = settleExpiredDerivatives(book, quotes);
  if (!result.ok) {
    console.error(`FAIL: settle engine: ${result.error || "unknown"}`);
    process.exit(1);
  }

  for (const s of result.skipped) {
    if (s.reason === "missing-official-close" || s.reason === "missing-official-settlement") {
      console.warn(`WARN: left open (no official price): ${s.market} ${s.asset} ${s.key}`);
    }
  }

  if (!result.settled.length) {
    console.log(`NO-OP: no expired derivatives to settle (asOf ${asOfYmd})`);
    return;
  }

  const next = result.book;
  next.screenerMathGate = "closed";
  next.booksSeparate = true;
  next.cumulative = true;
  const usSum = summarizeUs(next);
  const twSum = summarizeTw(next);
  next.US.summaryZh = usSum.zh;
  next.US.summaryEn = usSum.en;
  next.TW.summaryZh = twSum.zh;
  next.TW.summaryEn = twSum.en;
  next.officialSettlements = {
    asOf: asOfIso,
    options: quotes.options,
    futures: quotes.futures.filter((q) =>
      result.settled.some((s) => s.market === "TW" && s.key === `${q.code}|${q.month}`)
    ).concat(
      // keep every official row used or listed for audit
      []
    ),
  };
  // Keep the full official quote lists we actually used (options always recorded; futures used + known).
  next.officialSettlements.futures = quotes.futures.filter((q) =>
    (next.TW.trades || []).some(
      (t) => t.reason === "expiry-settle" && t.code === q.code && t.month === q.month
    )
  );

  const json = JSON.stringify(next, null, 2) + "\n";
  writeFileSync(BOOK_PATH, json);
  if (existsSync(DOCS_DATA) || existsSync(join(ROOT, "docs"))) {
    mkdirSync(DOCS_DATA, { recursive: true });
    writeFileSync(join(DOCS_DATA, "paper-derivatives.json"), json);
  }

  console.log(`OK: settled ${result.settled.length} expired derivative(s) asOf=${asOfIso}`);
  for (const s of result.settled) {
    if (s.asset === "option") {
      console.log(
        `  US ${s.key} officialClose=${s.officialClose} settlePremium=${s.settlePremium} cashDelta=${s.cashDelta} realizedPnl=${s.realizedPnl} ${s.sourceUrl || ""}`
      );
    } else {
      console.log(
        `  TW ${s.key} officialSettlement=${s.officialSettlement} realizedPnl=${s.realizedPnl} marginReleased=${s.marginReleased} ${s.sourceUrl || ""}`
      );
    }
  }
  console.log(`  US cashAdj=${next.US.cashAdj} realizedPnl=${next.US.realizedPnl} marginHold=${next.US.marginHold} open=${(next.US.positions || []).length}`);
  console.log(`  TW cashAdj=${next.TW.cashAdj} realizedPnl=${next.TW.realizedPnl} marginHold=${next.TW.marginHold} open=${(next.TW.positions || []).length}`);
  console.log(`Wrote ${BOOK_PATH}`);
}

main();
