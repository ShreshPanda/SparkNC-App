# SparkNC

SparkNC is a cross-platform productivity and communication platform for students, ambassadors, lab leaders, administrators, and board members. The project is Version 1.0 Release Candidate 2 and is prepared for its first Cloudflare deployment.

## Stack

- Expo SDK 54, TypeScript, Expo Router, NativeWind, React Query
- Cloudflare Workers and D1
- Route → Controller → Service → Repository → Database

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_CLOUDFLARE_WORKER_URL`.
3. Copy `.dev.vars.example` to `.dev.vars` and set local Worker secrets.
4. Run `npm run verify` and `npm run check:deployment`.
5. Follow `docs/CLOUDFLARE_SETUP.md` to create or bind dedicated SparkNC D1 databases and replace only the documented placeholders.
6. Apply local migrations with `node scripts/apply-d1-migrations.mjs sparknc-local local`.

## Commands

- `npm start` — start Expo
- `npm run web` — start the Expo web target
- `npm run verify` — run frontend/Worker typechecks and Worker tests
- `npm run check:deployment` — validate the tracked first-deployment prerequisites
- `npx wrangler dev --local` — start the Worker locally
- `node scripts/apply-d1-migrations.mjs <database-name> local` — apply local D1 migrations
- `npm run deploy:dry-run` — validate production Worker deployment configuration
- `npm run health:check -- https://<worker-domain>` — verify deployed health endpoints

## Documentation

- Product and UX: `docs/PRODUCT_BIBLE.md`, `docs/DESIGN_SYSTEM.md`, `docs/UX_PRINCIPLES.md`, `docs/COMPONENT_LIBRARY.md`
- Engineering: `docs/ARCHITECTURE_AUDIT.md`, `docs/API_STANDARDS.md`, `docs/DATABASE_GUIDE.md`, `docs/TESTING_GUIDE.md`
- Deployment: `docs/CLOUDFLARE_SETUP.md`, `docs/DEPLOYMENT.md`, `docs/DEPLOYMENT_AUTOMATION.md`, `docs/PRODUCTION_CHECKLIST.md`, `docs/PRODUCTION_VERIFICATION.md`, `docs/MAC_SETUP.md`
- RC2 readiness: `docs/INFRASTRUCTURE_VALIDATION.md`, `docs/MIGRATION_VALIDATION.md`, `docs/SECURITY_HARDENING.md`, `docs/RC2_CERTIFICATION.md`

## Release status

See `PROJECT_STATUS.md`, `docs/SPRINT_STATE.md`, and `NEXT_TASK.md` for current delivery status and the remaining production verification tasks.
