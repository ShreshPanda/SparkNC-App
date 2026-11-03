import { BaseRepository } from './baseRepository';

type BoundStatement = {
  run: () => Promise<unknown>;
  all: () => Promise<{ results: Record<string, unknown>[] }>;
};

type Db = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => BoundStatement;
  };
  // D1 batch(): executes bound prepared statements atomically. Bound
  // statements produced by prepare().bind() are D1-compatible.
  batch?: (statements: BoundStatement[]) => Promise<unknown>;
};

export interface RosterRecord {
  id: string;
  schoolId: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface RosterEntryRecord {
  id: string;
  rosterId: string;
  schoolId: string;
  displayName: string;
  status: 'pending' | 'claimed' | 'revoked';
  hasClaimCode: boolean;
  claimedUserId?: string;
  createdAt: string;
}

export class RosterRepository extends BaseRepository {
  constructor(private readonly db: Db) {
    super();
  }

  async createRoster(input: { schoolId: string; name: string; createdBy: string }): Promise<RosterRecord> {
    const id = this.createId('roster');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO rosters (id, school_id, name, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, input.schoolId, input.name, input.createdBy, now, now)
      .run();
    return { id, schoolId: input.schoolId, name: input.name, createdBy: input.createdBy, createdAt: now };
  }

  async listRosters(schoolId?: string): Promise<RosterRecord[]> {
    const query = schoolId
      ? this.db.prepare('SELECT * FROM rosters WHERE school_id = ? ORDER BY created_at DESC').bind(schoolId)
      : this.db.prepare('SELECT * FROM rosters ORDER BY created_at DESC').bind();
    const result = await query.all();
    return (result.results ?? []).map((r) => this.mapRoster(r));
  }

  async getRoster(rosterId: string): Promise<RosterRecord | null> {
    const result = await this.db.prepare('SELECT * FROM rosters WHERE id = ? LIMIT 1').bind(rosterId).all();
    const row = result.results?.[0];
    return row ? this.mapRoster(row) : null;
  }

  async listEntries(rosterId: string): Promise<RosterEntryRecord[]> {
    const result = await this.db
      .prepare('SELECT * FROM roster_entries WHERE roster_id = ? ORDER BY created_at ASC')
      .bind(rosterId)
      .all();
    return (result.results ?? []).map((r) => this.mapEntry(r));
  }

  async listEntriesBySchool(schoolId: string): Promise<RosterEntryRecord[]> {
    const result = await this.db
      .prepare("SELECT * FROM roster_entries WHERE school_id = ? AND status = 'pending'")
      .bind(schoolId)
      .all();
    return (result.results ?? []).map((r) => this.mapEntry(r));
  }

  async getEntry(entryId: string): Promise<RosterEntryRecord | null> {
    const result = await this.db.prepare('SELECT * FROM roster_entries WHERE id = ? LIMIT 1').bind(entryId).all();
    const row = result.results?.[0];
    return row ? this.mapEntry(row) : null;
  }

  async createEntry(input: { rosterId: string; schoolId: string; displayName: string }): Promise<RosterEntryRecord> {
    const id = this.createId('entry');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO roster_entries (id, roster_id, school_id, display_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.rosterId, input.schoolId, input.displayName, 'pending', now, now)
      .run();
    return { id, rosterId: input.rosterId, schoolId: input.schoolId, displayName: input.displayName, status: 'pending', hasClaimCode: false, createdAt: now };
  }

  async updateEntryName(entryId: string, displayName: string): Promise<void> {
    await this.db
      .prepare('UPDATE roster_entries SET display_name = ?, updated_at = ? WHERE id = ?')
      .bind(displayName, this.now(), entryId)
      .run();
  }

  // Conditional update: only pending entries can be revoked or edited —
  // claimed identities are immutable through this path.
  async setEntryStatus(entryId: string, fromStatus: string, toStatus: string): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE roster_entries SET status = ?, updated_at = ? WHERE id = ? AND status = ?')
      .bind(toStatus, this.now(), entryId, fromStatus)
      .run();
    return Boolean((result as { meta?: { changes?: number } })?.meta?.changes ?? true);
  }

  async setClaimCodeHash(entryId: string, claimCodeHash: string): Promise<void> {
    await this.db
      .prepare('UPDATE roster_entries SET claim_code_hash = ?, updated_at = ? WHERE id = ?')
      .bind(claimCodeHash, this.now(), entryId)
      .run();
  }

  async findEntryByClaimCodeHash(claimCodeHash: string): Promise<RosterEntryRecord | null> {
    const result = await this.db
      .prepare('SELECT * FROM roster_entries WHERE claim_code_hash = ? LIMIT 1')
      .bind(claimCodeHash)
      .all();
    const row = result.results?.[0];
    return row ? this.mapEntry(row) : null;
  }

  // Atomic bulk insert for CSV imports. Entry ids are deterministic
  // (rosterId + importId + line) so a retried commit with the same
  // importId hits INSERT OR IGNORE on the primary key and cannot
  // duplicate rows; a new importId creates fresh entries.
  async createEntries(inputs: { id: string; rosterId: string; schoolId: string; displayName: string }[]): Promise<RosterEntryRecord[]> {
    const now = this.now();
    const statements = inputs.map((input) =>
      this.db
        .prepare('INSERT OR IGNORE INTO roster_entries (id, roster_id, school_id, display_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(input.id, input.rosterId, input.schoolId, input.displayName, 'pending', now, now),
    );

    const records: RosterEntryRecord[] = inputs.map((input) => ({
      id: input.id,
      rosterId: input.rosterId,
      schoolId: input.schoolId,
      displayName: input.displayName,
      status: 'pending',
      hasClaimCode: false,
      createdAt: now,
    }));

    // Production must fail closed: without D1 batch() there is no atomic
    // write path, so the import is rejected rather than falling back to
    // sequential inserts that could leave partial rows.
    if (typeof this.db.batch !== 'function') {
      throw new Error('Atomic batch support is required for roster imports');
    }
    await this.db.batch(statements);
    return records;
  }

  async deleteEntries(entryIds: string[]): Promise<void> {
    for (const id of entryIds) {
      await this.db.prepare('DELETE FROM roster_entries WHERE id = ?').bind(id).run();
    }
  }

  private mapRoster(row: Record<string, unknown>): RosterRecord {
    return {
      id: String(row.id ?? ''),
      schoolId: String(row.school_id ?? ''),
      name: String(row.name ?? ''),
      createdBy: String(row.created_by ?? ''),
      createdAt: String(row.created_at ?? ''),
    };
  }

  private mapEntry(row: Record<string, unknown>): RosterEntryRecord {
    return {
      id: String(row.id ?? ''),
      rosterId: String(row.roster_id ?? ''),
      schoolId: String(row.school_id ?? ''),
      displayName: String(row.display_name ?? ''),
      status: (row.status as RosterEntryRecord['status']) ?? 'pending',
      hasClaimCode: row.claim_code_hash != null && String(row.claim_code_hash).length > 0,
      claimedUserId: row.claimed_user_id == null ? undefined : String(row.claimed_user_id),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
