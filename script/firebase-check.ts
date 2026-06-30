import "../server/env";
import fs from "fs";
import path from "path";
import {
  getFirestoreDb,
  getFirebaseInitError,
  getFirebaseOrgId,
  getFirebaseProjectId,
  isFirebaseConfigured,
} from "../server/firebase/admin";
import { pullFromFirebase, pushToFirebase } from "../server/firebase/sync";
import { LocalJsonStorage } from "../server/localJsonStorage";

function check(name: string, ok: boolean, detail: string) {
  const icon = ok ? "✅" : "❌";
  console.log(`${icon} ${name}: ${detail}`);
  return ok;
}

async function main() {
  console.log("\nSproutDrive Firebase Connection Check");
  console.log("=====================================\n");

  const projectId = getFirebaseProjectId();
  const orgId = getFirebaseOrgId();

  check("FIREBASE_PROJECT_ID", Boolean(projectId), projectId ?? "not set");
  check("FIREBASE_ORG_ID", true, orgId);

  const credPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasJson = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const credExists = credPath ? fs.existsSync(path.resolve(credPath)) : false;

  check(
    "Credentials",
    hasJson || credExists,
    hasJson
      ? "FIREBASE_SERVICE_ACCOUNT_JSON set"
      : credExists
        ? `File found at ${credPath}`
        : `Missing — place service account at ${credPath ?? ".local/firebase-service-account.json"}`,
  );

  if (!isFirebaseConfigured()) {
    console.log("\n⚠️  Firebase is not fully configured. See docs/FIREBASE_SETUP.md\n");
    process.exit(1);
  }

  const db = getFirestoreDb();
  if (!db) {
    check("Firestore connection", false, getFirebaseInitError() ?? "unknown error");
    process.exit(1);
  }

  check("Firestore connection", true, `Connected to project ${projectId}`);

  const testPath = `sproutdrive/${orgId}/meta/healthcheck`;
  try {
    await db.doc(testPath).set({
      checkedAt: new Date().toISOString(),
      host: "sproutdrive-firebase-check",
    });
    const doc = await db.doc(testPath).get();
    check("Write/read test", doc.exists, `Document ${testPath}`);
  } catch (error) {
    check("Write/read test", false, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const local = new LocalJsonStorage({ seed: false });
  const cloud = await pullFromFirebase();
  if (cloud) {
    check(
      "Cloud snapshot",
      true,
      `${cloud.snapshot.orders.length} orders, ${cloud.snapshot.customers.length} customers, ${cloud.snapshot.suppliers.length} suppliers`,
    );
  } else {
    console.log("ℹ️  No cloud snapshot yet — run the app once to push local data");
    await pushToFirebase(local.getSnapshot());
    check("Initial cloud push", true, "Local snapshot uploaded to Firestore");
  }

  console.log("\n✅ Firebase setup looks good!");
  console.log(`   Console: https://console.firebase.google.com/project/${projectId}/firestore`);
  console.log(`   Data path: sproutdrive/${orgId}/meta/snapshot\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
