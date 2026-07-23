# Production Checklist

Use this checklist before declaring SparkNC production ready.

## Cloudflare account setup

- [ ] Cloudflare account created and Workers enabled.
- [ ] Wrangler CLI authenticated: `npx wrangler login`.

## Worker creation

- [ ] `wrangler.jsonc` updated with the Worker `name`.
- [ ] Worker `main` entrypoint set to `workers/index.ts`.
- [ ] `compatibility_date` and `compatibility_flags` reviewed and set.

## D1 creation and binding

- [ ] Dedicated SparkNC D1 database created: `npx wrangler d1 create <new-sparknc-production-database-name>`.
- [ ] `database_name` and `database_id` in `wrangler.jsonc` replaced with real values.
- [ ] D1 binding name in code matches `DB`.

## Migration execution

- [ ] `npm run verify` and `npm run check:deployment` pass.
- [ ] The dedicated production D1 name and ID replace only the production placeholders in `wrangler.jsonc`.
- [ ] `node scripts/apply-d1-migrations.mjs <production-database-name> remote` reports migrations `001` through `020` applied.
- [ ] No migration errors are reported by Wrangler.
- [ ] A D1 export or backup procedure has been confirmed before the migration window.

## Environment variables

- [ ] `.env` created from `.env.example` for the frontend.
- [ ] `.dev.vars` created from `.dev.vars.example` for local backend.
- [ ] `SESSION_SECRET` set in Cloudflare dashboard or via `wrangler secret put`.
- [ ] `BETTER_AUTH_SECRET` set as a production Worker secret.
- [ ] `BETTER_AUTH_URL` is the deployed HTTPS Worker URL in `wrangler.jsonc`.
- [ ] `ALLOWED_ORIGINS` contains only exact approved HTTPS web origins.
- [ ] `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` is set to the deployed Worker URL for the frontend build.
- [ ] No secrets committed to the repository.

## HTTPS verification

- [ ] Worker accessible over `https://`.
- [ ] `COOKIE_SECURE=true` in production `wrangler.jsonc` vars.
- [ ] `COOKIE_SAMESITE=Strict` configured.

## Authentication verification

- [ ] `POST /auth/register` creates a user and returns a `Set-Cookie` header.
- [ ] `POST /auth/login` returns a valid session cookie.
- [ ] `GET /auth/me` returns the authenticated user including XP and streak.
- [ ] `POST /auth/logout` clears the session cookie.
- [ ] Passwords are stored as PBKDF2 hashes in `users.password_hash`.

## Cookie verification

- [ ] Session cookie is `HttpOnly`.
- [ ] Session cookie uses `SameSite=Strict`.
- [ ] Session cookie has `Max-Age` set.
- [ ] Session cookie `Secure` attribute is set in production.

## Health endpoint verification

- [ ] `GET /health` returns `success: true`.
- [ ] `GET /health` reports `database: connected` when D1 is reachable.
- [ ] `GET /health` does not leak secrets.

## Deployment verification

- [ ] `npm run deploy:dry-run` completes before any deployment.
- [ ] `npm run deploy:worker` completes without errors and its Worker version ID is recorded.
- [ ] `node scripts/check-worker-health.mjs https://<worker-domain>` passes.
- [ ] Frontend builds with `npx expo export --platform web`.
- [ ] Frontend `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` points to the deployed Worker.
- [ ] `docs/PRODUCTION_VERIFICATION.md` is completed, including role-based access and core pilot flows.

## Post-deployment

- [ ] Worker logs reviewed for errors or exposed secrets.
- [ ] `ENVIRONMENT` var set to `production` in `wrangler.jsonc`.
- [ ] Rollback plan documented and known by the team.
