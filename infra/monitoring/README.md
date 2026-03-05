# Cloud Monitoring Policy Skeletons

This folder contains Wave 2 alert policy skeletons for `astrome-api`.

## Files

- `alert-uptime-fail.yaml`
- `alert-api-hard-fail.yaml`
- `alert-api-elevated-fail.yaml`
- `alert-api-latency-p95.yaml`
- `alert-infra-stress.yaml`

## Placeholders To Replace

- `PROJECT_ID`
- `UPTIME_CHECK_ID`
- `SLACK_CRITICAL_CHANNEL_ID`
- `SLACK_WARNING_CHANNEL_ID`

## Notes

- API error-rate policies include traffic gates (`>=20/5m` and `>=50/10m`) as separate AND conditions.
- Latency threshold is set as `1200` to match the Wave 2 spec (`1200ms`). If your metric view is seconds, set this to `1.2`.
- Uptime policy uses MQL to capture `3 consecutive` 1-minute probe failures.

## Apply Example

```bash
export PROJECT_ID="your-gcp-project"

gcloud monitoring policies create \
  --project "$PROJECT_ID" \
  --policy-from-file infra/monitoring/alert-uptime-fail.yaml
```

Repeat for each file after replacing placeholders.
