import { BaseRepository } from './baseRepository';

export interface FeedbackInsightRecord {
  id: string;
  scope: string;
  scopeId?: string;
  insightType: string;
  title: string;
  description: string;
  data?: string;
  createdAt: string;
}

export class FeedbackInsightsRepository extends BaseRepository {
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

  async create(input: { scope: string; scopeId?: string; insightType: string; title: string; description: string; data?: string }): Promise<FeedbackInsightRecord> {
    const id = this.createId('fbi');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO feedback_insights (id, scope, scope_id, insight_type, title, description, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.scope, input.scopeId ?? null, input.insightType, input.title, input.description, input.data ?? null, now)
      .run();
    return { id, scope: input.scope, scopeId: input.scopeId, insightType: input.insightType, title: input.title, description: input.description, data: input.data, createdAt: now };
  }

  async list(scope?: string, scopeId?: string, limit = 100): Promise<FeedbackInsightRecord[]> {
    let query = 'SELECT id, scope, scope_id, insight_type, title, description, data, created_at FROM feedback_insights';
    const params: unknown[] = [];
    const conditions: string[] = [];
    if (scope) {
      conditions.push('scope = ?');
      params.push(scope);
    }
    if (scopeId) {
      conditions.push('scope_id = ?');
      params.push(scopeId);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    const result = await this.db.prepare(query).bind(...params).all();
    return (result.results ?? []).map((row) => this.mapRecord(row));
  }

  async clear(scope: string, scopeId?: string): Promise<void> {
    if (scopeId) {
      await this.db.prepare('DELETE FROM feedback_insights WHERE scope = ? AND scope_id = ?').bind(scope, scopeId).run();
    } else {
      await this.db.prepare('DELETE FROM feedback_insights WHERE scope = ?').bind(scope).run();
    }
  }

  private mapRecord(row: Record<string, unknown>): FeedbackInsightRecord {
    return {
      id: String(row.id ?? ''),
      scope: String(row.scope ?? ''),
      scopeId: row.scope_id == null ? undefined : String(row.scope_id),
      insightType: String(row.insight_type ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      data: row.data == null ? undefined : String(row.data),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
