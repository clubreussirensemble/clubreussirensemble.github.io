const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

// À chaque nouveau message, envoie une notification aux autres membres de la discussion.
exports.notifierMessage = onDocumentCreated("reseau_messages/{id}", async event => {
  const m = event.data && event.data.data();
  if (!m || !Array.isArray(m.membres)) return;

  const dests = m.membres.filter(u => u !== m.de);
  if (!dests.length) return;

  const db = admin.firestore();
  const docs = await Promise.all(dests.map(u => db.doc(`reseau_tokens/${u}`).get()));
  const tokens = [], proprio = {};
  docs.forEach(d => {
    if (!d.exists) return;
    (d.data().tokens || []).forEach(t => { tokens.push(t); proprio[t] = d.id; });
  });
  if (!tokens.length) return;

  const apercu = m.mediaUrl
    ? (m.mediaType === "audio" ? "🎤 Message vocal" : m.mediaType === "video" ? "🎥 Vidéo" : "📷 Photo")
    : String(m.texte || "");
  const titre = m.groupe ? (m.groupeNom || "Groupe") : (m.deNom || "Nouveau message");
  const corps = (m.groupe ? String(m.deNom || "").split(" ")[0] + " : " : "") + apercu.slice(0, 120);

  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    data: {
      titre,
      corps,
      tag: String(m.conv || "message"),
      lien: m.groupe ? `messages.html#g:${m.groupe}` : `messages.html#${m.de}`
    },
    webpush: { headers: { Urgency: "high", TTL: "86400" } }
  });

  // Supprime les jetons périmés
  const retraits = [];
  res.responses.forEach((r, i) => {
    const code = r.error && r.error.code;
    if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
      retraits.push(db.doc(`reseau_tokens/${proprio[tokens[i]]}`)
        .update({ tokens: admin.firestore.FieldValue.arrayRemove(tokens[i]) }).catch(() => {}));
    }
  });
  await Promise.all(retraits);
});
