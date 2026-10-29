// Verbatim legacy oracle (paper-trade.mjs @ b2f1531, applySells rule chain / isLimitUpStyle / applyBuys roomVal).
// Only the surrounding loop/IO is stripped; every expression below is copied unchanged. Study use only.
import { unrealizedReturn, takeProfitQty, unrealizedPnlOf } from "../math-core.mjs";

const STOP_LOSS_RET = -0.03; // 未實現 <= -3% 停損
const TAKE_PROFIT_RET = 0.12; // 未實現 >= +12% 停利
const MOMENTUM_DAY_PCT = -2; // 未站上 SMA20 且日漲跌 < -2%
const LIMIT_UP_DAY_PCT = 9.5; // 接近漲停
const LIMIT_UP_CHASE_DROP = -5; // 隔日急殺
const MAX_POS_PCT = 0.08;
const TW_LOT = 1000;

export function isLimitUpStyle(stock) {
  if (!stock) return false;
  if (typeof stock.dayPct === "number" && stock.dayPct >= LIMIT_UP_DAY_PCT) return true;
  const blob = `${stock.risk || ""} ${stock.why || ""}`;
  return blob.includes("漲停");
}

function unrealizedRet(pos) {
  return unrealizedReturn(pos.mark, pos.avgCost);
}
function lotSizeOf(market) {
  return market === "TW" ? TW_LOT : 1;
}
function unrealizedPnl(pos) {
  const u = unrealizedPnlOf(pos.mark, pos.avgCost, pos.qty);
  return u == null ? NaN : u;
}

/** legacy body of the applySells loop for one position that has a same-day quote q (q.price number). */
export function legacyExitAction(pos, q, { date, market, inList }) {
  const mark = q.price;
  pos.mark = mark;
  const ret = unrealizedRet(pos);
  const dayPct = q && typeof q.dayPct === "number" ? q.dayPct : pos.dayPct;
  const aboveSma20 = q && typeof q.aboveSma20 === "boolean" ? q.aboveSma20 : pos.aboveSma20;

  let action = null;
  // 1 停損
  if (ret != null && ret <= STOP_LOSS_RET) {
    action = { reason: "stop", text: "停損：未實現報酬 ≤ −3%", qty: pos.qty };
  }
  // 2 漲停追價隔日急殺
  else if (
    pos.limitUpStyle &&
    pos.openedOn &&
    pos.openedOn < date &&
    typeof dayPct === "number" &&
    dayPct <= LIMIT_UP_CHASE_DROP
  ) {
    action = {
      reason: "limit-up-chase",
      text: "漲停追價隔日急殺：買進時近漲停，今日日漲跌 ≤ −5%",
      qty: pos.qty,
    };
  }
  // 3 動能轉弱（需要當日報價的 aboveSma20 / dayPct）
  else if (aboveSma20 === false && typeof dayPct === "number" && dayPct < MOMENTUM_DAY_PCT) {
    action = {
      reason: "momentum-break",
      text: "動能轉弱：未站上 SMA20 且當日跌超過 2%",
      qty: pos.qty,
    };
  }
  // 4 離開名單且虧損
  else if (!inList.has(pos.ticker) && unrealizedPnl(pos) < 0) {
    action = {
      reason: "off-list",
      text: "離開當日名單且未實現虧損",
      qty: pos.qty,
    };
  }
  // 5 停利賣一半
  else if (ret != null && ret >= TAKE_PROFIT_RET) {
    const qty = takeProfitQty(pos.qty, lotSizeOf(market));
    if (qty != null) action = { reason: "take-profit", text: "停利：未實現報酬 ≥ +12%（賣一半或全數）", qty };
  }
  return action;
}

/** legacy applyBuys add-on headroom; caller skipped when roomVal <= 0 */
export function legacyRoomVal(equity, pos) {
  return equity * MAX_POS_PCT - pos.qty * pos.mark;
}
