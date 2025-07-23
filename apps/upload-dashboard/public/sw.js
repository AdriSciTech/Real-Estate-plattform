// public/sw.js (Service Worker file)
const CACHE_NAME = 'optimized-images-v1';
const IMAGE_CACHE_NAME = 'images-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        // Cache critical resources
        '/',
        '/css/styles.css',
        '/js/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Aggressive caching for images
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then((fetchResponse) => {
            // Only cache successful responses
            if (fetchResponse.ok) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_IMAGES') {
    const urls = event.data.urls;
    caches.open(IMAGE_CACHE_NAME).then((cache) => {
      cache.addAll(urls.map(url => new Request(url, { mode: 'cors' })));
    });
  }
});

// Modern Image Gallery with Virtual Scrolling
