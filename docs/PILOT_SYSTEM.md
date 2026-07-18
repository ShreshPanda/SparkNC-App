# Pilot System

The Pilot System allows SparkNC leadership to onboard and manage controlled groups of real-world testers before a wider release.

## Purpose

- Track which users are part of a pilot cohort.
- Measure pilot engagement and collect structured feedback.
- Pause or complete pilots without deleting historical data.

## Data model

Table: `pilot_users`

- `id` — pilot membership id
- `user_id` — reference to `users.id`
- `pilot_group` — arbitrary group label (e.g., `fall-2026`, `campus-alpha`)
- `status` — `active`, `paused`, or `completed`
- `joined_at` — when the user joined the pilot
- `last_active_at` — most recent activity timestamp
- `created_at` / `updated_at` — audit timestamps

## Permissions

- `pilot.manage` — create groups, add participants, update status (admins).
- Any authenticated user can view their own pilot status via `GET /pilot/me`.

## API endpoints

- `POST /pilot/groups` — create a new pilot group (admin).
- `GET /pilot/groups` — list all pilot groups (admin).
- `POST /pilot/participants` — add a user to a pilot group (admin).
- `GET /pilot/participants?group=` — list participants, optionally filtered by group (admin).
- `PATCH /pilot/participants/:id` — update participant status (admin).
- `GET /pilot/me` — current user's pilot status.

## Integration

`PilotService` should be called from the login flow to update `last_active_at` and from the admin dashboard to manage cohorts. Future work can connect pilot groups to feedback analysis and engagement analytics for measurable pilot outcomes.
