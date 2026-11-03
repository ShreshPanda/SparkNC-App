// Shared migration-ledger helpers used by scripts/apply-d1-migrations.mjs
// and the worker test suite. Pure JS so both can import it directly.

export const MIGRATIONS_TABLE = '_migrations';

export const MIGRATIONS_DDL = `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
  name TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
)`;

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

// One migration file + its ledger row as a single atomic script.
// BEGIN IMMEDIATE takes the write lock up front so concurrent runs
// serialize; the PK on _migrations.name aborts a duplicate anyway.
export function migrationScript(name, sql, appliedAt) {
  return `BEGIN IMMEDIATE;\n${sql}\nINSERT INTO ${MIGRATIONS_TABLE} (name, applied_at) VALUES (${quote(name)}, ${quote(appliedAt)});\nCOMMIT;`;
}

// Baseline rows for a legacy DB: marks operator-verified migrations
// applied without re-running their SQL.
export function baselineScript(names, appliedAt) {
  const rows = names.map((n) => `INSERT OR IGNORE INTO ${MIGRATIONS_TABLE} (name, applied_at) VALUES (${quote(n)}, ${quote(appliedAt)});`).join('\n');
  return `BEGIN IMMEDIATE;\n${MIGRATIONS_DDL};\n${rows}\nCOMMIT;`;
}

// Decide what to run. Stops on inconsistency instead of guessing:
// a non-empty schema with an empty ledger is a legacy DB that needs an
// explicit operator baseline — never auto-assumed.
export function planMigrations(files, appliedNames, userTableCount, baselineNames = []) {
  const applied = new Set(appliedNames);
  const baseline = new Set(baselineNames);
  for (const name of baseline) {
    if (!files.includes(name)) throw new Error(`Baseline target is not a migration file: ${name}`);
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
