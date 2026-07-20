import { BaseRepository } from './baseRepository';

export interface JourneyEvent {
  id: string;
  userId: string;
  date: string;
  title: string;
  description: string;
  category: 'milestone' | 'goal' | 'achievement' | 'event' | 'community' | 'reflection';
  badge?: string;
}

export class JourneyRepository extends BaseRepository {
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

  async listEvents(userId: string): Promise<JourneyEvent[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, date, title, description, category, badge FROM journey_events WHERE user_id = ? ORDER BY date DESC')
      .bind(userId)
      .all();
    return (result.results ?? []).map((row) => this.mapEvent(row));
  }

  async addEvent(event: Omit<JourneyEvent, 'id'>): Promise<JourneyEvent> {
    const id = this.createId('journey');
    await this.db
      .prepare('INSERT INTO journey_events (id, user_id, date, title, description, category, badge) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, event.userId, event.date, event.title, event.description, event.category, event.badge ?? null)
      .run();
    return { id, ...event };
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM journey_events WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .run();
  }

  private mapEvent(row: Record<string, unknown>): JourneyEvent {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      date: String(row.date ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      category: String(row.category ?? 'milestone') as JourneyEvent['category'],
      badge: row.badge == null ? undefined : String(row.badge),
    };
  }
}
