# SEO Monitoring — Query Tracking & Escalation Runbook

## Overview

Astrome targets three high-intent Tamil calendar queries. This document defines what to
track, where to track it, the monitoring cadence, and the conditions that trigger action.

---

## Target Queries

| Query | Intent | Expected landing page |
|---|---|---|
| `tamil panchang` | Informational / tool | `/` (home) |
| `tamil panchangam` | Informational / tool | `/` (home) |
| `tamil panchanga` | Variant spelling | `/` (home) |

All three are variants of the same intent. GSC will surface them as separate rows; treat
them as a single query group for alerting purposes.

---

## Data Source: Google Search Console

### Initial Setup

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add property → **URL prefix** → `https://astrome.app`.
3. Verify ownership via the **HTML tag** method: add the meta tag to `layout.tsx`
   `metadata.verification.google` field, or use the DNS TXT record method.
4. Submit sitemap: `https://astrome.app/sitemap.xml`.
5. Allow 3–5 days for GSC to populate initial data.

### GSC Report: Performance → Search results

Filters to set for ongoing monitoring:

| Filter | Value |
|---|---|
| Date range | Last 28 days (rolling) |
| Search type | Web |
| Query contains | `tamil panch` |

Export columns: **Query**, **Clicks**, **Impressions**, **CTR**, **Position**.

---

## KPIs & Baselines

Establish baseline values in the first full month after launch. Update targets quarterly.

| KPI | Definition | Initial target | Escalation threshold |
|---|---|---|---|
| **Impressions** | Times the page appeared in search results for the query group | — (record baseline) | Drop > 30% WoW |
| **Clicks** | Organic visits attributed to target queries | — (record baseline) | Drop > 25% WoW |
| **CTR** | Clicks ÷ Impressions | ≥ 4% | Falls below 2% for 2 consecutive weeks |
| **Average position** | Mean ranking position for query group | ≤ 20 | Rises above 30 for 2 consecutive weeks |

---

## Monitoring Cadence

### Weekly (every Monday)

- Open GSC Performance report, filter to last 7 days vs previous 7 days.
- Check impressions and clicks for each target query.
- Record values in the [SEO tracking sheet](#tracking-sheet-template).
- If any **escalation threshold** is breached → follow the escalation steps below.

### Monthly (first Monday of each month)

- Pull 28-day rolling window; compare to prior 28-day window.
- Review **Coverage** report for index errors on `/`, `/about`, `/help`.
- Review **Core Web Vitals** report — confirm LCP < 2.5 s, CLS < 0.1, FID/INP < 200 ms.
- Review **Mobile Usability** report for any new issues.
- Update baseline targets if growth trend warrants revision.

### Quarterly

- Re-evaluate target query list — add long-tail variants that are emerging in GSC data
  (e.g. `tamil panchangam today`, `rahu kalam today tamil`).
- Run a Lighthouse audit on `/` and compare to prior quarter.
- Review structured data via [Rich Results Test](https://search.google.com/test/rich-results)
  for the WebSite and WebApplication schemas in `page.tsx`.

---

## Escalation Conditions & Response

### Condition 1 — Impression drop > 30% week-over-week

Likely causes: Google algorithm update, manual action, crawl error, robots.txt change,
canonical tag regression, sitemap removed.

Response:
1. Check GSC **Coverage** and **Manual Actions** reports immediately.
2. Confirm `https://astrome.app/sitemap.xml` is accessible and lists `/`.
3. Confirm `robots.ts` has not accidentally blocked Googlebot.
4. Check if a recent deploy changed canonical tags or metadata in `layout.tsx`.
5. Check [Google Search Status Dashboard](https://status.search.google.com) for algorithm
   update announcements.
6. If no technical issue found, monitor for 7 more days before further action.

### Condition 2 — CTR falls below 2% for 2 consecutive weeks

Likely causes: title/description no longer match user intent, competitors improved
snippets, position degraded.

Response:
1. Review current `<title>` and `<meta description>` in `layout.tsx` vs top-ranking
   competitor pages for `tamil panchangam`.
2. A/B test alternative title formats:
   - `Tamil Panchangam Today — [City] | Astrome`
   - `Today's Tamil Panchang with Rahu Kalam & Timings | Astrome`
3. Ensure the OG/Twitter description reinforces the value proposition (location-based,
   accurate timings).

### Condition 3 — Average position rises above 30 for 2 consecutive weeks

Likely causes: thin content, new competitor, Core Web Vitals regression, missing E-E-A-T
signals.

Response:
1. Run Lighthouse on `/` — check LCP and CLS; a regression here directly affects ranking.
2. Review whether the page content has changed (description section in `page.tsx`).
3. Ensure the JSON-LD schemas (WebSite, WebApplication) in `page.tsx` are valid via
   Rich Results Test.
4. Consider adding a more detailed editorial description of the Panchang elements
   (Tithi, Nakshatra, Yoga, Karana) to strengthen topical authority.

---

## Tracking Sheet Template

Copy this table into a spreadsheet and update weekly.

| Week ending | Query | Impressions | Clicks | CTR | Avg Position | Notes |
|---|---|---|---|---|---|---|
| YYYY-MM-DD | tamil panchang | | | | | |
| YYYY-MM-DD | tamil panchangam | | | | | |
| YYYY-MM-DD | tamil panchanga | | | | | |

---

## Related Files

| File | Purpose |
|---|---|
| `frontend/app/robots.ts` | Googlebot crawl directives |
| `frontend/app/sitemap.ts` | XML sitemap served at `/sitemap.xml` |
| `frontend/app/layout.tsx` | Global `<title>`, `<meta>`, OG, Twitter cards |
| `frontend/app/page.tsx` | JSON-LD structured data (WebSite, WebApplication) |
| `docs/observability/analytics-ga4.md` | GA4 event schema for behavioural analytics |
