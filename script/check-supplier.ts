import "../server/env";
import { getFirestoreDb, getFirebaseOrgId } from "../server/firebase/admin";

async function main() {
  const db = getFirestoreDb();
  if (!db) {
    console.error("Firebase not configured");
    process.exit(1);
  }

  const orgId = getFirebaseOrgId();
  const doc = await db.doc(`sproutdrive/${orgId}/meta/snapshot`).get();
  if (!doc.exists) {
    console.log("No snapshot in Firestore");
    process.exit(1);
  }

  const payload = doc.data()?.payload as { suppliers?: Array<{ id: number; name: string; phone?: string; address?: string }> };
  const suppliers = payload?.suppliers ?? [];
  const match = suppliers.filter((s) => s.name.toLowerCase().includes("test firestore"));

  console.log(`Firestore suppliers total: ${suppliers.length}`);
  if (match.length) {
    console.log("✅ Found in Firestore:");
    match.forEach((s) => console.log(JSON.stringify(s, null, 2)));
  } else {
    console.log("❌ 'test firestore supplier' not found in Firestore snapshot");
    console.log("Recent names:", suppliers.slice(-5).map((s) => s.name).join(", "));
  }
}

main().catch(console.error);
