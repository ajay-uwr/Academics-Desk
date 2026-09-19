const CACHE_NAME = "uwr-academics-desk-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

// On activate, delete any old cache versions (like the stuck v1 cache) so
// nothing frozen sticks around, then take control of open tabs immediately.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Network-first: always fetch the latest version when online, and update the
// cache as it goes. Only falls back to the cached copy if the network request
// fails (genuinely offline) — so GitHub updates show up immediately instead
// of being stuck behind a stale cached copy.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.indexOf("script.google.com") !== -1) return; // never intercept API calls

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
