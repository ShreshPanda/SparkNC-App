# Migration Validation

## Result

A clean local D1 run applied every ordered migration from `001_initial.sql` through `020_spark_moments.sql` successfully.

## Correction made

`006_intelligence.sql` originally created `ai_memories` with conversational fields. `015_ai_memory.sql` attempted to recreate that table with structured-memory fields, but `CREATE TABLE IF NOT EXISTS` preserved the older schema and failed when creating an index on `key`.

`015_ai_memory.sql` now evolves the table using D1-compatible `ALTER TABLE ... ADD COLUMN` statements for `key`, `value`, `category`, `is_disabled`, and `updated_at`, then creates the required indexes.

## Commands

Local clean-schema validation:

```bash
npx wrangler d1 migrations apply <database-name> --local
```

Remote application:

```bash
node scripts/apply-d1-migrations.mjs <database-name> remote
```

## Release procedure

1. Back up or export the production D1 database according to the Cloudflare operational policy.
2. Review the pending migration list against the target database.
3. Apply remote migrations once, during the deployment window.
4. Verify `/status` and critical authenticated flows.
5. If a migration requires reversal, deploy a new compensating migration; do not alter migration files already applied remotely.
