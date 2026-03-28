const CACHE = "preconsegna-v2";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Let Supabase calls go through network always
  if (e.request.url.includes("supabase.co") || e.request.url.includes("cdnjs") || e.request.url.includes("unpkg")) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Network first, fallback to cache for app files
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
