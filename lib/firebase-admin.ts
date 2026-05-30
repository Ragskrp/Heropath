import * as admin from "firebase-admin";

let adminDb: admin.firestore.Firestore | undefined;

function getFirebaseAdminApp() {
  if (admin.apps.length) {
    return admin.app();
  }

  const b64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
  if (!b64Key) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY_B64 environment variable.");
  }

  try {
    const jsonStr = Buffer.from(b64Key, "base64").toString("utf8");
    const cert = JSON.parse(jsonStr);
    admin.initializeApp({
      credential: admin.credential.cert(cert),
      projectId: cert.project_id,
    });
    return admin.app();
  } catch (err) {
    console.error("Failed to initialize Firebase Admin from FIREBASE_SERVICE_ACCOUNT_KEY_B64.", err);
    throw err;
  }
}

export function getAdminDb() {
  if (!adminDb) {
    adminDb = getFirebaseAdminApp().firestore();
    adminDb.settings({ ignoreUndefinedProperties: true });
  }

  return adminDb;
}

export function getAdminAuth() {
  return getFirebaseAdminApp().auth();
}
