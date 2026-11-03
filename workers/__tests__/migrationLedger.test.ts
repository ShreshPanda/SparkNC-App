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

describe('migration ledger (S3c-9)', () => {
  it('applies a migration and records it atomically in one script', () => {
    const s = db();
    s.exec(MIGRATIONS_DDL);
    const sql = readFileSync(join(DIR, '001_initial.sql'), 'utf8');
    s.exec(migrationScript('001_initial.sql', sql, 't'));
    expect(s.prepare(`SELECT name FROM ${MIGRATIONS_TABLE}`).all()).toEqual([{ name: '001_initial.sql' }]);
    expect((s.prepare(`SELECT name FROM sqlite_master WHERE name='users'`).all() as unknown[]).length).toBe(1);
  });

  it('a failed migration leaves no schema change and no ledger row', () => {
    const s = db();
    s.exec(MIGRATIONS_DDL);
    expect(() => s.exec(migrationScript('bad.sql', 'CREATE TABLE ghost(id TEXT); SELECT * FROM missing_table;', 't'))).toThrow();
    expect((s.prepare(`SELECT COUNT(*) c FROM ${MIGRATIONS_TABLE}`).get() as { c: number }).c).toBe(0);
  });

  it('ledger marks are not inferred from existing schema objects', () => {
    const s = db();
    s.exec(MIGRATIONS_DDL);
    s.exec(readFileSync(join(DIR, '001_initial.sql'), 'utf8')); // schema exists, no ledger row
    expect((s.prepare(`SELECT COUNT(*) c FROM ${MIGRATIONS_TABLE}`).get() as { c: number }).c).toBe(0);
  });

  it('plan: empty ledger + existing schema requires an explicit baseline', () => {
    const files = ['001_initial.sql', '002_sessions.sql', '024_enrollment_claim.sql'];
    expect(() => planMigrations(files, [], 5)).toThrow(/baseline/);
    // baseline marks verified migrations; only unrecorded ones run
    expect(planMigrations(files, [], 5, ['001_initial.sql', '002_sessions.sql'])).toEqual(['024_enrollment_claim.sql']);
    // baseline must name real, unapplied files
    expect(() => planMigrations(files, [], 5, ['nope.sql'])).toThrow(/not a migration file/);
  });

  it('baseline records verified migrations without running their SQL', () => {
    const s = db();
    s.exec(baselineScript(['001_initial.sql', '002_sessions.sql'], 't'));
    expect((s.prepare(`SELECT COUNT(*) c FROM ${MIGRATIONS_TABLE}`).get() as { c: number }).c).toBe(2);
    expect((s.prepare(`SELECT COUNT(*) c FROM sqlite_master WHERE name='users'`).get() as { c: number }).c).toBe(0);
  });

  it('duplicate ledger names cannot be recorded twice', () => {
    const s = db();
    s.exec(baselineScript(['001_initial.sql'], 't'));
    expect(() => s.exec(`INSERT INTO ${MIGRATIONS_TABLE} (name, applied_at) VALUES ('001_initial.sql','u')`)).toThrow();
  });
});
