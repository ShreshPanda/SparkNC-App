import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MIGRATIONS_DDL, MIGRATIONS_TABLE, baselineScript, migrationScript, planMigrations } from '../database/migrationLedger.mjs';

const DIR = join(__dirname, '..', 'database', 'migrations');

function db() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  return sqlite;
}

// Each generated file is what `wrangler d1 execute --file` runs inside its
// own transaction — so exec of the whole script mirrors the atomicity D1
// gives the file on the real path.
describe('migration ledger (S3c-10)', () => {
  it('writes Wrangler-compatible d1_migrations history (id, name, applied_at)', () => {
    const s = db();
    s.exec(MIGRATIONS_DDL);
    const sql = readFileSync(join(DIR, '001_initial.sql'), 'utf8');
    s.exec(migrationScript('001_initial.sql', sql, 't'));
    const rows = s.prepare(`SELECT id, name, applied_at FROM ${MIGRATIONS_TABLE}`).all() as { name: string }[];
    expect(rows.map((r) => r.name)).toEqual(['001_initial.sql']);
    expect((s.prepare(`SELECT name FROM sqlite_master WHERE name='users'`).all() as unknown[]).length).toBe(1);
  });

  it('emits no BEGIN/COMMIT — D1 wraps the file in its own transaction', () => {
    const script = migrationScript('x.sql', 'CREATE TABLE t(id TEXT);', 't');
    expect(script).not.toMatch(/BEGIN|COMMIT/i);
    expect(script).toContain(`INSERT INTO "${MIGRATIONS_TABLE}"`);
  });

  it('ledger marks are not inferred from existing schema objects', () => {
    const s = db();
    s.exec(MIGRATIONS_DDL);
    s.exec(readFileSync(join(DIR, '001_initial.sql'), 'utf8'));
    expect((s.prepare(`SELECT COUNT(*) c FROM ${MIGRATIONS_TABLE}`).get() as { c: number }).c).toBe(0);
  });

  it('duplicate migration names cannot be recorded twice', () => {
    const s = db();
    s.exec(MIGRATIONS_DDL);
    s.exec(baselineScript(['001_initial.sql'], 't'));
    expect(() => s.exec(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ('001_initial.sql')`)).toThrow();
  });

  it('baseline records verified migrations without running their SQL, and is idempotent', () => {
    const s = db();
    s.exec(baselineScript(['001_initial.sql', '002_sessions.sql'], 't'));
    s.exec(baselineScript(['001_initial.sql', '002_sessions.sql'], 'u')); // re-run is a no-op
    expect((s.prepare(`SELECT COUNT(*) c FROM ${MIGRATIONS_TABLE}`).get() as { c: number }).c).toBe(2);
    expect((s.prepare(`SELECT COUNT(*) c FROM sqlite_master WHERE name='users'`).get() as { c: number }).c).toBe(0);
  });

  it('plan: empty ledger + existing schema requires an explicit baseline', () => {
    const files = ['001_initial.sql', '002_sessions.sql', '024_enrollment_claim.sql'];
    expect(() => planMigrations(files, [], 5)).toThrow(/baseline/);
    expect(planMigrations(files, [], 5, ['001_initial.sql', '002_sessions.sql'])).toEqual(['024_enrollment_claim.sql']);
    expect(() => planMigrations(files, [], 5, ['nope.sql'])).toThrow(/not a migration file/);
  });

  it('plan: ledger entries without matching files are divergence and stop everything', () => {
    const files = ['001_initial.sql', '002_sessions.sql'];
    expect(() => planMigrations(files, ['001_initial.sql', 'ghost.sql'], 10)).toThrow(/diverges/);
  });

  it('plan: baseline on already-recorded migration is rejected', () => {
    const files = ['001_initial.sql'];
    expect(() => planMigrations(files, ['001_initial.sql'], 5, ['001_initial.sql'])).toThrow(/already recorded/);
  });
});
