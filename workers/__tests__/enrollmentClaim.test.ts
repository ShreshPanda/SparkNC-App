import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { EnrollmentRepository } from '../api/repositories/EnrollmentRepository';
import { EnrollmentService } from '../api/services/enrollmentService';

const MIGRATIONS = join(__dirname, '..', 'database', 'migrations');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

type Bound = { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> };

// Minimal D1-API adapter over node:sqlite: batch() executes the bound
// statements inside a real transaction — errors roll back everything,
// mirroring D1 semantics closely enough for these tests.
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
        const out = [];
        for (const s of stmts) out.push(await s.run());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

const INV_TOKEN = 'inv-token-aaa';
const LINK_TOKEN = 'link-token-bbb';
const CODE_AVA = '23456789AB'; // matches claim-code alphabet/pattern
const CODE_SAM = 'BCDEFGHJKM';
const CODE_OTHER_SCHOOL = 'NPQRSTUVWX';

function build() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  for (const f of ['001_initial.sql', '002_sessions.sql', '009_audit_logs.sql', '023_enrollment.sql', '024_enrollment_claim.sql']) {
    sqlite.exec(readFileSync(join(MIGRATIONS, f), 'utf8'));
  }
  sqlite.exec(`
    INSERT INTO schools (id, name, slug, created_at, updated_at) VALUES
      ('school-1','Alpha Lab','alpha','t','t'), ('school-2','Beta Lab','beta','t','t');
    INSERT INTO users (id, email, name, role, school_id, is_active, created_at, updated_at) VALUES
      ('u-lead','lead@x.co','Lead','lab_leader','school-1',1,'t','t');
    INSERT INTO rosters VALUES ('r1','school-1','Fall','u-lead','t','t'), ('r2','school-2','Fall','u-lead','t','t');
    INSERT INTO roster_entries (id,roster_id,school_id,display_name,status,claim_code_hash,created_at,updated_at) VALUES
      ('e-ava','r1','school-1','Ava Reyes','pending','${sha(CODE_AVA)}','t','t'),
      ('e-sam','r1','school-1','Sam Cho','pending','${sha(CODE_SAM)}','t','t'),
      ('e-zed','r2','school-2','Zed Park','pending','${sha(CODE_OTHER_SCHOOL)}','t','t');
    INSERT INTO invitations (id,roster_entry_id,school_id,kind,token_hash,created_by,expires_at,created_at) VALUES
      ('i-ava','e-ava','school-1','individual','${sha(INV_TOKEN)}','u-lead','2999-01-01T00:00:00.000Z','t'),
      ('i-link',NULL,'school-1','school_link','${sha(LINK_TOKEN)}','u-lead','2999-01-01T00:00:00.000Z','t');
  `);
  const db = d1(sqlite);
  return { sqlite, service: new EnrollmentService(new EnrollmentRepository(db as never)) };
}

