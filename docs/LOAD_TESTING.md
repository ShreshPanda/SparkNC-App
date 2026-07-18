# Load Testing Guide

This guide describes how to validate SparkNC performance at 100, 500, and 1000 concurrent users.

## Tools

- [Artillery](https://www.artillery.io/) or [k6](https://k6.io/) for HTTP load generation.
- Cloudflare Analytics dashboard for Worker CPU time and D1 query metrics.
- Browser Lighthouse / Web Vitals for frontend performance.

## Targets

| Metric | 100 users | 500 users | 1000 users |
| --- | --- | --- | --- |
| P95 API response | < 500 ms | < 1000 ms | < 2000 ms |
| P99 API response | < 1000 ms | < 2000 ms | < 4000 ms |
| Error rate | < 1% | < 1% | < 2% |
| D1 slow queries | 0 | < 5% | < 10% |

## Test scenarios

1. **Health check** — `GET /health` to baseline Worker/D1 latency.
2. **Authenticated read** — `GET /tasks` with a session cookie.
3. **Write load** — `POST /tasks` and `POST /goals`.
4. **Analytics** — `GET /analytics/engagement`.
5. **Community** — `GET /community/groups` and `POST /community/groups/:id/posts`.
6. **AI companion** — `POST /ai/chat` (or cached/demo endpoint if Workers AI is not connected).

## Environment

Run against a staging deployment before production:

```bash
npx wrangler deploy --env staging
```

Use isolated D1 database and synthetic test accounts. Do not run load tests against the production database with real user data.

## Procedure

1. **100 users** — 10 req/s for 5 minutes. Verify P95 and error rates.
2. **500 users** — 50 req/s for 10 minutes. Verify D1 slow queries and CPU time.
3. **1000 users** — 100 req/s for 15 minutes. Verify no Worker OOM and acceptable P99.

## Optimization checklist

- [ ] All new D1 queries use `.bind()` and targeted indexes.
- [ ] `012_performance_indexes.sql` is applied.
- [ ] Heavy analytics endpoints cache or pre-compute results.
- [ ] Audit logging is async and does not block the response.
- [ ] `PerformanceMonitoringService` is recording slow operation timings.
- [ ] Consider Cloudflare D1 read replicas and query result caching with KV when available.

## Capturing results

Record results in this file or a runbook:

```
Date: ...
Scenario: ...
Concurrent users: ...
P95: ...
P99: ...
Error rate: ...
Notes: ...
```

## Remediation

If targets are missed:

1. Identify slow queries via `PerformanceMonitoringService` logs.
2. Add missing indexes or rewrite N+1 queries.
3. Cache expensive analytics in KV.
4. Split write-heavy endpoints into Durable Objects or queues if necessary.
5. Increase `wrangler` Worker limits or use Workers Paid plan for more CPU time.
