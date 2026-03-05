/* Antika Restaurant - Service Worker */

const CACHE_NAME = 'antika-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/index.css',
  '/css/lang.css',
  '/css/spotify.css',
  '/js/index.js',
  '/js/lang.js',
  '/assets/menu.json',
  '/assets/images/logo antika.png',
  '/assets/icons/peru.jpg',
  '/assets/icons/eeuu.webp',
  '/assets/icons/brasil.png',
  '/assets/icons/google.png',
  '/assets/icons/wasap2.png'
];

/* Instalar Service Worker y cachear assets */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
      console.log('[SW] Error al cachear assets:', err);
    })
  );
  self.skipWaiting();
});

/* Activar Service Worker y limpiar caches antiguos */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* Estrategia de fetcheo: Network-first para datos, Cache-first para assets */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* No cachear: API calls, chrome extensions, etc */
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  /* Assets estáticos: Cache-first */
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        }).catch(() => {
          return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
    );
    return;
  }

  /* Datos dinámicos (JSON, APIs): Network-first */
  if (request.url.includes('.json') || request.url.includes('maps') || request.url.includes('googleapis')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return caches.match(request);
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).catch(() => {
            return new Response('Contenido no disponible', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
    return;
  }

  /* Default: Network-first */
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return caches.match(request);
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

/* Helper: detectar si es un asset estático */
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|webp|svg|woff|woff2|eot|ttf|otf)$/i.test(pathname);
}

/* Escuchar mensajes desde el cliente */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
