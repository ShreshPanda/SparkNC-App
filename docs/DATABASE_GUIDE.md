# SparkNC Database Guide (Cloudflare D1)

> **Source of truth for schema, constraints, and evolution.**
>
> This guide standardizes how tables relate, how indexes are chosen, and how migrations are performed.

---

## 1) Overview
- Database: Cloudflare D1 (SQLite-compatible)
- Migration files: `workers/database/migrations/001_initial.sql` etc.
- Schema files: `workers/database/schema/*.sql` (if used by build/deploy pipeline)

Principles:
- Normalize relationships.
- Use foreign keys.
- Add indexes for access paths.
- Keep auditing fields consistent.

---

## 2) Every table (standard columns)
All domain tables should include:
- `id` (primary key)
- `created_at` (timestamp)
- `updated_at` (timestamp, if update-heavy)
- `deleted_at` (optional soft-delete if needed)

If a table belongs to an org/school:
- `school_id` (or equivalent) as foreign key.

---

## 3) Relationships
Relationship types:
- **1-to-many** (school → users; user → tasks)
- **many-to-many** via join tables (if/when added)
- **ownership**: tasks/goals/messages are typically owned by a user or scoped to a school.

Rules:
- Foreign keys must be explicit.
- Deletion behavior must be deliberate (cascade vs restrict). Prefer restrict unless the product truly deletes children.

---

## 4) Indexes
Index on:
- foreign keys (`school_id`, `user_id`, etc.)
- fields used in `WHERE` and sort clauses
- unique constraints for deduplication (e.g., username/email within a school)

Rule of thumb:
- Every endpoint implies at least one access path; ensure there is an index to support it.

---

## 5) Foreign keys
Rules:
- Always name foreign key columns consistently.
- Ensure referenced table exists before adding constraints.

---

## 6) Permissions (data-layer)
The database stores data; authorization is enforced in the API layer.

However, schema should support efficient permission checks:
- include scoping columns (school/org)
- include role references where needed

---

## 7) Migration strategy
- Migrations must be additive whenever possible.
- Backfill strategy:
  - add column nullable first
  - backfill in a subsequent migration
  - then enforce not-null

Process:
1. Add migration file `workers/database/migrations/XXX_description.sql`
2. Update schema/seed if your pipeline uses them
3. Ensure repositories can handle new columns gracefully
4. Update tests

---

## 8) Naming conventions
- Tables: plural nouns (`tasks`, `goals`, `users`)
- Columns: `snake_case`
- Timestamp columns: `created_at`, `updated_at`
- Foreign keys: `<parent>_id` (e.g., `user_id`, `school_id`)

---

## 9) Performance considerations
- Use narrow selects in repositories.
- Avoid N+1 query patterns.
- Prefer pagination for list endpoints.

---

## 10) Implementation alignment
Current persistence coverage (per Master Context):
- Tasks via `TaskRepository` and `TaskService`
- Goals via `GoalRepository` and `GoalService`

When expanding to messages/events:
- follow same repository/service pattern
- add indexes needed for timeline/feed queries.

