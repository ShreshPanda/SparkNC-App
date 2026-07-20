# Deployment Validation

Use this checklist after every deployment to verify production readiness.

## Pre-deployment

- [ ] `wrangler.jsonc` is committed and points to the correct `database_id`.
- [ ] `compatibility_date` is set and not expired.
- [ ] `SESSION_SECRET` and `BETTER_AUTH_SECRET` are set as secrets.
- [ ] `EXPO_ACCESS_TOKEN` is set if push notifications are enabled.
- [ ] All migrations through the latest are applied to the target D1 database.
- [ ] Required role permissions are seeded.

## Deploy

- [ ] `npx wrangler deploy` completes without errors.
- [ ] `npx wrangler d1 migrations apply sparknc-db` reports all migrations applied.
- [ ] No uncommitted secrets or `.dev.vars` are included in the bundle.

## Post-deployment smoke tests

```bash
HEALTH=$(curl -s https://<your-domain>/health | jq -r '.data.status')
if [ "$HEALTH" != "ok" ]; then echo "Health check failed"; exit 1; fi

curl -s https://<your-domain>/version | jq
curl -s https://<your-domain>/status | jq

# Auth flow
curl -s -X POST https://<your-domain>/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test1234!","name":"Test"}'
curl -s -X POST https://<your-domain>/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test1234!"}'

# Data flow
curl -s https://<your-domain>/tasks
curl -s https://<your-domain>/goals
curl -s https://<your-domain>/events
```

## Health expectations

- `GET /health` returns `200` with `status: ok` and `database: connected`.
- `GET /version` returns a semantic version string.
- `GET /status` reports all expected tables and `authConfigured: true`.

## Common failures

- `INVALID_CONFIG` with `Missing DB binding` → check `wrangler.jsonc` D1 binding.
- `Missing or too short SESSION_SECRET` → set `wrangler secret put SESSION_SECRET`.
- `404` on known routes → run `npx wrangler deploy` again and verify `workers/index.ts` loaded.

## Rollback trigger

Roll back immediately if:

- `/health` fails for more than 2 minutes.
- Auth or core data endpoints return `500`.
- `/status` reports missing tables after migrations.
