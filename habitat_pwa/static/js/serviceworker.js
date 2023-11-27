// Cache version control
const CACHE_VERSION = 7;
const CURRENT_CACHE = `cache-storage-V${CACHE_VERSION}`;

// List of routes that are going to be cached
const cacheFiles = [
    // pages
    '/base_layout',
    '/',
    '/map',
    '/directions',
    // files
    '/static/db.sqlite3',
    '/static/style.css',
    '/static/img/app-icon.png',
    '/static/img/festival-map.jpg',
    '/static/js/idb.js',
    '/static/js/idbop.js',
    '/static/patua-one-v20-latin-regular.woff2',
    // '/templates/habitat_pwa/base.html',
    // '/templates/habitat_pwa/index.html',
    // '/templates/habitat_pwa/directions.html',
    // '/templates/habitat_pwa/map.html',
]

// activation event: clean up previously registered service workers
self.addEventListener('activate', event =>
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  )
);


// Install event: cache the files
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CURRENT_CACHE).then(function(cache) {
        return cache.addAll(cacheFiles);
        })
    );
});


self.addEventListener('fetch', function(event) {
    event.respondWith((async() => {

    const cache = await caches.open(CURRENT_CACHE);

    try {
        const cachedResponse = await cache.match(event.request);
        if(cachedResponse) {
            console.log('cachedResponse: ', event.request.url);
            return cachedResponse;
        }

        const fetchResponse = await fetch(event.request);
        if(fetchResponse) {
            console.log('fetchResponse: ', event.request.url);
            await cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
        }
    }   catch (error) {
        console.log('Fetch failed: ', error);
        const cachedResponse = await cache.match('/en/offline.html');
        return cachedResponse;
    }
  })());


    // const requestUrl = new URL(event.request.url);
    // if (requestUrl.origin === location.origin) {
    //     if ((requestUrl.pathname === '/')) {
    //         event.respondWith(caches.match('/'));
    //         return;
    //     }
    // }
    // event.respondWith(
    //   caches.match(event.request).then(function(response) {
    //     return response || fetch(event.request);
    //   })
    // );
});