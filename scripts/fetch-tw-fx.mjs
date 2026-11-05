#!/usr/bin/env node
/**
 * Official Taipei interbank USD/TWD close → public/data/usd-twd-taipei.json (+ docs/data).
 *
 * Source: 中央銀行「新臺幣/美元 銀行間收盤匯率」(data from 台北外匯經紀股份有限公司),
 * https://www.cbc.gov.tw/tw/lp-645-1.html — published every TW business day 16:00–17:00 Taipei.
 * Display-only (熱門 strip 「台北收」). It does NOT feed picks, parity or the paper book.
 * Never invents a number: if the page cannot be parsed, the previous snapshot is kept.
 *
 * Manual: npm run fetch-tw-fx
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
export const CBC_FX_URL = "https://www.cbc.gov.tw/tw/lp-645-1.html";
const OUTS = [path.join(ROOT, "public/data/usd-twd-taipei.json"), path.join(ROOT, "docs/data/usd-twd-taipei.json")];
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Parse CBC table rows → [{ date: "YYYY-MM-DD", close }], newest first. Rejects implausible values. */
export function parseCbcFxRows(html) {
  const rows = [];
  const re = /data-th="[^"]*日期[^"]*"[^>]*>\s*<span>\s*(\d{4})\/(\d{2})\/(\d{2})\s*<\/span>[\s\S]*?data-th="NTD\/USD"[^>]*>\s*<span>\s*([0-9]+\.[0-9]+)\s*<\/span>/g;
  let m;
  while ((m = re.exec(String(html || "")))) {
    const close = Number(m[4]);
    const date = `${m[1]}-${m[2]}-${m[3]}`;
    if (!Number.isFinite(close) || close < 20 || close > 50) continue;
    if (Number.isNaN(Date.parse(date + "T00:00:00Z"))) continue;
    if (rows.some((r) => r.date === date)) continue;
    rows.push({ date, close });
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
}

async function main() {
  let html;
  try {
    const res = await fetch(CBC_FX_URL, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (e) {
    console.warn(`fetch-tw-fx: CBC fetch failed (${e?.message || e}); keeping previous snapshot`);
    process.exitCode = 1;
    return;
  }
  const rows = parseCbcFxRows(html);
  if (!rows.length) {
    console.warn("fetch-tw-fx: no rows parsed from CBC page; keeping previous snapshot");
    process.exitCode = 1;
    return;
  }
  const latest = rows[0];
  const prev = rows[1] || null;
  const out = {
    asOf: new Date().toISOString(),
    source: "中央銀行 新臺幣/美元 銀行間收盤匯率（資料來源：台北外匯經紀股份有限公司）",
    sourceUrl: CBC_FX_URL,
    latest: {
      date: latest.date,
      close: latest.close,
      prevDate: prev?.date ?? null,
      prevClose: prev?.close ?? null,
      // TWD per USD: up = 新台幣貶值
      dayChange: prev ? Math.round((latest.close - prev.close) * 1000) / 1000 : null,
    },
    rows: rows.slice(0, 20),
  };
  for (const fp of OUTS) {
    if (!fs.existsSync(path.dirname(fp))) continue;
    fs.writeFileSync(fp, JSON.stringify(out, null, 2) + "\n");
  }
  console.log(`fetch-tw-fx: 台北收 ${latest.date} ${latest.close}${prev ? ` (prev ${prev.date} ${prev.close})` : ""}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
