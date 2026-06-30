import { DatabaseStorage, type IStorage } from "./storage";
import { LocalJsonStorage } from "./localJsonStorage";
import { MemoryStorage } from "./memoryStorage";
import {
  getFirebaseSyncStatus,
  initializeFirebaseSync,
  scheduleFirebasePush,
} from "./firebase/sync";
import { isFirebaseConfigured } from "./firebase/admin";

export let storage: IStorage;

export async function initStorage(): Promise<IStorage> {
  if (storage) return storage;

  // Legacy PostgreSQL (Replit / explicit postgres provider)
  if (
    process.env.DATABASE_URL &&
    process.env.STORAGE_PROVIDER === "postgres"
  ) {
    storage = new DatabaseStorage();
    console.log("🐘 Using PostgreSQL storage");
    return storage;
  }

  // Pure in-memory (no persistence) — quick demos only
  if (process.env.USE_MEMORY_STORAGE === "true") {
    storage = new MemoryStorage();
    console.log("💾 Using in-memory storage (data lost on restart)");
    return storage;
  }

  // Enterprise default: local JSON file + optional Firebase Firestore sync
  const local = new LocalJsonStorage({
    seed: process.env.SEED_SAMPLE_DATA !== "false",
    onPersist: () => scheduleFirebasePush(() => local.getSnapshot()),
  });

  if (isFirebaseConfigured()) {
    await initializeFirebaseSync(
      (snapshot) => local.replaceSnapshot(snapshot),
      () => local.getSnapshot(),
    );
    console.log("☁️  Enterprise mode: Firebase Firestore + local JSON backup");
  } else {
    console.log(`📂 Local enterprise DB: ${local.filePath}`);
    console.log("   Set FIREBASE_PROJECT_ID + credentials for cloud sync");
  }

  storage = local;
  return storage;
}

export function getStorageInfo() {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? null;
  return {
    provider:
      process.env.STORAGE_PROVIDER === "postgres"
        ? "postgres"
        : process.env.USE_MEMORY_STORAGE === "true"
          ? "memory"
          : isFirebaseConfigured()
            ? "firebase+local"
            : "local-json",
    localDbPath:
      storage instanceof LocalJsonStorage ? storage.filePath : null,
    firebase: getFirebaseSyncStatus(),
    projectId,
    consoleUrl: projectId
      ? `https://console.firebase.google.com/project/${projectId}/firestore`
      : null,
    documentation: "/docs/FIREBASE_SETUP.md",
  };
}

/** Force push local snapshot to Firebase (owner action) */
export async function forceFirebaseSync(): Promise<{ ok: boolean; error?: string }> {
  if (!(storage instanceof LocalJsonStorage)) {
    return { ok: false, error: "Sync only available with local JSON storage" };
  }
  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase is not configured" };
  }
  const { pushToFirebase } = await import("./firebase/sync");
  await pushToFirebase(storage.getSnapshot());
  const status = getFirebaseSyncStatus();
  return status.lastError ? { ok: false, error: status.lastError } : { ok: true };
}
