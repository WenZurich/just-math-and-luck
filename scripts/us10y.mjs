/**
 * US 10Y Treasury yield daily history (percent) from public sources — data only, no thresholds here.
 * Order: Yahoo ^TNX (same series daily-scan already uses) → FRED DGS10 CSV (official H.15, genuine-outage backup).
 * Returns { source, bars: [{ date, c }] } oldest→newest, or null. Never invents a value: FRED "." rows are skipped.
 */
const UA =
  "Mozilla/5.0 (compatible; JustMathAndLuck/1.0; +https://github.com/WenZurich/Just-Math-and-Luck)";

async function fromYahoo() {
  const url = "https://query1.finance.yahoo.com/v8/finance/chart/%5ETNX?interval=1d&range=2y";
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) return null;
  const r = (await res.json())?.chart?.result?.[0];
  const ts = r?.timestamp || [];
  const cl = r?.indicators?.quote?.[0]?.close || [];
  const off = r?.meta?.gmtoffset ?? 0;
  const bars = [];
  for (let i = 0; i < ts.length; i++) {
    const c = cl[i];
    if (c == null || !Number.isFinite(c)) continue;
    bars.push({ date: new Date((ts[i] + off) * 1000).toISOString().slice(0, 10), c });
  }
  return bars.length >= 61 ? { source: "Yahoo ^TNX", bars } : null;
}

async function fromFred() {
  const start = new Date(Date.now() - 420 * 86400e3).toISOString().slice(0, 10);
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10&cosd=${start}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) return null;
  const bars = [];
  for (const line of (await res.text()).split(/\r?\n/).slice(1)) {
    const [date, v] = line.split(",");
    const c = Number(v);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || v === "." || v === "" || !Number.isFinite(c)) continue;
    bars.push({ date, c });
  }
  return bars.length >= 61 ? { source: "FRED DGS10", bars } : null;
}

export async function fetchUs10yHistory() {
  for (const f of [fromYahoo, fromFred]) {
    try {
      const r = await f();
      if (r) return r;
    } catch (e) {
      console.warn(`US10Y ${f.name} failed:`, e.message);
    }
  }
  return null;
}

/** 20-day change already computed by daily-scan into latest.json (key is dUs10y20d). */
export function us10y20dFromRegime(usR) {
  const f = usR?.features || {};
  const v = f.dUs10y20d ?? f.d_US10Y_20d ?? f.dUs10Y_20d ?? null;
  return v != null && Number.isFinite(v) ? v : null;
}
