/* Service worker des applications abonnées (Registre de l'École + Gestion financière) */
const CACHE='cre-gestion-v2';
const SHELL=['gestion-ecole-abonne.html','gestion-financiere-abonne.html','manifest-ecole.json','manifest-finance.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('cre-gestion-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  if(r.method!=='GET') return;
  /* Bibliothèques Firebase et polices : gardées pour que l'application démarre sans connexion */
  if(['www.gstatic.com','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)){
    e.respondWith(caches.match(r).then(m=>{
      const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>m);
      return m||net;
    }));
    return;
  }
  if(u.origin!==location.origin) return; /* Firestore, Auth : réseau direct (gérés par Firebase) */
  /* Pages : réseau d'abord (version à jour), cache si hors connexion */
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('gestion-ecole-abonne.html'))));
    return;
  }
  /* Autres fichiers du site : cache d'abord */
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>m)));
});
