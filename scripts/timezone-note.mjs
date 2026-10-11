// Builds latest.json timezoneNote from the real run time and the real last
// session dates of the TW / US index bars. No fixed dates.

const TPE = "Asia/Taipei";

function taipeiParts(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TPE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

const isYmd = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

/**
 * @param {{asOf: string, twCloseDate?: string|null, usCloseDate?: string|null}} a
 *   twCloseDate / usCloseDate = exchange-local date of the last daily bar (YYYY-MM-DD).
 */
export function buildTimezoneNote({ asOf, twCloseDate, usCloseDate }) {
  const tp = taipeiParts(asOf);
  const head = tp ? `資料抓取 ${tp.date} ${tp.time}（台北）` : `資料抓取 ${asOf}`;
  const tw = isYmd(twCloseDate) ? `台股為 ${twCloseDate} 收盤` : "台股收盤日未取得";
  const us = isYmd(usCloseDate) ? `美股為 ${usCloseDate} 收盤（美東）` : "美股收盤日未取得";
  return `${head}；${tw}；${us}。以 asOf 為準。`;
}

/** Short label for other notes, e.g. "10/7 收盤" or "收盤日未取得". */
export function closeLabel(ymd) {
  if (!isYmd(ymd)) return "最新收盤（日期未取得）";
  const [, m, d] = ymd.split("-");
  return `${Number(m)}/${Number(d)} 收盤`;
}
