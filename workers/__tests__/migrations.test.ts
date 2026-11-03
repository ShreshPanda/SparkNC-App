import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const MIGRATIONS = join(__dirname, '..', 'database', 'migrations');

function buildDb(migrations: string[]) {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`
    CREATE TABLE schools (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, school_id TEXT, is_active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE roles (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, permissions TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL DEFAULT 't', updated_at TEXT NOT NULL DEFAULT 't');
    INSERT INTO schools VALUES ('school-1','S1'),('school-2','S2');
    INSERT INTO users VALUES ('u-lead','l@x.co','Lead','lab_leader','school-1',1),('u-stu','s@x.co','Stu','student','school-1',1);
    INSERT INTO roles (id, name, permissions) VALUES
      ('role_student','student','["student.perm"]'),
      ('role_lab_leader','lab_leader','["messages.send","messages.read","events.read","custom.legacy"]'),
      ('role_location_manager','location_manager','["events.manage","announcements.manage"]'),
      ('role_admin','admin','["*"]');
  `);
  for (const file of migrations) {
    db.exec(readFileSync(join(MIGRATIONS, file), 'utf8'));
  }
  return db;
}

const enrollmentSql = ['023_enrollment.sql'];
const rbacPlusEnrollment = ['022_rbac.sql', '023_enrollment.sql'];

describe('023_enrollment migration', () => {
  it('creates all enrollment tables and is idempotent', () => {
    const db = buildDb([...enrollmentSql, ...enrollmentSql]);
    const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[]).map((r) => r.name);
    for (const t of ['rosters', 'roster_entries', 'invitations', 'access_reset_requests']) {
      expect(tables).toContain(t);
    }
  });

  it('stores only hashes (no plaintext token/code columns)', () => {
    const db = buildDb(enrollmentSql);
    const inviteCols = (db.prepare('PRAGMA table_info(invitations)').all() as { name: string }[]).map((c) => c.name);
    const resetCols = (db.prepare('PRAGMA table_info(access_reset_requests)').all() as { name: string }[]).map((c) => c.name);
    expect(inviteCols).toContain('token_hash');
    expect(resetCols).toContain('token_hash');
    for (const c of [...inviteCols, ...resetCols]) {
      expect(c).not.toMatch(/^token$|^code$|plaintext/i);
    }
  });

  it('permits duplicate display names within a school', () => {
    const db = buildDb(enrollmentSql);
    db.exec("INSERT INTO rosters VALUES ('r1','school-1','R','u-lead','t','t')");
    db.exec("INSERT INTO roster_entries (id,roster_id,school_id,display_name,created_at,updated_at) VALUES ('e1','r1','school-1','Ava','t','t'),('e2','r1','school-1','Ava','t','t')");
    expect((db.prepare('SELECT COUNT(*) c FROM roster_entries').get() as { c: number }).c).toBe(2);
  });

  it('enforces one active individual invitation per roster entry', () => {
    const db = buildDb(enrollmentSql);
    db.exec(`
      INSERT INTO rosters VALUES ('r1','school-1','R','u-lead','t','t');
      INSERT INTO roster_entries (id,roster_id,school_id,display_name,created_at,updated_at) VALUES ('e1','r1','school-1','Ava','t','t');
      INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES ('i1','e1','school-1','individual','h1','u-lead','2999','t');
    `);
    expect(() =>
      db.exec("INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES ('i2','e1','school-1','individual','h2','u-lead','2999','t')"),
    ).toThrow(/UNIQUE/i);
  });

  it('allows reissue after claim and supports school_link rows', () => {
    const db = buildDb(enrollmentSql);
    db.exec(`
      INSERT INTO rosters VALUES ('r1','school-1','R','u-lead','t','t');
      INSERT INTO roster_entries (id,roster_id,school_id,display_name,created_at,updated_at) VALUES ('e1','r1','school-1','Ava','t','t');
      INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,claimed_at,claimed_by,created_at) VALUES ('i1','e1','school-1','individual','h1','u-lead','2999','t','u-stu','t');
      INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES ('i2','e1','school-1','individual','h2','u-lead','2999','t');
      INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES ('i3',NULL,'school-1','school_link','h3','u-lead','2999','t');
    `);
    expect((db.prepare('SELECT COUNT(*) c FROM invitations').get() as { c: number }).c).toBe(3);
  });

  it('rejects foreign-key violations', () => {
    const db = buildDb(enrollmentSql);
    db.exec("INSERT INTO rosters VALUES ('r1','school-1','R','u-lead','t','t')");
    expect(() =>
      db.exec("INSERT INTO roster_entries (id,roster_id,school_id,display_name,created_at,updated_at) VALUES ('eX','r1','school-3','G','t','t')"),
    ).toThrow(/FOREIGN KEY/i);
  });

  it('enforces one active reset request per user', () => {
    const db = buildDb(enrollmentSql);
    db.exec("INSERT INTO access_reset_requests (id,user_id,school_id,requested_by,token_hash,expires_at,created_at) VALUES ('x1','u-stu','school-1','u-lead','rh1','2999','t')");
    expect(() =>
      db.exec("INSERT INTO access_reset_requests (id,user_id,school_id,requested_by,token_hash,expires_at,created_at) VALUES ('x2','u-stu','school-1','u-lead','rh2','2999','t')"),
    ).toThrow(/UNIQUE/i);
  });

  it('merges lab_leader permissions additively and preserves other roles', () => {
    const db = buildDb(enrollmentSql);
    const perms = (name: string) => JSON.parse((db.prepare('SELECT permissions FROM roles WHERE name = ?').get(name) as { permissions: string }).permissions) as string[];
    expect(perms('lab_leader')).toEqual(expect.arrayContaining(['roster.manage', 'invitations.manage', 'students.reset_access', 'custom.legacy', 'messages.send']));
    expect(perms('admin')).toEqual(['*']);
    expect(perms('student')).toEqual(['student.perm']);
    expect(perms('location_manager')).not.toContain('roster.manage');
  });
});

