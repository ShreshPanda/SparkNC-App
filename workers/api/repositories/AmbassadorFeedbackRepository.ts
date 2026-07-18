import { BaseRepository } from './baseRepository';

export interface AmbassadorFeedbackRecord {
  id: string;
  ambassadorId: string;
  studentId?: string;
  category: string;
  observation: string;
  suggestedImprovement?: string;
  createdAt: string;
}

export class AmbassadorFeedbackRepository extends BaseRepository {
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

  async create(input: { ambassadorId: string; studentId?: string; category: string; observation: string; suggestedImprovement?: string }): Promise<AmbassadorFeedbackRecord> {
    const id = this.createId('amb_feedback');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO ambassador_feedback (id, ambassador_id, student_id, category, observation, suggested_improvement, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.ambassadorId, input.studentId ?? null, input.category, input.observation, input.suggestedImprovement ?? null, now)
      .run();
    return { id, ambassadorId: input.ambassadorId, studentId: input.studentId, category: input.category, observation: input.observation, suggestedImprovement: input.suggestedImprovement, createdAt: now };
  }

  async listByAmbassador(ambassadorId: string): Promise<AmbassadorFeedbackRecord[]> {
    const result = await this.db
      .prepare('SELECT id, ambassador_id, student_id, category, observation, suggested_improvement, created_at FROM ambassador_feedback WHERE ambassador_id = ? ORDER BY created_at DESC')
      .bind(ambassadorId)
      .all();
    return (result.results ?? []).map((row) => this.mapRecord(row));
  }

  async listAll(limit = 200): Promise<AmbassadorFeedbackRecord[]> {
    const result = await this.db
      .prepare('SELECT id, ambassador_id, student_id, category, observation, suggested_improvement, created_at FROM ambassador_feedback ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all();
    return (result.results ?? []).map((row) => this.mapRecord(row));
  }

  async listByCategory(category: string, limit = 100): Promise<AmbassadorFeedbackRecord[]> {
    const result = await this.db
      .prepare('SELECT id, ambassador_id, student_id, category, observation, suggested_improvement, created_at FROM ambassador_feedback WHERE category = ? ORDER BY created_at DESC LIMIT ?')
      .bind(category, limit)
      .all();
    return (result.results ?? []).map((row) => this.mapRecord(row));
  }

  private mapRecord(row: Record<string, unknown>): AmbassadorFeedbackRecord {
    return {
      id: String(row.id ?? ''),
      ambassadorId: String(row.ambassador_id ?? ''),
      studentId: row.student_id == null ? undefined : String(row.student_id),
      category: String(row.category ?? ''),
      observation: String(row.observation ?? ''),
      suggestedImprovement: row.suggested_improvement == null ? undefined : String(row.suggested_improvement),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
