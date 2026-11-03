import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createHash, pbkdf2Sync } from 'node:crypto';
import { EnrollmentRepository } from '../api/repositories/EnrollmentRepository';
import { EnrollmentService } from '../api/services/enrollmentService';
import { AccessResetRepository } from '../api/repositories/AccessResetRepository';
import { AccessResetService } from '../api/services/accessResetService';
import { claimEnrollmentController, resolveInvitationController, verifyClaimCodeController } from '../api/controllers/enrollment';
import { completeResetController, initiateResetController } from '../api/controllers/accessReset';
import { registerController } from '../api/controllers/auth';
import { D1RateLimiter } from '../api/services/rateLimitService';
import { createPermissionService } from '../api/services/permissionService';
import worker, { PUBLIC_METHOD_PATHS } from '../index';
import { MessageService } from '../api/services/messageService';
import { MessageRepository } from '../api/repositories/MessageRepository';

const MIGRATIONS = join(__dirname, '..', 'database', 'migrations');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

type Bound = { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> };

function d1(db: DatabaseSync) {
  let batches = Promise.resolve();
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
    batch: (stmts: Bound[]) => {
      const result = batches.then(async () => {
        db.exec('BEGIN');
        try {
          for (const s of stmts) await s.run();
          db.exec('COMMIT');
        } catch (e) {
          db.exec('ROLLBACK');
          throw e;
        }
      });
      batches = result.catch(() => undefined);
      return result;
    },
  };
}

