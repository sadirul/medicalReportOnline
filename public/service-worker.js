// Minimal service worker: no custom caching.
// Kept only to satisfy PWA install requirements.

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
    self.clients.claim();
});
