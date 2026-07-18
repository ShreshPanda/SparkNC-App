# Engagement Analytics

Engagement Analytics measure whether SparkNC is actually helping students by tracking active usage, completion, and community participation.

## Metrics

- **DAU** — distinct active users in the last 24 hours.
- **WAU** — distinct active users in the last 7 days.
- **MAU** — distinct active users in the last 30 days.
- **Retention** — users from a past cohort who remain active in the last 7 days.
- **Feature usage** — action counts from `growth_events`.
- **Task completion** — `task_completed` events per period.
- **Goal completion** — `goal_completed` events per period.
- **Community activity** — `group_posts` created per period.

## Implementation

- `EngagementAnalyticsRepository` runs aggregate D1 queries against `growth_events`, `users`, and `group_posts`.
- `EngagementAnalyticsService` assembles the summary, retention cohort, and feature usage.
- `EngagementAnalyticsController` returns the data as JSON.
- `workers/api/routes/engagementAnalytics.ts` exposes the endpoints with `admin.analytics.view` permission.

## Endpoints

- `GET /analytics/engagement` — full engagement summary.
- `GET /analytics/retention` — 7-day retention cohort.
- `GET /analytics/features` — 30-day feature usage breakdown.

## Privacy

All counts are aggregated. No individual student activity is returned by these endpoints. Admins see cohort-level data only.

## Future improvements

- Pre-compute daily aggregates in a `daily_engagement_snapshots` table to avoid expensive scans at scale.
- Add cohort retention by signup week.
- Track per-school and per-pilot-group engagement.
