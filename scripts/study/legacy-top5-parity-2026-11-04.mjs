// Verbatim legacy copies (daily-scan.mjs at 989940d, lines 623–663) kept as a test oracle only — never imported by the pipeline.
// Cross-market Top-5 and TSM / 2330 ADR parity, wrapped in functions without changing any expression.
function round(n, d = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}
export { round };

export function legacyTop5(usPicks, twPicks) {
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
  return top5;
}

// Parity numbers only (note text is not math); returns the two published numbers or null.
export function legacyParity(tw2330, tsm, taipeiFx) {
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
    };
  }
  return parity;
}
