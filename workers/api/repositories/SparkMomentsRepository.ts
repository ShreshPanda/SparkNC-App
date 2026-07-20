import { BaseRepository } from './baseRepository';

export interface SparkMomentRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  triggeredAt: string;
  acknowledgedAt: string | null;
  metadata?: string;
}

export class SparkMomentsRepository extends BaseRepository {
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

  async listByUser(userId: string): Promise<SparkMomentRecord[]> {
    const { results } = await this.db
      .prepare('SELECT id, user_id, type, title, description, triggered_at, acknowledged_at, metadata FROM spark_moments WHERE user_id = ? ORDER BY triggered_at DESC')
      .bind(userId)
      .all();
    return (results ?? []).map((row) => this.mapMoment(row));
  }

  async hasTriggered(userId: string, type: string): Promise<boolean> {
    const { results } = await this.db
      .prepare('SELECT id FROM spark_moments WHERE user_id = ? AND type = ? LIMIT 1')
      .bind(userId, type)
      .all();
    return (results ?? []).length > 0;
  }

  async insert(moment: Omit<SparkMomentRecord, 'id' | 'triggeredAt' | 'acknowledgedAt'>): Promise<SparkMomentRecord> {
    const id = this.createId('moment');
    const triggeredAt = this.now();
    await this.db
      .prepare('INSERT INTO spark_moments (id, user_id, type, title, description, triggered_at, acknowledged_at, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, moment.userId, moment.type, moment.title, moment.description, triggeredAt, null, moment.metadata ?? null, triggeredAt)
      .run();
    return { id, ...moment, triggeredAt, acknowledgedAt: null };
  }

  async acknowledge(id: string, userId: string): Promise<void> {
    await this.db
      .prepare('UPDATE spark_moments SET acknowledged_at = ? WHERE id = ? AND user_id = ?')
      .bind(this.now(), id, userId)
      .run();
  }

  private mapMoment(row: Record<string, unknown>): SparkMomentRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      type: String(row.type ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      triggeredAt: String(row.triggered_at ?? ''),
      acknowledgedAt: row.acknowledged_at == null ? null : String(row.acknowledged_at),
      metadata: row.metadata == null ? undefined : String(row.metadata),
    };
  }
}
