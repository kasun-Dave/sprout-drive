import "../server/env";
import { LocalJsonStorage } from "../server/localJsonStorage";
import { pushToFirebase, pullFromFirebase } from "../server/firebase/sync";

async function main() {
  const local = new LocalJsonStorage({ seed: false });
  const snapshot = local.getSnapshot();
  console.log(`Local suppliers: ${snapshot.suppliers.length}`);
  const test = snapshot.suppliers.find((s) => s.name.includes("test firestore"));
  console.log(test ? `✅ Local: ${test.name} (id ${test.id})` : "❌ Not in local file");

  await pushToFirebase(snapshot);

  const cloud = await pullFromFirebase();
  const cloudTest = cloud?.snapshot.suppliers.find((s) => s.name.includes("test firestore"));
  console.log(
    cloudTest
      ? `✅ Firestore: ${cloudTest.name} (id ${cloudTest.id}) — ${cloud!.snapshot.suppliers.length} suppliers total`
      : "❌ Not in Firestore after push",
  );
}

main().catch(console.error);
