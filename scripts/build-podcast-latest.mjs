#!/usr/bin/env node
/**
 * Build a tiny summary of the podcast / blog catalogs → public/data/podcast-latest.json
 * so the 名人podcast menu can show "最新一集・日期・總集數" without downloading the
 * large per-show catalogs (gooaye ≈ 650 KB). Pure derivation from the public JSON
 * files already in public/data — no network, nothing invented.
 * Runs automatically before every `npm run build`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "public/data");
const OUT = path.join(DATA, "podcast-latest.json");

const twDate = (iso) => {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(d);
};

function readJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8"));
  } catch {
    return null;
  }
}

function latestOf(items, dateKey) {
  let best = null;
  let bestT = -Infinity;
  for (const it of items || []) {
    const t = new Date(it?.[dateKey]).getTime();
    if (Number.isFinite(t) && t > bestT) {
      bestT = t;
      best = it;
    }
  }
  return best;
}

const shows = {};
for (const [id, file] of [
  ["gooaye", "gooaye-episodes.json"],
  ["xiaojun", "xiaojun-episodes.json"],
  ["whynottv", "whynottv-episodes.json"],
]) {
  const d = readJson(file);
  const eps = d?.episodes || [];
  const last = latestOf(eps, "pubDateIso");
  if (!last) continue;
  shows[id] = {
    kind: "episodes",
    count: eps.length,
    latestEp: Number.isFinite(Number(last.ep)) ? Number(last.ep) : null,
    latestTitle: String(last.title || "").trim(),
    latestDate: twDate(last.pubDateIso),
    catalogAsOf: d.asOf || null,
  };
}

const zj = readJson("zhang-junan-posts.json");
if (zj?.posts?.length) {
  const last = latestOf(zj.posts, "publishedAt");
  shows["zhang-junan"] = {
    kind: "posts",
    count: zj.posts.length,
    latestEp: null,
    latestTitle: String(last?.title || "").trim(),
    latestDate: twDate(last?.publishedAt),
    catalogAsOf: zj.asOf || null,
  };
}

const out = { asOf: new Date().toISOString(), timezone: "Asia/Taipei", shows };
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(
  "podcast-latest:",
  Object.entries(shows)
    .map(([k, v]) => `${k}=${v.count}/${v.latestDate}`)
    .join(" ")
);
