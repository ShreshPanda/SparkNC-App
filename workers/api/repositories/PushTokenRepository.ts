import { BaseRepository } from './baseRepository';
import type { PushTokenRecord } from '../services/notificationProviders/types';

export class PushTokenRepository extends BaseRepository {
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

  async saveToken(input: Omit<PushTokenRecord, 'id' | 'createdAt'>): Promise<PushTokenRecord> {
    const id = this.createId('push');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO push_tokens (id, user_id, device_type, token, created_at, last_used_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, input.userId, input.deviceType, input.token, now, input.lastUsedAt ?? now)
      .run();
    return { id, ...input, createdAt: now };
  }

  async getTokensForUser(userId: string): Promise<PushTokenRecord[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, device_type, token, created_at, last_used_at FROM push_tokens WHERE user_id = ? ORDER BY last_used_at DESC')
      .bind(userId)
      .all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      deviceType: String(row.device_type ?? 'unknown') as PushTokenRecord['deviceType'],
      token: String(row.token ?? ''),
      createdAt: String(row.created_at ?? ''),
      lastUsedAt: row.last_used_at == null ? undefined : String(row.last_used_at),
    }));
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE push_tokens SET last_used_at = ? WHERE id = ?')
      .bind(this.now(), id)
      .run();
  }

  async deleteToken(id: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM push_tokens WHERE id = ?')
      .bind(id)
      .run();
  }
}