describe('enrollment claim pipeline (S3c-2)', () => {
  let ctx: ReturnType<typeof build>;
  beforeEach(() => {
    ctx = build();
  });

  it('resolves an invitation without disclosing name or school', async () => {
    const resolved = await ctx.service.resolveInvitation(INV_TOKEN);
    expect(resolved.kind).toBe('individual');
    expect(Object.keys(resolved).sort()).toEqual(['expiresAt', 'kind']);
    await expect(ctx.service.resolveInvitation('nope')).rejects.toThrow(/invalid/i);
  });

  it('verify + claim happy path: atomic account, entry claim, invitation consume, session, audit', async () => {
    const { grantToken, displayName, schoolName } = await ctx.service.verifyClaimCode(INV_TOKEN, CODE_AVA);
    expect(displayName).toBe('Ava Reyes');
    expect(schoolName).toBe('Alpha Lab');

    // raw grant token is never stored — only its hash
    const grantRow = ctx.sqlite.prepare('SELECT * FROM verification_grants').get() as Record<string, unknown>;
    expect(grantRow.token_hash).toBe(sha(grantToken));
    expect(grantRow.token_hash).not.toBe(grantToken);

    const result = await ctx.service.claim(grantToken, 'my  secure   phrase');
    expect(result.publicId).toMatch(/^stu_[A-Za-z0-9]{16}$/);
    expect(result.sessionId).toMatch(/^sess-/);
    expect(result).not.toHaveProperty('syntheticEmail');
    expect(result).not.toHaveProperty('email');

    const user = ctx.sqlite.prepare("SELECT * FROM users WHERE id = (SELECT user_id FROM enrollments)").get() as Record<string, unknown>;
    expect(user.role).toBe('student');
    expect(user.school_id).toBe('school-1');
    expect(user.email).toBe(`${result.publicId}@students.sparknc.internal`);
    expect(String(user.password_hash)).toMatch(/^pbkdf2:100000:/);

    const entry = ctx.sqlite.prepare("SELECT * FROM roster_entries WHERE id='e-ava'").get() as Record<string, unknown>;
    expect(entry.status).toBe('claimed');
    expect(entry.claimed_user_id).toBe(user.id);

    const invite = ctx.sqlite.prepare("SELECT * FROM invitations WHERE id='i-ava'").get() as Record<string, unknown>;
    expect(invite.claimed_at).not.toBeNull();

    const session = ctx.sqlite.prepare('SELECT * FROM sessions WHERE id = ?').get(result.sessionId) as Record<string, unknown>;
    expect(session.user_id).toBe(user.id);
    expect(session.revoked_at).toBeNull();

    const audit = ctx.sqlite.prepare("SELECT * FROM audit_logs WHERE action='enrollment.claim'").get() as Record<string, unknown>;
    expect(audit.entity_id).toBe('e-ava');
    expect(JSON.stringify(audit)).not.toContain(grantToken);

    const pub = ctx.sqlite.prepare('SELECT * FROM student_public_ids').get() as Record<string, unknown>;
    expect(pub.public_id).toBe(result.publicId);
    expect(pub.user_id).toBe(user.id);

    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM claim_probe').get() as { c: number }).c).toBe(0);
  });

  it('rejects a wrong claim code and writes no grant', async () => {
    await expect(ctx.service.verifyClaimCode(INV_TOKEN, 'KKKKKKKKKK')).rejects.toThrow(/invalid code/i);
    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM verification_grants').get() as { c: number }).c).toBe(0);
  });

  it('individual invitation rejects a code bound to a different entry', async () => {
    await expect(ctx.service.verifyClaimCode(INV_TOKEN, CODE_SAM)).rejects.toThrow(/invalid code/i);
  });

  it('school link verifies any pending entry in its school but never cross-school', async () => {
    const v = await ctx.service.verifyClaimCode(LINK_TOKEN, CODE_SAM);
    expect(v.displayName).toBe('Sam Cho');
    await expect(ctx.service.verifyClaimCode(LINK_TOKEN, CODE_OTHER_SCHOOL)).rejects.toThrow(/invalid code/i);
  });

  it('school link stays reusable across multiple independent claims', async () => {
    const a = await ctx.service.verifyClaimCode(LINK_TOKEN, CODE_AVA);
    const b = await ctx.service.verifyClaimCode(LINK_TOKEN, CODE_SAM);
    const ra = await ctx.service.claim(a.grantToken, 'alpha beta gamma');
    const rb = await ctx.service.claim(b.grantToken, 'delta epsilon zeta');
    expect(ra.publicId).not.toBe(rb.publicId);
    const invite = ctx.sqlite.prepare("SELECT * FROM invitations WHERE id='i-link'").get() as Record<string, unknown>;
    expect(invite.claimed_at).toBeNull();
    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM enrollments').get() as { c: number }).c).toBe(2);
  });

  it('grant token cannot be replayed — second claim aborts with nothing written', async () => {
    const { grantToken } = await ctx.service.verifyClaimCode(INV_TOKEN, CODE_AVA);
    await ctx.service.claim(grantToken, 'alpha beta gamma');
    await expect(ctx.service.claim(grantToken, 'delta epsilon zeta')).rejects.toThrow();
    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM enrollments').get() as { c: number }).c).toBe(1);
    expect((ctx.sqlite.prepare("SELECT COUNT(*) c FROM users WHERE role='student' AND email LIKE 'stu_%'").get() as { c: number }).c).toBe(1);
  });

  it('rolls back the entire claim when the entry was claimed between verify and claim', async () => {
    const { grantToken } = await ctx.service.verifyClaimCode(INV_TOKEN, CODE_AVA);
    ctx.sqlite.exec("UPDATE roster_entries SET status='claimed', claimed_user_id='u-lead' WHERE id='e-ava'");
    await expect(ctx.service.claim(grantToken, 'alpha beta gamma')).rejects.toThrow();
    // nothing partial: no user, no enrollment, no session, no audit
    expect((ctx.sqlite.prepare("SELECT COUNT(*) c FROM users WHERE email LIKE 'stu_%'").get() as { c: number }).c).toBe(0);
    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM enrollments').get() as { c: number }).c).toBe(0);
    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM sessions').get() as { c: number }).c).toBe(0);
    expect((ctx.sqlite.prepare("SELECT COUNT(*) c FROM audit_logs WHERE action='enrollment.claim'").get() as { c: number }).c).toBe(0);
    // grant unconsumed (batch rolled back B1) but entry already claimed
    const grant = ctx.sqlite.prepare('SELECT * FROM verification_grants').get() as Record<string, unknown>;
    expect(grant.used_at).toBeNull();
  });

  it('rolls back when the invitation is revoked between verify and claim', async () => {
    const { grantToken } = await ctx.service.verifyClaimCode(INV_TOKEN, CODE_AVA);
    ctx.sqlite.exec("UPDATE invitations SET revoked_at='2999' WHERE id='i-ava'");
    await expect(ctx.service.claim(grantToken, 'alpha beta gamma')).rejects.toThrow();
    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM enrollments').get() as { c: number }).c).toBe(0);
  });

  it('enforces the 20-outstanding-grant cap', async () => {
    for (let i = 0; i < 20; i += 1) {
      ctx.sqlite.exec(
        `INSERT INTO verification_grants (id,token_hash,invitation_id,roster_entry_id,school_id,expires_at,created_at)
         VALUES ('g${i}','gh${i}','i-link','e-sam','school-1','2999-01-01T00:00:00.000Z','t')`,
      );
    }
    await expect(ctx.service.verifyClaimCode(LINK_TOKEN, CODE_AVA)).rejects.toThrow();
    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM verification_grants').get() as { c: number }).c).toBe(20);
  });

  it('expired and used grants do not count toward the cap', async () => {
    for (let i = 0; i < 20; i += 1) {
      ctx.sqlite.exec(
        `INSERT INTO verification_grants (id,token_hash,invitation_id,roster_entry_id,school_id,expires_at,used_at,created_at)
         VALUES ('g${i}','gh${i}','i-link','e-sam','school-1','2000-01-01T00:00:00.000Z',NULL,'t')`,
      );
    }
    const v = await ctx.service.verifyClaimCode(LINK_TOKEN, CODE_AVA);
    expect(v.displayName).toBe('Ava Reyes');
  });

  it('rejects weak access phrases without writing anything', async () => {
    const { grantToken } = await ctx.service.verifyClaimCode(INV_TOKEN, CODE_AVA);
    for (const bad of ['ab cd ef', 'oneverylongsinglewordxx', '123456789012', 'only two']) {
      await expect(ctx.service.claim(grantToken, bad)).rejects.toThrow(/requirements|invalid/i);
    }
    expect((ctx.sqlite.prepare('SELECT COUNT(*) c FROM enrollments').get() as { c: number }).c).toBe(0);
  });

  it('generates distinct public ids and stores no raw secrets', async () => {
    const a = await ctx.service.verifyClaimCode(LINK_TOKEN, CODE_AVA);
    const b = await ctx.service.verifyClaimCode(LINK_TOKEN, CODE_SAM);
    const ra = await ctx.service.claim(a.grantToken, 'alpha beta gamma');
    const rb = await ctx.service.claim(b.grantToken, 'delta epsilon zeta');
    expect(ra.publicId).not.toBe(rb.publicId);
    const dump = JSON.stringify(
      ctx.sqlite.prepare('SELECT * FROM verification_grants').all() as unknown[],
    );
    expect(dump).not.toContain(a.grantToken);
    expect(dump).not.toContain(b.grantToken);
  });
});
