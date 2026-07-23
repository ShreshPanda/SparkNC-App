# Database Audit — RC1

**Date**: 2026-07-20  
**Scope**: Migrations `001`–`020`, active repositories, foreign keys, and indexes

## Findings fixed

- `003_passwords.sql` now uses idempotent column additions because the initial schema already contains password columns.
- `005_organization.sql` now adds the event, message, and notification columns required by their repositories when `001_initial.sql` has already created those tables.
- `012_performance_indexes.sql` now indexes real task/goal columns and removes the absent `xp_history` table reference.
- `012_performance_indexes.sql` now indexes `feedback_insights.insight_type`, not absent `category`.
- `018_sprint9_performance_indexes.sql` now uses actual activity, notification, event, audit, message, and conversation columns.
- Pilot analytics and growth/insight repositories now use canonical gamification columns: `xp_total`, `current_streak`, `longest_streak`.

## Remaining database risks

- Migration files must be executed in order against a clean D1 database. This audit did not apply them because production D1 identifiers are still placeholders in `wrangler.jsonc`.
- SQLite `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` support must be validated with the deployed D1 engine before release. If unsupported, re-baseline the initial schema in a new migration plan rather than editing already-applied production migrations.
- `005_organization.sql` contains `CREATE TABLE IF NOT EXISTS` statements after compatibility `ALTER TABLE` statements. It is safe for the `001` → `005` sequence but should be consolidated only in a migration-breaking release.
- Several tables store JSON as `TEXT`; application parsing and input limits should be tested under realistic payloads.

## Constraints and indexes

- Core user-owned data uses foreign keys to `users`.
- Sessions, community membership, onboarding, and Spark Moments have appropriate user/entity indexes.
- Primary performance indexes cover tasks, goals, messages, events, analytics snapshots, feedback, community, observability, and portfolio lookups.

## Recommendation

**No-Go for production migration application until a clean local D1 migration run succeeds.** Use the deployment checklist after filling in the D1 binding.
