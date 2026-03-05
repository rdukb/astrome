# GCP Dashboards

This spec defines production dashboard panels and their exact metric mappings.

## Dashboard: `Astrome - API SLO Overview`

Time range defaults: last 6 hours. Auto-refresh: 1 minute.

### Panel 1: End-to-End Uptime (1m)

- Visualization: Scorecard + sparkline
- Metric: `monitoring.googleapis.com/uptime_check/check_passed`
- Resource: `uptime_url`
- Filter:

```txt
resource.type="uptime_url"
metric.type="monitoring.googleapis.com/uptime_check/check_passed"
metric.labels.check_id="<CHECK_ID_FOR_astrome-api-health-prod>"
```

- Alignment: `1m`, aligner `ALIGN_FRACTION_TRUE`
- Goal line: `>= 0.99`

### Panel 2: Requests per Minute (RPM)

- Visualization: Time series
- Metric: `run.googleapis.com/request_count`
- Resource: `cloud_run_revision`
- Filter:

```txt
resource.type="cloud_run_revision"
resource.labels.service_name="astrome-api"
resource.labels.location="us-central1"
metric.type="run.googleapis.com/request_count"
```

- Alignment: `1m`, aligner `ALIGN_RATE`
- Grouping: none

### Panel 3: API Error Rate (5xx %)

- Visualization: Time series + threshold lines
- Formula: `sum(5xx requests) / sum(total requests) * 100`
- Numerator filter adds: `metric.labels.response_code_class="5xx"`
- Denominator filter: total request filter from panel 2
- Alignment: `5m` rolling
- Threshold lines: `3%` (warning), `10%` (critical)

### Panel 4: API p95 Latency

- Visualization: Time series + threshold line
- Metric: `run.googleapis.com/request_latencies`
- Resource: `cloud_run_revision`
- Filter:

```txt
resource.type="cloud_run_revision"
resource.labels.service_name="astrome-api"
resource.labels.location="us-central1"
metric.type="run.googleapis.com/request_latencies"
```

- Alignment: `1m`, aligner `ALIGN_PERCENTILE_95`
- Threshold line: `1200 ms`

### Panel 5: CPU Utilization

- Visualization: Time series
- Metric: `run.googleapis.com/container/cpu/utilizations`
- Resource filter: standard Cloud Run filter
- Alignment: `1m`, aligner `ALIGN_MEAN`
- Threshold line: `0.80`

### Panel 6: Memory Utilization

- Visualization: Time series
- Metric: `run.googleapis.com/container/memory/utilizations`
- Resource filter: standard Cloud Run filter
- Alignment: `1m`, aligner `ALIGN_MEAN`
- Threshold line: `0.85`

## Dashboard: `Astrome - Alert Triage`

Time range defaults: last 1 hour. Auto-refresh: 30 seconds.

### Panel 1: Active Incidents by Severity

- Source: Cloud Monitoring incidents
- Filter labels:

```txt
metadata.user_labels.env="prod"
metadata.user_labels.service="astrome-api"
```

- Breakdown: `severity`

### Panel 2: 5xx Count (5m buckets)

- Metric: `run.googleapis.com/request_count`
- Filter adds: `metric.labels.response_code_class="5xx"`
- Alignment: `5m`, aligner `ALIGN_SUM`

### Panel 3: Total Request Count (5m buckets)

- Metric: `run.googleapis.com/request_count`
- Alignment: `5m`, aligner `ALIGN_SUM`

### Panel 4: Uptime Failed Probes

- Metric: `monitoring.googleapis.com/uptime_check/check_passed`
- Transform: `1 - fraction_true`
- Alignment: `1m`

## Required Dashboard Variables

- `service_name` default `astrome-api`
- `region` default `us-central1`
- `env` default `prod`

All panel filters must be parameterized with these variables for reuse across environments.
