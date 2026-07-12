const CACHE_NAME = "earring-atelier-v1";
const URLS_TO_CACHE = ["./", "./index.html"];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  // App shell: cache-first so it opens instantly with no signal.
  // Firebase/Firestore calls go straight to the network (never cached),
  // so sales sync stays live and accurate.
  if (event.request.url.indexOf("firestore") !== -1 || event.request.url.indexOf("googleapis") !== -1){
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request);
    })
  );
});
