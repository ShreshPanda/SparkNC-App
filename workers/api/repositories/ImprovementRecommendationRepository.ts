import { BaseRepository } from './baseRepository';

export interface ImprovementRecommendationRecord {
  id: string;
  scope: string;
  scopeId?: string;
  recommendationType: string;
  title: string;
  description: string;
  evidence?: string;
  status: string;
  createdAt: string;
}

export class ImprovementRecommendationRepository extends BaseRepository {
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

  async create(input: { scope: string; scopeId?: string; recommendationType: string; title: string; description: string; evidence?: string }): Promise<ImprovementRecommendationRecord> {
    const id = this.createId('recommendation');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO improvement_recommendations (id, scope, scope_id, recommendation_type, title, description, evidence, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.scope, input.scopeId ?? null, input.recommendationType, input.title, input.description, input.evidence ?? null, 'pending', now)
      .run();
    return { id, scope: input.scope, scopeId: input.scopeId, recommendationType: input.recommendationType, title: input.title, description: input.description, evidence: input.evidence, status: 'pending', createdAt: now };
  }

  async list(scope?: string, scopeId?: string, status?: string, limit = 100): Promise<ImprovementRecommendationRecord[]> {
    let query = 'SELECT id, scope, scope_id, recommendation_type, title, description, evidence, status, created_at FROM improvement_recommendations';
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
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    const result = await this.db.prepare(query).bind(...params).all();
    return (result.results ?? []).map((row) => this.mapRecord(row));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.prepare('UPDATE improvement_recommendations SET status = ? WHERE id = ?').bind(status, id).run();
  }

  private mapRecord(row: Record<string, unknown>): ImprovementRecommendationRecord {
    return {
      id: String(row.id ?? ''),
      scope: String(row.scope ?? ''),
      scopeId: row.scope_id == null ? undefined : String(row.scope_id),
      recommendationType: String(row.recommendation_type ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      evidence: row.evidence == null ? undefined : String(row.evidence),
      status: String(row.status ?? 'pending'),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
