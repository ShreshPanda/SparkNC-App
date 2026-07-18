import { BaseRepository } from './baseRepository';

export interface NotificationPreferenceRecord {
  id: string;
  userId: string;
  sendDeadlines: boolean;
  sendStreakAlerts: boolean;
  sendEvents: boolean;
  sendMessages: boolean;
  sendRecommendations: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  timezone: string;
  updatedAt: string;
}

export interface NotificationPreferenceInput {
  sendDeadlines?: boolean;
  sendStreakAlerts?: boolean;
  sendEvents?: boolean;
  sendMessages?: boolean;
  sendRecommendations?: boolean;
  quietHoursStart?: number;
  quietHoursEnd?: number;
  timezone?: string;
}

export class NotificationPreferenceRepository extends BaseRepository {
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

  async getPreferences(userId: string): Promise<NotificationPreferenceRecord | null> {
    const result = await this.db
      .prepare('SELECT id, user_id, send_deadlines, send_streak_alerts, send_events, send_messages, send_recommendations, quiet_hours_start, quiet_hours_end, timezone, updated_at FROM notification_preferences WHERE user_id = ? LIMIT 1')
      .bind(userId)
      .all();
    const row = result.results?.[0];
    return row ? this.mapRow(row) : null;
  }

  async upsertPreferences(userId: string, input: NotificationPreferenceInput): Promise<NotificationPreferenceRecord> {
    const existing = await this.getPreferences(userId);
    const now = this.now();
    if (existing) {
      await this.db
        .prepare(`UPDATE notification_preferences SET
          send_deadlines = ?, send_streak_alerts = ?, send_events = ?, send_messages = ?, send_recommendations = ?,
          quiet_hours_start = ?, quiet_hours_end = ?, timezone = ?, updated_at = ? WHERE user_id = ?`)
        .bind(
          this.bool(input.sendDeadlines ?? existing.sendDeadlines),
          this.bool(input.sendStreakAlerts ?? existing.sendStreakAlerts),
          this.bool(input.sendEvents ?? existing.sendEvents),
          this.bool(input.sendMessages ?? existing.sendMessages),
          this.bool(input.sendRecommendations ?? existing.sendRecommendations),
          input.quietHoursStart ?? existing.quietHoursStart,
          input.quietHoursEnd ?? existing.quietHoursEnd,
          input.timezone ?? existing.timezone,
          now,
          userId,
        )
        .run();
      return { ...existing, ...input, updatedAt: now };
    }

    const id = this.createId('notpref');
    await this.db
      .prepare(`INSERT INTO notification_preferences
        (id, user_id, send_deadlines, send_streak_alerts, send_events, send_messages, send_recommendations, quiet_hours_start, quiet_hours_end, timezone, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        id,
        userId,
        this.bool(input.sendDeadlines ?? true),
        this.bool(input.sendStreakAlerts ?? true),
        this.bool(input.sendEvents ?? true),
        this.bool(input.sendMessages ?? true),
        this.bool(input.sendRecommendations ?? true),
        input.quietHoursStart ?? 22,
        input.quietHoursEnd ?? 8,
        input.timezone ?? 'America/New_York',
        now,
      )
      .run();
    return { id, userId, ...this.defaults(input), updatedAt: now };
  }

  private bool(value: boolean): number {
    return value ? 1 : 0;
  }

  private defaults(input: NotificationPreferenceInput): Omit<NotificationPreferenceRecord, 'id' | 'userId' | 'updatedAt'> {
    return {
      sendDeadlines: input.sendDeadlines ?? true,
      sendStreakAlerts: input.sendStreakAlerts ?? true,
      sendEvents: input.sendEvents ?? true,
      sendMessages: input.sendMessages ?? true,
      sendRecommendations: input.sendRecommendations ?? true,
      quietHoursStart: input.quietHoursStart ?? 22,
      quietHoursEnd: input.quietHoursEnd ?? 8,
      timezone: input.timezone ?? 'America/New_York',
    };
  }

  private mapRow(row: Record<string, unknown>): NotificationPreferenceRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      sendDeadlines: Boolean(row.send_deadlines),
      sendStreakAlerts: Boolean(row.send_streak_alerts),
      sendEvents: Boolean(row.send_events),
      sendMessages: Boolean(row.send_messages),
      sendRecommendations: Boolean(row.send_recommendations),
      quietHoursStart: Number(row.quiet_hours_start ?? 22),
      quietHoursEnd: Number(row.quiet_hours_end ?? 8),
      timezone: String(row.timezone ?? 'America/New_York'),
      updatedAt: String(row.updated_at ?? ''),
    };
  }
}
