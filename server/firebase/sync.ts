import type { StorageSnapshot } from "../memoryStorage";
import { firebaseCollection, getFirestoreDb, getFirebaseInitError, isFirebaseConfigured } from "./admin";

const SNAPSHOT_DOC = "snapshot";
const META_DOC = "meta";

export type FirebaseSyncStatus = {
  enabled: boolean;
  connected: boolean;
  projectId: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  orgId: string;
  firestorePath: string;
};

let syncStatus: FirebaseSyncStatus = {
  enabled: isFirebaseConfigured(),
  connected: false,
  projectId: process.env.FIREBASE_PROJECT_ID ?? null,
  lastSyncAt: null,
  lastError: null,
  orgId: process.env.FIREBASE_ORG_ID || "default",
  firestorePath: `sproutdrive/${process.env.FIREBASE_ORG_ID || "default"}/meta/snapshot`,
};

let syncTimer: ReturnType<typeof setTimeout> | undefined;
let syncInFlight = false;

export function getFirebaseSyncStatus(): FirebaseSyncStatus {
  return { ...syncStatus };
}

/** Pull cloud snapshot and its timestamp */
export async function pullFromFirebase(): Promise<{
  snapshot: StorageSnapshot;
  updatedAt: string;
} | null> {
  if (!isFirebaseConfigured()) return null;

  const db = getFirestoreDb();
  if (!db) {
    syncStatus.lastError = getFirebaseInitError() ?? "Firestore unavailable";
    return null;
  }

  try {
    const doc = await firebaseCollection(META_DOC).doc(SNAPSHOT_DOC).get();
    if (!doc.exists) {
      syncStatus.connected = true;
      syncStatus.lastError = null;
      return null;
    }

    const docData = doc.data();
    const snapshot = docData?.payload as StorageSnapshot | undefined;
    if (!snapshot) return null;

    syncStatus.connected = true;
    syncStatus.lastSyncAt = new Date().toISOString();
    syncStatus.lastError = null;
    console.log("☁️  Loaded enterprise data from Firebase Firestore");
    return {
      snapshot,
      updatedAt: String(docData?.updatedAt ?? new Date(0).toISOString()),
    };
  } catch (error) {
    syncStatus.lastError = error instanceof Error ? error.message : String(error);
    console.error("Firebase pull failed:", syncStatus.lastError);
    return null;
  }
}

/** Strip Date objects and non-JSON types for Firestore compatibility */
function serializeForFirestore(snapshot: StorageSnapshot): StorageSnapshot {
  return JSON.parse(JSON.stringify(snapshot));
}

/** Push local snapshot to Firestore */
export async function pushToFirebase(snapshot: StorageSnapshot): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const db = getFirestoreDb();
  if (!db) {
    syncStatus.lastError = getFirebaseInitError() ?? "Firestore unavailable";
    return;
  }

  if (syncInFlight) return;
  syncInFlight = true;

  try {
    await firebaseCollection(META_DOC).doc(SNAPSHOT_DOC).set({
      payload: serializeForFirestore(snapshot),
      updatedAt: new Date().toISOString(),
      version: 1,
    });
    syncStatus.connected = true;
    syncStatus.lastSyncAt = new Date().toISOString();
    syncStatus.lastError = null;
  } catch (error) {
    syncStatus.lastError = error instanceof Error ? error.message : String(error);
    console.error("Firebase push failed:", syncStatus.lastError);
  } finally {
    syncInFlight = false;
  }
}

export function scheduleFirebasePush(getSnapshot: () => StorageSnapshot): void {
  if (!isFirebaseConfigured()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushToFirebase(getSnapshot());
  }, 1500);
}

function snapshotRevision(snapshot: StorageSnapshot): number {
  const times: number[] = [];
  const add = (d: unknown) => {
    if (!d) return;
    const ms = new Date(String(d)).getTime();
    if (Number.isFinite(ms)) times.push(ms);
  };

  snapshot.users.forEach((u) => { add(u.updatedAt); add(u.createdAt); });
  snapshot.suppliers.forEach((s) => { add(s.updatedAt); add(s.createdAt); });
  snapshot.customers.forEach((c) => { add(c.updatedAt); add(c.createdAt); });
  snapshot.orders.forEach((o) => { add(o.updatedAt); add(o.createdAt); });
  snapshot.purchases.forEach((p) => add(p.createdAt));
  snapshot.plantingBatches.forEach((b) => { add(b.updatedAt); add(b.createdAt); });
  snapshot.vans.forEach((v) => { add(v.updatedAt); add(v.createdAt); });
  snapshot.stockItems.forEach((i) => add(i.lastUpdated));
  snapshot.stockTransactions.forEach((t) => add(t.createdAt));
  snapshot.settings.forEach((s) => add(s.updatedAt));
  snapshot.maintenanceLogs.forEach((l) => add(l.createdAt));

  return times.length ? Math.max(...times) : 0;
}

export async function initializeFirebaseSync(
  loadSnapshot: (snapshot: StorageSnapshot) => void,
  getSnapshot: () => StorageSnapshot,
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const localSnapshot = getSnapshot();
  const cloud = await pullFromFirebase();

  if (!cloud) {
    await pushToFirebase(localSnapshot);
    return;
  }

  const localRev = snapshotRevision(localSnapshot);
  const cloudRev = snapshotRevision(cloud.snapshot);

  if (localRev >= cloudRev) {
    if (localRev > cloudRev) {
      console.log("📂 Local data is newer than cloud — syncing up to Firebase");
    }
    await pushToFirebase(localSnapshot);
    return;
  }

  console.log("☁️  Cloud data is newer — applying from Firebase");
  loadSnapshot(cloud.snapshot);
}
