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

- [ ] D1 database created: `npx wrangler d1 create sparknc-db`.
- [ ] `database_name` and `database_id` in `wrangler.jsonc` replaced with real values.
- [ ] D1 binding name in code matches `DB`.

## Migration execution

- [ ] `001_initial.sql` applied.
- [ ] `002_sessions.sql` applied.
- [ ] `003_passwords.sql` applied.
- [ ] `004_gamification.sql` applied.
- [ ] No migration errors reported by Wrangler.

## Environment variables

- [ ] `.env` created from `.env.example` for the frontend.
- [ ] `.dev.vars` created from `.dev.vars.example` for local backend.
- [ ] `SESSION_SECRET` set in Cloudflare dashboard or via `wrangler secret put`.
- [ ] `BETTER_AUTH_SECRET` set if compatibility mode is used.
- [ ] `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` set to the deployed Worker URL.
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

- [ ] `npx wrangler deploy` completes without errors.
- [ ] `npx wrangler d1 migrations apply` reports all migrations applied.
- [ ] Frontend builds with `npx expo export --platform web`.
- [ ] Frontend `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL` points to the deployed Worker.
- [ ] End-to-end register, login, create task, and complete task flows tested.

## Post-deployment

- [ ] Worker logs reviewed for errors or exposed secrets.
- [ ] `ENVIRONMENT` var set to `production` in `wrangler.jsonc`.
- [ ] Rollback plan documented and known by the team.
