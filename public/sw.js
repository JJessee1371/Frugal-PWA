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

const staticCache = "static-cache-v1";
const dataCache = "data-cache-v1";


//Install portion of sw life cycle - cahce all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(staticCache)
            .then(cache => {
                return cache.addAll(filesToCache)
            })
            .catch(err => console.log("SW install caching error: ", err))
    );
    self.skipWaiting();
});

//Activation portion of sw life cycle
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then(keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (key !== staticCache && key !== dataCache) {
                            return caches.delete(key);
                        }
                    })
                )
            })
            .catch(err => console.log("SW activation error: ", err))
    );
    self.clients.claim();
});


//Fetching data
self.addEventListener('fetch', (event) => {
    //Handle API requests
    if (event.request.url.includes("/api")) {
        return event.respondWith(
            caches
                .open(dataCache)
                .then(dataCache => {
                   return fetch(event.request)
                    .then(res => {
                        if (res.status === 200) {
                            dataCache.put(event.request.url, res.clone());
                        }
                        return res;
                    })
                    .catch(err => {
                        console.log("SW fetch response error: ", err);
                        return dataCache.match(event.request);
                    })
                })
                .catch(err => console.log("SW open cache error: ", err))
        )
    }

    //All other requests handled here
    event.respondWith(
        caches
            .match(event.request)
            .then(res => {
                return res || fetch(event.request)                
            })
            .catch(err => console.log("Handle other reqs err: ", err))                
    )
});