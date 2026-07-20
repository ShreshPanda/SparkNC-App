# Observability

Production observability for SparkNC is built around request metrics, slow-query logging, and error aggregation.

## Components

- `workers/api/services/ObservabilityService.ts` — records requests and errors, builds dashboards.
- `workers/api/repositories/MetricsRepository.ts` — D1 persistence for `request_metrics`, `error_logs`, `slow_queries`.
- `workers/api/controllers/metrics.ts` — `GET /metrics` endpoint.
- `workers/database/migrations/019_observability.sql` — creates the observability tables.

## Metrics captured

- `requestId`, `method`, `path`, `statusCode`, `durationMs`, `userId`
- Error `message`, `path`, `method`, `requestId`
- `slow_queries` table (populated by `PerformanceMonitoringService`)

## Dashboard

`GET /metrics` returns:

- Request totals and average/max duration over the selected window.
- Error totals.
- Top slow queries.
- Recent error log entries.

Requires `admin.executive.view` permission.

## Request IDs

Every Worker response includes a `requestId` generated in `workers/index.ts`. Use it to correlate logs, errors, and slow queries.

## Alerts

- Any request > 300ms is recorded in `slow_queries`.
- Error logs can be queried and exported for incident triage.
- Workers Analytics and Pages dashboard provide additional egress/error-rate metrics.

## Future improvements

- Ship metrics to a centralized observability provider (Cloudflare Analytics, Sentry, Datadog).
- Add structured JSON logging in `logger.ts`.
- Add p50/p95/p99 percentile views.
- Add feature-usage counters.
