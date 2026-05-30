import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const b64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
  if (b64Key) {
    try {
      const jsonStr = Buffer.from(b64Key, "base64").toString("utf8");
      const cert = JSON.parse(jsonStr);
      admin.initializeApp({
        credential: admin.credential.cert(cert),
      });
    } catch (err) {
      console.error("Failed to initialize Firebase Admin cert from B64. Using default.", err);
      admin.initializeApp();
    }
  } else {
    admin.initializeApp();
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
