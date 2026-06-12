// AutoSlot Service Worker — Modo Offline (PWA)
const CACHE_NAME = 'autoslot-v1';

// Recursos estáticos que sempre ficam em cache
const STATIC_ASSETS = ['/', '/index.html'];

// Rotas da API que usam estratégia "cache-first" (leitura)
const API_READ_PATTERNS = ['/api/vagas', '/api/reservas', '/api/dashboard'];

// Instalação: pré-cacheia assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: estratégia híbrida
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET (POST, PUT, PATCH, DELETE) — passam direto
  if (request.method !== 'GET') return;

  // API de leitura: network-first, cache como fallback
  const isApiRead = API_READ_PATTERNS.some(p => url.pathname.includes(p));
  if (isApiRead) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Assets estáticos: cache-first
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok && request.url.startsWith(self.location.origin)) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      }
      return response;
    }))
  );
});
