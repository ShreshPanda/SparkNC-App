# Deployment Automation

## Verification

```bash
npm run verify
```

This runs frontend TypeScript validation, Worker TypeScript validation, Worker tests, and generated Wrangler binding freshness. Run `npm run check:deployment` next to validate the tracked deployment surface.

## Migrations

```bash
npm run migrate:local -- <database-name> local
npm run migrate:remote -- <database-name> remote
```

Use the remote command only after backing up the target database and confirming the intended migration window.

## Worker deployment

```bash
npm run deploy:dry-run
npm run deploy:worker
npm run deploy:staging:dry-run
npm run deploy:staging
```

The production commands use the top-level configuration. The staging commands use `env.staging`. Do not deploy until the target D1 binding IDs, Worker URLs, origin allowlist, and Worker secrets are configured.

## Rollback

1. Identify the last known-good Worker deployment with `npx wrangler versions list`.
2. Roll back production with `npm run rollback:worker` or a specific version with `node scripts/rollback-worker.mjs production <version-id>`.
3. Roll back staging with `npm run rollback:staging` or `node scripts/rollback-worker.mjs staging <version-id>`.
4. Keep D1 schema forward-only; write and apply a compensating migration if a schema correction is necessary.
5. Run `npm run health:check -- https://<worker-domain>` after rollback.
