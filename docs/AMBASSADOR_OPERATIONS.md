# Ambassador Operations

The Ambassador Student Support System gives peer mentors a queue of students who need attention, organized by risk level.

## Risk buckets

- **Inactive** — no activity in the last 14 days.
- **Needs encouragement** — some activity but low completion or momentum.
- **Strong growth** — high completion and consistent activity.

## Data model

`StudentSupportRepository` queries `users` (students) and `growth_events` to compute:

- `daysInactive`
- `recentTasks` completed (14 days)
- `recentGoals` completed (14 days)
- `recentXp` earned (14 days)
- `risk`

## API

- `GET /ambassador/student-support` — support queue for the ambassador's scoped school/location.
- `POST /ambassador/student-support` — record a support message sent to a student.

## Permissions

- `ambassador.support.view` — view the queue.
- `ambassador.support.message` — send and log support messages.

## Integration

The ambassador dashboard can display the three buckets and a one-click recommendation per student. Future work may store support interactions in a dedicated table and correlate them with re-engagement.

## Privacy

Ambassadors only see students within their assigned school/location scope. They do not see private tasks, goals, or messages beyond what is needed for support.
