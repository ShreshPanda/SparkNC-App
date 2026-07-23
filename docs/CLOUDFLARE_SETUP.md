# Cloudflare Setup

This is the canonical first-deployment guide for the SparkNC Worker and D1 database. It never reuses another project’s Worker, D1 database, secrets, or deployment.

## Configuration placeholders

Replace only these values in `wrangler.jsonc` after creating the relevant SparkNC resource:

| Placeholder | Set to | Scope |
| --- | --- | --- |
| `<YOUR_D1_DATABASE_NAME>` | New or intentionally dedicated production SparkNC D1 name | Production |
| `<YOUR_D1_DATABASE_ID>` | ID returned by `wrangler d1 create` or `wrangler d1 info` | Production |
| `<YOUR_WORKER_DOMAIN>` | Deployed production Worker HTTPS domain | Production |
| `<YOUR_WEB_ORIGIN>` | Exact HTTPS web frontend origin | Production |
| `<YOUR_STAGING_D1_DATABASE_NAME>` | Separate staging SparkNC D1 name | Staging |
| `<YOUR_STAGING_D1_DATABASE_ID>` | ID for the staging D1 database | Staging |
| `<YOUR_STAGING_WORKER_DOMAIN>` | Staging Worker HTTPS domain | Staging |
| `<YOUR_STAGING_WEB_ORIGIN>` | Exact staging web frontend origin | Staging |

Do not put account IDs, API tokens, or secrets in this file.

## Production sequence

1. Verify the local repository:

   ```bash
   npm install
   npm run verify
   npm run check:deployment
   ```

2. Authenticate and inspect the account without changing any resources:

   ```bash
   npx wrangler login
   npx wrangler whoami
   npx wrangler d1 list
   ```

3. Create a dedicated production database, choosing a name that cannot collide with existing projects:

   ```bash
   npx wrangler d1 create <new-sparknc-production-database-name>
   ```

   Copy only that command’s returned name and ID into the top-level `d1_databases` entry in `wrangler.jsonc`.

4. Set the production non-secret values in `wrangler.jsonc`: `BETTER_AUTH_URL`, `ALLOWED_ORIGINS`, and the D1 placeholders. Keep `ENVIRONMENT=production` and `COOKIE_SECURE=true`. For a browser frontend, use HTTPS subdomains of the same registrable domain for the web app and API, such as `https://app.example.com` and `https://api.example.com`; the session cookie is intentionally `SameSite=Strict`.

5. Create secrets interactively; Wrangler does not print or persist entered values:

   ```bash
   npx wrangler secret put SESSION_SECRET
   npx wrangler secret put BETTER_AUTH_SECRET
   ```

6. Validate the configuration without deployment:

   ```bash
   npm run deploy:dry-run
   ```

7. Apply the migrations to the dedicated remote database:

   ```bash
   node scripts/apply-d1-migrations.mjs <new-sparknc-production-database-name> remote
   ```

8. Deploy the Worker:

   ```bash
   npm run deploy:worker
   ```

9. Copy the Worker URL printed by Wrangler and verify it:

   ```bash
   node scripts/check-worker-health.mjs https://<deployed-worker-domain>
   ```

10. Set `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` to that URL in the frontend deployment environment, then build the frontend.

## Staging sequence

Use the same sequence with a separate D1 database and the `env.staging` values. Deploy with `npm run deploy:staging:dry-run` then `npm run deploy:staging`. Set secrets for staging using `npx wrangler secret put <name> --env staging`.

## Expected output

- `npm run check:deployment` reports 20 ordered D1 migrations and finds the DB binding, staging configuration, startup validation, and health endpoint.
- `npm run deploy:dry-run` validates the Worker without creating a deployment.
- Migration application reports each migration as applied or already applied.
- `npm run deploy:worker` prints a new Worker version and HTTPS URL.
- Health verification prints three passed endpoints; `/health` must report `status: ok`.
