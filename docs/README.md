# SproutDrive Documentation

SproutDrive is an enterprise sprout-business management system (orders, planting, deliveries, analytics).

## Quick start

```powershell
npm install
copy .env.example .env
# Add Firebase service account — see docs/FIREBASE_SETUP.md
npm run dev:local
```

Open **http://localhost:5000** and sign in with any email/password (first user = owner).

## Documentation index

| Document | Description |
|----------|-------------|
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Connect project **sproutdrive-a975e** to Firestore |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Storage layers, sync flow, data model |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | All environment variables |
| [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) | Running locally on Windows |
| [DEPLOY.md](./DEPLOY.md) | Free cloud hosting (Render) |

## Firebase project

- **Project ID:** `sproutdrive-a975e`
- **Console:** [Firebase Firestore](https://console.firebase.google.com/project/sproutdrive-a975e/firestore)
- **Database path:** `sproutdrive/{orgId}/meta/snapshot`

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev:local` | Local JSON DB + optional Firebase sync (default) |
| `npm run dev:memory` | In-memory only (demos, data lost on restart) |
| `npm run firebase:check` | Validate Firebase credentials and connection |
| `npm test` | Run unit tests |
| `npm run check` | TypeScript type check |

## Support files

- `.env.example` — copy to `.env` and fill in secrets
- `firestore.rules` — Firestore security rules (deploy with Firebase CLI)
- `.local/enterprise-db/` — local JSON database (gitignored)
- `.local/firebase-service-account.json` — service account key (gitignored)
