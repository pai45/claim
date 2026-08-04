/*
 * Benefits Assistant service worker.
 *
 * Deliberately network-first for HTML. The native shell in `mobile/` loads the
 * deployed site so that pushes to main reach users without an app rebuild; a
 * cache-first document strategy would defeat that by pinning stale markup.
 * Hashed build output is safe to serve cache-first because its filenames change
 * whenever the contents do.
 *
 * Bump CACHE_VERSION to force every client onto a fresh cache.
 */

const CACHE_VERSION = "v1";
const SHELL_CACHE = `benefits-assistant-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `benefits-assistant-assets-${CACHE_VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE];

// Resolved from the worker's own location, so `/claim/` and a root-hosted
// deployment both work without a build-time constant.
const SCOPE_URL = new URL("./", self.location);
const SHELL_URL = SCOPE_URL.href;

/** Content-hashed build output: filename changes whenever contents do. */
function isImmutable(url) {
  return url.pathname.startsWith(`${SCOPE_URL.pathname}_next/static/`);
}

/**
 * Documents and the RSC payloads that client navigation fetches alongside them
 * (`.txt` in a static export). Both must stay network-first, or a fresh page
 * could be paired with a stale payload.
 */
function isDocumentRequest(request, url) {
  return (
    request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".txt")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add(new Request(SHELL_URL, { cache: "reload" })))
      // A failed precache must not block activation; the fetch handler copes.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("benefits-assistant-") &&
                !CURRENT_CACHES.includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached =
      (await caches.match(request)) || (await caches.match(SHELL_URL));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(ASSET_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;

  const response = await network;
  if (response) return response;
  throw new Error(`Unable to fetch ${request.url}`);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin traffic is left alone: the OCR model weights and WASM come
  // from a CDN and are far too large to hold in the cache, and hotlinked
  // vehicle photos are not worth persisting.
  if (url.origin !== self.location.origin) return;

  // Stay inside the deployment's own scope.
  if (!url.pathname.startsWith(SCOPE_URL.pathname)) return;

  // Range requests need the real network to serve partial content.
  if (request.headers.has("range")) return;

  if (isDocumentRequest(request, url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isImmutable(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
