# SproutDrive Deployment Guide

Deploy SproutDrive to a **free public URL** for testing. Recommended: **[Render](https://render.com)** (free tier, HTTPS included).

Your Firebase project **`sproutdrive-a975e`** holds all business data in the cloud, so the hosted app does not need a persistent local disk.

---

## Option A — Render (recommended, free)

### What you get

- Public HTTPS URL like `https://sproutdrive.onrender.com`
- Free tier (spins down after ~15 min idle; first load may take 30–60s)
- Auto-deploy on git push

### Prerequisites

1. [GitHub](https://github.com) account  
2. [Render](https://render.com) account (sign in with GitHub)  
3. Firebase service account JSON (same file used locally)

### Step 1 — Push code to GitHub

```powershell
cd C:\Users\kabnlk\Downloads\SproutDriveCloud\SproutDriveCloud

# Create a new repo on github.com named "sproutdrive" (empty, no README)

git add .
git commit -m "Prepare SproutDrive for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sproutdrive.git
git push -u origin main
```

> Do **not** commit `.env` or `.local/firebase-service-account.json` (already in `.gitignore`).

### Step 2 — Create Render web service

> **Important:** Create a **Web Service**, NOT a Static Site. Static sites show plain "Not Found".

1. Open [Render Dashboard](https://dashboard.render.com)
2. **New +** → **Web Service** (or **Blueprint** if using `render.yaml`)
3. Connect your GitHub repo
4. Render reads `render.yaml` automatically, or set manually:

| Setting | Value |
|---------|--------|
| **Build Command** | `npm run build` *(do not add `npm ci` — install runs separately)* |
| **Start Command** | `npm start` |
| **Plan** | Free |
| **Region** | Singapore (closest to South Asia) |

### Step 3 — Environment variables

In Render → your service → **Environment**, add:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `FIREBASE_PROJECT_ID` | `sproutdrive-a975e` |
| `FIREBASE_ORG_ID` | `default` |
| `SESSION_SECRET` | *(Generate or paste a long random string)* |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | *(Secret — see below)* |
| `SEED_SAMPLE_DATA` | `false` |

**`FIREBASE_SERVICE_ACCOUNT_JSON`** — paste the **entire** service account file as one line:

```powershell
# In PowerShell — copy JSON to clipboard for Render paste:
Get-Content .local\firebase-service-account.json -Raw | Set-Clipboard
```

Paste into Render as a **Secret** env var.

### Step 4 — Deploy

Click **Deploy**. When the build finishes, open your Render URL.

Sign in with any email/password (first user = owner). Data loads from [Firestore](https://console.firebase.google.com/project/sproutdrive-a975e/firestore).

### Health check

Render pings `/api/auth/config` — should return `{"provider":"local"}`.

---

## Option B — Railway (free trial credits)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub  
2. Same env vars as Render  
3. Build: `npm run build`  
4. Start: `npm start`

---

## Option C — Quick local public URL (tunnel, not permanent hosting)

For a **temporary** shareable link while developing locally:

```powershell
# Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
cloudflared tunnel --url http://localhost:5000
```

Or use [ngrok](https://ngrok.com): `ngrok http 5000`

---

## Option D — Belmo (free tier)

Belmo auto-detects Node.js and runs **install** and **build** as separate steps. Do **not** put `npm ci` in the build command — it causes `EBUSY: rmdir node_modules/.cache`.

### Belmo settings (required)

1. **Build** tab → **Build Command** must be exactly:
   ```
   npm run build
   ```
   *(Not `npm ci && npm run build`)*

2. **Or** switch to **Dockerfile** mode in Settings (uses the repo `Dockerfile` instead of auto-build).

3. **Environment** — same vars as Render (see Step 3 above).

4. Redeploy after saving settings.

---

## Production notes

| Topic | Detail |
|-------|--------|
| **Data** | Firebase Firestore is the source of truth on cloud hosts |
| **Local JSON** | Not persisted on free Render (ephemeral disk) — Firebase sync handles this |
| **Auth** | Email/password login (`/api/local/login`); cookies use `secure: true` over HTTPS |
| **Cold start** | Free Render sleeps when idle; first request after sleep is slow |
| **Secrets** | Never commit service account JSON or `.env` |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Plain **"Not Found"** on black page | You likely created a **Static Site** — delete it and create a **Web Service** instead. Redeploy with `npm run build` + `npm start` |
| Build fails with **EBUSY** / `node_modules/.cache` | Remove `npm ci` from build command; use `npm run build` only, or switch to Dockerfile deploy |
| Login doesn’t stick | Ensure `SESSION_SECRET` is set; site must use HTTPS (Render provides this) |
| Empty data | Set `FIREBASE_SERVICE_ACCOUNT_JSON`; check [Firestore console](https://console.firebase.google.com/project/sproutdrive-a975e/firestore) |
| 502 on wake | Wait 60s for free tier cold start |

---

## Related docs

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
