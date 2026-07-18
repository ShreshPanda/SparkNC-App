# SparkNC Performance Guide

## Principles
- Measure before optimizing.
- Use indexes for D1 query patterns, not for every column.
- Cache expensive results at the edge (KV) and avoid repeated D1 round-trips.
- Lazy load large lists on the frontend.
- Keep responses small and JSON structures flat.

## Backend optimizations

### Database indexes
See `workers/database/migrations/012_performance_indexes.sql`. Key indexes:
- `tasks(user_id, status)` for dashboard lists.
- `tasks(user_id, completed_at)` for streak and XP calculations.
- `goals(user_id, status)` and `goals(user_id, completed_at)` for progress views.
- `growth_events(user_id, occurred_at)` for timelines and narratives.
- `messages(recipient_id, read_status)` for unread badges.
- `xp_history(user_id, created_at)` for XP trends.
- `analytics_snapshots(snapshot_date, scope, scope_id)` for reporting.

### Query patterns
- Prefer `SELECT ... WHERE user_id = ?` with a covering index.
- Avoid `SELECT *` in analytics; fetch only needed columns.
- Use `LIMIT` for lists and `COUNT(*)` for badges.
- Aggregate snapshots in the background (`snapshotOrganizationAnalyticsController`) instead of at request time.

### Caching
- Cache `AdminOverview` and `AmbassadorCommandCenter` results in KV with a 5-minute TTL.
- Cache `StudentGrowthNarrative` for one hour; it only changes when new events occur.
- Cache `roles` and `permissions` in memory for the lifetime of the request context.

## Frontend optimizations

### Lazy loading
- Use `FlatList` `onEndReached` for notifications, feedback, and group posts.
- Paginate analytics and growth timeline endpoints (`?page` and `?limit`).

### Rendering
- Use `React.memo` for `SparkCard`, `EmptyState`, and list items.
- Use `useMemo` for computed stats derived from API payloads.
- Avoid re-rendering animations when not visible.

### Images
- Serve icons from `@expo/vector-icons` and vector assets.
- Compress splash and icon PNGs to under 250 KB.
- Use `expo-image` `contentFit` and `cachePolicy` for web exports.

## Monitoring
- `PerformanceMonitoringService.measure()` wraps slow operations.
- Default slow threshold is 300 ms.
- Cloudflare Workers Analytics and `wrangler tail` are the primary observability tools.

## Load testing checklist
- [ ] 1,000 concurrent dashboard requests complete under 500 ms.
- [ ] Notification generation for 10,000 users completes under 30 s via cron.
- [ ] AI companion reflection completes under 1 s for a single user.
- [ ] Growth narrative generation for one user completes under 2 s.
- [ ] Group post list loads under 1 s for groups with 1,000 posts.

## Future work
- Add query result caching in KV for hot endpoints.
- Shard analytics snapshots by month.
- Add edge-distributed rate limiting for public routes.
