const CACHE_NAME = 'the-grind-design-v21-final';
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
      console.log('V21 Final: Caching Assets...');
      // 1. Cache file internal (Pasti Berhasil)
      await cache.addAll(ASSETS_TO_CACHE);
      
      // 2. Cache file eksternal (Gunakan Request khusus no-cors)
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
    caches.match(event.request).then((response) => {
      // Jika ada di cache, pakai cache. Jika tidak, ambil dari network.
      return response || fetch(event.request).catch(() => {
          // Jika offline dan file tidak ada di cache (misal gambar baru)
          console.log('Offline & Not in cache');
      });
    })
  );
});
