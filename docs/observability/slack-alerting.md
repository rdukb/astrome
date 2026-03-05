# Slack Alerting

This spec defines Slack routing and message standards for Wave 2 alert delivery.

## Channels

- `#astrome-alerts-critical`
  - For `severity=critical`
  - Immediate human response expected
- `#astrome-alerts-warning`
  - For `severity=warning`
  - Triage during working hours

## Cloud Monitoring Notification Channels

Create two Slack notification channels in Cloud Monitoring:

1. `slack-critical`
- Slack workspace: Astrome workspace
- Destination: `#astrome-alerts-critical`
- Used by: `prod-uptime-fail`, `prod-api-hard-fail`

2. `slack-warning`
- Slack workspace: Astrome workspace
- Destination: `#astrome-alerts-warning`
- Used by: `prod-api-elevated-fail`, `prod-api-latency-p95`, `prod-infra-stress`

## Policy-to-Route Mapping

| Alert Policy | Severity | Notification Channel | Slack Channel |
|---|---|---|---|
| `prod-uptime-fail` | critical | `slack-critical` | `#astrome-alerts-critical` |
| `prod-api-hard-fail` | critical | `slack-critical` | `#astrome-alerts-critical` |
| `prod-api-elevated-fail` | warning | `slack-warning` | `#astrome-alerts-warning` |
| `prod-api-latency-p95` | warning | `slack-warning` | `#astrome-alerts-warning` |
| `prod-infra-stress` | warning | `slack-warning` | `#astrome-alerts-warning` |

## Message Content Standard

Use custom documentation fields in each alert policy to standardize Slack payloads.

Required sections:

- `Summary`: one-line symptom with current value
- `Impact`: user-facing impact statement
- `Runbook`: triage steps and dashboard links
- `Escalation`: who to page if not resolved

Template:

```txt
[{{policy.display_name}}] {{condition.name}}
Service: astrome-api | Env: prod | Severity: {{policy.user_label.severity}}
Value: {{metric.value}} | Threshold: {{condition.threshold_value}} | Window: {{condition.duration}}

Impact: {{policy.documentation.impact}}
Runbook: {{policy.documentation.runbook}}
Escalation: {{policy.documentation.escalation}}
Incident: {{incident.url}}
Dashboard: {{policy.documentation.dashboard}}
```

## Escalation Rules

- Critical alert open > 15 minutes: page on-call owner in Slack thread.
- Critical alert open > 30 minutes: escalate to backup owner.
- Warning alert open > 2 hours: convert to tracked issue and assign owner.

## Runbook Links (to include in each policy)

- Primary dashboard: `Astrome - API SLO Overview`
- Triage dashboard: `Astrome - Alert Triage`
- Health endpoint: `https://astrome.app/api/health`

## Change Control

- Any new production alert must declare `severity` and `route` labels.
- Any policy without a runbook link cannot be enabled.
- Keep Slack routing aligned with `docs/observability/alerts.md`.
