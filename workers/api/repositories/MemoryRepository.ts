import { BaseRepository } from './baseRepository';

export interface MemoryRecord {
  id: string;
  userId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  context?: string;
  createdAt: string;
}

export class MemoryRepository extends BaseRepository {
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

  async listRecent(userId: string, limit = 20): Promise<MemoryRecord[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, role, content, context, created_at FROM ai_memories WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .bind(userId, limit)
      .all();
    return (result.results ?? []).reverse().map((row) => this.mapMemory(row));
  }

  async save(userId: string, role: MemoryRecord['role'], content: string, context?: string): Promise<MemoryRecord> {
    const id = this.createId('mem');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO ai_memories (id, user_id, role, content, context, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, userId, role, content, context ?? null, now)
      .run();
    return { id, userId, role, content, context, createdAt: now };
  }

  private mapMemory(row: Record<string, unknown>): MemoryRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      role: String(row.role ?? 'assistant') as MemoryRecord['role'],
      content: String(row.content ?? ''),
      context: row.context == null ? undefined : String(row.context),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
