/* Service worker partagé par Gestion école et Gestion financière.
   - fichiers du site : réseau d'abord, copie en cache si hors connexion
   - bibliothèques externes autorisées : cache d'abord, mise à jour en arrière-plan
   - Firebase (données, connexion) : jamais mis en cache, géré par les applications */
const VERSION = 'gestion-v2';
const SHELL = [
  'accueil-gestion.html', 'gestion-ecole-abonne.html', 'gestion-financiere-abonne.html',
  'firebase.js', 'manifest-gestion.json',
  'icon-192.png', 'icon-512.png'
];
const LIBS = ['www.gstatic.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('accueil-gestion.html') : undefined)))
    );
    return;
  }

  if (LIBS.includes(url.hostname)) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
