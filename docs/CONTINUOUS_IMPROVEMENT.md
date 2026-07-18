# SparkNC Continuous Improvement Engine

## Purpose
Close the loop from student activity → feedback → AI analysis → leadership insights → program improvements.

## Pipeline
1. **Student Activity** — existing task, goal, event, message, XP, streak data.
2. **Feedback** — `student_feedback`, `ambassador_feedback`, `feature_requests`.
3. **Analysis** — `FeedbackAnalysisService` and `ImpactAnalyticsService` detect patterns.
4. **Insights** — stored in `feedback_insights` and surfaced on dashboards.
5. **Recommendations** — `ImprovementRecommendationService` generates actionable suggestions.

## Components
- `ImprovementRecommendationRepository` — stores `improvement_recommendations`.
- `ImprovementRecommendationService` — generates and lists recommendations.
- `ImpactAnalyticsService` — provides the data foundation.

## Example Recommendations
- "Students are struggling with deadlines. Consider increasing reminder frequency."
- "Event attendance is higher on Thursdays. Consider scheduling more events then."
- "A number of students need support. Consider office hours or mentorship."

## Endpoints
- `POST /recommendations/generate` — compute new recommendations.
- `GET /recommendations` — list existing recommendations.
- `POST /recommendations/:id/status` — accept/dismiss/pending.

## Governance
Recommendations are suggestions, not automatic decisions. Leadership reviews them before acting. `AuditLogService` can be wired to track generation and status changes.
