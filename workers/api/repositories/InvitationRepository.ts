import { BaseRepository } from './baseRepository';

type Db = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      run: () => Promise<unknown>;
      all: () => Promise<{ results: Record<string, unknown>[] }>;
    };
  };
};

export interface InvitationRecord {
  id: string;
  rosterEntryId?: string;
  schoolId: string;
  kind: 'individual' | 'school_link';
  expiresAt: string;
  revokedAt?: string;
  claimedAt?: string;
  createdBy: string;
  createdAt: string;
}

export class InvitationRepository extends BaseRepository {
  constructor(private readonly db: Db) {
    super();
  }

  async create(input: {
    rosterEntryId?: string;
    schoolId: string;
    kind: 'individual' | 'school_link';
    tokenHash: string;
    createdBy: string;
    expiresAt: string;
  }): Promise<InvitationRecord> {
    const id = this.createId('invite');
    const now = this.now();
    await this.db
      .prepare(
        'INSERT INTO invitations (id, roster_entry_id, school_id, kind, token_hash, created_by, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(id, input.rosterEntryId ?? null, input.schoolId, input.kind, input.tokenHash, input.createdBy, input.expiresAt, now)
      .run();
    return { id, rosterEntryId: input.rosterEntryId, schoolId: input.schoolId, kind: input.kind, expiresAt: input.expiresAt, createdBy: input.createdBy, createdAt: now };
  }

  async getById(id: string): Promise<InvitationRecord | null> {
    const result = await this.db.prepare('SELECT * FROM invitations WHERE id = ? LIMIT 1').bind(id).all();
    const row = result.results?.[0];
    return row ? this.map(row) : null;
  }

  async listBySchool(schoolId: string): Promise<InvitationRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM invitations WHERE school_id = ? ORDER BY created_at DESC')
      .bind(schoolId)
      .all();
    return (result.results ?? []).map((r) => this.map(r));
  }

  // Active = not claimed and not revoked. Used to retire prior invitations
  // (expired or still-valid) before issuing a replacement for an entry.
  async listActiveForEntry(rosterEntryId: string): Promise<InvitationRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM invitations WHERE roster_entry_id = ? AND claimed_at IS NULL AND revoked_at IS NULL')
      .bind(rosterEntryId)
      .all();
    return (result.results ?? []).map((r) => this.map(r));
  }

  async revoke(id: string): Promise<void> {
    await this.db.prepare('UPDATE invitations SET revoked_at = ? WHERE id = ?').bind(this.now(), id).run();
  }

  private map(row: Record<string, unknown>): InvitationRecord {
    return {
      id: String(row.id ?? ''),
      rosterEntryId: row.roster_entry_id == null ? undefined : String(row.roster_entry_id),
      schoolId: String(row.school_id ?? ''),
      kind: (row.kind as InvitationRecord['kind']) ?? 'individual',
      expiresAt: String(row.expires_at ?? ''),
      revokedAt: row.revoked_at == null ? undefined : String(row.revoked_at),
      claimedAt: row.claimed_at == null ? undefined : String(row.claimed_at),
      createdBy: String(row.created_by ?? ''),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
