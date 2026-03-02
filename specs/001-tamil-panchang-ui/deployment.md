# Astrome Deployment Guide

> **Last updated:** March 2026
> **Domain:** astrome.app (registered with GoDaddy)
> **Stack:** Python 3.11 FastAPI backend + Next.js 14 static frontend

---

## 1. Project Deployment Requirements

| Requirement | Detail |
|-------------|--------|
| **Python version** | 3.11+ (avoid 3.13+) |
| **Backend server** | FastAPI + Uvicorn (ASGI) |
| **Ephemeris** | Built-in Moshier via pyswisseph — no external binary files needed |
| **SQLite role** | Cache-only (calculation results + term definitions). Safe to wipe on redeploy — all data rebuilds on demand |
| **Frontend rendering** | Next.js 14 static export (`next build && next export`) — no SSR required |
| **Scale target** | ~1,000 DAU, 100 concurrent requests |
| **API SLA** | < 500ms per Panchang calculation |
| **Frontend SLA** | FCP < 2s, TTI < 3s |

---

## 2. Chosen Hosting Architecture

### Platform: GCP Firebase Hosting + GCP Cloud Run

```
GoDaddy DNS
├── astrome.app        →  Firebase Hosting  (Next.js static export)
│                          Global CDN, HTTPS automatic, free tier
│
└── api.astrome.app    →  Cloud Run domain mapping (preview)
                           └── Cloud Run service (FastAPI)
                               └── In-memory SQLite (cache, rebuilds on restart)
```

### Why This Architecture

- **Firebase Hosting** is the only GCP option that provides HTTPS on a custom domain at zero cost without a Load Balancer (~$18/mo). It serves the static Next.js export from a global CDN.
- **Cloud Run** provides serverless Python hosting with per-request billing — near-zero cost at low traffic. `min-instances=1` keeps the container warm and avoids cold starts that would violate the 500ms SLA.
- **Cloud Run domain mapping** (`api.astrome.app`) is technically in GCP preview as of March 2026 and carries a latency caveat, but is acceptable for a personal/small-scale project and avoids the Load Balancer cost entirely.
- **SQLite cache** is not persisted across restarts — this is acceptable because all cached data (Panchang calculations, term definitions) is fully reproducible from pyswisseph on demand.

### Alternative Considered: Fly.io

A strong alternative at ~$5.70/mo. Simpler to operate (`fly deploy`), persistent volumes for SQLite, single platform. Recommended if GCP complexity becomes a friction point or if the Cloud Run preview domain mapping causes issues in production.

---

## 3. Monthly Cost Estimate

| Component | Detail | Cost |
|-----------|--------|------|
| Firebase Hosting | Static frontend, global CDN | **$0** (Spark/Blaze free tier) |
| Cloud Run — idle (min=1) | 512MiB, request-based billing, memory only when idle | **~$3.24/mo** |
| Cloud Run — active | ~1,000 DAU, <500ms calls, 1 vCPU | **~$0.50–1.00/mo** |
| Cloud Run domain mapping | Preview feature | **$0** |
| GoDaddy domain renewal | astrome.app | ~$1.50/mo amortized |
| **Total** | | **~$5–6/mo** |

> **Firebase billing note:** Upgrade to the Blaze (pay-as-you-go) plan even if staying within free limits. As of February 3, 2026, Spark plan projects lose access to their `appspot.com` default bucket (402/403 errors). Blaze charges nothing within free-tier limits and avoids this issue.

> **Firebase Hosting free limits (Blaze plan):** 1 GB storage, 10 GB/month transfer — more than sufficient for a Next.js static build at this traffic level.

---

## 4. DNS Configuration (GoDaddy)

Log into GoDaddy DNS Manager for `astrome.app` and set:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| `A` or `TXT` | `@` | *(provided by Firebase during custom domain setup)* | 1 hour |
| `CNAME` | `api` | *(provided by Cloud Run domain mapping setup)* | 1 hour |

> Firebase will give you specific `A` record IPs and a `TXT` verification record during the "Add custom domain" flow in the Firebase console. Cloud Run domain mapping will similarly provide a CNAME or A record target.

---

## 5. Deployment Setup Steps

### 5.1 Firebase Hosting (Frontend)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build Next.js as static export
# In frontend/next.config.js, ensure:
#   output: 'export'
cd frontend && npm run build

# Deploy
firebase deploy --only hosting
```

**`firebase.json` configuration:**
```json
{
  "hosting": {
    "public": "frontend/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "trailingSlash": false,
    "headers": [
      {
        "source": "/sw.js",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      }
    ]
  }
}
```

**Add custom domain:** Firebase Console → Hosting → Add custom domain → `astrome.app` → follow DNS verification steps.

---

### 5.2 Cloud Run (Backend)

**`backend/Dockerfile`:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run Alembic migrations then start server
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8080
```

