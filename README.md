# SproutDrive

Cloud-based mung bean sprout business management — orders, planting cycles, deliveries, stock, analytics.

## Quick start

```powershell
npm install
copy .env.example .env
npm run dev:local
```

→ **http://localhost:5000**

## Firebase (enterprise)

Project: **sproutdrive-a975e**  
Console: [Firestore](https://console.firebase.google.com/project/sproutdrive-a975e/firestore)

Full setup: **[docs/FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)**

## Deploy (free test hosting)

Host on **Render** (free HTTPS URL): **[docs/DEPLOY.md](./docs/DEPLOY.md)**

```powershell
npm run build   # verify production build
```

## Documentation

All docs live in **[docs/](./docs/README.md)**:

- [Firebase setup](./docs/FIREBASE_SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Environment variables](./docs/ENVIRONMENT.md)
- [Local development](./docs/LOCAL_DEVELOPMENT.md)

## Storage

| Mode | Command | Where data lives |
|------|---------|------------------|
| Enterprise (default) | `npm run dev:local` | Local JSON + optional Firestore |
| Memory demo | `npm run dev:memory` | RAM only |
| PostgreSQL | `STORAGE_PROVIDER=postgres` | Neon/Replit |

Local backup path: `.local/enterprise-db/sproutdrive.json`
