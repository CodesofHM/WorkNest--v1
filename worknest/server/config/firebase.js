const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // 🚀 Production (Railway)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // 💻 Local (fallback file)
  serviceAccount = require("../serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };