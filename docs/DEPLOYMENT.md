# Deployment Guide

This guide is the deployment overview. Use `CLOUDFLARE_SETUP.md` as the canonical sequential first-deployment procedure and `PRODUCTION_VERIFICATION.md` as the post-deployment gate.

## Prerequisites

- Node.js LTS and npm installed.
- A Cloudflare account with Workers and D1 enabled.
- The repository-local Wrangler CLI is available through `npx wrangler`.
- The Expo CLI (`npx expo`) available for the mobile/web frontend.

## 1. Cloudflare login

```bash
npx wrangler login
```

This opens a browser to authenticate the CLI with your Cloudflare account.

## 2. Create and bind the D1 database

Create a D1 database:

```bash
npx wrangler d1 create <new-sparknc-database-name>
```

Note the `database_id` returned. Open `wrangler.jsonc` and replace the placeholders in `d1_databases`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "<YOUR_D1_DATABASE_NAME>",
    "database_id": "<YOUR_D1_DATABASE_ID>"
  }
]
```

## 3. Run migrations

Apply the ordered migrations in `workers/database/migrations`:

```bash
node scripts/apply-d1-migrations.mjs <database-name> local
```

For production:

```bash
node scripts/apply-d1-migrations.mjs <database-name> remote
```

Migrations are named with contiguous numeric prefixes and the validated chain is `001_initial.sql` through `020_spark_moments.sql`.

## 4. Configure secrets and environment variables

### Backend secrets

Set the required secrets in the Cloudflare dashboard or with Wrangler:

```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put BETTER_AUTH_SECRET
```

For local development, copy `.dev.vars.example` to `.dev.vars` and fill in the values.

### Frontend environment

Copy `.env.example` to `.env` and set:

```bash
EXPO_PUBLIC_CLOUDFLARE_WORKER_URL=https://sparknc-api.<your_subdomain>.workers.dev
```

For local development, use:

```bash
EXPO_PUBLIC_CLOUDFLARE_WORKER_URL=http://localhost:8787
```

## 5. Local Worker development

Start the Worker locally with D1 bindings:

```bash
npx wrangler dev --local
```

The local Worker is available at `http://localhost:8787` by default.

## 6. Verify the health endpoint

```bash
node scripts/check-worker-health.mjs http://localhost:8787
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "version": "1.0.0-rc2",
    "timestamp": "..."
  },
  "timestamp": "...",
  "requestId": "..."
}
```

## 7. Deploy the Worker

Validate the production Worker configuration first:

```bash
npm run deploy:dry-run
```

Apply remote migrations using the real D1 database name, then deploy:

```bash
node scripts/apply-d1-migrations.mjs <production-database-name> remote
npm run deploy:worker
```

Wrangler prints the deployed Worker URL and version ID. Record both, then run the health-check script against the printed URL.

## 8. Deploy the Expo web frontend

Build the web bundle:

```bash
npx expo export --platform web
```

Host the generated `dist` directory on any static host, such as Cloudflare Pages:

```bash
npx wrangler pages deploy dist --project-name sparknc-web
```

Alternatively, distribute via the Expo app stores for iOS and Android.

## 9. Production verification

1. Register a test account with `POST /auth/register`.
2. Login with `POST /auth/login` and confirm a `Set-Cookie` header.
3. Call `GET /auth/me` with the cookie and confirm user details, XP, and streak.
4. Create, complete, and delete a task via `POST /tasks` and `POST /tasks/:id/complete`.

## 10. Rollback process

1. Record the incident and identify the last known-good Worker version with `npx wrangler versions list`.
2. Roll back the Worker only with `npm run rollback:worker` or `node scripts/rollback-worker.mjs production <version-id>`.
3. D1 migrations are forward-only. Apply a compensating migration when schema remediation is necessary.
4. Run `node scripts/check-worker-health.mjs https://<worker-domain>` after rollback.

## Required Cloudflare dashboard configuration

- D1 database created and bound with `DB` binding.
- Worker deployed with `compatibility_date` set in `wrangler.jsonc`.
- `SESSION_SECRET` secret set.
- `BETTER_AUTH_SECRET` secret set if Better Auth compatibility is enabled later.
- (Optional) KV namespace or R2 bucket bound if caching or asset storage is added.
