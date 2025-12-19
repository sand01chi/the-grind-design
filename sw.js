const CACHE_NAME = 'the-grind-design-v21.1; 
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './app-logo.png'
];

const EXTERNAL_LIBS = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/locale/id.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('V22 Update: Caching Assets...');
      await cache.addAll(ASSETS_TO_CACHE);
      
      const libraryPromises = EXTERNAL_LIBS.map(async (url) => {
        try {
          const request = new Request(url, { mode: 'no-cors' });
          const response = await fetch(request);
          return await cache.put(url, response);
        } catch (err) {
          console.warn('Failed to cache library:', url);
        }
      });
      return Promise.all(libraryPromises);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
