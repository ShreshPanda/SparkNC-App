import { BaseRepository } from './baseRepository';

type BoundStatement = {
  run: () => Promise<unknown>;
  all: () => Promise<{ results: Record<string, unknown>[] }>;
};

type Db = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => BoundStatement;
  };
  // D1 batch(): executes bound prepared statements atomically. A statement
  // that succeeds with zero affected rows does NOT abort the batch, so
  // every required write is followed by a claim_probe fail-forcing insert.
  batch?: (statements: BoundStatement[]) => Promise<unknown>;
};

export interface InvitationLookup {
  id: string;
  kind: 'individual' | 'school_link';
  schoolId: string;
  rosterEntryId?: string;
  expiresAt: string;
}

export interface GrantIdentityRecord {
  id: string;
  invitationId: string;
  rosterEntryId: string;
  schoolId: string;
  displayName: string;
  schoolName: string;
}

export interface ClaimBatchInput {
  grantId: string;
  attemptNonce: string;
  entryId: string;
  invitationId: string;
  userId: string;
  publicId: string;
  syntheticEmail: string;
  displayName: string;
  schoolId: string;
  passwordHash: string;
  passwordSalt: string;
  sessionId: string;
  sessionExpiresAt: string;
  auditId: string;
  auditMetadata: string;
  now: string;
}

export class EnrollmentRepository extends BaseRepository {
  constructor(private readonly db: Db) {
    super();
  }

  private requireBatch(): (statements: BoundStatement[]) => Promise<unknown> {
    // Fail closed: without D1 batch() there is no atomic write path.
    if (typeof this.db.batch !== 'function') {
      throw new Error('Atomic batch support is required for enrollment');
    }
    return this.db.batch.bind(this.db);
  }

  // Invitation resolution: minimal lookup only. Expired/claimed/revoked
  // invitations return null; no roster name or school data is read here.
  async findActiveInvitationByTokenHash(tokenHash: string, now: string): Promise<InvitationLookup | null> {
    const result = await this.db
      .prepare(
        `SELECT id, kind, school_id, roster_entry_id, expires_at FROM invitations
          WHERE token_hash = ? AND claimed_at IS NULL AND revoked_at IS NULL AND expires_at > ? LIMIT 1`,
      )
      .bind(tokenHash, now)
      .all();
    const row = result.results?.[0];
    if (!row) return null;
    return {
      id: String(row.id),
      kind: row.kind === 'school_link' ? 'school_link' : 'individual',
      schoolId: String(row.school_id),
      rosterEntryId: row.roster_entry_id == null ? undefined : String(row.roster_entry_id),
      expiresAt: String(row.expires_at),
    };
  }

  // Post-issuance identity read: only callable after a grant row exists,
  // which already implies claim-code verification succeeded inside the
  // issuance batch. This is where the roster name is first disclosed.
  async findGrantIdentity(grantId: string): Promise<GrantIdentityRecord | null> {
    const result = await this.db
      .prepare(
        `SELECT g.id, g.invitation_id, g.roster_entry_id, g.school_id,
                e.display_name AS display_name, s.name AS school_name
           FROM verification_grants g
           JOIN roster_entries e ON e.id = g.roster_entry_id
           JOIN schools s ON s.id = g.school_id
          WHERE g.id = ? LIMIT 1`,
      )
      .bind(grantId)
      .all();
    const row = result.results?.[0];
    if (!row) return null;
    return {
      id: String(row.id),
      invitationId: String(row.invitation_id),
      rosterEntryId: String(row.roster_entry_id),
      schoolId: String(row.school_id),
      displayName: String(row.display_name),
      schoolName: String(row.school_name),
    };
  }

  async findGrantIdentityByTokenHash(tokenHash: string): Promise<(GrantIdentityRecord & { usedAt?: string; expiresAt: string }) | null> {
    const result = await this.db
      .prepare(
        `SELECT g.id, g.invitation_id, g.roster_entry_id, g.school_id,
                g.used_at, g.expires_at,
                e.display_name AS display_name, s.name AS school_name
           FROM verification_grants g
           JOIN roster_entries e ON e.id = g.roster_entry_id
           JOIN schools s ON s.id = g.school_id
          WHERE g.token_hash = ? LIMIT 1`,
      )
      .bind(tokenHash)
      .all();
    const row = result.results?.[0];
    if (!row) return null;
    return {
      id: String(row.id),
      invitationId: String(row.invitation_id),
      rosterEntryId: String(row.roster_entry_id),
      schoolId: String(row.school_id),
      displayName: String(row.display_name),
      schoolName: String(row.school_name),
      usedAt: row.used_at == null ? undefined : String(row.used_at),
      expiresAt: String(row.expires_at),
    };
  }

