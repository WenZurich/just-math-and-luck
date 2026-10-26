/**
 * Taiwan public fundamentals: TWSE/TPEX openapi + MOPS 彙總表.
 * Never invents missing metrics — callers must skip names without data.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { signedGrowth, meanOrNull } from "./math-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOPS_CACHE = path.join(__dirname, ".mops-cache");

const UA =
  "Mozilla/5.0 (compatible; JustMathAndLuck/1.0; +https://github.com/WenZurich/Just-Math-and-Luck)";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function parseNum(s) {
  if (s == null) return null;
  const t = String(s)
    .replace(/,/g, "")
    .replace(/%/g, "")
    .replace(/--/g, "")
    .trim();
  if (!t || t === "-" || t === "—") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function rocYearFromGregorian(y) {
  return y - 1911;
}

export function taipeiParts(now = new Date()) {
  const [y, m] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  return { y, m };
}

/** Latest typically disclosed fiscal season (ROC year + season 1-4). */
export function latestDisclosedSeason(now = new Date()) {
  const { y, m } = taipeiParts(now);
  let season;
  let year = y;
  if (m >= 11) season = 3;
  else if (m >= 8) season = 2;
  else if (m >= 5) season = 1;
  else {
    season = 4;
    year = y - 1;
  }
  return { rocYear: rocYearFromGregorian(year), season, gregorianYear: year };
}

function prevSeason(rocYear, season) {
  if (season <= 1) return { rocYear: rocYear - 1, season: 4 };
  return { rocYear, season: season - 1 };
}

export function listRecentSeasons(n = 5, now = new Date()) {
  let { rocYear, season } = latestDisclosedSeason(now);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push([rocYear, season]);
    ({ rocYear, season } = prevSeason(rocYear, season));
  }
  return out;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

let mopsCookie = "";

async function ensureMopsCookie() {
  if (mopsCookie) return mopsCookie;
  try {
    const warm = await fetch("https://mopsov.twse.com.tw/mops/web/t163sb04", {
      headers: { "User-Agent": UA },
    });
    const set = warm.headers.getSetCookie?.() || [];
    mopsCookie = set.map((c) => c.split(";")[0]).join("; ");
  } catch {
    mopsCookie = "";
  }
  return mopsCookie;
}

function mopsHtmlLooksValid(text) {
  if (!text || text.length < 1000) return false;
  if (text.includes("FOR SECURITY REASONS")) return false;
  // Headers often use 公司<br>代號 — raw includes() for 公司代號 fails.
  return (
    text.includes("公司名稱") ||
    text.includes("公司<br>代號") ||
    text.includes("<table")
  );
}

async function postMops(ajaxPath, body, attempt = 0) {
  try {
    fs.mkdirSync(MOPS_CACHE, { recursive: true });
    const fp = path.join(
      MOPS_CACHE,
      `${ajaxPath}_${body.TYPEK}_${body.year}_${String(body.season).padStart(2, "0")}.html`
    );
    if (attempt === 0 && fs.existsSync(fp)) {
      const cached = fs.readFileSync(fp, "utf8");
      if (mopsHtmlLooksValid(cached)) return cached;
    }
  } catch {
    /* ignore cache */
  }

  const urls = [
    `https://mopsov.twse.com.tw/mops/web/${ajaxPath}`,
    `https://mops.twse.com.tw/mops/web/${ajaxPath}`,
  ];
  const payload = new URLSearchParams(body).toString();
  const cookie = await ensureMopsCookie();
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "User-Agent": UA,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://mopsov.twse.com.tw/mops/web/t163sb04",
          Origin: "https://mopsov.twse.com.tw",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: payload,
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!mopsHtmlLooksValid(text)) continue;
      try {
        fs.mkdirSync(MOPS_CACHE, { recursive: true });
        const fp = path.join(
          MOPS_CACHE,
          `${ajaxPath}_${body.TYPEK}_${body.year}_${String(body.season).padStart(2, "0")}.html`
        );
        fs.writeFileSync(fp, text);
      } catch {
        /* ignore */
      }
      return text;
    } catch {
      /* next */
    }
  }
  if (attempt < 2) {
    mopsCookie = ""; // refresh session
    await sleep(1200 + attempt * 800);
    return postMops(ajaxPath, body, attempt + 1);
  }
  return null;
}

