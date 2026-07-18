import { BaseRepository } from './baseRepository';

export interface GrowthEventRecord {
  id: string;
  userId: string;
  eventType: string;
  title: string;
  description?: string;
  occurredAt: string;
  metadata?: string;
}

export class GrowthTimelineRepository extends BaseRepository {
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

  async listEvents(userId: string): Promise<GrowthEventRecord[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, event_type, title, description, occurred_at, metadata FROM growth_events WHERE user_id = ? ORDER BY occurred_at DESC')
      .bind(userId)
      .all();
    return (result.results ?? []).map((row) => this.mapEvent(row));
  }

  async recordEvent(userId: string, input: Omit<GrowthEventRecord, 'id' | 'userId'>): Promise<GrowthEventRecord> {
    const id = this.createId('growth');
    await this.db
      .prepare('INSERT INTO growth_events (id, user_id, event_type, title, description, occurred_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(
        id,
        userId,
        input.eventType,
        input.title,
        input.description ?? null,
        input.occurredAt,
        input.metadata ?? null,
      )
      .run();
    return { id, userId, ...input };
  }

  async getUserCreatedAt(userId: string): Promise<string | null> {
    const result = await this.db
      .prepare('SELECT created_at FROM users WHERE id = ? LIMIT 1')
      .bind(userId)
      .all();
    const row = result.results?.[0];
    return row ? String(row.created_at ?? '') : null;
  }

  async getFirstCompletedTask(userId: string): Promise<{ id: string; title: string; createdAt: string } | null> {
    const result = await this.db
      .prepare('SELECT id, title, created_at FROM tasks WHERE user_id = ? AND completed = 1 ORDER BY created_at ASC LIMIT 1')
      .bind(userId)
      .all();
    const row = result.results?.[0];
    if (!row) return null;
    return { id: String(row.id ?? ''), title: String(row.title ?? ''), createdAt: String(row.created_at ?? '') };
  }

  async getCompletedGoals(userId: string): Promise<{ id: string; title: string; createdAt: string }[]> {
    const result = await this.db
      .prepare('SELECT id, title, created_at FROM goals WHERE user_id = ? AND completed = 1 ORDER BY created_at ASC')
      .bind(userId)
      .all();
    return (result.results ?? []).map((row) => ({ id: String(row.id ?? ''), title: String(row.title ?? ''), createdAt: String(row.created_at ?? '') }));
  }

  async getStreakMilestones(userId: string): Promise<{ streak: number; recordedAt: string }[]> {
    const result = await this.db
      .prepare('SELECT streak_longest, created_at FROM users WHERE id = ? LIMIT 1')
      .bind(userId)
      .all();
    const row = result.results?.[0];
    if (!row) return [];
    const streak = Number(row.streak_longest ?? 0);
    const milestones: { streak: number; recordedAt: string }[] = [];
    const recordedAt = String(row.created_at ?? this.now());
    [7, 30, 60, 100].forEach((m) => {
      if (streak >= m) milestones.push({ streak: m, recordedAt });
    });
    return milestones;
  }

  async getXPMilestones(userId: string): Promise<{ xp: number; recordedAt: string }[]> {
    const result = await this.db
      .prepare('SELECT xp, created_at FROM users WHERE id = ? LIMIT 1')
      .bind(userId)
      .all();
    const row = result.results?.[0];
    if (!row) return [];
    const xp = Number(row.xp ?? 0);
    const level = Math.floor(xp / 100) + 1;
    const milestones: { xp: number; recordedAt: string }[] = [];
    const recordedAt = String(row.created_at ?? this.now());
    [5, 10, 25, 50].forEach((m) => {
      if (level >= m) milestones.push({ xp: m * 100, recordedAt });
    });
    return milestones;
  }

  async getAttendedEvents(userId: string): Promise<{ id: string; title: string; startsAt: string }[]> {
    const result = await this.db
      .prepare('SELECT e.id, e.title, e.starts_at FROM events e JOIN event_attendees ea ON e.id = ea.event_id WHERE ea.user_id = ? ORDER BY e.starts_at ASC')
      .bind(userId)
      .all();
    return (result.results ?? []).map((row) => ({ id: String(row.id ?? ''), title: String(row.title ?? ''), startsAt: String(row.starts_at ?? '') }));
  }

  private mapEvent(row: Record<string, unknown>): GrowthEventRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      eventType: String(row.event_type ?? ''),
      title: String(row.title ?? ''),
      description: row.description == null ? undefined : String(row.description),
      occurredAt: String(row.occurred_at ?? ''),
      metadata: row.metadata == null ? undefined : String(row.metadata),
    };
  }
}
