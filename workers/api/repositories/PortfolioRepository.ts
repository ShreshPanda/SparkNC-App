import { BaseRepository } from './baseRepository';

export interface PortfolioRecord {
  userId: string;
  type: 'project' | 'goal' | 'achievement' | 'event' | 'community' | 'certificate' | 'skill' | 'volunteer' | 'badge' | 'reflection';
  id: string;
  title: string;
  description?: string;
  date?: string;
  metadata?: string;
}

export class PortfolioRepository extends BaseRepository {
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

  async listForUser(userId: string, type?: PortfolioRecord['type']): Promise<PortfolioRecord[]> {
    const base = 'SELECT user_id, type, id, title, description, date, metadata FROM portfolio WHERE user_id = ?';
    const query = type ? `${base} AND type = ? ORDER BY date DESC` : `${base} ORDER BY date DESC`;
    const stmt = this.db.prepare(query);
    const result = type ? await stmt.bind(userId, type).all() : await stmt.bind(userId).all();
    return (result.results ?? []).map((row) => this.mapRecord(row));
  }

  async addRecord(record: PortfolioRecord): Promise<void> {
    await this.db
      .prepare('INSERT OR REPLACE INTO portfolio (user_id, type, id, title, description, date, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(record.userId, record.type, record.id, record.title, record.description ?? null, record.date ?? null, record.metadata ?? null)
      .run();
  }

  async removeRecord(userId: string, id: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM portfolio WHERE user_id = ? AND id = ?')
      .bind(userId, id)
      .run();
  }

  private mapRecord(row: Record<string, unknown>): PortfolioRecord {
    return {
      userId: String(row.user_id ?? ''),
      type: String(row.type ?? '') as PortfolioRecord['type'],
      id: String(row.id ?? ''),
      title: String(row.title ?? ''),
      description: row.description == null ? undefined : String(row.description),
      date: row.date == null ? undefined : String(row.date),
      metadata: row.metadata == null ? undefined : String(row.metadata),
    };
  }
}
