# Local runtime files (not committed to git)

Place sensitive and machine-specific files here.

## Required for Firebase cloud sync

```
firebase-service-account.json
```

Download from:  
https://console.firebase.google.com/project/sproutdrive-a975e/settings/serviceaccounts/adminsdk

Then set in `.env`:

```
FIREBASE_SERVICE_ACCOUNT_PATH=./.local/firebase-service-account.json
```

## Auto-created

```
enterprise-db/sproutdrive.json   — local database backup (created on first run)
```

See **docs/FIREBASE_SETUP.md** for full instructions.
