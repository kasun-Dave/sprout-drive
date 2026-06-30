# Firebase Setup — sproutdrive-a975e

This guide connects SproutDrive to your Firebase project using **Firestore** as the cloud database, with a **local JSON backup** on every machine.

**Your project:** [sproutdrive-a975e Firestore console](https://console.firebase.google.com/project/sproutdrive-a975e/firestore)

---

## Architecture (recommended)

```
┌─────────────┐     writes      ┌──────────────────────────────┐
│  Express    │ ──────────────► │  Local JSON (.local/...)     │
│  API        │                 │  (fast, offline-capable)     │
└─────────────┘                 └──────────────┬───────────────┘
       │                                       │ debounced sync
       │                                       ▼
       │                          ┌──────────────────────────────┐
       └────────────────────────► │  Firebase Firestore (cloud)  │
                                  │  sproutdrive/{org}/meta/...  │
                                  └──────────────────────────────┘
```

- **Reads/writes** go to local JSON first (fast, works offline).
- **Cloud sync** pushes to Firestore ~1.5s after changes.
- **On startup**, cloud data wins if a snapshot exists; otherwise local is pushed to cloud.

---

## Step 1 — Enable Firestore

1. Open the [Firestore database page](https://console.firebase.google.com/project/sproutdrive-a975e/database).
2. Click **Create database** (if not already created).
3. Choose **Production mode** (we deploy custom rules from `firestore.rules`).
4. Pick a region close to your users (e.g. `asia-south1` or `us-central1`).

---

## Step 2 — Create a service account key

The server uses the **Firebase Admin SDK** (server-side only — never expose this key in the browser).

1. Go to [Project Settings → Service accounts](https://console.firebase.google.com/project/sproutdrive-a975e/settings/serviceaccounts/adminsdk).
2. Click **Generate new private key**.
3. Save the downloaded JSON as:

```
.local/firebase-service-account.json
```

> This file is **gitignored**. Never commit it.

---

## Step 3 — Configure `.env`

```powershell
copy .env.example .env
```

Edit `.env`:

```env
FIREBASE_PROJECT_ID=sproutdrive-a975e
FIREBASE_ORG_ID=default
FIREBASE_SERVICE_ACCOUNT_PATH=./.local/firebase-service-account.json
SESSION_SECRET=use-a-long-random-string-in-production
```

Alternative for CI/deploy: set `FIREBASE_SERVICE_ACCOUNT_JSON` to the entire JSON on one line.

---

## Step 4 — Verify connection

```powershell
npm run firebase:check
```

Expected output:

```
✅ FIREBASE_PROJECT_ID: sproutdrive-a975e
✅ Credentials: File found at ./.local/firebase-service-account.json
✅ Firestore connection: Connected to project sproutdrive-a975e
✅ Write/read test: Document sproutdrive/default/meta/healthcheck
✅ Firebase setup looks good!
```

---

## Step 5 — Run the app

```powershell
npm run dev:local
```

You should see:

```
☁️  Enterprise mode: Firebase Firestore + local JSON backup
serving on port 5000
```

In the app: **Settings → Enterprise Storage** shows sync status and a **Sync to Firebase** button (owners only).

---

## Firestore data location

| Field | Value |
|-------|-------|
| Collection root | `sproutdrive` |
| Organization doc | `{FIREBASE_ORG_ID}` (default: `default`) |
| Snapshot doc | `meta/snapshot` |

Document shape:

```json
{
  "payload": { "users": [], "orders": [], "customers": [], "..." },
  "updatedAt": "2026-06-30T12:00:00.000Z",
  "version": 1
}
```

View in console:  
https://console.firebase.google.com/project/sproutdrive-a975e/firestore/data/sproutdrive~2Fdefault~2Fmeta~2Fsnapshot

---

## Deploy security rules (optional but recommended)

Install [Firebase CLI](https://firebase.google.com/docs/cli), then:

```powershell
firebase login
firebase use sproutdrive-a975e
firebase deploy --only firestore:rules
```

Rules in `firestore.rules` **deny all direct client access** until client-side Firebase Auth is added. The server Admin SDK bypasses these rules.

---

## Multi-tenant / multiple sites

Set a different org ID per deployment:

```env
FIREBASE_ORG_ID=branch-colombo
```

Each org gets an isolated Firestore subtree under `sproutdrive/{orgId}/`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Credentials file not found` | Place JSON at path in `FIREBASE_SERVICE_ACCOUNT_PATH` |
| `Permission denied` | Enable Firestore API; ensure service account has **Firebase Admin** role |
| `Cloud offline` in Settings | Run `npm run firebase:check`; check `lastError` in `/api/system/storage` |
| Data not in console | Trigger **Sync to Firebase** in Settings, or wait for auto-sync after a change |
| Port 5000 in use | Stop other Node processes or set `PORT=5001` in `.env` |

---

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — full storage design
- [ENVIRONMENT.md](./ENVIRONMENT.md) — all env variables
