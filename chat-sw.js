// Service worker minimal — Espace élève (Chat_eleves.html)
// Rend l'application installable ; les données (Firebase) restent toujours en ligne.
const CACHE = 'cre-chat-v1';
const SHELL = ['Chat_eleves.html', 'icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Ne jamais mettre en cache Firebase / Google : toujours le réseau
  if (url.origin !== location.origin) return;
  // Réseau d'abord, cache en secours (hors-ligne)
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('Chat_eleves.html')))
  );
});
