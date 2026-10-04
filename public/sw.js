/* just-math-and-luck PWA service worker
 * Scope: /just-math-and-luck/  (GitHub Pages project site)
 * - Cache shell (HTML/CSS/JS/icons) for offline open
 * - Network-first for data/*.json so daily updates prefer fresh
 */
const BASE = "/just-math-and-luck/";
const SHELL_CACHE = "jml-shell-v12";
const DATA_CACHE = "jml-data-v3";

const PRECACHE_URLS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "icon-192.png",
  BASE + "icon-512.png",
  BASE + "apple-touch-icon.png",
  BASE + "favicon.png",
  BASE + "favicon.svg",
  BASE + "logo.png",
  BASE + "logo.svg",
];

function toPathname(request) {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "";
  }
}

function isDataJson(request) {
  const path = toPathname(request);
  return path.startsWith(BASE + "data/") && path.endsWith(".json");
}

function isSameOriginShell(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  const path = url.pathname;
  if (!path.startsWith(BASE)) return false;
  if (isDataJson(request)) return false;
  // Skip SW itself / chrome-extension etc.
  if (path.endsWith("/sw.js")) return false;
  return true;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
          } catch {
            /* individual asset may 404 during first deploy — ignore */
          }
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, DATA_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("jml-") && !keep.has(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

async function networkFirstData(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidateShell(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((res) => {
      if (res && res.ok && (request.method === "GET" || request.method === undefined)) {
        cache.put(request, res.clone());
      }
      return res;
    })
    .catch(() => null);

  if (cached) {
    void networkPromise;
    return cached;
  }
  const fresh = await networkPromise;
  if (fresh) return fresh;
  // Navigation fallback to cached index for offline open
  if (request.mode === "navigate") {
    const fallback =
      (await cache.match(BASE + "index.html")) ||
      (await cache.match(BASE));
    if (fallback) return fallback;
  }
  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Cross-origin (fonts, CDN): leave to network
  try {
    if (new URL(request.url).origin !== self.location.origin) return;
  } catch {
    return;
  }

  const path = toPathname(request);
  if (!path.startsWith(BASE)) return;

  if (isDataJson(request)) {
    event.respondWith(networkFirstData(request));
    return;
  }

  // HTML navigations: network-first so hashed asset deploys are not stuck behind SWR
  if (request.mode === "navigate" || path === BASE || path === BASE + "index.html") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  if (isSameOriginShell(request)) {
    event.respondWith(staleWhileRevalidateShell(request));
  }
});

async function networkFirstNavigate(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
      try {
        cache.put(BASE + "index.html", fresh.clone());
        cache.put(BASE, fresh.clone());
      } catch {
        /* ignore put alias failures */
      }
    }
    return fresh;
  } catch (err) {
    const fallback =
      (await cache.match(request)) ||
      (await cache.match(BASE + "index.html")) ||
      (await cache.match(BASE));
    if (fallback) return fallback;
    throw err;
  }
}
