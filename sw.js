const CACHE_NAME = "earring-atelier-v2";
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
  if (event.request.url.indexOf("firestore") !== -1 || event.request.url.indexOf("googleapis") !== -1 || event.request.url.indexOf("gstatic") !== -1){
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        return response;
      })
      .catch(function(){
        return caches.match(event.request);
      })
  );
});
