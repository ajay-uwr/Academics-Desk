const CACHE_NAME = "uwr-trainer-desk-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// App shell (HTML/manifest) loads from cache if offline. Data requests to the
// Apps Script backend always go to the network — this never caches your logs.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.indexOf("script.google.com") !== -1) return; // never intercept API calls
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
