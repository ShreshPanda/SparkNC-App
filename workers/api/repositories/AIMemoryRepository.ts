import { BaseRepository } from './baseRepository';

export interface AIMemoryRecord {
  id: string;
  userId: string;
  key: string;
  value: string;
  category: 'preference' | 'goal' | 'milestone' | 'interaction';
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIMemoryInput {
  userId: string;
  key: string;
  value: string;
  category?: AIMemoryRecord['category'];
}

export class AIMemoryRepository extends BaseRepository {
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

  async create(input: AIMemoryInput): Promise<AIMemoryRecord> {
    const id = this.createId('aimem');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO ai_memories (id, user_id, key, value, category, is_disabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.userId, input.key, input.value, input.category ?? 'preference', 0, now, now)
      .run();
    return { id, userId: input.userId, key: input.key, value: input.value, category: input.category ?? 'preference', isDisabled: false, createdAt: now, updatedAt: now };
  }

  async listActive(userId: string, category?: string): Promise<AIMemoryRecord[]> {
    const query = category
      ? 'SELECT id, user_id, key, value, category, is_disabled, created_at, updated_at FROM ai_memories WHERE user_id = ? AND is_disabled = 0 AND category = ? ORDER BY updated_at DESC'
      : 'SELECT id, user_id, key, value, category, is_disabled, created_at, updated_at FROM ai_memories WHERE user_id = ? AND is_disabled = 0 ORDER BY updated_at DESC';
    const stmt = this.db.prepare(query);
    const result = category ? await stmt.bind(userId, category).all() : await stmt.bind(userId).all();
    return (result.results ?? []).map((row) => this.map(row));
  }

  async disable(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE ai_memories SET is_disabled = 1, updated_at = ? WHERE id = ?')
      .bind(this.now(), id)
      .run();
  }

  async disableByKey(userId: string, key: string): Promise<void> {
    await this.db
      .prepare('UPDATE ai_memories SET is_disabled = 1, updated_at = ? WHERE user_id = ? AND key = ?')
      .bind(this.now(), userId, key)
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM ai_memories WHERE id = ?').bind(id).run();
  }

  private map(row: Record<string, unknown>): AIMemoryRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      key: String(row.key ?? ''),
      value: String(row.value ?? ''),
      category: String(row.category ?? 'preference') as AIMemoryRecord['category'],
      isDisabled: row.is_disabled === 1 || row.is_disabled === true,
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    };
  }
}
