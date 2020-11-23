const staticCache = 'file-v1';
const dataCache = 'data-v1';
const filesToCache = [
    '/',
    '/index.html',
    '/index.js',
    '/manifest.webmanifest',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

//Installation portion of SW lifecycle
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches
        .open(cache => {
            return cache.addAll(filesToCache);
        })
        .catch(err => console.log('Error caching static assets on install: ', err))
    );

    self.skipWaiting();
});

//Activate SW and clear previous caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches
        .keys()
        .then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== staticCache && key !== dataCache) {
                        return caches.delete(key);
                    }
                })
            );
        })
        .catch(err => console.log('Activation error: ', err))
    );

    self.clients.claim();
});

//
self.addEventListener('fetch', (e) => {
    //Handle API caching
    if(e.request.url.includes('/api')) {
        return e.respondWith(
            caches
            .open(dataCache)
            .then(cache => {
                return fetch(e.request)
                .then(response => {
                    if(response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }

                    return response;
                })
                .catch(err => {
                    //Network failed, locate request in cache
                    return cache.match(e.request);
                })
            })
            .catch(err => console.log('Error fetching API: ', err))
        );
    };
});