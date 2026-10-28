// VERBATIM legacy copy (market-regime.mjs L475–602 + daily-scan.mjs screensFor) before 2026-10-29 move to math-core. Oracle only — do not edit.
/**
 * Ranking / screen dial helpers — US/TW separate callers.
 */
export function scoreAdjust(baseScore, m, regime, indexDayPct) {
  if (!regime?.cycleStance) return { score: baseScore, regimeNote: null };
  const stance = regime.cycleStance;
  let score = baseScore;
  let regimeNote = null;
  const rs21 =
    m.d1mPct != null && indexDayPct != null
      ? m.d1mPct / 100 - (regime.features?.ret21d ?? 0)
      : null;

  if (stance === "defensive" || stance === "selective") {
    if (m.above20 && m.above50) score += 1.2;
    else score -= 1.5;
    // K5 demote thin euphoria chase
    if (
      m.d1mPct != null &&
      m.d1mPct >= 8 &&
      m.volRatio != null &&
      m.volRatio < 0.8
    ) {
      score -= 2.5;
      regimeNote = "週期偏熱：量能不足的高 RS 降權";
    }
    if (m.volRatio != null && m.volRatio < 0.7 && (m.dayPct ?? 0) > 2) {
      score -= 1.2;
      regimeNote = regimeNote || "週期偏熱：縮量上漲降權";
    }
    if (!regimeNote) regimeNote = "週期偏防禦：提高雙均線／品質門檻";
  } else if (stance === "aggressive" || stance === "constructive") {
    // Firm hands K2
    if (
      (m.d1mPct ?? 0) < 0 &&
      m.volRatio != null &&
      m.volRatio >= 1.5 &&
      m.above200
    ) {
      score += 2.2;
      regimeNote = "週期偏積極：價弱量增（firm-hands）加權";
    }
    // Earlier RS+vol
    if (m.volRatio != null && m.volRatio >= 1.1 && (m.dayPct ?? 0) > 0) {
      score += 1.0;
      regimeNote = regimeNote || "週期偏積極：早段放量相對強度加權";
    }
    if (!m.above50 && m.above200) {
      score += 0.6;
      regimeNote = regimeNote || "週期偏積極：允許站上 SMA200 但低於 SMA50";
    }
    if (!regimeNote) regimeNote = "週期偏積極：放寬進場節奏";
  } else if (stance === "stabilize_first") {
    score -= 3;
    if (m.above20) score += 1.5;
    else score -= 2;
    regimeNote = "恐慌相位：先穩定再加碼，觀察權重";
  }

  return { score, regimeNote };
}

export function passesScreenA(m, indexDayPct, regime) {
  const rs = m.dayPct - (indexDayPct ?? 0);
  const stance = regime?.cycleStance;

  if (stance === "stabilize_first") {
    // K6 gate: need reclaim SMA20 after shock context
    return !!m.above20 && (rs >= 1.0 || (m.volRatio ?? 0) >= 1.5);
  }

  if (stance === "defensive") {
    const strong =
      m.above20 &&
      m.above50 &&
      (rs >= 0.8 || (m.d5Pct ?? 0) >= 4) &&
      (m.volRatio == null || m.volRatio >= 1.0);
    // demote parabolic thin
    if (
      strong &&
      (m.d1mPct ?? 0) >= 12 &&
      m.volRatio != null &&
      m.volRatio < 0.8
    ) {
      return false;
    }
    return strong;
  }

  if (stance === "selective") {
    return (
      m.above50 &&
      (rs >= 0.5 ||
        (m.d5Pct ?? 0) >= 3 ||
        ((m.d1mPct ?? 0) >= 6 && m.above20))
    );
  }

  if (stance === "aggressive" || stance === "constructive") {
    const early =
      rs >= 0.3 ||
      m.dayPct >= 1.0 ||
      (m.d5Pct ?? 0) >= 2 ||
      ((m.d1mPct ?? 0) >= 4 && m.above20) ||
      (m.above200 &&
        (m.volRatio ?? 0) >= 1.4 &&
        (m.d1mPct ?? 0) < 0); // firm hands
    if (stance === "constructive") {
      return early && (m.above20 || m.above200);
    }
    return early && (m.above200 || m.above20 || (m.volRatio ?? 0) >= 1.3);
  }

  // balanced baseline
  const strongDay = rs >= 0.5 || m.dayPct >= 1.5;
  const mom5 = (m.d5Pct ?? 0) >= 3;
  const mom1m = (m.d1mPct ?? 0) >= 6 && m.above20;
  const aboveBoth = m.above20 && m.above50 && ((m.d5Pct ?? 0) >= 0 || rs >= 0);
  return strongDay || mom5 || mom1m || aboveBoth;
}

export function listSizeForStance(stance, defaultN = 12) {
  if (stance === "defensive") return Math.max(6, Math.round(defaultN * 0.55));
  if (stance === "selective") return Math.max(8, Math.round(defaultN * 0.75));
  if (stance === "stabilize_first") return Math.max(5, Math.round(defaultN * 0.45));
  if (stance === "aggressive") return Math.min(14, defaultN + 2);
  return defaultN;
}

export function screensFor(m, indexDayPct, { forceObserve = false, regime = null } = {}) {
  if (forceObserve) return ["observe"];
  const s = [];
  if (passesScreenA(m, indexDayPct, regime)) s.push("A");
  const volFloor =
    regime?.cycleStance === "defensive"
      ? 1.0
      : regime?.cycleStance === "aggressive"
        ? 1.1
        : 1.2;
  if (m.volRatio != null && m.volRatio >= volFloor) s.push("B");
  // mid-term momentum tag even if day weak
  if (
    !s.includes("A") &&
    (m.d1mPct ?? 0) >= 8 &&
    m.above20 &&
    m.above50 &&
    regime?.cycleStance !== "stabilize_first"
  ) {
    s.push("A");
  }
  if (!s.length) s.push("observe");
  return s;
}
