const CACHE_NAME = 'system-quest-v21';
const ASSETS = ['./', './index.html', './manifest.json', './icon.ico'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url || '';
  if (
    e.request.method !== 'GET' ||
    url.includes('/api/') ||
    url.includes('api.github.com') ||
    url.includes('raw.githubusercontent.com') ||
    url.includes('generativelanguage.googleapis.com') ||
    url.includes('api.qrserver.com')
  ) {
    return;
  }
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
