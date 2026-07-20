# Pilot Operations Dashboard

The Pilot Operations Dashboard gives program leaders a daily, weekly, and monthly view of pilot engagement.

## Endpoint

`GET /pilot/operations`

Requires `admin.pilot.view` permission.

Query parameters:

- `days` — window for daily/historical series (default 30)
- `features` — comma-separated action names to count (default `task_complete,goal_complete,ai_chat,event_join`)

## Response fields

- `active.daily` — array of `{ date, count }` for active users per day
- `active.monthly` — distinct active users in the last 30 days
- `completions` — task completions, goal completions, events attended
- `engagement` — messages sent, community posts, AI interactions, feature usage counts
- `averages` — average streak, average XP, average satisfaction score
- `retention` — 7-day and 30-day daily activity retention percentages
- `exportable` — `true` (export UI can render CSV/JSON)

## Export

`GET /pilot/operations/export` (future) will return a CSV of all dashboard values.

## Implementation

- `PilotOperationsRepository.ts` — SQL aggregations against `activity_logs`, `users`, `tasks`, `goals`, `messages`, `group_posts`, `ai_memory`, `student_feedback`.
- `PilotOperationsDashboardService.ts` — composes metrics and computes retention.
- `pilotOperations.ts` controller/route — permission-guarded.

## Privacy

All metrics are aggregated. No individual student names are returned.