describe('022 + 023 combined', () => {
  it('applies cleanly in order and remains idempotent', () => {
    const db = buildDb([...rbacPlusEnrollment, ...rbacPlusEnrollment]);
    const perms = JSON.parse((db.prepare("SELECT permissions FROM roles WHERE name='lab_leader'").get() as { permissions: string }).permissions) as string[];
    expect(perms).toEqual(expect.arrayContaining(['roster.manage', 'invitations.manage', 'students.reset_access', 'messages.send']));
  });
});

const claimSql = ['023_enrollment.sql', '024_enrollment_claim.sql'];

describe('024_enrollment_claim migration', () => {
  it('creates all claim-pipeline tables on a fresh database and is idempotent', () => {
    const db = buildDb([...claimSql, '024_enrollment_claim.sql']);
    const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[]).map((r) => r.name);
    for (const t of ['student_public_ids', 'verification_grants', 'enrollments', 'claim_probe', 'reset_consumptions', 'rate_limits']) {
      expect(tables).toContain(t);
    }
  });

  it('applies cleanly to an existing migrated database (022 + 023)', () => {
    const db = buildDb([...rbacPlusEnrollment, '024_enrollment_claim.sql']);
    const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map((r) => r.name);
    for (const t of ['rosters', 'roster_entries', 'invitations', 'access_reset_requests', 'enrollments', 'verification_grants']) {
      expect(tables).toContain(t);
    }
  });

  it('does not add a public_id column to users and assigns no IDs to legacy accounts', () => {
    const db = buildDb(claimSql);
    const userCols = (db.prepare('PRAGMA table_info(users)').all() as { name: string }[]).map((c) => c.name);
    expect(userCols).not.toContain('public_id');
    expect(userCols).toContain('email');
    expect((db.prepare('SELECT COUNT(*) c FROM student_public_ids').get() as { c: number }).c).toBe(0);
  });

  it('enforces uniqueness on public IDs, grant token hashes, and enrollment claim keys', () => {
    const db = buildDb(claimSql);
    db.exec(`
      INSERT INTO rosters VALUES ('r1','school-1','R','u-lead','t','t');
      INSERT INTO roster_entries (id,roster_id,school_id,display_name,created_at,updated_at) VALUES ('e1','r1','school-1','Ava','t','t');
      INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES ('i1','e1','school-1','individual','ih1','u-lead','2999','t');
      INSERT INTO student_public_ids VALUES ('stu_abc','u-stu','t');
      INSERT INTO verification_grants (id,token_hash,invitation_id,roster_entry_id,school_id,expires_at,created_at) VALUES ('g1','gh1','i1','e1','school-1','2999','t');
      INSERT INTO enrollments VALUES ('e1','u-stu','i1','g1','t');
    `);
    expect(() => db.exec("INSERT INTO student_public_ids VALUES ('stu_abc','u-lead','t')")).toThrow(/UNIQUE/i);
    expect(() => db.exec("INSERT INTO student_public_ids VALUES ('stu_def','u-stu','t')")).toThrow(/UNIQUE/i);
    expect(() => db.exec("INSERT INTO verification_grants (id,token_hash,invitation_id,roster_entry_id,school_id,expires_at,created_at) VALUES ('g2','gh1','i1','e1','school-1','2999','t')")).toThrow(/UNIQUE/i);
    // one enrollment per roster entry and per grant
    expect(() => db.exec("INSERT INTO enrollments VALUES ('e1','u-lead','i1','g2','t')")).toThrow(/UNIQUE|FOREIGN KEY/i);
    expect(() => db.exec("INSERT INTO enrollments VALUES ('e2','u-lead','i1','g1','t')")).toThrow(/UNIQUE|FOREIGN KEY/i);
    // one consumption marker per reset token
    db.exec("INSERT INTO reset_consumptions VALUES ('rh1','n1','t')");
    expect(() => db.exec("INSERT INTO reset_consumptions VALUES ('rh1','n2','t')")).toThrow(/UNIQUE/i);
  });

  it('enforces foreign keys on grants, enrollments, and public ids', () => {
    const db = buildDb(claimSql);
    db.exec(`
      INSERT INTO rosters VALUES ('r1','school-1','R','u-lead','t','t');
      INSERT INTO roster_entries (id,roster_id,school_id,display_name,created_at,updated_at) VALUES ('e1','r1','school-1','Ava','t','t');
      INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES ('i1','e1','school-1','individual','ih1','u-lead','2999','t');
    `);
    expect(() => db.exec("INSERT INTO student_public_ids VALUES ('stu_x','no-user','t')")).toThrow(/FOREIGN KEY/i);
    expect(() => db.exec("INSERT INTO verification_grants (id,token_hash,invitation_id,roster_entry_id,school_id,expires_at,created_at) VALUES ('g1','gh1','no-invite','e1','school-1','2999','t')")).toThrow(/FOREIGN KEY/i);
    expect(() => db.exec("INSERT INTO verification_grants (id,token_hash,invitation_id,roster_entry_id,school_id,expires_at,created_at) VALUES ('g1','gh1','i1','no-entry','school-1','2999','t')")).toThrow(/FOREIGN KEY/i);
    db.exec("INSERT INTO verification_grants (id,token_hash,invitation_id,roster_entry_id,school_id,expires_at,created_at) VALUES ('g1','gh1','i1','e1','school-1','2999','t')");
    expect(() => db.exec("INSERT INTO enrollments VALUES ('e1','no-user','i1','g1','t')")).toThrow(/FOREIGN KEY/i);
  });

  it('references schools(id) from verification_grants.school_id and rejects invalid schools', () => {
    const db = buildDb(claimSql);
    const fks = db.prepare('PRAGMA foreign_key_list(verification_grants)').all() as { table: string; from: string; to: string }[];
    expect(fks).toEqual(expect.arrayContaining([expect.objectContaining({ table: 'schools', from: 'school_id', to: 'id' })]));
    db.exec(`
      INSERT INTO rosters VALUES ('r1','school-1','R','u-lead','t','t');
      INSERT INTO roster_entries (id,roster_id,school_id,display_name,created_at,updated_at) VALUES ('e1','r1','school-1','Ava','t','t');
      INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES ('i1','e1','school-1','individual','ih1','u-lead','2999','t');
    `);
    expect(() =>
      db.exec("INSERT INTO verification_grants (id,token_hash,invitation_id,roster_entry_id,school_id,expires_at,created_at) VALUES ('g1','gh1','i1','e1','school-9','2999','t')"),
    ).toThrow(/FOREIGN KEY/i);
  });

  it('claim_probe aborts on missing prerequisite and stays empty on success', () => {
    const db = buildDb(claimSql);
    // prerequisite missing -> NULL insert -> NOT NULL violation
    expect(() =>
      db.exec("INSERT INTO claim_probe (v) SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM roster_entries WHERE id = 'nope')"),
    ).toThrow(/NOT NULL/i);
    // prerequisite satisfied -> 0 rows -> no error, table stays empty
    db.exec("INSERT INTO rosters VALUES ('r1','school-1','R','u-lead','t','t')");
    db.exec("INSERT INTO roster_entries (id,roster_id,school_id,display_name,created_at,updated_at) VALUES ('e1','r1','school-1','Ava','t','t')");
    db.exec("INSERT INTO claim_probe (v) SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM roster_entries WHERE id = 'e1')");
    expect((db.prepare('SELECT COUNT(*) c FROM claim_probe').get() as { c: number }).c).toBe(0);
  });

  it('rate_limits upsert increments atomically and returns the count', () => {
    const db = buildDb(claimSql);
    const upsert = db.prepare(
      'INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key, window_start) DO UPDATE SET count = count + 1 RETURNING count',
    );
    expect((upsert.get('verify:ip:1.2.3.4', 0) as { count: number }).count).toBe(1);
    expect((upsert.get('verify:ip:1.2.3.4', 0) as { count: number }).count).toBe(2);
    // a different window starts a fresh counter
    expect((upsert.get('verify:ip:1.2.3.4', 1) as { count: number }).count).toBe(1);
  });
});
