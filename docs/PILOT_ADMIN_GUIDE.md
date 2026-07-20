# Pilot Admin Guide

## Getting started

1. Deploy the Worker and apply all D1 migrations (001–020).
2. Seed role permissions for `admin.*`, `pilot.*`, `community.moderate.*`, and `ambassador.support.*`.
3. Create the first admin user through the registration flow and assign the `admin` role in the `users` table.
4. Set `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` in the Expo `.env` to the production Worker domain.

## Day-to-day operations

- Use `GET /executive/dashboard` for high-level program health.
- Use `GET /pilot/operations` for daily/weekly pilot analytics.
- Use `GET /metrics` for observability (requests, errors, slow queries).
- Use `/audit` to review sensitive admin actions.
- Use `/community/reports` and `/community/moderate/*` to handle moderation.

## Common tasks

### Add a school or location

Update the `schools` and `locations` tables directly or via an admin importer.

### Onboard a cohort

Send students the Expo app link and have them:

1. Sign up at `/auth/register`.
2. Complete onboarding at `/onboarding`.
3. Join a pilot group if applicable.

### View analytics

Call `GET /pilot/operations?days=30` to export daily active users, task/goal completions, and feature usage.

## Troubleshooting

- If `/health` fails, verify D1 binding and `wrangler.jsonc` `database_id`.
- If auth fails, check `SESSION_SECRET` is set and at least 32 characters.
- If push notifications fail, verify `EXPO_ACCESS_TOKEN`.

## Escalation

For deployment issues, see `docs/PRODUCTION_RUNBOOK.md`.
