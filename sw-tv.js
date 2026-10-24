/* Service Worker (sw-tv.js) — TV gratuite (Club Réussir Ensemble de Mamou)
   Met en cache la page et ses scripts pour qu'elle s'ouvre sans connexion.
   Les flux vidéo et les listes de chaînes ne passent JAMAIS par ici
   (les listes sont enregistrées par la page dans IndexedDB). */
const CACHE = 'tv-gratuite-v1';
const PAGE = 'tv-gratuite.html';
const CDN = ['https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled([c.add(PAGE), ...CDN.map(u => c.add(u))])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page : réseau d'abord (toujours à jour), cache si hors ligne
  if (req.mode === 'navigate' && url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(PAGE, copy));
        return r;
      }).catch(() => caches.match(PAGE))
    );
    return;
  }

  // Script hls.js et polices : cache d'abord, mise à jour en arrière-plan
  if (CDN.includes(req.url) || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(r => {
          if (r && (r.ok || r.type === 'opaque')) {
            const copy = r.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return r;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
  // Tout le reste (flux, listes M3U, publicités) : réseau normal.
});
