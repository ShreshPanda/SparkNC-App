import { BaseRepository } from './baseRepository';

export interface FeatureRequestRecord {
  id: string;
  createdBy: string;
  title: string;
  description?: string;
  category: string;
  votes: number;
  status: string;
  createdAt: string;
}

export class FeatureRequestRepository extends BaseRepository {
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

  async create(input: { createdBy: string; title: string; description?: string; category: string }): Promise<FeatureRequestRecord> {
    const id = this.createId('feature');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO feature_requests (id, created_by, title, description, category, votes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.createdBy, input.title, input.description ?? null, input.category, 0, 'Submitted', now)
      .run();
    return { id, createdBy: input.createdBy, title: input.title, description: input.description, category: input.category, votes: 0, status: 'Submitted', createdAt: now };
  }

  async list(status?: string, limit = 200): Promise<FeatureRequestRecord[]> {
    let query = 'SELECT id, created_by, title, description, category, votes, status, created_at FROM feature_requests';
    const params: unknown[] = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY votes DESC, created_at DESC LIMIT ?';
    params.push(limit);
    const result = await this.db.prepare(query).bind(...params).all();
    return (result.results ?? []).map((row) => this.mapRecord(row));
  }

  async get(id: string): Promise<FeatureRequestRecord | null> {
    const result = await this.db.prepare('SELECT id, created_by, title, description, category, votes, status, created_at FROM feature_requests WHERE id = ? LIMIT 1').bind(id).all();
    const row = result.results?.[0];
    return row ? this.mapRecord(row) : null;
  }

  async vote(id: string): Promise<void> {
    await this.db.prepare('UPDATE feature_requests SET votes = votes + 1 WHERE id = ?').bind(id).run();
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.prepare('UPDATE feature_requests SET status = ? WHERE id = ?').bind(status, id).run();
  }

  private mapRecord(row: Record<string, unknown>): FeatureRequestRecord {
    return {
      id: String(row.id ?? ''),
      createdBy: String(row.created_by ?? ''),
      title: String(row.title ?? ''),
      description: row.description == null ? undefined : String(row.description),
      category: String(row.category ?? ''),
      votes: Number(row.votes ?? 0),
      status: String(row.status ?? 'Submitted'),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
