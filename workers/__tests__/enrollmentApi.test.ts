import { describe, it, expect, beforeEach } from 'vitest';
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
import { PUBLIC_METHOD_PATHS } from '../index';

const MIGRATIONS = join(__dirname, '..', 'database', 'migrations');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

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
