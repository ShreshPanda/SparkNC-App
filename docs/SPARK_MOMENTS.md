# Spark Moments

Spark Moments are meaningful, personalized celebrations for student progress.

## Supported moments

| Type | Threshold | Message |
| --- | --- | --- |
| `xp_100` | 100 XP | Great start — 100 XP in the books! |
| `xp_500` | 500 XP | 500 XP! You are building serious momentum. |
| `xp_1000` | 1000 XP | 1000 XP — that is SparkNC dedication in action. |
| `first_goal` | 1 goal | First goal down. This is what progress feels like. |
| `goals_10` | 10 goals | 10 goals completed — consistency is your superpower. |
| `first_community` | 1 contribution | Welcome to the SparkNC community — your voice matters. |
| `top_contributor` | 50 contributions | Top contributor — you are lifting others up. |
| `streak_7` | 7-day streak | 7-day streak! Momentum is building. |
| `streak_30` | 30-day streak | 30-day streak — unstoppable focus. |

## Backend

- `SparkMomentsRepository.ts` — persists triggered moments and acknowledgments.
- `SparkMomentsService.ts` — compares user stats to thresholds and triggers new moments.
- `GET /spark-moments` — list a user's moments.
- `POST /spark-moments/trigger` — trigger detection for provided stats.

## Frontend

Use `CelebrationOverlay.tsx` to show the most recent unacknowledged moment. Call `POST /spark-moments/trigger` after task/goal completion, XP gains, or community activity.

## Database

`020_spark_moments.sql` creates `spark_moments` and `spark_moment_triggers` tables with indexes on `user_id` and `type`.

## Future

- Add shareable graphic cards.
- Add birthday and one-year anniversary triggers.
- Add perfect-attendance and leadership-recognition moments.
