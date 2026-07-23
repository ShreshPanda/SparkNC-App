# Production Environment

This document summarizes production environment requirements. `CLOUDFLARE_SETUP.md` is the canonical first-deployment sequence.

## Cloudflare Worker

- **Worker name**: `sparknc-api`
- **Entrypoint**: `workers/index.ts`
- **Config**: `wrangler.jsonc`
- **Compatibility date**: `2026-07-20`
- **Compatibility flags**: `nodejs_compat`
- **Minify**: enabled for production

## D1 database

- **Binding**: `DB`
- **Migrations**: `workers/database/migrations/*.sql`
- **Apply locally**: `node scripts/apply-d1-migrations.mjs <database-name> local`
- **Apply production**: `node scripts/apply-d1-migrations.mjs <database-name> remote`

## Required secrets

Set via `wrangler secret put` or the Cloudflare dashboard:

- `SESSION_SECRET` — at least 32 characters
- `BETTER_AUTH_SECRET` — at least 32 characters (if Better Auth is enabled)
- `EXPO_ACCESS_TOKEN` is required only when real Expo push delivery is enabled; do not add an account-wide Cloudflare API token unless a Worker feature explicitly requires it.

## Environment variables

`wrangler.jsonc` exposes:

- `ENVIRONMENT=production`
- `COOKIE_SAMESITE=Strict`
- `COOKIE_SECURE=true`
- `BETTER_AUTH_URL=https://<YOUR_WORKER_DOMAIN>`
- `ALLOWED_ORIGINS=https://<YOUR_WEB_ORIGIN>`

Frontend `.env`:

- `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL=https://sparknc-api.<subdomain>.workers.dev`

## Health and status

- `GET /health` — Worker + D1 connectivity
- `GET /version` — release version
- `GET /status` — full system status, route count, env validation

## Rollback

1. Inspect prior versions with `npx wrangler versions list`.
2. Roll back with `node scripts/rollback-worker.mjs production <version-id>`.
3. Use a compensating migration for schema remediation.
4. Verify with `node scripts/check-worker-health.mjs https://<worker-domain>`.

## Region and compliance

- Cloudflare Workers runs at the edge; data is stored in D1.
- D1 backups and point-in-time restore are managed through the Cloudflare dashboard.
- No PII is logged to `request_metrics`, `slow_queries`, or `error_logs` beyond `user_id` and request path.
