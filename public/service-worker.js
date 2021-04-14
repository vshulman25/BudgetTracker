const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/db.js',
    '/index.js',
    'style.css',

    'https://fonts.googleapis.com/css?family=Istok+Web|Montserrat:800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
];

const PRECACHE = 'cache-v1';
const DATA_CACHE = 'data-cache-v1';

self.addEventListener("install", event => {
    event.waitUntil(caches.open(PRECACHE).then(cache => {
        return cache.addAll(FILES_TO_CACHE)
    }))
})

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
