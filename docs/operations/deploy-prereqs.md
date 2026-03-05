# Deployment Prerequisites

This checklist is copy/paste-ready for setting up and verifying Astrome production deployment prerequisites.

## Scope

- Frontend: Firebase Hosting
- Backend: Cloud Run (API service)
- Domain: `astrome.app` (canonical)

## 1) Required APIs

Enable the following Google Cloud APIs in the target project:

```bash
PROJECT_ID="<your-project-id>"

gcloud config set project "$PROJECT_ID"

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  firebase.googleapis.com \
  firebasehosting.googleapis.com
```

Verification:

```bash
gcloud services list --enabled --project "$PROJECT_ID" | grep -E 'run.googleapis.com|artifactregistry.googleapis.com|cloudbuild.googleapis.com|firebasehosting.googleapis.com|monitoring.googleapis.com|logging.googleapis.com'
```

## 2) Required IAM Roles

Create/identify deployment principals and grant the baseline roles below.

### Human deployer (or CI principal)

- `roles/run.admin`
- `roles/iam.serviceAccountUser`
- `roles/artifactregistry.writer`
- `roles/cloudbuild.builds.editor`
- `roles/firebase.admin`
- `roles/logging.viewer`
- `roles/monitoring.viewer`

### Runtime service account (Cloud Run service identity)

- `roles/logging.logWriter`
- `roles/monitoring.metricWriter`

Grant example:

```bash
PROJECT_ID="<your-project-id>"
DEPLOYER="user:you@example.com"   # or serviceAccount:ci@project.iam.gserviceaccount.com
RUNTIME_SA="<runtime-service-account-email>"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$DEPLOYER" --role="roles/run.admin"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$DEPLOYER" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$DEPLOYER" --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$DEPLOYER" --role="roles/cloudbuild.builds.editor"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$DEPLOYER" --role="roles/firebase.admin"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$DEPLOYER" --role="roles/logging.viewer"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$DEPLOYER" --role="roles/monitoring.viewer"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA}" --role="roles/logging.logWriter"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA}" --role="roles/monitoring.metricWriter"
```

Find runtime service account email:

```bash
SERVICE="astrome-api"
REGION="<region>"

gcloud run services describe "$SERVICE" \
  --region "$REGION" \
  --format='value(spec.template.spec.serviceAccountName)'
```

Verification:

```bash
gcloud projects get-iam-policy "$PROJECT_ID" \
  --flatten="bindings[].members" \
  --format="table(bindings.role,bindings.members)" \
  | grep -E 'roles/run.admin|roles/iam.serviceAccountUser|roles/artifactregistry.writer|roles/cloudbuild.builds.editor|roles/firebase.admin|roles/logging.viewer|roles/monitoring.viewer|roles/logging.logWriter|roles/monitoring.metricWriter'
```

## 3) Local Tooling Prereqs

```bash
# Required CLIs
node --version
pnpm --version
gcloud --version
firebase --version
python3 --version
```

Auth/bootstrap:

```bash
gcloud auth login
gcloud auth application-default login
firebase login
```

## 4) Environment Configuration

### Frontend

`frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL=
```

### Backend (Cloud Run service env)

Required:

- `CORS_ORIGINS=https://astrome.app,https://www.astrome.app,https://astrome-prod.web.app,https://astrome-prod.firebaseapp.com`

Optional/typical:

- `ENVIRONMENT=production`
- `LOG_LEVEL=INFO`

Verification:

```bash
SERVICE="astrome-api"
REGION="<region>"

gcloud run services describe "$SERVICE" --region "$REGION" --format='value(spec.template.spec.containers[0].env)'
```

## 5) Pre-PR Validation Baseline

Run before opening deployment-related PRs:

```bash
cd frontend
pnpm lint
pnpm type-check
pnpm build
```

## 6) Post-Deploy Verification

```bash
# SEO artifacts
curl -I https://astrome.app/robots.txt
curl -I https://astrome.app/sitemap.xml

# Homepage + API health
curl -I https://astrome.app/
curl -s https://astrome.app/api/v1/definitions | head
curl -s "https://astrome.app/api/v1/panchang?date=$(date +%F)&latitude=37.2647&longitude=-121.9623&timezone=America/Los_Angeles" | head
```

## 7) Exit Criteria

Deployment prerequisites are complete when:

- Required APIs are enabled and verified.
- IAM roles are granted and verified for deployer + runtime identities.
- Local deploy tooling is installed and authenticated.
- Required environment variables are set in target services.
- Validation baseline passes in `frontend`.
