const SHELL = 'civis-public-shell-v1';
self.addEventListener('install', event => { event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(['/offline', '/icon.svg']))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== SHELL).map(key => caches.delete(key))))); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/auth') || url.pathname.startsWith('/v1')) return;
  if (event.request.mode === 'navigate') event.respondWith(fetch(event.request).catch(() => caches.match('/offline')));
});
