# Metrics Catalog

This catalog defines the Wave 2 production metrics for Astrome observability.

## Scope

- Project: `astrome` (replace with real GCP project ID in policy JSON)
- Region: `us-central1`
- Service: `astrome-api` (Cloud Run)
- Frontdoor path: `https://astrome.app/api/**` (Firebase rewrite to Cloud Run)

## Canonical Resource Filters

Use these filters unless a metric requires different resource type.

```txt
resource.type="cloud_run_revision"
resource.labels.service_name="astrome-api"
resource.labels.location="us-central1"
```

## Metric Definitions

| Metric ID | Source Metric Type | Unit | Aggregation | Primary Filter Additions | Purpose |
|---|---|---|---|---|---|
| `api_request_total` | `run.googleapis.com/request_count` | requests | Sum over window | none | Denominator for error-rate and traffic gates |
| `api_request_5xx` | `run.googleapis.com/request_count` | requests | Sum over window | `metric.labels.response_code_class="5xx"` | Numerator for API failure ratios |
| `api_error_rate_5xx` | Derived (`api_request_5xx / api_request_total`) | percent | Aligned ratio by window | same as above | API hard/elevated failure policy |
| `api_latency_p95` | `run.googleapis.com/request_latencies` | seconds | 95th percentile over window | none | User-facing backend latency SLI |
| `infra_cpu_utilization` | `run.googleapis.com/container/cpu/utilizations` | ratio (0-1) | Mean over window | none | CPU saturation detection |
| `infra_memory_utilization` | `run.googleapis.com/container/memory/utilizations` | ratio (0-1) | Mean over window | none | Memory saturation detection |
| `uptime_check_passed` | `monitoring.googleapis.com/uptime_check/check_passed` | bool | Fraction true over window | `resource.type="uptime_url"` + check ID/host filter | End-to-end availability |

## Uptime Check Asset

Create one production check and reuse it everywhere:

- Display name: `astrome-api-health-prod`
- URL: `https://astrome.app/api/health`
- Period: `1 minute`
- Regions: at least 3 (US + EU + APAC)
- Success criteria: HTTP 200 and body contains `"status":"online"`

After creation, capture `check_id` and use:

```txt
resource.type="uptime_url"
metric.type="monitoring.googleapis.com/uptime_check/check_passed"
metric.labels.check_id="<CHECK_ID_FOR_astrome-api-health-prod>"
```

## Label Conventions

- Environment label for all dashboards/policies: `env=prod`
- Severity label for alert policies: `severity=critical|warning`
- Routing label for notifications: `route=slack-critical|slack-warning`

## Notes

- Error-rate alerts must always include traffic gates (`>=20 req/5m` or `>=50 req/10m`) to avoid false positives at low volume.
- Latency policy uses p95 from Cloud Run request latencies (distribution metric), not average.
- Infra stress is an OR policy: memory threshold OR CPU threshold for sustained 10 minutes.
