# Performance Optimization

This document captures Sprint 9 performance improvements for SparkNC.

## Database indexes

New indexes added in `018_sprint9_performance_indexes.sql`:

- `journey_events(user_id, date)` and `journey_events(user_id, category)` — fast journey lookups.
- `portfolio(user_id, type)` — portfolio summary by type.
- `delight_events(user_id, type)` and `delight_events(created_at)` — delight and analytics queries.
- `activity_logs(user_id, date)` and `activity_logs(action, created_at)` — engagement and streak computations.
- `notifications(user_id, sent_at)` and `notifications(user_id, read_status)` — message/alert feeds.
- `users(school_id, location_id, role)` and `users(organization_id, role)` — scoped analytics.
- `events(start_time)` and `event_attendees(event_id, user_id)` — calendar and attendance.
- `audit_logs(user_id, action)` and `audit_logs(created_at)` — compliance queries.
- `messages(thread_id, created_at)` and `message_thread_participants(thread_id, user_id)` — messaging threads.

## Query optimization

- Repositories use targeted selects and avoid `SELECT *` where practical.
- Date-range queries use indexed columns (`created_at`, `date`).
- Aggregations are pushed to SQL via `COUNT`, `SUM`, `GROUP BY`.
- `PerformanceMonitoringService` flags queries > 300ms as slow.

## Frontend performance

- New dashboard widgets are modular and can be lazy-loaded.
- `AnimationProvider` disables motion when reduced motion is requested.
- FlatList `scrollEnabled={false}` avoids nested scroll conflicts.

## Worker performance

- `wrangler.jsonc` enables `minify`.
- Worker responses are JSON with `content-type` set.
- Observability captures request duration and slow queries for tuning.

## Caching and pagination

- API lists default to reasonable page sizes; consumers pass `limit`/`offset`.
- KV/R2 bindings are reserved in `wrangler.jsonc` for future caching layers.

## Future work

- Add Cloudflare KV for frequently read reference data.
- Implement request-level caching headers for immutable assets.
- Bundle split the Expo web build by route.
