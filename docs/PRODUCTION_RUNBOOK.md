# SparkNC Production Runbook

This runbook describes how to deploy, configure, and operate the SparkNC Cloudflare Worker in production.

## 1. Repository layout

- `wrangler.jsonc` — non-secret Worker configuration (name, compatibility, D1 binding, vars).
- `workers/index.ts` — Worker entrypoint.
- `workers/database/migrations/` — D1 schema migrations ordered by sprint.
- `workers/api/` — routes, controllers, services, repositories, middleware.
- `.dev.vars.example` — local secret template.
- `docs/` — architecture, testing, and operational documentation.

## 2. Environment variables

Non-secret vars live in `wrangler.jsonc`:

```json
"vars": {
  "ENVIRONMENT": "production",
  "COOKIE_SAMESITE": "Strict",
  "COOKIE_SECURE": "true"
}
```

Secrets must be set with `wrangler secret put` and are **never** committed:

- `SESSION_SECRET` — 32-byte hex used for cookie signing. Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `BETTER_AUTH_SECRET` — compatibility placeholder if Better Auth is enabled.
- `BETTER_AUTH_URL` — public Worker URL.
- `EXPO_ACCESS_TOKEN` — required for `ExpoPushProvider` real push delivery.

Set a secret:

```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put EXPO_ACCESS_TOKEN
```

## 3. D1 database configuration

1. Create the D1 database:
   ```bash
   npx wrangler d1 create sparknc-prod-db
   ```
2. Copy the returned `database_id` into `wrangler.jsonc`:
   ```json
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "sparknc-prod-db",
       "database_id": "<UUID>"
     }
   ]
   ```
3. Apply all migrations in order:
   ```bash
   npx wrangler d1 migrations apply sparknc-prod-db --remote
   ```
4. Verify tables exist by calling `GET /health` after deployment.

## 4. Deployment

### Local smoke test

```bash
npm install
cp .dev.vars.example .dev.vars
# edit .dev.vars with local secrets
npx wrangler dev
```

### Production deploy

```bash
npx wrangler deploy
```

After deploy, verify:

```bash
curl https://<name>.<subdomain>.workers.dev/health
curl https://<name>.<subdomain>.workers.dev/version
```

Expected response includes `ok: true` and the deployed `APP_VERSION`.

## 5. Migration ordering

Migrations are applied sequentially by filename. The current sequence is `001` through `012`. New migrations must use the next number and be idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

Never rename a migration that has already been applied to a remote D1 instance. If a migration is bad, create a new one to fix it.

## 6. Rollback process

Cloudflare D1 does not support down-migrations natively. To roll back:

1. Identify the last good deployment commit or release tag.
2. Re-deploy the Worker from that tag:
   ```bash
   git checkout <tag>
   npx wrangler deploy
   ```
3. If schema changes are unsafe, restore from a D1 backup (manually exported before deploy) or create a corrective migration.
4. Update the `APP_VERSION` and runbook notes with the rollback reason.

## 7. Secret management

- Store all secrets in `wrangler secret` or the Cloudflare dashboard.
- `.dev.vars` is for local development only and is excluded from Git by `.gitignore`.
- Rotate `SESSION_SECRET` by deploying a new secret value and invalidating existing sessions.
- Never print secrets in logs; `AuditLogService` redacts known sensitive keys.

## 8. Production troubleshooting

| Symptom | Check | Action |
| --- | --- | --- |
| `500` on every request | `env.DB` binding | Confirm `wrangler.jsonc` `d1_databases` has correct `database_id` for the environment. |
| Auth failures | `SESSION_SECRET` | Verify secret is set and matches deployed Worker. |
| Push notifications not delivered | `EXPO_ACCESS_TOKEN` + `PushTokenRepository` | Check token registration and `ExpoPushProvider` logs. |
| Missing tables | `GET /health` | Re-run `wrangler d1 migrations apply` and inspect migrations. |
| Slow API responses | `PerformanceMonitoringService` results | Review `docs/PERFORMANCE_GUIDE.md` for index and caching guidance. |
| High audit/error rate | `AuditLogService` and Worker logs | Investigate sensitive-action failures and permission mismatches. |

## 9. Health checks

- `GET /health` — returns D1 connectivity and overall status.
- `GET /version` — returns `APP_VERSION` and git/source metadata.
- `GET /status` — returns environment and dependency status for dashboards.

## 10. Operational contacts

- Engineering lead: see `docs/AI_ENGINEERING_GUIDE.md`.
- Product constitution: `docs/PRODUCT_BIBLE.md`.
- Design system: `docs/DESIGN_SYSTEM.md`.