function b64url(buf: Buffer) {
  return buf.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function credential(secret: string, salt: string) {
  const saltBytes = Buffer.from(salt.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  return `pbkdf2:100000:${b64url(pbkdf2Sync(secret, saltBytes, 100000, 32, 'sha256'))}`;
}

const INV_TOKEN = 'inv-token-aaa';
const LINK_TOKEN = 'link-token-bbb';
const CODE_AVA = '23456789AB';
const CODE_SAM = 'BCDEFGHJKM';
const CODE_FOREIGN = 'NPQRSTUVWX';
const OLD_PHRASE_SALT = 'b2xkc2FsdA';

function build() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  for (const f of ['001_initial.sql', '002_sessions.sql', '009_audit_logs.sql', '023_enrollment.sql', '024_enrollment_claim.sql']) {
    sqlite.exec(readFileSync(join(MIGRATIONS, f), 'utf8'));
  }
  sqlite.exec(`
    INSERT INTO roles (id, name, permissions, created_at, updated_at) VALUES ('rl','lab_leader','["roster.manage","invitations.manage","students.reset_access"]','t','t');
    INSERT INTO schools (id, name, slug, created_at, updated_at) VALUES
      ('school-1','Alpha Lab','alpha','t','t'), ('school-2','Beta Lab','beta','t','t');
    INSERT INTO users (id, email, name, role, school_id, is_active, password_hash, password_salt, created_at, updated_at) VALUES
      ('u-lead','lead@x.co','Lead','lab_leader','school-1',1,'x','x','t','t'),
      ('u-lead2','lead2@x.co','Lead2','lab_leader','school-2',1,'x','x','t','t'),
      ('u-admin','admin@x.co','Admin','admin',NULL,1,'x','x','t','t'),
      ('u-stu','stu_x@students.sparknc.internal','Old Student','student','school-1',1,'${credential('old phrase here', OLD_PHRASE_SALT)}','${OLD_PHRASE_SALT}','t','t'),
      ('u-stu2','stu_y@students.sparknc.internal','Other School Stu','student','school-2',1,'x','x','t','t'),
      ('u-inactive','stu_z@students.sparknc.internal','Inactive','student','school-1',0,'x','x','t','t');
    INSERT INTO rosters VALUES ('r1','school-1','Fall','u-lead','t','t'), ('r2','school-2','Fall','u-lead','t','t');
    INSERT INTO roster_entries (id,roster_id,school_id,display_name,status,claim_code_hash,created_at,updated_at) VALUES
      ('e-ava','r1','school-1','Ava Reyes','pending','${sha(CODE_AVA)}','t','t'),
      ('e-sam','r1','school-1','Sam Cho','pending','${sha(CODE_SAM)}','t','t'),
      ('e-zed','r2','school-2','Zed Park','pending','${sha(CODE_FOREIGN)}','t','t');
    INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES
      ('i-ava','e-ava','school-1','individual','${sha(INV_TOKEN)}','u-lead','2999-01-01T00:00:00.000Z','t'),
      ('i-link',NULL,'school-1','school_link','${sha(LINK_TOKEN)}','u-lead','2999-01-01T00:00:00.000Z','t'),
      ('i-exp',NULL,'school-1','school_link','${sha('expired-tok')}','u-lead','2000-01-01T00:00:00.000Z','t'),
      ('i-rev',NULL,'school-1','school_link','${sha('revoked-tok')}','u-lead','2999-01-01T00:00:00.000Z','t');
    UPDATE invitations SET revoked_at='t' WHERE id='i-rev';
    INSERT INTO sessions (id, user_id, created_at, expires_at, revoked_at) VALUES ('sess-old','u-stu','t','2999-01-01T00:00:00.000Z',NULL);
  `);
  const db = d1(sqlite);
  return {
    sqlite,
    db,
    enrollment: new EnrollmentService(new EnrollmentRepository(db as never)),
    reset: new AccessResetService(new AccessResetRepository(db as never)),
  };
}

const ctx = (db: unknown, extra: Record<string, unknown> = {}) => ({
  env: { DB: db, COOKIE_SECURE: 'true' },
  headers: new Headers({ 'cf-connecting-ip': '9.9.9.9' }),
  ...extra,
});

const lead1 = { userId: 'u-lead', role: 'lab_leader', schoolId: 'school-1' };
const lead2 = { userId: 'u-lead2', role: 'lab_leader', schoolId: 'school-2' };
const admin = { userId: 'u-admin', role: 'admin' };

describe('enrollment API (S3c-4)', () => {
  let t: ReturnType<typeof build>;
  beforeEach(() => {
    t = build();
  });

  it('full resolve → verify → claim flow through controllers', async () => {
    const resolved = (await resolveInvitationController({ token: INV_TOKEN }, ctx(t.db))) as { ok: boolean; data: { kind: string; expiresAt: string } };
    expect(resolved.ok).toBe(true);
    expect(Object.keys(resolved.data).sort()).toEqual(['expiresAt', 'kind']);
    expect(JSON.stringify(resolved)).not.toContain('Ava');

    const verified = (await verifyClaimCodeController({ token: INV_TOKEN, claimCode: CODE_AVA }, ctx(t.db))) as { ok: boolean; data: { grantToken: string; displayName: string; schoolName: string } };
    expect(verified.ok).toBe(true);
    expect(verified.data.displayName).toBe('Ava Reyes');
    expect(verified.data.schoolName).toBe('Alpha Lab');

    const claimed = (await claimEnrollmentController({ grantToken: verified.data.grantToken, accessPhrase: 'alpha beta gamma' }, ctx(t.db))) as { ok: boolean; data: Record<string, unknown>; setCookie: string };
    expect(claimed.ok).toBe(true);
    expect(claimed.data.publicId).toMatch(/^stu_[A-Za-z0-9]{16}$/);
    expect(claimed.setCookie).toContain('sparknc_session=');
    expect(JSON.stringify(claimed.data)).not.toContain('students.sparknc.internal');
  });

  it('rejects invalid, expired, and revoked invitation tokens uniformly', async () => {
    for (const token of ['nope', 'expired-tok', 'revoked-tok']) {
      const res = (await resolveInvitationController({ token }, ctx(t.db))) as Response;
      expect(res.status).toBe(400);
    }
  });

  it('school link accepts an in-school code and rejects cross-school', async () => {
    const ok = (await verifyClaimCodeController({ token: LINK_TOKEN, claimCode: CODE_SAM }, ctx(t.db))) as { ok: boolean };
    expect(ok.ok).toBe(true);
    const bad = (await verifyClaimCodeController({ token: LINK_TOKEN, claimCode: CODE_FOREIGN }, ctx(t.db))) as Response;
    expect(bad.status).toBe(400);
  });

  it('rate limits increment every key even when one is over limit', async () => {
    const limiter = new D1RateLimiter(t.db as never);
    // exhaust the invitation-level key via direct checks
    for (let i = 0; i < 5; i += 1) {
      await verifyClaimCodeController({ token: INV_TOKEN, claimCode: 'KKKKKKKKKK' }, ctx(t.db));
    }
    const res = (await verifyClaimCodeController({ token: INV_TOKEN, claimCode: CODE_AVA }, ctx(t.db))) as Response;
    expect(res.status).toBe(429);
    // both keys still incremented on the rejected request
    const rows = t.sqlite.prepare('SELECT COUNT(*) c, SUM(count) s FROM rate_limits').get() as { c: number; s: number };
    expect(rows.c).toBe(2);
    expect(rows.s).toBe(12); // inv: 6, ip: 6
    void limiter;
  });

  it('rotating invitation tokens cannot bypass the aggregate IP limit', async () => {
    for (let i = 0; i < 20; i += 1) {
      await verifyClaimCodeController({ token: `rotating-${i}`, claimCode: 'KKKKKKKKKK' }, ctx(t.db));
    }
    const res = (await verifyClaimCodeController({ token: LINK_TOKEN, claimCode: CODE_AVA }, ctx(t.db))) as Response;
    expect(res.status).toBe(429);
    // 21 ip increments across distinct invitation keys
    const ipRows = t.sqlite.prepare("SELECT SUM(count) s FROM rate_limits WHERE key LIKE 'rl:enroll:verify:ip:%'").get() as { s: number };
    expect(ipRows.s).toBe(21);
  });

  it('concurrent increments do not lose counts', async () => {
    const limiter = new D1RateLimiter(t.db as never);
    await Promise.all(
      Array.from({ length: 7 }, () => limiter.check([{ scope: 'test', subject: 'subj', max: 100, windowMs: 60_000 }])),
    );
    const row = t.sqlite.prepare('SELECT count FROM rate_limits').get() as { count: number };
    expect(row.count).toBe(7);
  });
});

describe('Worker lifecycle and security (S3c-5)', () => {
  let t: ReturnType<typeof build>;
  let ip: string;
  beforeEach(() => {
    t = build();
    ip = crypto.randomUUID();
    t.sqlite.exec(readFileSync(join(MIGRATIONS, '019_observability.sql'), 'utf8'));
    t.sqlite.exec(readFileSync(join(MIGRATIONS, '005_organization.sql'), 'utf8'));
    t.sqlite.prepare("UPDATE users SET password_hash=?, password_salt=? WHERE id='u-lead'").run(credential('staff password', OLD_PHRASE_SALT), OLD_PHRASE_SALT);
    t.sqlite.exec("UPDATE roles SET permissions='[\"messages.send\"]' WHERE name='student'");
  });

  async function request(path: string, body?: unknown, cookie?: string, method = body === undefined ? 'GET' : 'POST') {
    const pending: Promise<unknown>[] = [];
    const response = await worker.fetch(new Request(`https://worker.test${path}`, {
      method,
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip, ...(cookie ? { Cookie: cookie } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }), { DB: t.db, SESSION_SECRET: 'test-secret-at-least-thirty-two-characters', COOKIE_SECURE: 'true', ENVIRONMENT: 'test' }, {
      waitUntil: (promise) => { pending.push(promise); },
    });
    await Promise.all(pending);
    return response;
  }
  afterEach(() => vi.restoreAllMocks());
  const cookieOf = (response: Response) => response.headers.get('set-cookie')!.split(';')[0];
  async function dataOf(response: Response) {
    expect(response.status).toBe(200);
    const body = await response.json() as { success: boolean; data: any };
    expect(body.success).toBe(true);
    return body.data.data ?? body.data;
  }

  it.each(['individual', 'school_link'])('complete roster/import → %s → enrollment → login/logout → reset lifecycle', async (kind) => {
    const staff = cookieOf(await request('/auth/login', { email: 'lead@x.co', password: 'staff password' }));
    const roster = await dataOf(await request('/rosters', { name: 'Lifecycle' }, staff));
    const csv = 'name\nLifecycle Student\nSecond Student';
    const preview = await dataOf(await request(`/rosters/${roster.id}/import/preview`, { csv }, staff));
    const imported = await dataOf(await request(`/rosters/${roster.id}/import/commit`, { csv, importId: preview.importId }, staff));
    expect(imported.imported).toBe(2);
    const entries = await dataOf(await request(`/rosters/${roster.id}/entries`, undefined, staff));
    const entry = entries.find((e: any) => e.displayName === 'Lifecycle Student');
    const { claimCode } = await dataOf(await request('/invitations/claim-code', { rosterEntryId: entry.id }, staff));
    const { token } = await dataOf(await request(kind === 'individual' ? '/invitations' : '/invitations/school-link', { rosterEntryId: entry.id }, staff));
    const resolved = await dataOf(await request('/enroll/resolve', { token }));
    expect(Object.keys(resolved).sort()).toEqual(['expiresAt', 'kind']);
    expect(resolved.kind).toBe(kind);
    const verified = await dataOf(await request('/enroll/verify', { token, claimCode }));
    expect(verified.displayName).toBe('Lifecycle Student');
    const phrase = 'lifecycle secret phrase';
    const claimed = await request('/enroll/claim', { grantToken: verified.grantToken, accessPhrase: phrase });
    const claimCookie = cookieOf(claimed);
    const identity = await dataOf(claimed);
    expect(identity.publicId).toMatch(/^stu_[A-Za-z0-9]{16}$/);
    expect(claimed.headers.get('set-cookie')).toContain('HttpOnly; SameSite=Strict');
    expect(claimed.headers.get('set-cookie')).toContain('Secure');
    const restored = await dataOf(await request('/auth/me', undefined, claimCookie));
    expect(restored.publicId).toBe(identity.publicId);
    expect(restored).not.toHaveProperty('email');
    expect(restored).not.toHaveProperty('password_hash');
    expect(restored).not.toHaveProperty('password_salt');
    const login = await request('/auth/login', { publicId: identity.publicId, accessPhrase: phrase });
    const loginCookie = cookieOf(login);
    await dataOf(login);
    const loggedOut = await request('/auth/logout', {}, loginCookie);
    expect(loggedOut.headers.get('set-cookie')).toContain('Max-Age=0');
    expect((await request('/auth/me', undefined, loginCookie)).status).toBe(401);
    expect((await request('/access/reset/initiate', { userId: restored.id }, claimCookie)).status).toBe(403);
    expect((await request('/rosters', undefined, claimCookie)).status).toBe(403);
    await expect(new MessageService(new MessageRepository(t.db)).sendMessage({ recipientId: 'u-lead', body: 'hello' }, restored.id)).rejects.toThrow('Students cannot initiate conversations');
    const reset = await dataOf(await request('/access/reset/initiate', { userId: restored.id }, staff));
    await dataOf(await request('/access/reset', { resetToken: reset.resetToken, accessPhrase: 'replacement secret phrase' }));
    expect((await request('/auth/me', undefined, claimCookie)).status).toBe(401);
    expect((await request('/auth/login', { publicId: identity.publicId, accessPhrase: phrase })).status).toBe(401);
    await dataOf(await request('/auth/login', { publicId: identity.publicId, accessPhrase: 'replacement secret phrase' }));
    expect((await request('/access/reset', { resetToken: reset.resetToken, accessPhrase: 'third secret phrase' })).status).toBe(400);
    expect((await request('/enroll/claim', { grantToken: verified.grantToken, accessPhrase: phrase })).status).toBe(400);
    expect((await request('/enroll/resolve', { token })).status).toBe(kind === 'individual' ? 400 : 200);
    const audit = JSON.stringify(t.sqlite.prepare('SELECT * FROM audit_logs').all());
    for (const secret of [token, claimCode, verified.grantToken, reset.resetToken, phrase, 'replacement secret phrase', 'students.sparknc.internal']) expect(audit).not.toContain(secret);
  });

  it('preserves Retry-After through Worker standardization and CORS wrapping', async () => {
    for (let i = 0; i < 5; i += 1) await request('/enroll/verify', { token: 'invalid', claimCode: CODE_AVA });
    const response = await request('/enroll/verify', { token: 'invalid', claimCode: CODE_AVA });
    expect(response.status).toBe(429);
    expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(await response.json()).toMatchObject({ success: false, error: { code: 'RATE_LIMIT' } });
  });

  it.each([
    ['/enroll/verify', { token: 'missing', claimCode: CODE_AVA }, 'enroll:verify:inv'],
    ['/enroll/claim', { grantToken: 'missing', accessPhrase: 'alpha beta gamma' }, 'enroll:claim:grant'],
    ['/auth/login', { publicId: 'stu_aaaaaaaaaaaaaaaa', accessPhrase: 'alpha beta gamma' }, 'auth:login:acct'],
    ['/access/reset', { resetToken: 'missing', accessPhrase: 'alpha beta gamma' }, 'reset:complete:tok'],
  ])('enforces account/token thresholds with retained increments for %s', async (path, body, scope) => {
    for (let i = 0; i < 5; i += 1) expect((await request(path as string, body)).status).not.toBe(429);
    const over = await request(path as string, body);
    expect(over.status).toBe(429);
    expect(Number(over.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(t.sqlite.prepare('SELECT count FROM rate_limits WHERE key LIKE ?').get(`rl:${scope}:%`)).toMatchObject({ count: 6 });
    expect(t.sqlite.prepare('SELECT SUM(count) n FROM rate_limits').get()).toMatchObject({ n: 12 });
  });

  it.each([
    ['/enroll/resolve', 30], ['/enroll/verify', 20], ['/enroll/claim', 20], ['/auth/login', 20], ['/access/reset', 20],
  ])('rotating subjects cannot bypass the IP threshold for %s', async (path, max) => {
    for (let i = 0; i <= Number(max); i += 1) {
      const body = { token: `token-${i}`, claimCode: CODE_AVA, grantToken: `grant-${i}`, publicId: `stu_${String(i).padStart(16, '0')}`, accessPhrase: 'alpha beta gamma', resetToken: `reset-${i}` };
      expect((await request(String(path), body)).status).toBe(i === max ? 429 : path === '/auth/login' ? 401 : 400);
    }
  });

  it('reset-initiation throttles existing and missing targets identically', async () => {
    const staff = cookieOf(await request('/auth/login', { email: 'lead@x.co', password: 'staff password' }));
    for (const target of ['u-stu', 'missing-student']) {
      for (let i = 0; i < 3; i += 1) await request('/access/reset/initiate', { userId: target }, staff);
      const over = await request('/access/reset/initiate', { userId: target }, staff);
      expect(over.status).toBe(429);
      expect(await over.json()).toMatchObject({ success: false, error: { code: 'RATE_LIMIT', message: 'Too many attempts. Try again later.' } });
    }
  });

  it('concurrent reset completions consume the token once', async () => {
    const reset = await t.reset.initiate('u-stu', lead1);
    const results = await Promise.allSettled([t.reset.complete(reset.resetToken, 'first new phrase'), t.reset.complete(reset.resetToken, 'second new phrase')]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM reset_consumptions').get()).toMatchObject({ n: 1 });
    expect(t.sqlite.prepare("SELECT COUNT(*) n FROM audit_logs WHERE action='access.reset.complete'").get()).toMatchObject({ n: 1 });
  });

  it('fails closed with retry guidance when the student login limiter is unavailable', async () => {
    vi.spyOn(D1RateLimiter.prototype, 'check').mockRejectedValueOnce(new Error('SQLITE_BUSY internal detail'));
    const response = await request('/auth/login', { publicId: 'stu_aaaaaaaaaaaaaaaa', accessPhrase: 'alpha beta gamma' });
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('60');
    expect(JSON.stringify(await response.json())).not.toContain('SQLITE_BUSY');
  });

  it('does not allow synthetic-email login to bypass student authentication', async () => {
    const verified = await t.enrollment.verifyClaimCode(INV_TOKEN, CODE_AVA);
    const student = await t.enrollment.claim(verified.grantToken, 'alpha beta gamma');
    const email = `${student.publicId.toLowerCase()}@students.sparknc.internal`;
    t.sqlite.prepare('UPDATE users SET email=? WHERE id=(SELECT user_id FROM student_public_ids WHERE public_id=?)').run(email, student.publicId);
    expect((await request('/auth/login', { email, password: 'alpha beta gamma' })).status).toBe(401);
    t.sqlite.prepare('UPDATE users SET is_active=0 WHERE id=(SELECT user_id FROM student_public_ids WHERE public_id=?)').run(student.publicId);
    expect((await request('/auth/login', { publicId: student.publicId, accessPhrase: 'alpha beta gamma' })).status).toBe(401);
  });

  it('serializes competing claims and grant issuance without orphan accounts or exceeding the cap', async () => {
    const grants = await Promise.all([t.enrollment.verifyClaimCode(INV_TOKEN, CODE_AVA), t.enrollment.verifyClaimCode(INV_TOKEN, CODE_AVA)]);
    const results = await Promise.allSettled(grants.map((g) => t.enrollment.claim(g.grantToken, 'alpha beta gamma')));
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM enrollments').get()).toMatchObject({ n: 1 });
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM student_public_ids').get()).toMatchObject({ n: 1 });
    expect(t.sqlite.prepare("SELECT COUNT(*) n FROM verification_grants WHERE used_at IS NOT NULL").get()).toMatchObject({ n: 1 });
    const cap = await Promise.allSettled(Array.from({ length: 21 }, () => t.enrollment.verifyClaimCode(LINK_TOKEN, CODE_SAM)));
    expect(cap.filter((r) => r.status === 'fulfilled')).toHaveLength(20);
    expect(t.sqlite.prepare("SELECT COUNT(*) n FROM verification_grants WHERE invitation_id='i-link'").get()).toMatchObject({ n: 20 });
  });

  it('rejects expired grants and resets with school changes without partial state', async () => {
    const grant = await t.enrollment.verifyClaimCode(INV_TOKEN, CODE_AVA);
    t.sqlite.exec("UPDATE verification_grants SET expires_at='2000-01-01T00:00:00.000Z'");
    expect((await request('/enroll/claim', { grantToken: grant.grantToken, accessPhrase: 'alpha beta gamma' })).status).toBe(400);
    const reset = await t.reset.initiate('u-stu', lead1);
    t.sqlite.exec("UPDATE users SET school_id='school-2' WHERE id='u-stu'");
    expect((await request('/access/reset', { resetToken: reset.resetToken, accessPhrase: 'alpha beta gamma' })).status).toBe(400);
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM reset_consumptions').get()).toMatchObject({ n: 0 });
    expect(t.sqlite.prepare("SELECT revoked_at FROM sessions WHERE id='sess-old'").get()).toMatchObject({ revoked_at: null });
    expect(t.sqlite.prepare('SELECT used_at FROM access_reset_requests').get()).toMatchObject({ used_at: null });
    t.sqlite.exec("UPDATE users SET school_id='school-1' WHERE id='u-stu'; UPDATE access_reset_requests SET expires_at='2000-01-01T00:00:00.000Z'");
    expect((await request('/access/reset', { resetToken: reset.resetToken, accessPhrase: 'alpha beta gamma' })).status).toBe(400);
  });

  it('rolls back claim and reset credentials, consumption, and sessions when the final audit write fails', async () => {
    const grant = await t.enrollment.verifyClaimCode(INV_TOKEN, CODE_AVA);
    const reset = await t.reset.initiate('u-stu', lead1);
    const before = t.sqlite.prepare("SELECT password_hash,password_salt FROM users WHERE id='u-stu'").get();
    t.sqlite.exec("CREATE TRIGGER fail_security_audit BEFORE INSERT ON audit_logs WHEN NEW.action IN ('enrollment.claim','access.reset.complete') BEGIN SELECT RAISE(ABORT,'test audit failure'); END");
    expect((await request('/enroll/claim', { grantToken: grant.grantToken, accessPhrase: 'alpha beta gamma' })).status).toBe(400);
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM student_public_ids').get()).toMatchObject({ n: 0 });
    expect(t.sqlite.prepare('SELECT used_at FROM verification_grants').get()).toMatchObject({ used_at: null });
    expect((await request('/access/reset', { resetToken: reset.resetToken, accessPhrase: 'brand new phrase' })).status).toBe(400);
    expect(t.sqlite.prepare("SELECT password_hash,password_salt FROM users WHERE id='u-stu'").get()).toEqual(before);
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM reset_consumptions').get()).toMatchObject({ n: 0 });
    expect(t.sqlite.prepare('SELECT used_at FROM access_reset_requests').get()).toMatchObject({ used_at: null });
    expect(t.sqlite.prepare("SELECT revoked_at FROM sessions WHERE id='sess-old'").get()).toMatchObject({ revoked_at: null });
  });

  it.each(['u-stu', 'u-lead'])('suspension stops an existing %s session at the Worker boundary', async (userId) => {
    const cookie = userId === 'u-stu' ? 'sparknc_session=sess-old' : cookieOf(await request('/auth/login', { email: 'lead@x.co', password: 'staff password' }));
    expect((await request('/auth/me', undefined, cookie)).status).toBe(200);
    t.sqlite.prepare('UPDATE users SET is_active=0 WHERE id=?').run(userId);
    expect((await request('/auth/me', undefined, cookie)).status).toBe(401);
    expect((await request('/rosters', undefined, cookie)).status).toBe(401);
    expect((await request('/auth/logout', {}, cookie)).headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it.each(["is_active=0", "role='lab_leader'", "school_id='school-2'"])('reset issuance rechecks %s inside its batch and preserves the previous request', async (change) => {
    const previous = await t.reset.initiate('u-stu', lead1);
    const before = t.sqlite.prepare('SELECT * FROM access_reset_requests').all();
    const batch = t.db.batch.bind(t.db);
    vi.spyOn(t.db, 'batch').mockImplementationOnce((statements) => {
      t.sqlite.exec(`UPDATE users SET ${change} WHERE id='u-stu'`);
      return batch(statements);
    });
    await expect(t.reset.initiate('u-stu', lead1)).rejects.toThrow();
    expect(t.sqlite.prepare('SELECT * FROM access_reset_requests').all()).toEqual(before);
    expect(t.sqlite.prepare("SELECT COUNT(*) n FROM audit_logs WHERE action='access.reset.initiate'").get()).toMatchObject({ n: 1 });
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM claim_probe').get()).toMatchObject({ n: 0 });
    expect(previous.resetToken).toBeTruthy();
  });

  it.each(['SQLITE_BUSY: database is locked', 'SQLITE_BUSY_SNAPSHOT', 'SQLITE_LOCKED: database table is locked', 'D1_ERROR: D1 DB is overloaded. Too many requests queued.'])('returns safe retry guidance for transient grant/claim errors: %s', async (message) => {
    const grant = await t.enrollment.verifyClaimCode(INV_TOKEN, CODE_AVA);
    vi.spyOn(t.db, 'batch').mockRejectedValueOnce(new Error(message));
    const verify = await request('/enroll/verify', { token: INV_TOKEN, claimCode: CODE_AVA });
    expect(verify.status).toBe(503);
    expect(verify.headers.get('retry-after')).toBe('1');
    expect(await verify.json()).toMatchObject({ error: { code: 'RETRY_LATER', message: 'Temporarily unavailable. Try again shortly.' } });
    vi.spyOn(t.db, 'batch').mockRejectedValueOnce(new Error(message));
    const claim = await request('/enroll/claim', { grantToken: grant.grantToken, accessPhrase: 'alpha beta gamma' });
    expect(claim.status).toBe(503);
    expect(claim.headers.get('retry-after')).toBe('1');
    expect(JSON.stringify(await claim.json())).not.toContain('SQLITE');
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM enrollments').get()).toMatchObject({ n: 0 });
  });

  it('handles nested transient read errors before the grant and claim batches', async () => {
    const grant = await t.enrollment.verifyClaimCode(INV_TOKEN, CODE_AVA);
    const busy = Object.assign(new Error('D1_ERROR'), { cause: Object.assign(new Error('contention'), { code: 'SQLITE_BUSY' }) });
    vi.spyOn(EnrollmentRepository.prototype, 'findActiveInvitationByTokenHash').mockRejectedValueOnce(busy);
    expect((await request('/enroll/verify', { token: INV_TOKEN, claimCode: CODE_AVA })).status).toBe(503);
    vi.spyOn(EnrollmentRepository.prototype, 'findGrantIdentityByTokenHash').mockRejectedValueOnce(busy);
    expect((await request('/enroll/claim', { grantToken: grant.grantToken, accessPhrase: 'alpha beta gamma' })).status).toBe(503);
  });

  it('rolls back a late claim contention failure and permits retry with the same grant', async () => {
    const grant = await t.enrollment.verifyClaimCode(INV_TOKEN, CODE_AVA);
    t.sqlite.exec("CREATE TRIGGER fail_claim_session BEFORE INSERT ON sessions BEGIN SELECT RAISE(ABORT,'SQLITE_BUSY: database is locked'); END");
    const failed = await request('/enroll/claim', { grantToken: grant.grantToken, accessPhrase: 'alpha beta gamma' });
    expect(failed.status).toBe(503);
    expect(failed.headers.get('retry-after')).toBe('1');
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM enrollments').get()).toMatchObject({ n: 0 });
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM student_public_ids').get()).toMatchObject({ n: 0 });
    expect(t.sqlite.prepare('SELECT used_at FROM verification_grants').get()).toMatchObject({ used_at: null });
    t.sqlite.exec('DROP TRIGGER fail_claim_session');
    await dataOf(await request('/enroll/claim', { grantToken: grant.grantToken, accessPhrase: 'alpha beta gamma' }));
    expect(t.sqlite.prepare('SELECT COUNT(*) n FROM enrollments').get()).toMatchObject({ n: 1 });
  });

  it('admin may issue cross-school resets but must also pass the transactional active-student checks', async () => {
    await expect(t.reset.initiate('u-stu2', admin)).resolves.toHaveProperty('resetToken');
    const before = t.sqlite.prepare('SELECT * FROM access_reset_requests').all();
    const batch = t.db.batch.bind(t.db);
    vi.spyOn(t.db, 'batch').mockImplementationOnce((statements) => {
      t.sqlite.exec("UPDATE users SET is_active=0 WHERE id='u-stu2'");
      return batch(statements);
    });
    await expect(t.reset.initiate('u-stu2', admin)).rejects.toThrow();
    expect(t.sqlite.prepare('SELECT * FROM access_reset_requests').all()).toEqual(before);
  });

  it('distinguishes a valid full grant cap from invalid codes and non-transient constraints', async () => {
    for (let i = 0; i < 20; i += 1) await t.enrollment.verifyClaimCode(LINK_TOKEN, CODE_SAM);
    const cap = await request('/enroll/verify', { token: LINK_TOKEN, claimCode: CODE_SAM });
    expect(cap.status).toBe(429);
    expect(cap.headers.get('retry-after')).toBeTruthy();
    expect(await cap.json()).toMatchObject({ error: { code: 'CAP_EXCEEDED' } });
    const invalid = await request('/enroll/verify', { token: LINK_TOKEN, claimCode: 'KKKKKKKKKK' });
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ error: { code: 'INVALID_CODE' } });
    vi.spyOn(t.db, 'batch').mockRejectedValueOnce(new Error('UNIQUE constraint failed: verification_grants.id'));
    const constraint = await request('/enroll/verify', { token: INV_TOKEN, claimCode: CODE_AVA });
    expect(constraint.status).toBe(400);
    expect(constraint.headers.get('retry-after')).toBeNull();
  });

  it('management routes require sessions and public methods are exact', async () => {
    expect([...PUBLIC_METHOD_PATHS].sort()).toEqual(['POST /access/reset', 'POST /enroll/claim', 'POST /enroll/resolve', 'POST /enroll/verify']);
    for (const path of ['/rosters', '/invitations']) expect((await request(path)).status).toBe(401);
    expect((await request('/access/reset/initiate', { userId: 'u-stu' })).status).toBe(401);
    expect((await request('/auth/register', {})).status).toBe(403);
    for (const path of ['/enroll/resolve', '/enroll/verify', '/enroll/claim', '/access/reset']) expect((await request(path)).status).toBe(404);
  });
});

describe('public route policy', () => {
  it('exposes only the exact required method+path combinations', () => {
    for (const p of ['POST /enroll/resolve', 'POST /enroll/verify', 'POST /enroll/claim', 'POST /access/reset']) {
      expect(PUBLIC_METHOD_PATHS.has(p)).toBe(true);
    }
    for (const p of ['GET /enroll/resolve', 'PUT /enroll/claim', 'POST /access/reset/initiate', 'GET /access/reset', 'POST /invitations']) {
      expect(PUBLIC_METHOD_PATHS.has(p)).toBe(false);
    }
  });

  it('/auth/register remains invitation-gated', async () => {
    const res = (await registerController({ email: 'a@b.co', password: 'password123', name: 'N' })) as Response;
    expect(res.status).toBe(403);
  });

  it('lab_leader role carries students.reset_access after migrations', async () => {
    const t = build();
    const perms = createPermissionService(t.db as never);
    expect(await perms.hasPermission('lab_leader' as never, 'students.reset_access' as never)).toBe(true);
  });
});

describe('access reset (S3c-4)', () => {
  let t: ReturnType<typeof build>;
  beforeEach(() => {
    t = build();
  });

  it('initiates within school scope; admin may cross schools; returns token once', async () => {
    const res = (await initiateResetController({ userId: 'u-stu' }, ctx(t.db, lead1))) as { ok: boolean; data: { resetToken: string } };
    expect(res.ok).toBe(true);
    expect(res.data.resetToken.length).toBeGreaterThan(30);
    const stored = t.sqlite.prepare('SELECT * FROM access_reset_requests').get() as Record<string, unknown>;
    expect(stored.token_hash).toBe(sha(res.data.resetToken));
    expect(JSON.stringify(stored)).not.toContain(res.data.resetToken);
    // audit row exists without secrets
    const audit = t.sqlite.prepare("SELECT * FROM audit_logs WHERE action='access.reset.initiate'").get() as Record<string, unknown>;
    expect(audit).toBeTruthy();
    expect(JSON.stringify(audit)).not.toContain(res.data.resetToken);

    const cross = (await initiateResetController({ userId: 'u-stu2' }, ctx(t.db, lead1))) as Response;
    expect(cross.status).toBe(403);
    const asAdmin = (await initiateResetController({ userId: 'u-stu2' }, ctx(t.db, admin))) as { ok: boolean };
    expect(asAdmin.ok).toBe(true);
    void lead2;
  });

  it('rejects initiation for non-students and inactive students', async () => {
    for (const uid of ['u-lead', 'u-inactive', 'missing']) {
      const res = (await initiateResetController({ userId: uid }, ctx(t.db, lead1))) as Response;
      expect(res.status).toBe(400);
    }
    expect((t.sqlite.prepare('SELECT COUNT(*) c FROM access_reset_requests').get() as { c: number }).c).toBe(0);
  });

  it('completes a reset: rotates credentials, revokes all sessions, audits without secrets', async () => {
    const init = (await initiateResetController({ userId: 'u-stu' }, ctx(t.db, lead1))) as { data: { resetToken: string } };
    const done = (await completeResetController({ resetToken: init.data.resetToken, accessPhrase: 'brand new phrase' }, ctx(t.db))) as { ok: boolean };
    expect(done.ok).toBe(true);

    const session = t.sqlite.prepare("SELECT * FROM sessions WHERE id='sess-old'").get() as Record<string, unknown>;
    expect(session.revoked_at).not.toBeNull();
    const user = t.sqlite.prepare("SELECT * FROM users WHERE id='u-stu'").get() as Record<string, unknown>;
    expect(user.password_salt).not.toBe(OLD_PHRASE_SALT);
    const audit = t.sqlite.prepare("SELECT * FROM audit_logs WHERE action='access.reset.complete'").get() as Record<string, unknown>;
    expect(audit).toBeTruthy();
    expect(JSON.stringify(audit)).not.toContain(init.data.resetToken);
    expect(JSON.stringify(audit)).not.toContain('brand new phrase');
  });

  it('rejects replay, expiry, and unknown tokens; expired records do not block reissue', async () => {
    const init = (await initiateResetController({ userId: 'u-stu' }, ctx(t.db, lead1))) as { data: { resetToken: string } };
    await completeResetController({ resetToken: init.data.resetToken, accessPhrase: 'brand new phrase' }, ctx(t.db));
    const replay = (await completeResetController({ resetToken: init.data.resetToken, accessPhrase: 'another new phrase' }, ctx(t.db))) as Response;
    expect(replay.status).toBe(400);

    // expired prior request does not block issuing a new one
    t.sqlite.exec(`INSERT INTO access_reset_requests (id,user_id,school_id,requested_by,token_hash,expires_at,created_at)
      VALUES ('r-old','u-stu2','school-2','u-lead2','${sha('old-tok')}','2000-01-01T00:00:00.000Z','t')`);
    const reissue = await t.reset.initiate('u-stu2', admin);
    expect(reissue.resetToken).toBeTruthy();
    const old = t.sqlite.prepare("SELECT * FROM access_reset_requests WHERE id='r-old'").get() as Record<string, unknown>;
    expect(old.revoked_at).not.toBeNull();

    const expired = (await completeResetController({ resetToken: 'old-tok', accessPhrase: 'any new phrase' }, ctx(t.db))) as Response;
    expect(expired.status).toBe(400);
    const unknown = (await completeResetController({ resetToken: 'ghost', accessPhrase: 'any new phrase' }, ctx(t.db))) as Response;
    expect(unknown.status).toBe(400);
  });

  it('rate limits reset initiation per staff account, target, and IP; all keys increment when one is over', async () => {
    // target limit: 3 allowed initiations for u-stu, 4th rejected even
    // though staff and IP keys are under their limits.
    for (let i = 0; i < 3; i += 1) {
      const res = (await initiateResetController({ userId: 'u-stu' }, ctx(t.db, lead1))) as { ok: boolean };
      expect(res.ok).toBe(true);
    }
    const over = (await initiateResetController({ userId: 'u-stu' }, ctx(t.db, lead1))) as Response;
    expect(over.status).toBe(429);
    const rows = t.sqlite.prepare("SELECT key, count FROM rate_limits WHERE key LIKE 'rl:reset:init:%' ORDER BY key").all() as { key: string; count: number }[];
    expect(rows).toHaveLength(3); // staff, target, ip — all incremented every call
    expect(rows.every((r) => r.count === 4)).toBe(true);
    // keys are hashed — never contain the raw user id
    expect(JSON.stringify(rows)).not.toContain('u-stu');
    expect(JSON.stringify(rows)).not.toContain('u-lead');
  });

  it('staff-account limit caps initiations regardless of target rotation', async () => {
    for (let i = 0; i < 10; i += 1) {
      // rotate targets AND ips — only the staff key accumulates
      await initiateResetController({ userId: `rotating-${i}` }, ctx(t.db, { ...lead1, headers: new Headers({ 'cf-connecting-ip': `10.0.0.${i}` }) }));
    }
    const res = (await initiateResetController({ userId: 'u-stu' }, ctx(t.db, { ...lead1, headers: new Headers({ 'cf-connecting-ip': '10.9.9.9' }) }))) as Response;
    expect(res.status).toBe(429);
  });

  it('IP limit caps initiations regardless of staff rotation', async () => {
    for (let i = 0; i < 20; i += 1) {
      await initiateResetController({ userId: `t-${i}` }, ctx(t.db, { userId: `staff-${i}`, role: 'lab_leader', schoolId: 'school-1' }));
    }
    const res = (await initiateResetController({ userId: 'u-stu' }, ctx(t.db, lead1))) as Response;
    expect(res.status).toBe(429);
    const ipRow = t.sqlite.prepare("SELECT count FROM rate_limits WHERE key LIKE 'rl:reset:init:ip:%'").get() as { count: number };
    expect(ipRow.count).toBe(21);
  });

  it('rolls back everything when the target becomes invalid between issue and completion', async () => {
    const init = (await initiateResetController({ userId: 'u-stu' }, ctx(t.db, lead1))) as { data: { resetToken: string } };
    t.sqlite.exec("UPDATE users SET is_active=0 WHERE id='u-stu'");
    const res = (await completeResetController({ resetToken: init.data.resetToken, accessPhrase: 'brand new phrase' }, ctx(t.db))) as Response;
    expect(res.status).toBe(400);
    // nothing changed: token unused, no consumption marker, session intact, no audit
    const req = t.sqlite.prepare('SELECT * FROM access_reset_requests').get() as Record<string, unknown>;
    expect(req.used_at).toBeNull();
    expect((t.sqlite.prepare('SELECT COUNT(*) c FROM reset_consumptions').get() as { c: number }).c).toBe(0);
    const session = t.sqlite.prepare("SELECT * FROM sessions WHERE id='sess-old'").get() as Record<string, unknown>;
    expect(session.revoked_at).toBeNull();
    expect((t.sqlite.prepare("SELECT COUNT(*) c FROM audit_logs WHERE action='access.reset.complete'").get() as { c: number }).c).toBe(0);
  });
});
