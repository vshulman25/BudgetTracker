const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/db.js',
    '/index.js',
    '/style.css',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    '/public/manifest.webmanifest'
];

const PRECACHE = 'cache-v1';
const RUNTIME = 'runtime';
const DATA_CACHE = 'data-cache-v1';

self.addEventListener("install", event => {
    event.waitUntil(caches.open(PRECACHE).then(cache => {
        return cache.addAll(FILES_TO_CACHE).then(self.skipWaiting());
    }))
})

// self.addEventListener('install', (event) => {
//     event.waitUntil(
//       caches
//         .open(PRECACHE)
//         .then((cache) => cache.addAll(FILES_TO_CACHE))
//         .then(self.skipWaiting())
//     );
//   });

  self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
      caches
        .keys()
        .then((cachesToDelete) => {
           Promise.all(
            cachesToDelete.map((cacheToDelete) => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });

self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(caches.open(DATA_CACHE).then(cache => {
            return fetch(event.request).then((response) => {
                return cache.put(event.request.url, response.clone()).then(() => {
                    return response;
                }).catch (err => {
                    return cache.match(err)
                }).catch (err => console.log(err));
            });  
        }))
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then((response) => {
                if (response){ return response }
                else if (event.request.headers("accept").includes("text/html")){
                    return caches.match("/")
                }
            })
        })
    )
})

