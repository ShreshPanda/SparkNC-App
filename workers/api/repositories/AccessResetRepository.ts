import { BaseRepository } from './baseRepository';

type BoundStatement = {
  run: () => Promise<unknown>;
  all: () => Promise<{ results: Record<string, unknown>[] }>;
};

type Db = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => BoundStatement;
  };
  batch?: (statements: BoundStatement[]) => Promise<unknown>;
};

export interface ResetTargetRecord {
  id: string;
  role: string;
  schoolId?: string;
  isActive: boolean;
}

export interface ResetRequestLookup {
  id: string;
  userId: string;
  schoolId: string;
}

export class AccessResetRepository extends BaseRepository {
  constructor(private readonly db: Db) {
    super();
  }

  private requireBatch(): (statements: BoundStatement[]) => Promise<unknown> {
    if (typeof this.db.batch !== 'function') {
      throw new Error('Atomic batch support is required for access resets');
    }
    return this.db.batch.bind(this.db);
  }

  async findResetTarget(userId: string): Promise<ResetTargetRecord | null> {
    const result = await this.db
      .prepare('SELECT id, role, school_id, is_active FROM users WHERE id = ? LIMIT 1')
      .bind(userId)
      .all();
    const row = result.results?.[0];
    if (!row) return null;
    return {
      id: String(row.id),
      role: String(row.role ?? ''),
      schoolId: row.school_id == null ? undefined : String(row.school_id),
      isActive: Boolean(row.is_active),
    };
  }

  // Preflight lookup only — the completion batch revalidates authoritatively.
  async findRequestByTokenHash(tokenHash: string): Promise<ResetRequestLookup | null> {
    const result = await this.db
      .prepare('SELECT id, user_id, school_id FROM access_reset_requests WHERE token_hash = ? LIMIT 1')
      .bind(tokenHash)
      .all();
    const row = result.results?.[0];
    if (!row) return null;
    return { id: String(row.id), userId: String(row.user_id), schoolId: String(row.school_id) };
  }

  // Atomic issuance: all prior unconsumed requests (active or expired) are
  // revoked and the new request is inserted in one batch — expired rows can
  // never block reissue under the partial unique index. Audit is inside.
  async issueRequest(input: {
    requestId: string;
    userId: string;
    schoolId: string;
    requestedBy: string;
    callerRole: string;
    callerSchoolId: string;
    tokenHash: string;
    expiresAt: string;
    auditId: string;
    now: string;
  }): Promise<void> {
    const batch = this.requireBatch();
    await batch([
      this.db
        .prepare('UPDATE access_reset_requests SET revoked_at = ? WHERE user_id = ? AND used_at IS NULL AND revoked_at IS NULL')
        .bind(input.now, input.userId),
      this.db
        .prepare(
          `INSERT INTO access_reset_requests (id, user_id, school_id, requested_by, token_hash, expires_at, created_at)
           SELECT ?, u.id, u.school_id, ?, ?, ?, ? FROM users u
            WHERE u.id = ? AND u.role = 'student' AND u.is_active = 1
              AND u.school_id = ?
              AND (? = 'admin' OR (u.school_id = ? AND ? <> ''))`,
        )
        .bind(input.requestId, input.requestedBy, input.tokenHash, input.expiresAt, input.now, input.userId, input.schoolId, input.callerRole, input.callerSchoolId, input.callerSchoolId),
      this.db
        .prepare('INSERT INTO claim_probe (v) SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM access_reset_requests WHERE id = ? AND token_hash = ?)')
        .bind(input.requestId, input.tokenHash),
      this.db
        .prepare("INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) VALUES (?, ?, 'access.reset.initiate', 'user', ?, ?, ?)")
        .bind(input.auditId, input.requestedBy, input.userId, JSON.stringify({ schoolId: input.schoolId }), input.now),
    ]);
  }

  // Atomic completion — one batch:
  //   R1 consumption marker, conditional on the request being consumable;
  //     the token_hash PK aborts on replay.
  //   R2 probe aborts iff R1 inserted nothing (nonce binds THIS attempt).
  //   R3 mark the request used.
  //   R4 rotate credentials — guarded on a valid active student in the
  //     authorized school.
  //   R5 probe aborts iff R4 wrote nothing (fresh salt proves this attempt).
  //   R6 revoke all sessions.  R7 audit — inside the transaction.
  async completeReset(input: {
    tokenHash: string;
    nonce: string;
    userId: string;
    schoolId: string;
    passwordHash: string;
    passwordSalt: string;
    auditId: string;
    now: string;
  }): Promise<void> {
    const batch = this.requireBatch();
    await batch([
      this.db
        .prepare(
          `INSERT INTO reset_consumptions (token_hash, nonce, consumed_at)
           SELECT ?, ?, ?
             FROM access_reset_requests r
            WHERE r.token_hash = ?
              AND r.used_at IS NULL
              AND r.revoked_at IS NULL
              AND r.expires_at > ?`,
        )
        .bind(input.tokenHash, input.nonce, input.now, input.tokenHash, input.now),
      this.db
        .prepare('INSERT INTO claim_probe (v) SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM reset_consumptions WHERE token_hash = ? AND nonce = ?)')
        .bind(input.tokenHash, input.nonce),
      this.db
        .prepare('UPDATE access_reset_requests SET used_at = ? WHERE token_hash = ?')
        .bind(input.now, input.tokenHash),
      this.db
        .prepare("UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ? AND role = 'student' AND school_id = ? AND is_active = 1")
        .bind(input.passwordHash, input.passwordSalt, input.now, input.userId, input.schoolId),
      this.db
        .prepare("INSERT INTO claim_probe (v) SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = ? AND password_salt = ? AND role = 'student')")
        .bind(input.userId, input.passwordSalt),
      this.db
        .prepare('UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL')
        .bind(input.now, input.userId),
      this.db
        .prepare("INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) VALUES (?, ?, 'access.reset.complete', 'user', ?, ?, ?)")
        .bind(input.auditId, input.userId, input.userId, JSON.stringify({ schoolId: input.schoolId }), input.now),
    ]);
  }
}
