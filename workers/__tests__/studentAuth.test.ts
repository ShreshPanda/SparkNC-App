import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { pbkdf2Sync } from 'node:crypto';
import { AuthService, buildSessionCookie, getSessionCookieName } from '../api/services/authService';
import { loginController, meController, logoutController } from '../api/controllers/auth';

const MIGRATIONS = join(__dirname, '..', 'database', 'migrations');

type Bound = { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> };

function d1(db: DatabaseSync) {
  return {
    prepare: (sql: string) => ({
      bind: (...params: unknown[]): Bound => ({
        run: async () => {
          db.prepare(sql).run(...(params as never[]));
          return { meta: {} };
        },
        all: async () => ({ results: db.prepare(sql).all(...(params as never[])) as Record<string, unknown>[] }),
      }),
    }),
    batch: async (stmts: Bound[]) => {
      db.exec('BEGIN');
      try {
        for (const s of stmts) await s.run();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

function b64url(buf: Buffer) {
  return buf.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

// Replicates authService's stored format: pbkdf2:<iters>:<b64url(hash)>
function credential(secret: string, salt: string) {
  const saltBytes = Buffer.from(salt.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const bits = pbkdf2Sync(secret, saltBytes, 100000, 32, 'sha256');
  return `pbkdf2:100000:${b64url(bits)}`;
}

const STAFF_PASSWORD = 'staff password 123';
const STAFF_SALT = 'c3RhZmZzYWx0MTIz';
const STUDENT_PHRASE = 'my secure phrase';
const STUDENT_SALT = 'c3R1ZGVudHNhbHQx';
const PUBLIC_ID = 'stu_Ab3dEf5gH7jK9mN1';

function build() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  for (const f of ['001_initial.sql', '002_sessions.sql', '009_audit_logs.sql', '023_enrollment.sql', '024_enrollment_claim.sql']) {
    sqlite.exec(readFileSync(join(MIGRATIONS, f), 'utf8'));
  }
  sqlite.exec(`
    INSERT INTO schools (id, name, slug, created_at, updated_at) VALUES ('school-1','Alpha Lab','alpha','t','t');
    INSERT INTO users (id, email, name, role, school_id, is_active, password_hash, password_salt, created_at, updated_at) VALUES
      ('u-lead','lead@x.co','Lead','lab_leader','school-1',1,'${credential(STAFF_PASSWORD, STAFF_SALT)}','${STAFF_SALT}','t','t'),
      ('u-stu','${PUBLIC_ID}@students.sparknc.internal','Ava Reyes','student','school-1',1,'${credential(STUDENT_PHRASE, STUDENT_SALT)}','${STUDENT_SALT}','t','t'),
      ('u-off','stu_Zz9yXx8wWv7uU5tS@students.sparknc.internal','Inactive Stu','student','school-1',0,'${credential(STUDENT_PHRASE, STUDENT_SALT)}','${STUDENT_SALT}','t','t');
    INSERT INTO student_public_ids (public_id, user_id, created_at) VALUES
      ('${PUBLIC_ID}','u-stu','t'),
      ('stu_Zz9yXx8wWv7uU5tS','u-off','t');
  `);
  const db = d1(sqlite);
  return { sqlite, db, auth: new AuthService(db as never) };
}

const ctx = (db: unknown, cookie?: string) => ({
  env: { DB: db, COOKIE_SECURE: 'true' },
  headers: new Headers(cookie ? { Cookie: cookie } : {}),
});

describe('student login (S3c-3)', () => {
  let t: ReturnType<typeof build>;
  beforeEach(() => {
    t = build();
  });

  it('logs in a student with public_id + access phrase and creates a session', async () => {
    const res = (await loginController({ publicId: PUBLIC_ID, accessPhrase: STUDENT_PHRASE }, ctx(t.db))) as { ok: boolean; data: Record<string, unknown>; setCookie: string };
    expect(res.ok).toBe(true);
    expect(res.data.role).toBe('student');
    expect(res.data.publicId).toBe(PUBLIC_ID);
    expect(res.setCookie).toContain(getSessionCookieName());
    // Native transport: body carries the same name=value credential (S4.5.5).
    expect((res as { sessionCredential?: string }).sessionCredential).toMatch(/^sparknc_session=/);
    expect((t.sqlite.prepare('SELECT COUNT(*) c FROM sessions').get() as { c: number }).c).toBe(1);
    expect(JSON.stringify(res)).not.toContain('students.sparknc.internal');
  });

  it('normalizes phrase whitespace/case-folding like enrollment did', async () => {
    const res = (await loginController({ publicId: PUBLIC_ID, accessPhrase: '  my   secure  phrase ' }, ctx(t.db))) as { ok: boolean };
    expect(res.ok).toBe(true);
  });

  it('custom provisioned IDs login case-insensitively; malformed IDs still rejected (S4.5)', async () => {
    t.sqlite.exec(`
      INSERT INTO users (id, email, name, role, school_id, is_active, password_hash, password_salt, created_at, updated_at)
        VALUES ('u-qa','u-qa@test.sparknc','QA','student','school-1',1,'${credential(STUDENT_PHRASE, STUDENT_SALT)}','${STUDENT_SALT}','t','t');
      INSERT INTO student_public_ids (public_id, user_id, created_at) VALUES ('testingID','u-qa','t');
    `);
    const mixedCase = (await loginController({ publicId: 'testingID', accessPhrase: STUDENT_PHRASE }, ctx(t.db))) as { ok: boolean; data: Record<string, unknown> };
    expect(mixedCase.ok).toBe(true);
    const lowered = (await loginController({ publicId: 'testingid', accessPhrase: STUDENT_PHRASE }, ctx(t.db))) as { ok: boolean };
    expect(lowered.ok).toBe(true);
    for (const bad of ['xy', 'x'.repeat(33), 'bad id!', 'stu_bad?']) {
      const res = (await loginController({ publicId: bad, accessPhrase: STUDENT_PHRASE }, ctx(t.db))) as Response;
      expect(res.status).toBe(401); // same generic INVALID_CREDENTIALS as wrong-creds
    }
  });

  it('wrong phrase and unknown public id produce indistinguishable errors', async () => {
    const a = (await loginController({ publicId: PUBLIC_ID, accessPhrase: 'wrong words here now' }, ctx(t.db))) as Response;
    const b = (await loginController({ publicId: 'stu_Zz9yXx8wWv7uU5tQ', accessPhrase: 'wrong words here now' }, ctx(t.db))) as Response;
    const c = (await loginController({ publicId: 'not-an-id', accessPhrase: 'wrong words here now' }, ctx(t.db))) as Response;
    for (const r of [a, b, c]) {
      expect(r.status).toBe(401);
      expect(await r.json()).toEqual({ ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }
    expect((t.sqlite.prepare('SELECT COUNT(*) c FROM sessions').get() as { c: number }).c).toBe(0);
  });

  it('rejects inactive students', async () => {
    const res = (await loginController({ publicId: 'stu_Zz9yXx8wWv7uU5tS', accessPhrase: STUDENT_PHRASE }, ctx(t.db))) as Response;
    expect(res.status).toBe(401);
  });

  it('a public id cannot authenticate as staff and vice versa', async () => {
    // staff have no student_public_ids row — staff path with publicId fails
    const asStaff = (await loginController({ publicId: 'stu_Qq1wW2eE3rR4tT5y', accessPhrase: STAFF_PASSWORD }, ctx(t.db))) as Response;
    expect(asStaff.status).toBe(401);
    // staff email+password still works and returns no publicId
    const staff = (await loginController({ email: 'lead@x.co', password: STAFF_PASSWORD }, ctx(t.db))) as { ok: boolean; data: Record<string, unknown> };
    expect(staff.ok).toBe(true);
    expect(staff.data.role).toBe('lab_leader');
    expect(staff.data.publicId).toBeUndefined();
    // wrong staff password → same generic shape
    const bad = (await loginController({ email: 'lead@x.co', password: 'nope' }, ctx(t.db))) as Response;
    expect(bad.status).toBe(401);
  });
});

describe('session & identity serialization (S3c-3)', () => {
  let t: ReturnType<typeof build>;
  beforeEach(() => {
    t = build();
  });

  async function studentCookie() {
    const res = (await loginController({ publicId: PUBLIC_ID, accessPhrase: STUDENT_PHRASE }, ctx(t.db))) as { setCookie: string };
    return res.setCookie.split(';')[0];
  }

  it('session validates and /auth/me masks the synthetic email while exposing publicId', async () => {
    const cookie = await studentCookie();
    const res = (await meController({}, ctx(t.db, cookie))) as { ok: boolean; data: Record<string, unknown> };
    expect(res.ok).toBe(true);
    expect(res.data.publicId).toBe(PUBLIC_ID);
    expect(res.data.email).toBeUndefined();
    expect(res.data.name).toBe('Ava Reyes');
    expect(res.data.role).toBe('student');
    expect(JSON.stringify(res)).not.toContain('students.sparknc.internal');
    expect(JSON.stringify(res)).not.toContain('password');
  });

  it('staff /auth/me still returns the real email and no publicId', async () => {
    const login = (await loginController({ email: 'lead@x.co', password: STAFF_PASSWORD }, ctx(t.db))) as { setCookie: string };
    const res = (await meController({}, ctx(t.db, login.setCookie.split(';')[0]))) as { ok: boolean; data: Record<string, unknown> };
    expect(res.data.email).toBe('lead@x.co');
    expect(res.data.publicId).toBeUndefined();
  });

  it('logout revokes the session; restoration fails afterwards', async () => {
    const cookie = await studentCookie();
    const out = (await logoutController({}, ctx(t.db, cookie))) as { ok: boolean };
    expect(out.ok).toBe(true);
    const res = (await meController({}, ctx(t.db, cookie))) as Response;
    expect(res.status).toBe(401);
  });

  it('validateSession falls back cleanly when student_public_ids is absent', async () => {
    const sqlite = new DatabaseSync(':memory:');
    sqlite.exec('PRAGMA foreign_keys = ON');
    for (const f of ['001_initial.sql', '002_sessions.sql']) sqlite.exec(readFileSync(join(MIGRATIONS, f), 'utf8'));
    sqlite.exec(`INSERT INTO users (id,email,name,role,is_active,password_hash,password_salt,created_at,updated_at) VALUES ('u1','a@b.co','A','student',1,'${credential(STAFF_PASSWORD, STAFF_SALT)}','${STAFF_SALT}','t','t')`);
    const db = d1(sqlite);
    const auth = new AuthService(db as never);
    const login = await auth.login('a@b.co', STAFF_PASSWORD);
    const user = await auth.validateSession(login.sessionId);
    expect(user?.email).toBe('a@b.co');
    expect(user?.publicId).toBeUndefined();
    sqlite.exec("UPDATE users SET is_active=0 WHERE id='u1'");
    expect(await auth.validateSession(login.sessionId)).toBeNull();
  });
});

describe('session invalidation on suspension (S3c-5.2)', () => {
  const adminCaller = { userId: 'u-admin', role: 'admin' };
  const leadCaller = { userId: 'u-lead', role: 'lab_leader' };
  let t: ReturnType<typeof build>;
  beforeEach(() => {
    t = build();
  });

  it('student: suspension revokes the live session; reactivation requires a fresh login', async () => {
    const login = await t.auth.loginStudent(PUBLIC_ID, STUDENT_PHRASE);
    expect(await t.auth.validateSession(login.sessionId)).not.toBeNull();

    const audited: { action: string; entityId?: string }[] = [];
    const audit = { log: async (_a: unknown, action: string, _t: string, entityId?: string) => { audited.push({ action, entityId }); } };
    await t.auth.suspendUser('u-stu', adminCaller, audit);
    expect(await t.auth.validateSession(login.sessionId)).toBeNull();
    const dead = t.sqlite.prepare('SELECT revoked_at FROM sessions WHERE id = ?').get(login.sessionId) as { revoked_at: unknown };
    expect(dead.revoked_at).not.toBeNull();
    // suspended accounts cannot log in
    await expect(t.auth.loginStudent(PUBLIC_ID, STUDENT_PHRASE)).rejects.toThrow('Invalid credentials');

    await t.auth.reactivateUser('u-stu', adminCaller, audit);
    // previously revoked session is not restored
    expect(await t.auth.validateSession(login.sessionId)).toBeNull();
    expect(audited).toEqual([
      { action: 'account.suspend', entityId: 'u-stu' },
      { action: 'account.reactivate', entityId: 'u-stu' },
    ]);

    const fresh = await t.auth.loginStudent(PUBLIC_ID, STUDENT_PHRASE);
    expect(fresh.sessionId).not.toBe(login.sessionId);
    expect(await t.auth.validateSession(fresh.sessionId)).not.toBeNull();
  });

  it('staff: identical suspend/reactivate semantics via email login', async () => {
    const login = await t.auth.login('lead@x.co', STAFF_PASSWORD);
    expect(await t.auth.validateSession(login.sessionId)).not.toBeNull();

    await t.auth.suspendUser('u-lead', adminCaller);
    expect(await t.auth.validateSession(login.sessionId)).toBeNull();

    await t.auth.reactivateUser('u-lead', adminCaller);
    expect(await t.auth.validateSession(login.sessionId)).toBeNull();

    const fresh = await t.auth.login('lead@x.co', STAFF_PASSWORD);
    expect(await t.auth.validateSession(fresh.sessionId)).not.toBeNull();
  });

  it('deactivation and session revocation are atomic: a revocation failure leaves the account active', async () => {
    const login = await t.auth.loginStudent(PUBLIC_ID, STUDENT_PHRASE);
    t.sqlite.exec("CREATE TRIGGER fail_session_revoke BEFORE UPDATE ON sessions BEGIN SELECT RAISE(ABORT,'forced'); END");
    await expect(t.auth.suspendUser('u-stu', adminCaller)).rejects.toThrow();
    t.sqlite.exec('DROP TRIGGER fail_session_revoke');
    const user = t.sqlite.prepare("SELECT is_active FROM users WHERE id='u-stu'").get() as { is_active: number };
    expect(user.is_active).toBe(1);
    expect(await t.auth.validateSession(login.sessionId)).not.toBeNull();
  });

  it('non-admin callers are rejected before any write', async () => {
    const login = await t.auth.loginStudent(PUBLIC_ID, STUDENT_PHRASE);
    for (const caller of [leadCaller, { userId: 'u-stu', role: 'student' }, undefined as never]) {
      await expect(t.auth.suspendUser('u-stu', caller)).rejects.toThrow('Forbidden');
      await expect(t.auth.reactivateUser('u-stu', caller)).rejects.toThrow('Forbidden');
    }
    const user = t.sqlite.prepare("SELECT is_active FROM users WHERE id='u-stu'").get() as { is_active: number };
    expect(user.is_active).toBe(1);
    expect(await t.auth.validateSession(login.sessionId)).not.toBeNull();
    expect(t.sqlite.prepare('SELECT COUNT(*) c FROM sessions WHERE revoked_at IS NOT NULL').get()).toMatchObject({ c: 0 });
  });

  it('missing batch support fails closed with zero writes', async () => {
    const login = await t.auth.loginStudent(PUBLIC_ID, STUDENT_PHRASE);
    const noBatch = { prepare: (t.db as { prepare: unknown }).prepare };
    const auth = new AuthService(noBatch as never);
    await expect(auth.suspendUser('u-stu', adminCaller)).rejects.toThrow('Atomic batch support is required');
    const user = t.sqlite.prepare("SELECT is_active FROM users WHERE id='u-stu'").get() as { is_active: number };
    expect(user.is_active).toBe(1);
    expect(await t.auth.validateSession(login.sessionId)).not.toBeNull();
  });
});
