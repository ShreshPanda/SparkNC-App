# Production Environment

This document is the source of truth for the SparkNC production environment.

## Cloudflare Worker

- **Worker name**: `sparknc-api`
- **Entrypoint**: `workers/index.ts`
- **Config**: `wrangler.jsonc`
- **Compatibility date**: `2025-07-18`
- **Compatibility flags**: `nodejs_compat`
- **Minify**: enabled for production

## D1 database

- **Binding**: `DB`
- **Migrations**: `workers/database/migrations/*.sql`
- **Apply locally**: `npx wrangler d1 migrations apply sparknc-db --local`
- **Apply production**: `npx wrangler d1 migrations apply sparknc-db`

## Required secrets

Set via `wrangler secret put` or the Cloudflare dashboard:

- `SESSION_SECRET` — at least 32 characters
- `BETTER_AUTH_SECRET` — at least 32 characters (if Better Auth is enabled)
- `EXPO_ACCESS_TOKEN` — for push notification delivery
- `CLOUDFLARE_API_TOKEN` — for internal Cloudflare API calls (optional)

## Environment variables

`wrangler.jsonc` exposes:

- `ENVIRONMENT=production`
- `COOKIE_SAMESITE=Strict`
- `COOKIE_SECURE=true`

Frontend `.env`:

- `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL=https://sparknc-api.<subdomain>.workers.dev`

## Health and status

- `GET /health` — Worker + D1 connectivity
- `GET /version` — release version
- `GET /status` — full system status, route count, env validation

## Rollback

1. Re-deploy the previous commit via `npx wrangler deploy`.
2. Restore D1 from the most recent backup if a migration caused issues.
3. Verify `/status` returns `status: ok`.

## Region and compliance

- Cloudflare Workers runs at the edge; data is stored in D1.
- D1 backups and point-in-time restore are managed through the Cloudflare dashboard.
- No PII is logged to `request_metrics`, `slow_queries`, or `error_logs` beyond `user_id` and request path.
