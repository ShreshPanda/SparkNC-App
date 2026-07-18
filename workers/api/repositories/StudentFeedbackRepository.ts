import { BaseRepository } from './baseRepository';

export interface StudentFeedbackRecord {
  id: string;
  userId: string;
  category: string;
  rating?: number;
  feedbackText?: string;
  sentiment?: string;
  createdAt: string;
}

export class StudentFeedbackRepository extends BaseRepository {
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

  async create(input: { userId: string; category: string; rating?: number; feedbackText?: string; sentiment?: string }): Promise<StudentFeedbackRecord> {
    const id = this.createId('feedback');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO student_feedback (id, user_id, category, rating, feedback_text, sentiment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.userId, input.category, input.rating ?? null, input.feedbackText ?? null, input.sentiment ?? null, now)
      .run();
    return { id, userId: input.userId, category: input.category, rating: input.rating, feedbackText: input.feedbackText, sentiment: input.sentiment, createdAt: now };
  }

  async listByUser(userId: string, limit = 50): Promise<StudentFeedbackRecord[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, category, rating, feedback_text, sentiment, created_at FROM student_feedback WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .bind(userId, limit)
      .all();
    return (result.results ?? []).map((row) => this.mapFeedback(row));
  }

  async listAll(limit = 200): Promise<StudentFeedbackRecord[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, category, rating, feedback_text, sentiment, created_at FROM student_feedback ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all();
    return (result.results ?? []).map((row) => this.mapFeedback(row));
  }

  async listByCategory(category: string, limit = 100): Promise<StudentFeedbackRecord[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, category, rating, feedback_text, sentiment, created_at FROM student_feedback WHERE category = ? ORDER BY created_at DESC LIMIT ?')
      .bind(category, limit)
      .all();
    return (result.results ?? []).map((row) => this.mapFeedback(row));
  }

  async get(id: string): Promise<StudentFeedbackRecord | null> {
    const result = await this.db
      .prepare('SELECT id, user_id, category, rating, feedback_text, sentiment, created_at FROM student_feedback WHERE id = ? LIMIT 1')
      .bind(id)
      .all();
    const row = result.results?.[0];
    return row ? this.mapFeedback(row) : null;
  }

  private mapFeedback(row: Record<string, unknown>): StudentFeedbackRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      category: String(row.category ?? ''),
      rating: row.rating == null ? undefined : Number(row.rating),
      feedbackText: row.feedback_text == null ? undefined : String(row.feedback_text),
      sentiment: row.sentiment == null ? undefined : String(row.sentiment),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
