/* Service worker — Ma Boutique (Club Réussir Ensemble)
   Objectif : l'appli s'ouvre et fonctionne sans connexion.
   - Pages : réseau d'abord (4 s max), sinon la dernière version gardée.
   - Fichiers de l'appli, bibliothèques Firebase et polices : copie locale, mise à jour en arrière-plan.
   - Les échanges avec Firestore / authentification ne sont jamais interceptés. */
const CACHE = "boutique-v2";
const SHELL = ["gestion-boutique.html", "boutiques.html", "firebase.js",
               "manifest-boutique.json", "icon-192.png", "icon-512.png"];
const EXT = [/^https:\/\/www\.gstatic\.com\/firebasejs\//,
             /^https:\/\/fonts\.googleapis\.com\//,
             /^https:\/\/fonts\.gstatic\.com\//];
const STATIC = /\.(js|json|png|jpe?g|svg|ico|css|woff2?)$/i;

function cacheable(u) {
  try {
    const url = new URL(u, self.location.href);
    if (url.origin === self.location.origin) return STATIC.test(url.pathname);
    return EXT.some(re => re.test(url.href));
  } catch (e) { return false; }
}

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function navigate(r) {
  const cache = await caches.open(CACHE);
  const net = fetch(r).then(res => {
    if (res && res.ok && !res.redirected && new URL(r.url).origin === self.location.origin) {
      cache.put(r, res.clone()).catch(() => {});
    }
    return res;
  });
  const timeout = new Promise(res => setTimeout(() => res(null), 4000));
  try {
    const first = await Promise.race([net, timeout]);
    if (first) return first;
  } catch (e) { /* hors ligne : on passe à la copie locale */ }
  const hit = (await cache.match(r, { ignoreSearch: true })) || (await cache.match("gestion-boutique.html"));
  if (hit) return hit;
  return net.catch(() => Response.error());
}

async function stale(r) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(r);
  const net = fetch(r).then(res => {
    if (res && (res.ok || res.type === "opaque")) cache.put(r, res.clone()).catch(() => {});
    return res;
  }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (r.mode === "navigate") { e.respondWith(navigate(r)); return; }
  if (cacheable(r.url)) e.respondWith(stale(r));
});

/* La page nous envoie la liste de ce qu'elle a chargé (1re visite, avant que le worker ne contrôle la page) */
self.addEventListener("message", e => {
  const d = e.data;
  if (!d || d.type !== "cache-urls" || !Array.isArray(d.urls)) return;
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      d.urls.filter(cacheable).map(async u => {
        try {
          if (await c.match(u)) return;
          const res = await fetch(u);
          if (res && res.ok) await c.put(u, res);
        } catch (_) {}
      })
    ))
  );
});

