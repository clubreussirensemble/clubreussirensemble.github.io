/* Service worker — Guinée Service Transport (chauffeur + passager) */
const V = "gst-v1";
const SHELL = ["chauffeur.html", "passager.html", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
/* Réseau d'abord (toujours la dernière version), cache en secours hors connexion.
   Firebase, cartes et GPS ne passent jamais par le cache : seules les requêtes du même site sont gérées. */
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r))
  );
});
