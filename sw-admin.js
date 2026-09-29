// Service worker minimal — sert uniquement à rendre admin.html installable.
// Ne met rien en cache : chaque ouverture recharge la dernière version en ligne.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', e => {
  // Passe-plat : ne modifie aucune requête, juste requis pour l'installabilité.
});
