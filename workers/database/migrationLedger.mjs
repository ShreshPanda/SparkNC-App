// Shared migration-ledger helpers used by scripts/apply-d1-migrations.mjs
// and the worker test suite. Pure JS so both can import it directly.
//
// Authority: Wrangler's native `d1_migrations` table is the single source
// of truth for applied-migration history. We reuse Wrangler's exact table
// (DEFAULT_MIGRATION_TABLE = "d1_migrations") so `wrangler d1 migrations
// list/apply` and this runner always agree — no parallel ledgers.
//
// Atomicity: D1 does not accept BEGIN/COMMIT inside SQL files — each
// `wrangler d1 execute --file` invocation already runs its file in a
// single transaction ("D1 runs your SQL in a transaction for you" and
// files containing their own transactions are rejected). Appending the
// ledger INSERT to the migration file therefore commits both together;
// a failed file writes nothing.

export const MIGRATIONS_TABLE = 'd1_migrations';

// Same DDL Wrangler uses (src/d1/helpers.ts getCreateMigrationsTableQuery).
export const MIGRATIONS_DDL = `CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}"(
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	name       TEXT UNIQUE,
	applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

// One migration file: the migration SQL followed by its ledger row in the
// same file — the same transaction Wrangler wraps it in.
export function migrationScript(name, sql, appliedAt) {
  return `${sql}\nINSERT INTO "${MIGRATIONS_TABLE}" (name, applied_at) VALUES (${quote(name)}, ${quote(appliedAt)});`;
}

// Baseline rows for a legacy DB: marks operator-verified migrations
// applied without re-running their SQL. INSERT OR IGNORE so re-running a
// baseline is a no-op rather than an abort.
export function baselineScript(names, appliedAt) {
  const rows = names.map((n) => `INSERT OR IGNORE INTO "${MIGRATIONS_TABLE}" (name, applied_at) VALUES (${quote(n)}, ${quote(appliedAt)});`).join('\n');
  return `${MIGRATIONS_DDL}\n${rows}`;
}

// Decide what to run. Stops on inconsistency instead of guessing:
//  - ledger names that don't match files = divergence (foreign runner or
//    deleted migrations) -> refuse to proceed.
//  - schema objects present with an empty ledger = legacy DB -> require
//    an explicit operator baseline, never inferred.
export function planMigrations(files, appliedNames, userTableCount, baselineNames = []) {
  const fileSet = new Set(files);
  const applied = new Set(appliedNames);
  const baseline = new Set(baselineNames);
  for (const name of applied) {
    if (!fileSet.has(name)) {
      throw new Error(`Migration history diverges: '${name}' is recorded in ${MIGRATIONS_TABLE} but has no migration file. Resolve the divergence before applying anything.`);
    }
  }
  for (const name of baseline) {
    if (!fileSet.has(name)) throw new Error(`Baseline target is not a migration file: ${name}`);
    if (applied.has(name)) throw new Error(`Baseline target is already recorded as applied: ${name}`);
  }
  if (applied.size === 0 && userTableCount > 0 && baseline.size === 0) {
    throw new Error(
      `Database contains ${userTableCount} table(s) but no migration ledger. ` +
      `Establish a baseline: run with --baseline <names> for each migration the operator has verified, then apply the rest.`,
    );
  }
  return files.filter((f) => !applied.has(f) && !baseline.has(f));
}
