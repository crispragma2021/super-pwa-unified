const CACHE = "spwa-v1";
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(["/", "/index.html", "/manifest.json", "/icon-512.png", "/css/main.css", "/js/main.js"])
    )
  );
});
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
