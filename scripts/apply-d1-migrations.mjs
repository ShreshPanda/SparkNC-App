#!/usr/bin/env node
// Ledger-aware D1 migration runner.
//
// Records every successfully applied migration in the `_migrations` table
// inside the same transaction as the migration itself. A database that has
// schema objects but an empty ledger is treated as a legacy DB and the
// runner stops — establish an operator-verified baseline first:
//
//   node scripts/apply-d1-migrations.mjs <db> remote --baseline 001_initial.sql 002_sessions.sql ...
//   node scripts/apply-d1-migrations.mjs <db> remote            # applies the rest, ledgered
//
// Never baseline blind: confirm the schema actually matches each listed
// migration before recording it. The ledger proves execution, not intent.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MIGRATIONS_DDL, MIGRATIONS_TABLE, baselineScript, migrationScript, planMigrations } from '../workers/database/migrationLedger.mjs';

const [databaseName, target, ...rest] = process.argv.slice(2);
if (!databaseName || !['local', 'remote'].includes(target)) {
  console.error('Usage: node scripts/apply-d1-migrations.mjs <database-name> <local|remote> [--baseline <file.sql> ...]');
  process.exit(1);
}
const baselineIdx = rest.indexOf('--baseline');
const baseline = baselineIdx === -1 ? [] : rest.slice(baselineIdx + 1).filter((a) => !a.startsWith('--'));
const MIGRATIONS_DIR = join(new URL('..', import.meta.url).pathname, 'workers', 'database', 'migrations');

function d1(sql, capture = false) {
  const result = spawnSync('npx', ['wrangler', 'd1', 'execute', databaseName, `--${target}`, '--command', sql, '--json'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) throw new Error(`d1 execute failed: ${result.stderr || result.stdout}`);
  return capture ? JSON.parse(result.stdout) : result;
}

function d1File(sqlPath) {
  const result = spawnSync('npx', ['wrangler', 'd1', 'execute', databaseName, `--${target}`, '--file', sqlPath], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) throw new Error(`d1 execute --file ${sqlPath} failed`);
}

try {
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => /^\d+.*\.sql$/.test(f)).sort();
  d1(MIGRATIONS_DDL);
  const appliedRows = d1(`SELECT name FROM ${MIGRATIONS_TABLE}`, true);
  const applied = (appliedRows?.[0]?.results ?? []).map((r) => r.name);
  const userTables = d1(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '${MIGRATIONS_TABLE}'`,
    true,
  );
  const userTableCount = (userTables?.[0]?.results ?? []).length;

  if (baseline.length) {
    const tmp = join(tmpdir(), 'baseline.sql');
    writeFileSync(tmp, baselineScript(baseline, new Date().toISOString()));
    d1File(tmp);
    console.log(`Baselined ${baseline.length} migration(s) as operator-verified.`);
  }

  const pending = planMigrations(files, [...applied, ...baseline], userTableCount, baseline.length ? [] : baseline);
  if (!pending.length) {
    console.log('All migrations applied. Ledger is current.');
    process.exit(0);
  }
  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const tmp = join(tmpdir(), `mig-${file}`);
    writeFileSync(tmp, migrationScript(file, sql, new Date().toISOString()));
    console.log(`Applying ${file} ...`);
    d1File(tmp);
  }
  console.log(`Applied ${pending.length} migration(s).`);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
