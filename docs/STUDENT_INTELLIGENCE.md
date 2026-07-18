# Student Intelligence System

## Overview
The Student Intelligence layer turns existing SparkNC activity into actionable, personalized guidance. It analyzes the same `users`, `tasks`, `goals`, `events`, `messages`, and `notifications` tables already in production—no parallel data store or AI-only database is created.

## Intelligence Pipeline
1. **Aggregate** — `StudentInsightRepository` pulls totals for tasks, goals, XP, streaks, events, and messages.
2. **Analyze** — `StudentInsightService` derives patterns such as peak productivity hour, streak risk, and engagement score.
3. **Persist** — `student_insights` stores generated insights with an expiration date so stale guidance is replaced.
4. **Surface** — `ProgressScreen` renders stats, engagement score, and current insights.

## Key Tables
- `student_insights` — generated guidance per user (`insight_type`, `title`, `description`, `priority`, `expires_at`).
- `growth_events` — milestone timeline (first login, first task, goal completions, streak/level milestones, event attendance).
- `personal_records` — longest streak, most productive periods, etc.

## Files
- `workers/api/repositories/StudentInsightRepository.ts`
- `workers/api/services/studentInsightService.ts`
- `workers/api/controllers/insights.ts`
- `workers/api/routes/insights.ts`
- `app/(tabs)/progress.tsx`
- `app/(tabs)/growth.tsx`

## Endpoints
- `GET /insights` — list active insights for the current user.
- `GET /insights/dashboard` — combined stats + insights.
- `POST /insights/generate` — recompute and store new insights.
- `GET /growth-timeline` — timeline events.
- `POST /growth-timeline/generate` — build timeline from existing data.

## Data Sources
- `users.xp`, `users.current_streak`, `users.longest_streak`
- `tasks.completed` + `created_at` for productivity patterns
- `goals.completed` for milestone tracking
- `event_attendees` for participation
- `messages` for community engagement

## Extending
Add new `insight_type` values and matching generators in `StudentInsightService` without changing the repository or API contract.
