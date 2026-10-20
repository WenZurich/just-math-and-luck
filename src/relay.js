/**
 * CORS relay chain for public quote endpoints (lookup + live quotes).
 *
 * Order: primary relay r.jina.ai → backup relay (our own Cloudflare Worker, workers/quote-proxy).
 * A step "fails" on network error, timeout, non-2xx, or a body that isn't JSON; then the next step runs.
 * If every step fails the caller gets { ok:false } and keeps its honest error / stale card.
 * The relay never adds or changes numbers — it only passes the upstream body through.
 *
 * QUOTE_PROXY_URL is empty until the Worker is deployed; while empty the chain is jina-only
 * with the original timeouts (behaviour identical to before the backup existed).
 */
export const PRIMARY_RELAY = "https://r.jina.ai/";

/** Deployed Worker base, e.g. "https://jml-quote-proxy.<sub>.workers.dev". Empty = no backup yet. */
export const QUOTE_PROXY_URL = "";

/** Hosts the Worker allowlists (keep in sync with workers/quote-proxy/worker.js ALLOWED_HOSTS). */
export const BACKUP_ALLOWED_HOSTS = new Set([
  "query1.finance.yahoo.com",
  "query2.finance.yahoo.com",
  "mis.twse.com.tw",
]);

/** When a backup exists, give up on the primary sooner so the backup still answers quickly. */
export const PRIMARY_TIMEOUT_WITH_BACKUP_MS = 6000;
export const BACKUP_TIMEOUT_MS = 10000;

/** Backup URL for an absolute upstream URL, or null (no backup configured / host not allowlisted). */
export function backupRelayUrl(absoluteUrl, backupBase = QUOTE_PROXY_URL) {
  if (!backupBase) return null;
  let host;
  try {
    const u = new URL(absoluteUrl);
    if (u.protocol !== "https:") return null;
    host = u.hostname;
  } catch {
    return null;
  }
  if (!BACKUP_ALLOWED_HOSTS.has(host)) return null;
  return `${String(backupBase).replace(/\/+$/, "")}/?url=${encodeURIComponent(absoluteUrl)}`;
}

/** Ordered relay attempts for one upstream URL. */
export function relayAttempts(absoluteUrl, { backupBase = QUOTE_PROXY_URL, primaryTimeoutMs = 18000 } = {}) {
  const backup = backupRelayUrl(absoluteUrl, backupBase);
  const steps = [
    {
      via: "jina",
      url: `${PRIMARY_RELAY}${absoluteUrl}`,
      timeoutMs: backup ? Math.min(primaryTimeoutMs, PRIMARY_TIMEOUT_WITH_BACKUP_MS) : primaryTimeoutMs,
    },
  ];
  if (backup) steps.push({ via: "backup", url: backup, timeoutMs: BACKUP_TIMEOUT_MS });
  return steps;
}

/**
 * Run the chain. fetchText(url,{timeoutMs}) must throw on network error / timeout / non-2xx;
 * parse(text) returns JSON or null. onError(err, step) lets callers inspect error bodies.
 */
export async function fetchViaRelayChain(
  absoluteUrl,
  { fetchText, parse, backupBase = QUOTE_PROXY_URL, primaryTimeoutMs = 18000, onError, only } = {},
) {
  const errors = [];
  for (const step of relayAttempts(absoluteUrl, { backupBase, primaryTimeoutMs })) {
    if (only && !only.includes(step.via)) continue;
    try {
      const text = await fetchText(step.url, { timeoutMs: step.timeoutMs });
      const data = parse(text);
      if (data) return { ok: true, data, via: step.via, errors };
      errors.push(`${step.via}: parse`);
    } catch (e) {
      if (onError) onError(e, step);
      errors.push(`${step.via}: ${e?.message || e}`);
    }
  }
  return { ok: false, data: null, via: null, errors };
}
