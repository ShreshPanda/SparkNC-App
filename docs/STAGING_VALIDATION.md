# Staging Validation Checklist

## Configuration

- [ ] Staging uses a separate D1 database and Worker URL.
- [ ] All placeholders are replaced in staging configuration.
- [ ] Staging secrets are set through Cloudflare.
- [ ] Staging web origin is the only `ALLOWED_ORIGINS` value needed for browser testing.

## Deployment

- [ ] `npm run verify` passes.
- [ ] All 20 migrations are applied to staging D1.
- [ ] Worker dry-run passes before deploy.
- [ ] `/health`, `/version`, and `/status` return expected values over HTTPS.

## Core journeys

- [ ] Register a student; verify returned role is `student`.
- [ ] Login, call `/auth/me`, and logout; confirm session is revoked.
- [ ] Create, update, complete, and delete a task.
- [ ] Create and update a goal.
- [ ] Browse events and test authorized event management with an authorized role.
- [ ] Verify notifications, community, and onboarding flows still load.

## Security and operations

- [ ] Browser request from an unapproved origin returns `403`.
- [ ] Production-mode session cookie has `HttpOnly`, `SameSite=Strict`, and `Secure`.
- [ ] Unauthenticated `/metrics` returns `401`; unauthorized roles return `403`.
- [ ] A test 500 response contains no stack trace and includes `X-Request-Id`.
- [ ] Metrics appear after test traffic, including a slow request when intentionally induced.

## Release decision

- [ ] No critical or high-severity regression remains.
- [ ] Pilot owner has approved the staging test evidence.
- [ ] Rollback owner and previous Worker version are recorded.
