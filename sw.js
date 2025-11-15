// Service Worker para Super PWA AI
const CACHE_NAME = 'super-pwa-ai-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/css/chat-styles.css',
  '/config/api-config.js',
  '/js/deepseek-handler.js',
  '/js/ai-manager.js',
  '/js/chat-ui.js',
  '/js/app.js',
  '/manifest.json'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el recurso en cache o haz fetch
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
