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

//Install portion of SW lifecycle
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