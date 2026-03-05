# Operations Maintenance Cadence

This cadence keeps Astrome deployment, reliability, and observability hygiene current.

## Weekly

- Review Cloud Run error logs and top failing endpoints.
- Check homepage/API latency trend and investigate regressions.
- Verify `robots.txt`, `sitemap.xml`, and homepage `200` responses.
- Confirm no stale/failed deploy attempts remain unresolved.

## Bi-Weekly

- Review incident queue and ensure postmortems are complete.
- Validate runbooks in `docs/operations/incidents.md` against latest architecture.
- Audit alert noise and tune thresholds/documentation as needed.

## Monthly

- IAM review for deployers and runtime service accounts (remove stale access).
- Re-run deployment prerequisites in `docs/operations/deploy-prereqs.md`.
- Validate backup rollback path (frontend release rollback + Cloud Run revision rollback).
- Audit domain/canonical SEO settings and Search Console coverage health.

## Quarterly

- Run a tabletop exercise for one SEV-1 scenario from incident runbooks.
- Review SLO targets for availability, 5xx rate, and p95 latency.
- Evaluate dependency/runtime upgrades and security patch status.
- Confirm on-call ownership and escalation matrix are still accurate.

## Change Management Rules

- Any production incident should result in either a runbook update or explicit no-change note.
- Any deployment outage should produce a preventive action item with owner + due date.
- Runbook and prerequisites docs should be versioned with relevant release changes.

## Owners

- **Primary**: Platform/Backend maintainer
- **Secondary**: Frontend/SEO maintainer
- **Approver**: Repository maintainers

## Cadence Exit Criteria

Cadence is healthy when:

- Scheduled checks are completed in the expected interval.
- Action items are tracked to closure within planned due dates.
- No recurring incident class is left without an owner or mitigation plan.
