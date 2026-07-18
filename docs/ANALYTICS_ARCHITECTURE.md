# SparkNC Impact Analytics Architecture

## Overview
Admin Impact Analytics provides organization-level and school-level metrics. It is built on the same D1 database and repositories; no separate analytics warehouse is introduced.

## Components
- `AnalyticsRepository` — SQL aggregations over `users`, `tasks`, `goals`, `event_attendees`, and `messages`.
- `AnalyticsService` — coordinates overview, school, and snapshot operations.
- `AnalyticsController` — exposes endpoints for the admin/analytics screens.
- `analytics_snapshots` table — persisted daily metric snapshots for trend reporting.

## Metrics
- Daily and weekly active students (based on task completion within windows).
- Total students, tasks completed, goals completed, events attended, messages sent.
- XP trend over the last N days.
- School-scoped variants for location managers and admins.

## Endpoints
- `GET /analytics/overview` — organization-wide metrics.
- `GET /analytics/school/:id` — school-scoped metrics.
- `POST /analytics/snapshot/organization` — persist an organization snapshot.
- `POST /analytics/snapshot/school/:id` — persist a school snapshot.

## Snapshots
Snapshots store `scope`, `scope_id`, `snapshot_type`, `snapshot_date`, and `metrics` JSON. They can be used to render historical dashboards without repeatedly aggregating large tables.

## Files
- `workers/api/repositories/AnalyticsRepository.ts`
- `workers/api/services/analyticsService.ts`
- `workers/api/controllers/analytics.ts`
- `workers/api/routes/analytics.ts`
- `app/(tabs)/analytics.tsx`

## Privacy
- Analytics endpoints are protected by authentication. Future iterations can add `admin.analytics.read` permission checks through the permission middleware.
- School-scoped queries join through `users.school_id`; students are counted, not individually exposed.
