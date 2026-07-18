# SparkNC Production Deployment

## Overview
This guide covers deploying the SparkNC backend (Cloudflare Worker + D1) and preparing the Expo mobile/web clients for production.

## Prerequisites
- Cloudflare account
- Wrangler CLI authenticated (`wrangler login`)
- Node.js 18+ and npm
- D1 database created and bound as `DB`
- KV namespace created and bound as `KV` (optional but recommended for session caching)
- `SESSION_SECRET` secret set (at least 32 characters)
- `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` configured

## Environment Variables & Secrets
Configure in `wrangler.jsonc` or via `wrangler secret`:

```
SESSION_SECRET=<random-32-char-string>
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=https://sparknc.yourdomain.com
ENVIRONMENT=production
CLOUDFLARE_ACCOUNT_ID=<account-id>
CLOUDFLARE_API_TOKEN=<api-token>
```

## Local Development
1. `npm install`
2. `cp .dev.vars.example .dev.vars` and fill values.
3. `npx wrangler d1 migrations apply <DB-NAME> --local`
4. `npx wrangler dev`
5. Verify `/health`, `/version`, and `/status`.

## Production Deployment
1. Run migrations on production D1:
   ```bash
   npx wrangler d1 migrations apply <DB-NAME>
   ```
2. Deploy the Worker:
   ```bash
   npx wrangler deploy
   ```
3. Smoke-test endpoints:
   ```bash
   curl https://<your-domain>/health
   curl https://<your-domain>/version
   curl https://<your-domain>/status
   ```

## Health Endpoints
- `GET /health` — Worker + D1 connectivity.
- `GET /version` — Current deployed application version.
- `GET /status` — Full health, environment, auth, route count, and detected table list.

## Rollback Process
1. Re-deploy the previous Worker release tag via `npx wrangler deploy --version-id <id>` or Git checkout + redeploy.
2. If a bad migration was applied, restore D1 from the most recent backup before the migration.
3. Verify `/status` reports the expected table set and `status: ok`.

## Mobile/Web Release
- Set `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` to the production Worker domain.
- Run `npx expo export --platform web` for web hosting.
- Use EAS Build for iOS and Android app store binaries.

## Monitoring
- Use Cloudflare Workers Analytics for request volume and error rates.
- Watch `status` field from `/status` in uptime checks.
- Audit logs are available via `/audit` for admin actions.

## Security Checklist
- `SESSION_SECRET` is at least 32 characters and rotated regularly.
- Admin/leadership routes are wrapped with `requirePermission`.
- D1/KV permissions are scoped to the SparkNC namespace.
- No secrets are committed; all use Wrangler secrets or `.dev.vars`.
