import { BaseRepository } from './baseRepository';

export interface PilotUserRecord {
  id: string;
  userId: string;
  pilotGroup: string;
  status: 'active' | 'paused' | 'completed';
  joinedAt: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export class PilotRepository extends BaseRepository {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {
    super();
  }

  async addPilotUser(input: { userId: string; pilotGroup: string; status?: string }): Promise<PilotUserRecord> {
    const id = this.createId('pilot');
    const now = this.now();
    const status = input.status ?? 'active';
    await this.db
      .prepare('INSERT INTO pilot_users (id, user_id, pilot_group, status, joined_at, last_active_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.userId, input.pilotGroup, status, now, now, now, now)
      .run();
    return { id, userId: input.userId, pilotGroup: input.pilotGroup, status: status as PilotUserRecord['status'], joinedAt: now, lastActiveAt: now, createdAt: now, updatedAt: now };
  }

  async listPilotUsers(group?: string): Promise<PilotUserRecord[]> {
    const base = 'SELECT id, user_id, pilot_group, status, joined_at, last_active_at, created_at, updated_at FROM pilot_users';
    const query = group ? `${base} WHERE pilot_group = ? ORDER BY created_at DESC` : `${base} ORDER BY created_at DESC`;
    const stmt = this.db.prepare(query);
    const result = group ? await stmt.bind(group).all() : await stmt.bind().all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      pilotGroup: String(row.pilot_group ?? ''),
      status: String(row.status ?? 'active') as PilotUserRecord['status'],
      joinedAt: String(row.joined_at ?? ''),
      lastActiveAt: String(row.last_active_at ?? ''),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    }));
  }

  async listGroups(): Promise<string[]> {
    const result = await this.db
      .prepare('SELECT DISTINCT pilot_group FROM pilot_users ORDER BY pilot_group')
      .bind()
      .all();
    return (result.results ?? []).map((row) => String(row.pilot_group ?? ''));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db
      .prepare('UPDATE pilot_users SET status = ?, updated_at = ? WHERE id = ?')
      .bind(status, this.now(), id)
      .run();
  }

  async updateLastActive(userId: string): Promise<void> {
    await this.db
      .prepare('UPDATE pilot_users SET last_active_at = ? WHERE user_id = ?')
      .bind(this.now(), userId)
      .run();
  }
}
