# Deployment Guide

This guide prepares and deploys the SparkNC platform on Cloudflare and the Expo frontend.

## Prerequisites

- Node.js LTS and npm installed.
- A Cloudflare account with Workers and D1 enabled.
- Wrangler CLI installed globally or as a dev dependency:
  ```bash
  npm install -g wrangler
  ```
- The Expo CLI (`npx expo`) available for the mobile/web frontend.

## 1. Cloudflare login

```bash
npx wrangler login
```

This opens a browser to authenticate the CLI with your Cloudflare account.

## 2. Create and bind the D1 database

Create a D1 database:

```bash
npx wrangler d1 create sparknc-db
```

Note the `database_id` returned. Open `wrangler.jsonc` and replace the placeholders in `d1_databases`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "sparknc-db",
    "database_id": "<YOUR_DATABASE_ID>"
  }
]
```

## 3. Run migrations

Apply the ordered migrations in `workers/database/migrations`:

```bash
npx wrangler d1 migrations apply sparknc-db --local
```

For production:

```bash
npx wrangler d1 migrations apply sparknc-db
```

Migrations are named with numeric prefixes so they execute in order:

1. `001_initial.sql`
2. `002_sessions.sql`
3. `003_passwords.sql`
4. `004_gamification.sql`

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
npx wrangler dev
```

The local Worker is available at `http://localhost:8787` by default.

## 6. Verify the health endpoint

```bash
curl http://localhost:8787/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "version": "1.0.0",
    "timestamp": "..."
  },
  "timestamp": "...",
  "requestId": "..."
}
```

## 7. Deploy the Worker

```bash
npx wrangler deploy
```

This deploys the Worker to `sparknc-api.<your_subdomain>.workers.dev`.

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

1. Revert the Git commit that introduced the change.
2. Redeploy the previous Worker version:
   ```bash
   git checkout <previous-commit>
   npx wrangler deploy
   ```
3. For D1 migrations, Wrangler does not automatically roll back. Write compensating migrations if schema changes must be undone.

## Required Cloudflare dashboard configuration

- D1 database created and bound with `DB` binding.
- Worker deployed with `compatibility_date` set in `wrangler.jsonc`.
- `SESSION_SECRET` secret set.
- `BETTER_AUTH_SECRET` secret set if Better Auth compatibility is enabled later.
- (Optional) KV namespace or R2 bucket bound if caching or asset storage is added.
