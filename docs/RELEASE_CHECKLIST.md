# Release Checklist — SparkNC v1.0 RC1

## Pre-release

- [ ] All D1 migrations through `020_spark_moments.sql` are applied.
- [ ] `wrangler.jsonc` has the correct `database_id`.
- [ ] `SESSION_SECRET` is at least 32 characters and set as a Wrangler secret.
- [ ] `BETTER_AUTH_SECRET` and `EXPO_ACCESS_TOKEN` are set as Wrangler secrets.
- [ ] `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` points to the production Worker domain.
- [ ] `npm install` has been run for both Expo and Worker.
- [ ] Typecheck passes for both projects.
- [ ] `npm test` / `npx vitest run` passes.

## Deployment

- [ ] `npx wrangler d1 migrations apply sparknc-db`
- [ ] `npx wrangler deploy`
- [ ] `GET /health` returns `status: ok`
- [ ] `GET /version` returns the expected version
- [ ] `GET /status` reports all expected tables

## Smoke tests

- [ ] Register a test account at `POST /auth/register`
- [ ] Log in at `POST /auth/login` and receive a `Set-Cookie` header
- [ ] `GET /auth/me` returns user details, XP, and streak
- [ ] Create, complete, and list tasks
- [ ] Create and list goals
- [ ] Submit feedback and view insights
- [ ] Post in community and moderate
- [ ] View journey and portfolio
- [ ] Trigger a Spark Moment

## Frontend

- [ ] `npx expo export --platform web` builds successfully
- [ ] EAS Build succeeds for iOS and Android (optional for web pilot)
- [ ] Web bundle is deployed to Cloudflare Pages or equivalent

## Security

- [ ] No secrets in source control
- [ ] Admin routes return `403` for non-admin users
- [ ] `admin.executive.view`, `admin.pilot.view`, and moderation permissions are seeded

## Go-live

- [ ] Announce pilot start date to students, ambassadors, and leaders
- [ ] Confirm support channels and incident response contacts
- [ ] Schedule daily metrics review for the first week
