/* Service worker du Réseau : garde la page en cache pour un démarrage rapide.
   Les données (Firestore, Cloudinary) ne passent jamais par ici. */
const V = 'reseau-v1';
const SHELL = ['reseau.html', 'firebase.js', 'icon-512.png'];
const keep = u => /\/(reseau\.html|firebase\.js|icon-512\.png)$/.test(new URL(u).pathname);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok && keep(r.url)) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('reseau.html') : undefined)))
  );
});
