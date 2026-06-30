import fs from "fs";
import path from "path";
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let firebaseApp: App | undefined;
let firestoreDb: Firestore | undefined;
let initError: string | undefined;

export function getFirebaseProjectId(): string | undefined {
  return process.env.FIREBASE_PROJECT_ID;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      (process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS),
  );
}

export function getFirebaseOrgId(): string {
  return process.env.FIREBASE_ORG_ID || "default";
}

export function getFirebaseInitError(): string | undefined {
  return initError;
}

export function getFirestoreDb(): Firestore | undefined {
  if (!isFirebaseConfigured()) return undefined;
  if (firestoreDb) return firestoreDb;

  try {
    if (!firebaseApp) {
      const projectId = process.env.FIREBASE_PROJECT_ID!;
      let serviceAccount: Record<string, unknown> | undefined;

      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } else {
        const credPath =
          process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
          process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (credPath && fs.existsSync(path.resolve(credPath))) {
          serviceAccount = JSON.parse(fs.readFileSync(path.resolve(credPath), "utf-8"));
        }
      }

      if (!serviceAccount) {
        initError = "Firebase credentials file or JSON not found";
        return undefined;
      }

      firebaseApp =
        getApps().length > 0
          ? getApps()[0]
          : initializeApp({
              credential: cert(serviceAccount as Parameters<typeof cert>[0]),
              projectId,
            });
    }

    firestoreDb = getFirestore(firebaseApp);
    initError = undefined;
    return firestoreDb;
  } catch (error) {
    initError = error instanceof Error ? error.message : String(error);
    console.error("Firebase initialization failed:", initError);
    return undefined;
  }
}

export function firebaseCollection(name: string) {
  const db = getFirestoreDb();
  if (!db) throw new Error("Firestore is not configured");
  return db.collection("sproutdrive").doc(getFirebaseOrgId()).collection(name);
}
