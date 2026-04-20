const admin = require('firebase-admin');
try {
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);
} catch (error) {
  console.error("❌ CRITICAL: Firebase Admin initialization failed.", error);
  process.exit(1);
}
module.exports = { db: admin.firestore() };