# Infrastructure Validation

## RC2 configuration review

- Worker entrypoint: `workers/index.ts`.
- D1 binding: `DB`, with migrations at `workers/database/migrations`.
- Runtime configuration: `wrangler.jsonc` enables `nodejs_compat`, minification, and Workers observability.
- Production configuration remains intentionally blocked until every placeholder in `wrangler.jsonc` is replaced with the real D1 ID, Worker URL, and approved web origins.

## Validated locally

- `npm run typecheck` passed.
- `npm run typecheck:worker` passed.
- All migrations `001` through `020` applied successfully to a clean local D1 emulator.

## Required Cloudflare setup

1. Replace `database_name` and `database_id` placeholders in `wrangler.jsonc`.
2. Replace the `BETTER_AUTH_URL` and `ALLOWED_ORIGINS` placeholders with HTTPS production values.
3. Set `SESSION_SECRET` and `BETTER_AUTH_SECRET` using `wrangler secret put`; each must be at least 32 characters.
4. Apply migrations to the intended remote D1 database before deployment.
5. Run `npm run deploy:dry-run`, then `npm run deploy:worker`.
6. Confirm `/health`, `/version`, and `/status` over HTTPS after deployment.

## Operational constraints

- The rate limiter is isolate-local in-memory protection. It reduces accidental or low-volume abuse but is not a distributed enforcement mechanism.
- D1 schema changes are forward-only. Use a compensating migration rather than editing an already-applied production migration.