function parseHtmlTables(html, rowHandler) {
  if (!html) return;
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  for (const table of tables) {
    const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((m) => m[0]);
    if (rows.length < 2) continue;
    const headerCells = [
      ...rows[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi),
    ].map((c) => c[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
    if (!headerCells.includes("公司代號")) continue;
    for (let r = 1; r < rows.length; r++) {
      const cells = [
        ...rows[r].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi),
      ].map((c) => c[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
      rowHandler(headerCells, cells);
    }
  }
}

function headerIndex(headers, ...candidates) {
  for (const c of candidates) {
    const i = headers.indexOf(c);
    if (i >= 0) return i;
  }
  for (const c of candidates) {
    const i = headers.findIndex((h) => h.includes(c));
    if (i >= 0) return i;
  }
  return -1;
}

export function parseIncomeHtml(html) {
  const out = new Map();
  parseHtmlTables(html, (headers, cells) => {
    const iCode = headerIndex(headers, "公司代號");
    if (iCode < 0) return;
    const code = cells[iCode];
    if (!/^\d{4}$/.test(code)) return;
    const iName = headerIndex(headers, "公司名稱");
    const iRev = headerIndex(headers, "營業收入", "收益", "利息淨收益", "淨收益");
    const iOp = headerIndex(headers, "營業利益", "營業利益（損失）");
    const iPretax = headerIndex(
      headers,
      "稅前淨利（淨損）",
      "繼續營業單位稅前淨利（淨損）"
    );
    const iNi = headerIndex(
      headers,
      "本期淨利（淨損）",
      "本期稅後淨利（淨損）",
      "繼續營業單位本期淨利（淨損）",
      "繼續營業單位本期稅後淨利（淨損）"
    );
    const iEps = headerIndex(headers, "基本每股盈餘（元）", "基本每股盈餘");
    // Prefer 淨額 when present (avoids matching the shorter 營業毛利（毛損） column first incorrectly via includes)
    const iGp = headerIndex(headers, "營業毛利（毛損）淨額", "營業毛利（毛損）");
    out.set(code, {
      code,
      name: iName >= 0 ? cells[iName] : code,
      revenue: iRev >= 0 ? parseNum(cells[iRev]) : null,
      grossProfit: iGp >= 0 ? parseNum(cells[iGp]) : null,
      operatingIncome: iOp >= 0 ? parseNum(cells[iOp]) : null,
      pretax: iPretax >= 0 ? parseNum(cells[iPretax]) : null,
      netIncome: iNi >= 0 ? parseNum(cells[iNi]) : null,
      eps: iEps >= 0 ? parseNum(cells[iEps]) : null,
    });
  });
  return out;
}

export function parseBalanceHtml(html) {
  const out = new Map();
  parseHtmlTables(html, (headers, cells) => {
    const iCode = headerIndex(headers, "公司代號");
    if (iCode < 0) return;
    const code = cells[iCode];
    if (!/^\d{4}$/.test(code)) return;
    const iName = headerIndex(headers, "公司名稱");
    const iAssets = headerIndex(headers, "資產總計", "資產總額");
    const iLiab = headerIndex(headers, "負債總計", "負債總額");
    const iEquity = headerIndex(
      headers,
      "權益總計",
      "權益總額",
      "歸屬於母公司業主之權益合計",
      "權益合計"
    );
    const assets = iAssets >= 0 ? parseNum(cells[iAssets]) : null;
    const liab = iLiab >= 0 ? parseNum(cells[iLiab]) : null;
    const equity = iEquity >= 0 ? parseNum(cells[iEquity]) : null;
    out.set(code, {
      code,
      name: iName >= 0 ? cells[iName] : code,
      assets,
      liabilities: liab,
      equity,
      debtRatio: assets > 0 && liab != null ? liab / assets : null,
    });
  });
  return out;
}

export function parseOperatingAnalysisHtml(html) {
  const out = new Map();
  if (!html) return out;
  const re =
    /<tr[^>]*>\s*<td[^>]*>(\d{4})<\/td>\s*<td[^>]*>([^<]*)<\/td>\s*<td[^>]*>([^<]*)<\/td>\s*<td[^>]*>([^<]*)<\/td>\s*<td[^>]*>([^<]*)<\/td>/gi;
  let m;
  while ((m = re.exec(html))) {
    const gm = parseNum(m[4]);
    const om = parseNum(m[5]);
    if (gm == null && om == null) continue;
    out.set(m[1], {
      code: m[1],
      name: m[2].trim(),
      revenue: parseNum(m[3]),
      grossMargin: gm != null ? gm / 100 : null,
      operatingMargin: om != null ? om / 100 : null,
    });
  }
  return out;
}

/** PE / PB maps: code -> number */
export async function fetchValuationMaps() {
  const pe = new Map();
  const pb = new Map();
  const tw = await fetchJson("https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL");
  if (Array.isArray(tw)) {
    for (const row of tw) {
      const code = String(row.Code || "").trim();
      if (!/^\d{4}$/.test(code)) continue;
      const peV = parseNum(row.PEratio);
      const pbV = parseNum(row.PBratio);
      if (peV != null && peV > 0) pe.set(code, peV);
      if (pbV != null && pbV > 0) pb.set(code, pbV);
    }
  }
  const otc = await fetchJson(
    "https://www.tpex.org.tw/openapi/v1/tpex_mainboard_peratio_analysis"
  );
  if (Array.isArray(otc)) {
    for (const row of otc) {
      const code = String(row.SecuritiesCompanyCode || "").trim();
      if (!/^\d{4}$/.test(code)) continue;
      const peV = parseNum(row.PriceEarningRatio);
      const pbV = parseNum(row.PriceBookRatio);
      if (peV != null && peV > 0 && !pe.has(code)) pe.set(code, peV);
      if (pbV != null && pbV > 0 && !pb.has(code)) pb.set(code, pbV);
    }
  }
  return { pe, pb };
}

/** Director+supervisor holdings / shares outstanding. */
export async function fetchDirectorHoldPct() {
  const out = new Map();
  const detail = await fetchJson("https://openapi.twse.com.tw/v1/opendata/t187ap11_L");
  const profile = await fetchJson("https://openapi.twse.com.tw/v1/opendata/t187ap03_L");
  const shares = new Map();
  if (Array.isArray(profile)) {
    for (const row of profile) {
      const code = String(row.公司代號 || "").trim();
      const sh = parseNum(row.已發行普通股數或TDR原股發行股數);
      if (/^\d{4}$/.test(code) && sh > 0) shares.set(code, sh);
    }
  }
  const otcProfile = await fetchJson(
    "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O"
  );
  if (Array.isArray(otcProfile)) {
    for (const row of otcProfile) {
      const code = String(row.SecuritiesCompanyCode || "").trim();
      if (!/^\d{4}$/.test(code) || shares.has(code)) continue;
      const sh = parseNum(row.IssueShares);
      if (sh > 0) shares.set(code, sh);
    }
  }
  // Unique by 姓名 — same juridical person can appear on multiple board seats.
  const byCodeName = new Map(); // code -> Map(name -> shares)
  if (Array.isArray(detail)) {
    for (const row of detail) {
      const code = String(row.公司代號 || "").trim();
      const title = String(row.職稱 || "");
      if (!/董事|監察/.test(title)) continue;
      if (/法人代表人/.test(title)) continue;
      const name = String(row.姓名 || "").trim();
      if (!name) continue;
      const sh = parseNum(row.目前持股) || 0;
      if (!byCodeName.has(code)) byCodeName.set(code, new Map());
      const m = byCodeName.get(code);
      m.set(name, Math.max(m.get(name) || 0, sh));
    }
  }
  for (const [code, names] of byCodeName) {
    const outSh = shares.get(code);
    if (!(outSh > 0)) continue;
    let sh = 0;
    for (const v of names.values()) sh += v;
    const pct = sh / outSh;
    if (!(pct > 0) || pct > 1.0) continue;
    out.set(code, pct);
  }

  // TPEX: insufficient-holding list is sparse; try profile+detail style if present later.
  return out;
}

/** Latest debt ratio from consolidated BS openapi (TWSE+TPEX). */
export async function fetchLatestDebtRatio() {
  const out = new Map();
  const endpoints = [
    {
      url: "https://openapi.twse.com.tw/v1/opendata/t187ap07_L_ci",
      code: "公司代號",
      assets: "資產總計",
      liab: "負債總計",
    },
    {
      url: "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap07_O_ci",
      code: "SecuritiesCompanyCode",
      assets: "資產總計",
      liab: "負債總計",
    },
  ];
  for (const ep of endpoints) {
    const rows = await fetchJson(ep.url);
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const code = String(row[ep.code] || "").trim();
      if (!/^\d{4}$/.test(code)) continue;
      const assets = parseNum(row[ep.assets]);
      const liab = parseNum(row[ep.liab]);
      if (!(assets > 0) || liab == null) continue;
      out.set(code, liab / assets);
    }
  }
  // Also bank/insurance formats on TWSE
  for (const path of [
    "t187ap07_L_basi",
    "t187ap07_L_ins",
    "t187ap07_L_fh",
    "t187ap07_L_mim",
    "t187ap07_L_bd",
  ]) {
    const rows = await fetchJson(`https://openapi.twse.com.tw/v1/opendata/${path}`);
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const code = String(row.公司代號 || "").trim();
      if (!/^\d{4}$/.test(code) || out.has(code)) continue;
      const assets = parseNum(row.資產總計 ?? row.資產總額);
      const liab = parseNum(row.負債總計 ?? row.負債總額);
      if (!(assets > 0) || liab == null) continue;
      out.set(code, liab / assets);
    }
  }
  return out;
}

export async function fetchMopsIncome(typek, rocYear, season) {
  const html = await postMops("ajax_t163sb04", {
    encodeURIComponent: "1",
    step: "1",
    firstin: "1",
    off: "1",
    isQuery: "Y",
    TYPEK: typek,
    year: String(rocYear),
    season: String(season).padStart(2, "0"),
  });
  return html ? parseIncomeHtml(html) : null;
}

export async function fetchMopsBalance(typek, rocYear, season) {
  const html = await postMops("ajax_t163sb05", {
    encodeURIComponent: "1",
    step: "1",
    firstin: "1",
    off: "1",
    isQuery: "Y",
    TYPEK: typek,
    year: String(rocYear),
    season: String(season).padStart(2, "0"),
  });
  return html ? parseBalanceHtml(html) : null;
}

export async function fetchMopsOpAnalysis(typek, rocYear, season) {
  const html = await postMops("ajax_t163sb06", {
    encodeURIComponent: "1",
    step: "1",
    firstin: "1",
    off: "1",
    isQuery: "Y",
    TYPEK: typek,
    year: String(rocYear),
    season: String(season).padStart(2, "0"),
  });
  return html ? parseOperatingAnalysisHtml(html) : null;
}

function mergeSeasonMap(dest, rocYear, season, map, fields) {
  if (!map) return 0;
  let n = 0;
  for (const [code, row] of map) {
    if (!dest.has(code)) dest.set(code, { code, name: row.name, seasons: [] });
    const rec = dest.get(code);
    if (row.name) rec.name = row.name;
    let pt = rec.seasons.find((s) => s.year === rocYear && s.season === season);
    if (!pt) {
      pt = { year: rocYear, season };
      rec.seasons.push(pt);
    }
    for (const f of fields) {
      if (row[f] != null) pt[f] = row[f];
    }
    n++;
  }
  return n;
}

/**
 * Build TW fundamental bundle used by master + margin strategies.
 */
export async function buildTwFundamentalBundle(opts = {}) {
  const annualYears = opts.annualYears ?? 6;
  const quarterCount = opts.quarterCount ?? 8;
  console.log("▶ TW fundamentals bundle…");

  const [{ pe, pb }, directorPct, debtRatio] = await Promise.all([
    fetchValuationMaps(),
    fetchDirectorHoldPct(),
    fetchLatestDebtRatio(),
  ]);
  console.log(
    "  valuation PE",
    pe.size,
    "PB",
    pb.size,
    "director%",
    directorPct.size,
    "debtRatio",
    debtRatio.size
  );

  /** @type {Map<string, any>} */
  const byCode = new Map();

  // Annual income (season 04) for multi-year growth / OM
  const { rocYear: latestRoc } = latestDisclosedSeason();
  // If latest season isn't Q4 yet, latest full year is previous ROC year
  let latestFullYear = latestDisclosedSeason().season === 4 ? latestRoc : latestRoc - 1;
  // As of Sep 2026 (115), 114 is last full year; 115Q2 exists but not full year.
  const annualList = [];
  for (let i = 0; i < annualYears; i++) annualList.push(latestFullYear - i);

  for (const y of annualList) {
    for (const typek of ["sii", "otc"]) {
      process.stdout.write(`  annual IS ${typek} ${y}Q4… `);
      const map = await fetchMopsIncome(typek, y, 4);
      console.log(map ? map.size : "FAIL");
      if (!map) {
        await sleep(180);
        continue;
      }
      for (const [code, row] of map) {
        if (!byCode.has(code)) byCode.set(code, { code, name: row.name, annual: [], quarters: [] });
        const rec = byCode.get(code);
        if (row.name) rec.name = row.name;
        if (!rec.annual.some((a) => a.year === y)) {
          rec.annual.push({
            year: y,
            revenue: row.revenue,
            operatingIncome: row.operatingIncome,
            pretax: row.pretax,
            netIncome: row.netIncome,
            eps: row.eps,
            operatingMargin:
              row.operatingIncome != null && row.revenue > 0
                ? row.operatingIncome / row.revenue
                : null,
          });
        }
      }
      await sleep(220);
    }
  }

  // Quarterly income + balance for ROE / EPS growth
  const seasons = listRecentSeasons(quarterCount);
  for (const [y, s] of seasons) {
    for (const typek of ["sii", "otc"]) {
      process.stdout.write(`  Q IS ${typek} ${y}Q${s}… `);
      const inc = await fetchMopsIncome(typek, y, s);
      console.log(inc ? inc.size : "FAIL");
      if (inc) {
        for (const [code, row] of inc) {
          if (!byCode.has(code)) byCode.set(code, { code, name: row.name, annual: [], quarters: [] });
          const rec = byCode.get(code);
          if (row.name) rec.name = row.name;
          let q = rec.quarters.find((x) => x.year === y && x.season === s);
          if (!q) {
            q = { year: y, season: s };
            rec.quarters.push(q);
          }
          Object.assign(q, {
            revenueCum: row.revenue,
            operatingIncomeCum: row.operatingIncome,
            pretaxCum: row.pretax,
            netIncomeCum: row.netIncome,
            epsCum: row.eps,
            grossProfitCum: row.grossProfit,
          });
        }
      }
      await sleep(200);
      process.stdout.write(`  Q BS ${typek} ${y}Q${s}… `);
      const bal = await fetchMopsBalance(typek, y, s);
      console.log(bal ? bal.size : "FAIL");
      if (bal) {
        for (const [code, row] of bal) {
          if (!byCode.has(code)) byCode.set(code, { code, name: row.name, annual: [], quarters: [] });
          const rec = byCode.get(code);
          let q = rec.quarters.find((x) => x.year === y && x.season === s);
          if (!q) {
            q = { year: y, season: s };
            rec.quarters.push(q);
          }
          q.equity = row.equity;
          q.debtRatio = row.debtRatio;
          q.assets = row.assets;
          q.liabilities = row.liabilities;
        }
      }
      await sleep(200);
    }
  }

  // Derive single-quarter NI / EPS / OM and ROE
  for (const rec of byCode.values()) {
    rec.annual.sort((a, b) => a.year - b.year);
    rec.quarters.sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.season - b.season
    );
    const qs = rec.quarters;
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      const prev = i > 0 ? qs[i - 1] : null;
      const sameYearPrev =
        prev && prev.year === q.year && prev.season === q.season - 1 ? prev : null;
      const isQ1 = q.season === 1;
      if (isQ1 || !sameYearPrev) {
        q.netIncome = q.netIncomeCum ?? null;
        q.eps = q.epsCum ?? null;
        q.revenue = q.revenueCum ?? null;
        q.operatingIncome = q.operatingIncomeCum ?? null;
        q.grossProfit = q.grossProfitCum ?? null;
      } else {
        q.netIncome =
          q.netIncomeCum != null && sameYearPrev.netIncomeCum != null
            ? q.netIncomeCum - sameYearPrev.netIncomeCum
            : null;
        q.eps =
          q.epsCum != null && sameYearPrev.epsCum != null
            ? q.epsCum - sameYearPrev.epsCum
            : null;
        q.revenue =
          q.revenueCum != null && sameYearPrev.revenueCum != null
            ? q.revenueCum - sameYearPrev.revenueCum
            : null;
        q.operatingIncome =
          q.operatingIncomeCum != null && sameYearPrev.operatingIncomeCum != null
            ? q.operatingIncomeCum - sameYearPrev.operatingIncomeCum
            : null;
        q.grossProfit =
          q.grossProfitCum != null && sameYearPrev.grossProfitCum != null
            ? q.grossProfitCum - sameYearPrev.grossProfitCum
            : null;
      }
      // Margins are ratios (0.25 = 25%). Single-quarter preferred; YTD fallback only if SQ missing.
      q.operatingMargin =
        q.operatingIncome != null && q.revenue > 0
          ? q.operatingIncome / q.revenue
          : q.operatingIncomeCum != null && q.revenueCum > 0
            ? q.operatingIncomeCum / q.revenueCum
            : null;
      q.grossMargin =
        q.grossProfit != null && q.revenue > 0
          ? q.grossProfit / q.revenue
          : q.grossProfitCum != null && q.revenueCum > 0
            ? q.grossProfitCum / q.revenueCum
            : null;
      // Quarterly ROE = SQ NI / period-end equity (ratio). Sum of 4Q ≈ annual ROE proxy.
      q.roe = q.netIncome != null && q.equity > 0 ? q.netIncome / q.equity : null;
    }

    // YoY annual growth series (math-core guarded; see annualGrowthSeries)
    const gs = annualGrowthSeries(rec.annual);
    rec.revGrowthYoY = gs.rev;
    rec.pretaxGrowthYoY = gs.pretax;
  }

  console.log("  fundamental names", byCode.size);
  return {
    pe,
    pb,
    directorPct,
    debtRatio,
    byCode,
    meta: {
      annualYears: annualList,
      quarters: seasons,
      peSize: pe.size,
      pbSize: pb.size,
      directorSize: directorPct.size,
      debtSize: debtRatio.size,
      fundSize: byCode.size,
    },
  };
}

