# Incident Runbooks

This document defines first-response runbooks for common production incidents in Astrome.

## Roles and Ownership

- **Incident Commander (IC)**: Backend/Platform owner on-call
- **Communications Owner**: Product/Frontend owner
- **Approvers**: Repo maintainers with deploy permissions

If primary owner is unavailable for 10+ minutes during active impact, hand over to backup maintainer.

## Severity Guidance

- **SEV-1**: Full outage or critical user flow unavailable
- **SEV-2**: Partial outage or major degradation
- **SEV-3**: Degraded non-critical capability

## Runbook: Homepage Down

**Owner**: Frontend/Hosting on-call (IC can be backend on-call until reassigned)

### Triage

1. Confirm blast radius (all users vs region/ISP/cached clients).
2. Check whether failure is DNS, Hosting, or frontend runtime.
3. Open incident channel and record start time + first evidence.

### First Checks

```bash
# Basic homepage status and headers
curl -I https://astrome.app/

# Verify robots/sitemap are still served (hosting health proxy signal)
curl -I https://astrome.app/robots.txt
curl -I https://astrome.app/sitemap.xml
```

```bash
# Firebase Hosting status (requires gcloud/firebase auth)
firebase hosting:sites:list
firebase target
```

- Inspect browser console for runtime hydration/build errors.
- Check latest frontend deploy in Firebase Hosting release history.

### Mitigation

- Roll back to previous known-good Hosting release.
- If DNS issue, restore correct A/AAAA/CNAME records and TTL-aware comms.
- If runtime-only issue, ship hotfix and re-deploy frontend.

### Exit Criteria

- `https://astrome.app/` returns `200` for 5+ consecutive checks.
- Core routes render without fatal client errors.
- Incident timeline updated with root cause and follow-up tasks.

---

## Runbook: API 5xx Spike

**Owner**: Backend/Cloud Run on-call

### Triage

1. Confirm spike level, endpoint scope, and start window.
2. Identify whether errors are application exceptions, upstream failures, or cold-start/resource constraints.
3. Freeze risky changes until error trend stabilizes.

### First Checks

```bash
# Sample API through hosting rewrite
curl -s -o /dev/null -w "%{http_code}\n" https://astrome.app/api/v1/definitions
```

```bash
# Direct Cloud Run endpoint (replace SERVICE_URL)
curl -s -o /dev/null -w "%{http_code}\n" "$SERVICE_URL/api/v1/definitions"
```

```bash
# Recent Cloud Run errors (replace values)
gcloud logging read \
  'resource.type="cloud_run_revision" AND severity>=ERROR' \
  --project="$PROJECT_ID" --freshness=30m --limit=50 --format='value(timestamp,textPayload)'
```

- Confirm latest backend revision, env vars, and migration status.
- Check dependency availability (DB/file/ephemeris) in logs.

### Mitigation

- Roll back traffic to last healthy revision.
- Increase minimum instances temporarily for cold-start pressure.
- Reapply missing env vars/secrets and restart revision.

### Exit Criteria

- 5xx rate returns to baseline for at least 30 minutes.
- Top failing endpoints pass smoke checks.
- Root cause and permanent fix action items captured.

---

## Runbook: Latency Spike

**Owner**: Backend/Platform on-call

### Triage

1. Determine whether latency affects all endpoints or specific APIs.
2. Separate frontend render latency from backend response latency.
3. Check for correlated deploys, traffic surges, or dependency slowdown.

### First Checks

```bash
# Measure edge + API latency
curl -o /dev/null -s -w 'total=%{time_total}s connect=%{time_connect}s ttfb=%{time_starttransfer}s\n' https://astrome.app/
curl -o /dev/null -s -w 'total=%{time_total}s connect=%{time_connect}s ttfb=%{time_starttransfer}s\n' https://astrome.app/api/v1/definitions
```

```bash
# Review Cloud Run request latency distribution (metrics explorer via gcloud)
gcloud monitoring time-series list \
  --project="$PROJECT_ID" \
  --filter='metric.type="run.googleapis.com/request_latencies"' \
  --limit=20
```

- Inspect CPU/memory saturation and concurrent request pressure.
- Verify no degraded external dependency.

### Mitigation

- Scale Cloud Run min/max instances and concurrency conservatively.
- Revert recent high-cost code paths.
- Enable temporary caching where safe (`definitions` endpoints etc.).

### Exit Criteria

- p95 latency returns to agreed baseline window for 30 minutes.
- No sustained user-facing timeout reports.
- Follow-up optimization tickets logged with owner/date.

---

## Runbook: Deploy Failure

**Owner**: Release manager / deploy initiator

### Triage

1. Identify failing stage (build, artifact, deploy, rollout, smoke test).
2. Capture first failing command/log line.
3. Decide rollback vs fix-forward based on impact window.

### First Checks

```bash
# Frontend quality gate
cd frontend
pnpm lint && pnpm type-check && pnpm build
```

```bash
# Backend container/build sanity
cd backend
python -m pytest -q
```

- Check deploy credentials, IAM, and quota errors in CLI logs.
- Verify required environment variables exist in target environment.

### Mitigation

- If production impacted, rollback immediately to last healthy release.
- If pre-release only, fix failing stage and re-run full validation.
- Document exact failing command and corrected change.

### Exit Criteria

- New deployment completes all stages successfully.
- Post-deploy smoke checks pass for homepage + APIs.
- Incident/deploy notes include cause and prevention action.

---

## Runbook: SEO Visibility Drop

**Owner**: Product/SEO owner with frontend support

### Triage

1. Confirm if drop is global or query/page-specific.
2. Check if caused by indexation/crawl issues vs ranking shifts.
3. Correlate with deploy date, robots/sitemap/canonical changes.

### First Checks

```bash
# Verify crawl-critical artifacts
curl -I https://astrome.app/robots.txt
curl -I https://astrome.app/sitemap.xml
curl -I https://astrome.app/
```

- Inspect page source for canonical and noindex directives.
- Check Google Search Console for coverage/manual action/security issues.
- Validate sitemap freshness and URL discoverability.

### Mitigation

- Revert incorrect robots/canonical/noindex changes.
- Resubmit sitemap and request indexing for affected pages.
- Patch broken metadata or structured data regressions.

### Exit Criteria

- Crawl artifacts are valid and indexable state restored.
- Search Console errors return to normal trend.
- Recovery plan documented with checkpoints (1d/7d/28d).

## Incident Closure Checklist

- Incident timeline completed
- Customer/user communication posted
- Root cause identified (or next investigation owner assigned)
- Preventive action items created with owners and due dates
- Runbook improvements captured in follow-up PR
