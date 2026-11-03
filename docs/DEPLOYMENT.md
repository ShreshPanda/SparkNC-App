# SparkNC Staging Deployment & Migration Runbook

Canonical migration path: **`wrangler d1 migrations apply`** (Wrangler's
native system, authoritative `d1_migrations` ledger). The custom runner
`scripts/apply-d1-migrations.mjs` is for preflight checks, legacy baselines,
and divergence detection — it writes to the **same** ledger, so the two
paths never disagree. No deploy command applies migrations automatically.

## Required secrets & variables

| Item | Where | Notes |
|---|---|---|
| `SESSION_SECRET` | `wrangler secret put` | ≥32 chars; Worker fails boot without it |
| `DB` (D1 binding) | `wrangler.jsonc` | production + `env.staging` must each bind a **different** database_id |
| `COOKIE_SECURE` | var | `true` in production/staging |
| `COOKIE_SAMESITE` | var | `Strict` same-site, `None`+Secure if web app is cross-site |
| `ALLOWED_ORIGINS` | var | comma-separated HTTPS web origins; no placeholders |
| `ENVIRONMENT` | var | `development` local, `staging`, `production` |

~~`BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`~~ — removed in S3c-11; Better
Auth integration was abandoned.

## Staging setup package

**Local tooling required:** Node.js 20+ and `npm ci` (wrangler ships via
devDependencies — no global install needed). Authenticate with
`npx wrangler login`, or export `CLOUDFLARE_ACCOUNT_ID` +
`CLOUDFLARE_API_TOKEN` for CI.

**Cloudflare resources to create manually** (nothing here is scripted —
create in the dashboard or via wrangler):

```bash
npx wrangler d1 create sparknc-staging        # returns database_name + database_id
```

**Wrangler fields that need real values** in `wrangler.jsonc` → `env.staging`:

| Field | Replace | With |
|---|---|---|
| `d1_databases[0].database_name` | `<YOUR_STAGING_D1_DATABASE_NAME>` | output of `d1 create` |
| `d1_databases[0].database_id` | `<YOUR_STAGING_D1_DATABASE_ID>` | output of `d1 create` |
| `vars.ALLOWED_ORIGINS` | `https://<YOUR_STAGING_WEB_ORIGIN>` | real staging app origin(s) |
| `vars.COOKIE_SAMESITE` | `Strict` | keep `Strict` if app+API share a site; `None` if the web app is cross-site |

Secrets (per environment, never committed):

```bash
npx wrangler secret put SESSION_SECRET --env staging   # ≥32 chars, e.g. openssl rand -hex 32
```

`scripts/deploy-worker.mjs staging …` **fails closed** if the staging
`database_id` is missing, still a placeholder, or equals the production
ID — it cannot deploy staging onto the production D1.

## Preflight (read-only)

```bash
npm run verify                                     # typecheck + tests + wrangler types
node scripts/check-deployment-readiness.mjs        # files, migration ordering, staging block, env validation
wrangler whoami                                    # account access
wrangler d1 list                                   # confirm staging DB exists and ID matches wrangler.jsonc
```

## Inspect migration history (no writes)

```bash
wrangler d1 migrations list <staging-db-name> --remote
wrangler d1 execute <staging-db-name> --remote \
  --command "SELECT name FROM d1_migrations ORDER BY id"
```

## Backup

```bash
wrangler d1 export <staging-db-name> --remote --output=backup-$(date +%F).sql
```

## Apply migrations

```bash
# Canonical path (staging example)
wrangler d1 migrations apply <staging-db-name> --remote

# With preflight + legacy-baseline support instead:
node scripts/apply-d1-migrations.mjs <staging-db-name> remote
```

Each migration file runs in one D1 transaction with its ledger row.
`wrangler d1 migrations apply` skips anything already in `d1_migrations`.

### Legacy database (schema exists, `d1_migrations` empty)

1. Inspect the schema: `wrangler d1 execute <db> --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"`.
2. For every migration whose objects are verifiably present, attest it explicitly:
   `node scripts/apply-d1-migrations.mjs <db> remote --baseline 001_initial.sql 002_sessions.sql …`
3. Apply the remainder: `node scripts/apply-d1-migrations.mjs <db> remote` or `wrangler d1 migrations apply <db> --remote`.
4. Never baseline blind — the runner refuses unknown-file and already-recorded names.

## Post-migration verification

```bash
wrangler d1 execute <staging-db> --remote --command "SELECT name FROM d1_migrations ORDER BY id"   # all files present
wrangler deploy --env staging --dry-run
```

## Rollback

1. Restore: `wrangler d1 import` is not supported — restore via re-creating schema from the export (`wrangler d1 execute --file backup.sql`) on a fresh database, or use Cloudflare Time Travel/point-in-time if enabled.
2. Redeploy previous Worker: `node scripts/deploy-worker.mjs staging deploy` after `git checkout <prev>`.

## Staging secrets & verification

```bash
wrangler secret put SESSION_SECRET --env staging
wrangler secret list --env staging
wrangler deploy --env staging --dry-run
```

## Smoke test sequence (staging, requires real Worker)

1. `GET /health` → `ok`, `authConfigured: true`; `GET /status` → `ok`.
2. Staff login (email+password) → dashboard API calls succeed.
3. Roster → invitation → `resolve` → `verify` → `claim` → student login (public ID + phrase) → `/auth/me` → logout.
4. Reset: staff `initiate` → student completes with token → old session rejected → new-phrase login works.
5. Suspend a test account → its session 401s → reactivate → old session still dead → fresh login works.
6. `POST /auth/register` → `403 INVITE_REQUIRED`; `GET /enroll/verify` → 404.
7. Wrong claim code ×5 → invalid-code errors then `429` with `Retry-After`.
8. Audit: `SELECT action, entity_type FROM audit_logs` shows initiate/claim/complete rows with no token material.

## Limited pilot gate

Authorize a one-school pilot only when: all smoke tests pass on staging
with real `cf-connecting-ip` and cookies; `ALLOWED_ORIGINS` and
`COOKIE_SAMESITE` match the deployed app origin; no public registration
path exists; `d1_migrations` shows all migrations 001–024 exactly once;
a backup was taken within 24h; invitations are lab-leader-issued
individual invites only.
