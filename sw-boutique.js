/* Service worker — Ma Boutique (Club Réussir Ensemble)
   Réseau d'abord ; en cas de coupure, on affiche la dernière page vue. */
const CACHE = "boutique-v1";
const SHELL = ["gestion-boutique.html", "boutiques.html"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || r.mode !== "navigate") return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res && res.ok && new URL(r.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match("gestion-boutique.html")))
  );
});
