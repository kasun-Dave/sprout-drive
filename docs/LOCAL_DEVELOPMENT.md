# Local Development (Windows)

## Prerequisites

- Node.js 20+ (`node --version`)
- npm 10+

## First-time setup

```powershell
cd SproutDriveCloud
npm install
copy .env.example .env
```

### Option A — Local JSON only (no Firebase)

No extra steps. Data persists in:

```
.local/enterprise-db/sproutdrive.json
```

### Option B — Firebase cloud sync

Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md), then:

```powershell
npm run firebase:check
```

## Run

```powershell
npm run dev:local
```

Open **http://localhost:5000**.

Sign in with any email/password. The **first user** becomes **owner**.

## Useful commands

```powershell
npm run dev:local      # Local JSON + Firebase if configured
npm run dev:memory     # In-memory only (data lost on restart)
npm run firebase:check # Test Firebase connection
npm test               # Unit tests
npm run check          # TypeScript check
```

## Data persistence

| Mode | Persists across restart? |
|------|------------------------|
| `dev:local` (default) | Yes — `.local/enterprise-db/` |
| `dev:memory` | No |
| Firebase configured | Yes — cloud + local backup |

## Troubleshooting

**Port already in use**

```powershell
# Find and stop process on 5000, or:
$env:PORT=5001; npm run dev:local
```

**Connection failed in browser**

Ensure terminal shows `serving on port 5000`.

**Firebase not syncing**

1. Check `.env` has `FIREBASE_PROJECT_ID=sproutdrive-a975e`
2. Run `npm run firebase:check`
3. In app: Settings → Sync to Firebase

**Reset local data**

Delete `.local/enterprise-db/sproutdrive.json` and restart (re-seeds sample data).