  // Grant issuance — one atomic batch:
  //   G1 conditional INSERT ... SELECT enforces, inside SQL: invitation is
  //   active/unexpired, the roster entry is pending and unclaimed, the
  //   claim-code hash matches, school equality, individual-kind binding to
  //   the exact roster entry, and the ≤20 outstanding-grant cap (used and
  //   expired grants are excluded from the count).
  //   G2 fail-forcing probe aborts the batch if G1 inserted nothing.
  async issueVerificationGrant(input: {
    grantId: string;
    tokenHash: string;
    invitationId: string;
    claimCodeHash: string;
    expiresAt: string;
    now: string;
  }): Promise<void> {
    const batch = this.requireBatch();
    await batch([
      this.db
        .prepare(
          `INSERT INTO verification_grants
             (id, token_hash, invitation_id, roster_entry_id, school_id, expires_at, created_at)
           SELECT ?, ?, i.id, e.id, i.school_id, ?, ?
             FROM invitations i
             JOIN roster_entries e
               ON e.claim_code_hash = ?
              AND e.school_id = i.school_id
              AND e.status = 'pending'
              AND e.claimed_user_id IS NULL
            WHERE i.id = ?
              AND i.claimed_at IS NULL
              AND i.revoked_at IS NULL
              AND i.expires_at > ?
              AND (i.kind = 'school_link' OR i.roster_entry_id = e.id)
              AND (
                SELECT COUNT(*) FROM verification_grants g
                 WHERE g.invitation_id = i.id
                   AND g.used_at IS NULL
                   AND g.expires_at > ?
              ) < 20`,
        )
        .bind(input.grantId, input.tokenHash, input.expiresAt, input.now, input.claimCodeHash, input.invitationId, input.now, input.now),
      this.db
        .prepare('INSERT INTO claim_probe (v) SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM verification_grants WHERE id = ?)')
        .bind(input.grantId),
    ]);
  }

  // Atomic claim — one batch, exact ordering per frozen design:
  //   B1 consume grant stamped with this attempt's unique nonce.
  //   B2 insert user (before enrollments — immediate FK).
  //   B2b insert public id (FK to users).
  //   B3 conditional enrollments insert gated on the nonce marker, pending
  //      entry, school equality on both grant sides, invitation validity.
  //   B4 probe aborts iff B3 inserted nothing (keyed on grant_id so a
  //      prior completed claim cannot satisfy it).
  //   B5 mark the entry claimed.  B6 consume an individual invitation
  //      (school links intentionally untouched — multi-use).
  //   B7 session.  B8 audit — inside the transaction, so failures never log.
  async claim(input: ClaimBatchInput): Promise<void> {
    const batch = this.requireBatch();
    await batch([
      this.db
        .prepare('UPDATE verification_grants SET used_at = ?, attempt_id = ? WHERE id = ? AND used_at IS NULL AND expires_at > ?')
        .bind(input.now, input.attemptNonce, input.grantId, input.now),
      this.db
        .prepare(
          `INSERT INTO users (id, email, name, role, school_id, is_active, password_hash, password_salt, created_at, updated_at)
           VALUES (?, ?, ?, 'student', ?, 1, ?, ?, ?, ?)`,
        )
        .bind(input.userId, input.syntheticEmail, input.displayName, input.schoolId, input.passwordHash, input.passwordSalt, input.now, input.now),
      this.db
        .prepare('INSERT INTO student_public_ids (public_id, user_id, created_at) VALUES (?, ?, ?)')
        .bind(input.publicId, input.userId, input.now),
      this.db
        .prepare(
          `INSERT INTO enrollments (roster_entry_id, user_id, invitation_id, grant_id, created_at)
           SELECT ?, ?, ?, ?, ?
             FROM verification_grants g
             JOIN roster_entries e ON e.id = g.roster_entry_id
             JOIN invitations i ON i.id = g.invitation_id
            WHERE g.id = ?
              AND g.attempt_id = ?
              AND g.school_id = i.school_id
              AND g.school_id = e.school_id
              AND e.status = 'pending'
              AND e.claimed_user_id IS NULL
              AND i.claimed_at IS NULL
              AND i.revoked_at IS NULL
              AND i.expires_at > ?
              AND (i.kind = 'school_link' OR i.roster_entry_id = e.id)`,
        )
        .bind(input.entryId, input.userId, input.invitationId, input.grantId, input.now, input.grantId, input.attemptNonce, input.now),
      this.db
        .prepare('INSERT INTO claim_probe (v) SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE grant_id = ?)')
        .bind(input.grantId),
      this.db
        .prepare("UPDATE roster_entries SET status = 'claimed', claimed_user_id = ?, updated_at = ? WHERE id = ? AND status = 'pending' AND claimed_user_id IS NULL")
        .bind(input.userId, input.now, input.entryId),
      this.db
        .prepare("UPDATE invitations SET claimed_at = ?, claimed_by = ? WHERE id = ? AND kind = 'individual' AND claimed_at IS NULL AND revoked_at IS NULL")
        .bind(input.now, input.userId, input.invitationId),
      this.db
        .prepare('INSERT INTO sessions (id, user_id, created_at, expires_at, revoked_at) VALUES (?, ?, ?, ?, NULL)')
        .bind(input.sessionId, input.userId, input.now, input.sessionExpiresAt),
      this.db
        .prepare("INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) VALUES (?, ?, 'enrollment.claim', 'roster_entry', ?, ?, ?)")
        .bind(input.auditId, input.userId, input.entryId, input.auditMetadata, input.now),
    ]);
  }
}
