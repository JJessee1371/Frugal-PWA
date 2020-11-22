const fileCache = 'file-v1';
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
                    if(key !== fileCache && key !== dataCache) {
                        return caches.delete(key);
                    }
                })
            );
        })
        .catch(err => console.log('Activation error: ', err))
    );

    self.clients.claim();
});