/**
 * Annual YoY growth series from consecutive entries of a year-sorted annual list (same pairing as before:
 * adjacent list entries, so a missing year pairs across the gap). Revenue needs prior revenue > 0; pretax needs
 * prior pretax ≠ 0 (sign-aware: −100 → +50 is +150%). g via math-core signedGrowth: a junk endpoint ⇒ g null
 * (fails every "> threshold" test and makes the average null) instead of NaN or a coerced string.
 */
export function annualGrowthSeries(annual) {
  const rev = [];
  const pretax = [];
  for (let i = 1; i < (annual || []).length; i++) {
    const a = annual[i];
    const b = annual[i - 1];
    if (a.revenue != null && b.revenue > 0) {
      rev.push({ year: a.year, g: signedGrowth(a.revenue, b.revenue, { minAbsPrev: 0, requirePositivePrev: true }) });
    }
    if (a.pretax != null && b.pretax != null && Math.abs(b.pretax) > 0) {
      pretax.push({ year: a.year, g: signedGrowth(a.pretax, b.pretax, { minAbsPrev: 0 }) });
    }
  }
  return { rev, pretax };
}

/** Mean of growth rates — math-core meanOrNull (empty or any null/NaN/string entry ⇒ null, never NaN). */
export function avg(arr) {
  return meanOrNull(arr);
}

export function codeOfTicker(ticker) {
  return String(ticker || "")
    .replace(/\.TW$/i, "")
    .replace(/\.TWO$/i, "");
}
