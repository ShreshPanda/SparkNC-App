# Executive Dashboard 2.0

The Executive Dashboard gives leadership a polished, presentation-ready view of program health.

## Purpose

- Surface KPIs quickly.
- Track engagement, retention, and growth over time.
- Compare schools, locations, and organizations.
- Support data-driven leadership decisions.

## Features

- KPI cards: DAU, WAU, MAU, tasks, goals, community posts.
- Interactive charts: `dailyActiveSeries`, `featureUsage`.
- Retention cohort analysis.
- School, location, and organization comparisons.
- Growth over time widgets.

## Backend

- `ExecutiveDashboardService.ts` — composed from `EngagementAnalyticsService` and `AnalyticsRepository`.
- `GET /executive/dashboard` with `organizationId` and `days` parameters.
- Requires `admin.executive.view` permission.

## Frontend

- Admin/Analytics screen can consume the endpoint.
- Designed for presentation mode with high-contrast, large-number KPI cards.

## Privacy

- Aggregated only; no individual student names in executive widgets.
- Access restricted to `admin.executive.view` permission.

## Future improvements

- Export widgets to PNG/PDF.
- Real-time WebSocket updates.
- Drill-down from school to location to student cohort.
