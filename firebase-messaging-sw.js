/* Service worker des notifications — à placer à la racine du site, à côté de messages.html */
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

// La configuration est transmise par messages.html dans l'URL d'enregistrement.
let cfg = {};
try { cfg = JSON.parse(new URL(self.location.href).searchParams.get("c") || "{}"); } catch (e) {}
firebase.initializeApp(cfg);
const messaging = firebase.messaging();

// Messages « data » : la notification est affichée ici quand le site n'est pas au premier plan.
messaging.onBackgroundMessage(p => {
  const d = p.data || {};
  return self.registration.showNotification(d.titre || "Club Réussir Ensemble", {
    body: d.corps || "",
    icon: "/icon-512.png",
    badge: "/icon-512.png",
    tag: d.tag || "message",
    data: { lien: d.lien || "messages.html" }
  });
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.lien) || "messages.html", self.registration.scope).href;
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.split("#")[0] === url.split("#")[0] && "focus" in c) { c.navigate(url); return c.focus(); }
      }
      return clients.openWindow(url);
    })
  );
});
