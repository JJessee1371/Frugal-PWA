const filesToCache = [
    "/",
    "/index.js",
    "/db.js",
    "/index.html",
    "/styles.css",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];
  
const staticCache = "static-cache-v2";
const dataCache = "data-cache-v1";

//Install portion of service worker life cycle
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(staticCache).then(cache => {
        return cache.addAll(filesToCache);
        })
    );
    self.skipWaiting();
    });

    //Activate portion of service worker life cycle
    self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(keyList => {
        return Promise.all(
            keyList.map(key => {
            if (key !== staticCache && key !== dataCache) {
                console.log("Deleting cache", key);
                return caches.delete(key);
            }
            })
        );
        })
    );
    self.clients.claim();
});


// Hanlde fetch requests
self.addEventListener("fetch", function (event) {
    // Cache all API requests
    if (event.request.url.includes("/api/")) {
        event.respondWith(
        caches.open(dataCache).then(cache => {
            return fetch(event.request)
            .then(response => {
                // If response is good, clone it and store it
                if (response.status === 200) {
                cache.put(event.request.url, response.clone());
                }

                return response;
            })
            .catch(err => {
                // Network request failed, retreive data from cache
                return cache.match(event.request);
            });
        }).catch(err => { return cache.match(event.request) }
        )
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
        })
        .catch((err) => {
            console.error(err.stack)
        })
    );
});