# Olympiad habits → screening math guards

Continuous olympiad-level math improvement means **zero tolerance for silent arithmetic errors** in stock selection.

| Olympiad habit | Guard in this repo |
|----------------|--------------------|
| Check domain before applying a formula | Empty / singleton series → `null`, never a fake average |
| Reject undefined objects (NaN, ∞) | `sma` / `pctChange` / `volumeRatio` / ranking refuse non-finite inputs |
| Edge case ÷0 | `pct = (a−b)/b×100` with `b=0` → `null` (no Infinity leak into ranks) |
| Window / denominator invariants | SMA requires `len ≥ n`; volume ratio requires `avgVol > 0` |
| Monotonicity of scoring functionals | Synthetic fixtures assert higher RS / trend / constructive volume raise `baseRankingScore` |
| Clamp and additive checklist arithmetic | Marks `temperatureScore` stays in \[−2, +2\] and composes proxies additively |
| Percent from SMA | `pctFromSma(price,sma)=price/sma−1`; reject `sma≤0` / non-finite (regime units) |
| Drawdown from peak | `peakInWindow` + `drawdownFromPeak(price,peak)=price/peak−1`; reject non-finite / `peak≤0` |
| Compound multi-day returns | `compoundRet(rets)=∏(1+r_i)−1`; reject empty / non-finite / `r≤−1` |
| Weighted blend masses | `weightedMean(values,weights)=Σvw/Σw`; reject mismatch / empty / non-finite / weight<0 / Σw≤0 |
| Logarithmic return | `logReturn(p0,p1)=ln(p1/p0)`; reject non-finite / `p≤0` (regime / compound chain) |

**Run:** `npm run test:math` (also chained from `test:smoke` / `predeploy` so bad math cannot ship).

Implementation: `scripts/math-core.mjs` (pure helpers) + `scripts/math-guards.mjs` (property tests).
Daily drills live outside the site repo: `/workspace/stock-ops-study/math-drills/`.

| Paper options intrinsic/extrinsic + premium×100 cash | `optionIntrinsic` / `optionPremiumCashImpact` reject neg premium & non-int contracts |
| TX/MTX P&L points×mult×contracts + margin hold | `futuresPnlTwd` / `futuresMarginHold`; unknown codes → null (never invent) |
| Paper add-to-position blended cost | `avgCostAfterBuy` result stays between the two prices, avg×qty = total cost; live BUY/SELL replay must match avgCostAtSale and open positions |
| Paper book accounting identities | positionsValue = Σ mark×qty, equity = cash + positionsValue, cash-ledger replay (start − buys + sells = cash), equity − start = realized + unrealized, metrics totalPnl/pct consistent, cash ≥ 0 |
