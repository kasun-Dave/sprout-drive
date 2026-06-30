# Environment Variables

Copy `.env.example` to `.env` and configure for your environment.

## Server

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | HTTP port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `SESSION_SECRET` | Yes (prod) | — | Express session signing key |

## Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIREBASE_PROJECT_ID` | For cloud | — | e.g. `sproutdrive-a975e` |
| `FIREBASE_ORG_ID` | No | `default` | Tenant/org isolation in Firestore |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | For cloud | — | Path to service account JSON |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Alt | — | Inline JSON (CI/deploy) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alt | — | Standard Google env var |
| `STORAGE_PROVIDER` | No | auto | Set to `postgres` for PostgreSQL |
| `DATABASE_URL` | For postgres | — | PostgreSQL connection string |
| `USE_MEMORY_STORAGE` | No | `false` | Pure in-memory (no persistence) |
| `SEED_SAMPLE_DATA` | No | `true` | Seed demo data on empty local DB |

## Replit (legacy)

| Variable | Description |
|----------|-------------|
| `REPL_ID` | Enables Replit Auth instead of local login |
| `ISSUER_URL` | OIDC issuer (default: `https://replit.com/oidc`) |

## Example — enterprise (sproutdrive-a975e)

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=change-me-to-a-long-random-string

FIREBASE_PROJECT_ID=sproutdrive-a975e
FIREBASE_ORG_ID=default
FIREBASE_SERVICE_ACCOUNT_PATH=./.local/firebase-service-account.json
```

## Example — local only (no cloud)

```env
PORT=5000
SESSION_SECRET=dev-secret
# No Firebase vars — uses .local/enterprise-db/sproutdrive.json
```

## Example — PostgreSQL (Replit)

```env
STORAGE_PROVIDER=postgres
DATABASE_URL=postgresql://user:pass@host/db
SESSION_SECRET=...
REPL_ID=your-repl-id
```
