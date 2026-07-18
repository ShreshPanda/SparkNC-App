# SparkNC Impact Analytics

## Purpose
Impact Analytics answers leadership questions: "How can SparkNC improve its impact?" It combines existing engagement metrics with new feedback data.

## Components
- `AnalyticsRepository` (Sprint 4) — base engagement, XP, task/goal/event/message totals.
- `StudentFeedbackRepository` — student ratings and themes.
- `AmbassadorFeedbackRepository` — ambassador observations.
- `FeatureRequestRepository` — community improvement board.
- `ImpactAnalyticsService` — computes the `ImpactAnalytics` response.
- `ImpactReportService` — generates and stores monthly `impact_reports`.

## Metrics
- **Student Experience**: average satisfaction, feedback count, sentiment distribution, top themes, common challenges.
- **Engagement**: total/active students, task/goal completion rates, event participation.
- **Growth**: tasks completed, goals completed, events attended, messages sent, XP trend.
- **Feature Requests**: status distribution.

## Endpoints
- `GET /impact-analytics` — full impact dashboard.
- `POST /impact-reports/generate` — create a monthly report.
- `GET /impact-reports` — list stored reports.

## Reports
`impact_reports` stores JSON `metrics` for future PDF/dashboard export. Reports are scoped by `scope` and `report_type`.

## Extending
Add new metrics to `ImpactAnalyticsService` without changing the repository or response shape. Export/PDF rendering can be built on top of the report JSON later.
