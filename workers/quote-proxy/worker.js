/**
 * Just Math and Luck — backup quote relay (Cloudflare Worker).
 *
 * Used only when the primary public relay (r.jina.ai) fails. It forwards a GET to a small
 * allowlist of public quote endpoints and adds CORS for the GitHub Pages site.
 *
 *   GET https://<worker>.workers.dev/?url=<encoded absolute upstream URL>
 *
 * - GET / OPTIONS only; everything else → 405.
 * - Upstream must be https and on ALLOWED_HOSTS; anything else → 403.
 * - Short edge cache (EDGE_TTL seconds) so many visitors share one upstream call.
 * - Body is passed through unchanged (no numbers are added or altered).
 * - No secrets, no cookies forwarded.
 */
export const ALLOWED_HOSTS = new Set([
  "query1.finance.yahoo.com",
  "query2.finance.yahoo.com",
  "mis.twse.com.tw",
]);

export const ALLOWED_ORIGINS = new Set([
  "https://wenzurich.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
]);

const EDGE_TTL = 15;
const UPSTREAM_TIMEOUT_MS = 8000;

function corsHeaders(origin) {
  const h = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function reply(status, message, origin) {
  return new Response(JSON.stringify({ relayError: message }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) },
  });
}

/** Validate ?url= → URL object, or an error string. Exported for tests. */
export function parseTarget(requestUrl) {
  let target;
  try {
    const raw = new URL(requestUrl).searchParams.get("url");
    if (!raw) return { error: "missing url" };
    target = new URL(raw);
  } catch {
    return { error: "bad url" };
  }
  if (target.protocol !== "https:") return { error: "https only" };
  if (target.username || target.password) return { error: "no credentials" };
  if (target.port && target.port !== "443") return { error: "port not allowed" };
  if (!ALLOWED_HOSTS.has(target.hostname)) return { error: "host not allowed" };
  return { target };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "GET") return reply(405, "GET only", origin);
    // Browsers always send Origin on cross-site fetch; refuse other sites so this isn't an open proxy.
    if (origin && !ALLOWED_ORIGINS.has(origin)) return reply(403, "origin not allowed", origin);

    const { target, error } = parseTarget(request.url);
    if (error) return reply(error === "host not allowed" ? 403 : 400, error, origin);

    const cache = caches.default;
    const cacheKey = new Request(target.toString(), { method: "GET" });
    let upstream = await cache.match(cacheKey);
    if (!upstream) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
      try {
        upstream = await fetch(target.toString(), {
          method: "GET",
          signal: ctrl.signal,
          headers: {
            Accept: "application/json,text/plain,*/*",
            "User-Agent": "Mozilla/5.0 (compatible; jml-quote-relay/1.0)",
          },
          redirect: "follow",
        });
      } catch (e) {
        return reply(502, `upstream fetch failed: ${e?.name || "error"}`, origin);
      } finally {
        clearTimeout(timer);
      }
      // Only cache successful replies, briefly.
      if (upstream.ok) {
        const body = await upstream.arrayBuffer();
        const ct = upstream.headers.get("Content-Type") || "application/json";
        const toCache = new Response(body, {
          status: upstream.status,
          headers: { "Content-Type": ct, "Cache-Control": `public, max-age=${EDGE_TTL}` },
        });
        ctx.waitUntil(cache.put(cacheKey, toCache.clone()));
        upstream = toCache;
      }
    }

    const headers = new Headers(corsHeaders(origin));
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/json");
    headers.set("Cache-Control", `public, max-age=${EDGE_TTL}`);
    headers.set("X-Relay", "jml-quote-proxy");
    // Pass upstream status through (e.g. Yahoo's own 404 "symbol not found" JSON stays a 404).
    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
