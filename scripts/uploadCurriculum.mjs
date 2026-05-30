import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import admin from "firebase-admin";

const inputPath = process.argv[2] || "data/curriculum.generated.json";

function loadDotEnvLocal() {
  try {
    const envText = readFileSync(".env.local", "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) {
        process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // .env.local is optional.
  }
}

function getAdminDb() {
  if (!admin.apps.length) {
    const b64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
    if (!b64Key) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY_B64 environment variable.");
    }

    const cert = JSON.parse(Buffer.from(b64Key, "base64").toString("utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(cert),
      projectId: cert.project_id,
    });
  }

  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

function validateSubjects(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error("Curriculum file must contain a non-empty array of subjects.");
  }

  for (const subject of subjects) {
    if (!subject.id || !subject.title || !["KS3", "KS4"].includes(subject.level)) {
      throw new Error(`Invalid subject: ${JSON.stringify(subject).slice(0, 160)}`);
    }

    if (!Array.isArray(subject.topics) || subject.topics.length === 0) {
      throw new Error(`Subject ${subject.id} has no topics.`);
    }
  }
}

async function main() {
  loadDotEnvLocal();

  const subjects = JSON.parse(await readFile(inputPath, "utf8"));
  validateSubjects(subjects);

  const db = getAdminDb();
  const batch = db.batch();

  for (const subject of subjects) {
    batch.set(db.collection("curriculum").doc(subject.id), subject);
  }

  await batch.commit();
  console.log(`Uploaded ${subjects.length} curriculum subjects from ${inputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