**Build and deploy:**
```bash
# Set your project and region
export GCP_PROJECT=your-gcp-project-id
export REGION=us-central1

# Build and push container
gcloud builds submit --tag gcr.io/$GCP_PROJECT/astrome-api ./backend

# Deploy to Cloud Run
gcloud run deploy astrome-api \
  --image gcr.io/$GCP_PROJECT/astrome-api \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --set-env-vars "CORS_ORIGINS=https://astrome.app,DATABASE_URL=sqlite:///./panchang_cache.db,LOG_LEVEL=INFO"
```

**Add custom domain:**
```bash
# Map api.astrome.app to the Cloud Run service (preview feature)
gcloud beta run domain-mappings create \
  --service astrome-api \
  --domain api.astrome.app \
  --region $REGION
```

This command outputs the DNS records to add in GoDaddy.

---

### 5.3 Frontend Environment

**`frontend/.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://api.astrome.app
NEXT_PUBLIC_ENV=production
```

---

### 5.4 Backend Environment Variables

Set via Cloud Run console or `--set-env-vars` flag:

| Variable | Value |
|----------|-------|
| `CORS_ORIGINS` | `https://astrome.app` |
| `DATABASE_URL` | `sqlite:///./panchang_cache.db` |
| `LOG_LEVEL` | `INFO` |
| `RATE_LIMIT_ENABLED` | `true` |

> **No `EPHE_PATH` needed** — the project uses built-in Moshier ephemeris bundled with pyswisseph. No external ephemeris files required.

---

## 6. CI/CD (GitHub Actions)

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
      - name: Build and deploy backend
        run: |
          gcloud builds submit --tag gcr.io/${{ vars.GCP_PROJECT }}/astrome-api ./backend
          gcloud run deploy astrome-api \
            --image gcr.io/${{ vars.GCP_PROJECT }}/astrome-api \
            --region us-central1 \
            --platform managed

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Build Next.js
        working-directory: frontend
        run: npm ci && npm run build
        env:
          NEXT_PUBLIC_API_URL: https://api.astrome.app
          NEXT_PUBLIC_ENV: production
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SA_KEY }}
          channelId: live
```

---

## 7. Fallback Option: Fly.io

If Cloud Run domain mapping (preview) causes production issues, migrate to Fly.io:

```
astrome.app        → CNAME → astrome-frontend.fly.dev  (Fly Machine, 256MB)
api.astrome.app    → CNAME → astrome-api.fly.dev        (Fly Machine, 512MB)
                                └── Fly Volume 3GB (SQLite persistence)
```

**Fly.io cost breakdown:**

| Component | Cost |
|-----------|------|
| Frontend machine (256MB, shared-cpu-1x) | $2.02/mo |
| Backend machine (512MB, shared-cpu-1x) | ~$3.22/mo |
| Persistent volume (3GB) | $0.45/mo |
| Egress (<100GB, NA/EU) | $0 |
| **Total** | **~$5.70/mo** |

**Key differences from GCP:**
- Fly.io free tier no longer exists for new customers (as of 2025) — pay from first resource
- Persistent volumes natively solve SQLite persistence (no cache rebuild on restart)
- Single platform, simpler CLI (`fly deploy`), but less observability tooling than GCP
- No cold start concern — machines stay warm by default

---

## 8. Platform Comparison Summary

| Criteria | GCP (Firebase + Cloud Run) | Fly.io |
|----------|---------------------------|--------|
| Monthly cost | ~$5–6/mo | ~$5.70/mo |
| Frontend hosting | ✅ Firebase global CDN, free | Single-region machine |
| Custom domain HTTPS | ✅ Firebase (free) / Cloud Run (preview) | ✅ Automatic, GA |
| Cold starts / 500ms SLA | ✅ min=1, memory-billed idle | ✅ Always-on machines |
| SQLite persistence | ⚠️ Cache rebuilds on restart (acceptable) | ✅ Persistent volumes |
| Operational simplicity | Medium (GCP console/CLI) | ✅ Simple (`fly deploy`) |
| Observability | ✅ Cloud Logging, Monitoring | Basic dashboard |
| Vendor lock-in | Medium (GCP ecosystem) | Low |
| Domain mapping GA status | ⚠️ Cloud Run mapping is preview | ✅ GA |

---

## 9. Key Caveats to Monitor

1. **Cloud Run domain mapping** is in preview as of March 2026. Monitor https://cloud.google.com/run/docs/mapping-custom-domains for GA promotion. If latency issues arise on `api.astrome.app`, fall back to either the Firebase proxy rewrite or the Fly.io architecture.

2. **Firebase Blaze plan** — upgrade from Spark to avoid `appspot.com` bucket access issues introduced February 3, 2026. No cost within free limits.

3. **Fly.io pricing** — Fly.io no longer offers a free tier for new organizations. All Fly resources are billed from creation. The $10/month free credit mentioned in older docs is legacy-only.

4. **SQLite on Cloud Run** — each container instance has its own isolated SQLite file. With `max-instances=10`, up to 10 separate caches may exist simultaneously. This is fine since the cache is purely a performance optimization — correctness is unaffected.

5. **pyswisseph technical debt** — the `rise_trans()` parameter compatibility issue (±30–60 min sunrise/sunset error) affects Rahu Kalam accuracy. This is a known issue (task T052a) and must be resolved before production launch for accuracy-sensitive users.
