# Alert Policies

This document defines Wave 2 balanced alert thresholds and routing for production.

## Notification Routes

- `critical` -> `slack-critical` (Pager-worthy)
- `warning` -> `slack-warning` (Business hours follow-up)

## Alert Matrix

| Alert Name | Condition | Duration | Severity | Route |
|---|---|---|---|---|
| `prod-uptime-fail` | 3 consecutive uptime probe failures (1m checks) | 3 minutes | critical | slack-critical |
| `prod-api-hard-fail` | 5xx rate >= 10% for 5m AND total requests >= 20 per 5m | 5 minutes | critical | slack-critical |
| `prod-api-elevated-fail` | 5xx rate >= 3% for 10m AND total requests >= 50 per 10m | 10 minutes | warning | slack-warning |
| `prod-api-latency-p95` | p95 latency > 1200ms for 10m | 10 minutes | warning | slack-warning |
| `prod-infra-stress` | memory > 85% OR CPU > 80% for 10m | 10 minutes | warning | slack-warning |

## Policy Specs

### 1) `prod-uptime-fail`

- Metric source: `monitoring.googleapis.com/uptime_check/check_passed`
- Filter:

```txt
resource.type="uptime_url"
metric.type="monitoring.googleapis.com/uptime_check/check_passed"
metric.labels.check_id="<CHECK_ID_FOR_astrome-api-health-prod>"
```

- Trigger: condition is false for 3 aligned 1-minute evaluations.
- Labels: `env=prod`, `service=astrome-api`, `severity=critical`, `route=slack-critical`

### 2) `prod-api-hard-fail`

- Metric source: `run.googleapis.com/request_count`
- Resource filter:

```txt
resource.type="cloud_run_revision"
resource.labels.service_name="astrome-api"
resource.labels.location="us-central1"
metric.type="run.googleapis.com/request_count"
```

- Derived ratio: `sum(5xx, 5m) / sum(total, 5m)`
- Gate: `sum(total, 5m) >= 20`
- Trigger: ratio `>= 0.10` for 5 minutes.
- Labels: `env=prod`, `service=astrome-api`, `severity=critical`, `route=slack-critical`

### 3) `prod-api-elevated-fail`

- Metric source: `run.googleapis.com/request_count`
- Derived ratio: `sum(5xx, 10m) / sum(total, 10m)`
- Gate: `sum(total, 10m) >= 50`
- Trigger: ratio `>= 0.03` for 10 minutes.
- Labels: `env=prod`, `service=astrome-api`, `severity=warning`, `route=slack-warning`

### 4) `prod-api-latency-p95`

- Metric source: `run.googleapis.com/request_latencies`
- Filter:

```txt
resource.type="cloud_run_revision"
resource.labels.service_name="astrome-api"
resource.labels.location="us-central1"
metric.type="run.googleapis.com/request_latencies"
```

- Alignment: `1m`, `ALIGN_PERCENTILE_95`
- Trigger: `p95 > 1200ms` for 10 minutes.
- Labels: `env=prod`, `service=astrome-api`, `severity=warning`, `route=slack-warning`

### 5) `prod-infra-stress`

Two subconditions in one OR policy:

- Memory condition:
  - Metric: `run.googleapis.com/container/memory/utilizations`
  - Trigger: `mean > 0.85` for 10 minutes.
- CPU condition:
  - Metric: `run.googleapis.com/container/cpu/utilizations`
  - Trigger: `mean > 0.80` for 10 minutes.

Shared filter:

```txt
resource.type="cloud_run_revision"
resource.labels.service_name="astrome-api"
resource.labels.location="us-central1"
```

- Combiner: `OR`
- Labels: `env=prod`, `service=astrome-api`, `severity=warning`, `route=slack-warning`

## Noise Controls

- Auto-close incidents after 15 minutes healthy.
- Re-notify critical every 15 minutes while open.
- Re-notify warning every 60 minutes while open.
- Keep hard-fail and elevated-fail separate to preserve signal quality.
