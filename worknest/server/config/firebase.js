const admin = require('firebase-admin');
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (admin.apps.length === 0) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("✅ Firebase Admin SDK initialized successfully.");
  }
} catch (error) {
  console.error("❌ CRITICAL: Firebase Admin initialization failed.", error);
  process.exit(1);
}
module.exports = { db: admin.firestore() };