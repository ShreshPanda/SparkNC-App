import { BaseRepository } from './baseRepository';

export interface AchievementRecord {
  id: string;
  achievementKey: string;
  title: string;
  description: string;
  category: string;
  criteria: string;
  points: number;
  createdAt: string;
}

export interface UserAchievementRecord {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  metadata?: string;
}

export interface PersonalRecordRecord {
  id: string;
  userId: string;
  recordType: string;
  recordValue: number;
  recordUnit?: string;
  recordedAt: string;
  metadata?: string;
}

export class AchievementsRepository extends BaseRepository {
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

  async listAchievements(): Promise<AchievementRecord[]> {
    const result = await this.db
      .prepare('SELECT id, achievement_key, title, description, category, criteria, points, created_at FROM achievements ORDER BY category, title')
      .bind()
      .all();
    return (result.results ?? []).map((row) => this.mapAchievement(row));
  }

  async listUserAchievements(userId: string): Promise<UserAchievementRecord[]> {
    const result = await this.db
      .prepare('SELECT ua.id, ua.user_id, ua.achievement_id, ua.unlocked_at, ua.metadata FROM user_achievements ua JOIN achievements a ON a.id = ua.achievement_id WHERE ua.user_id = ? ORDER BY ua.unlocked_at DESC')
      .bind(userId)
      .all();
    return (result.results ?? []).map((row) => this.mapUserAchievement(row));
  }

  async unlockAchievement(userId: string, achievementId: string, metadata?: Record<string, unknown>): Promise<UserAchievementRecord> {
    const id = this.createId('uach');
    const now = this.now();
    const meta = metadata ? JSON.stringify(metadata) : null;
    await this.db
      .prepare('INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, unlocked_at, metadata) VALUES (?, ?, ?, ?, ?)')
      .bind(id, userId, achievementId, now, meta)
      .run();
    return { id, userId, achievementId, unlockedAt: now, metadata: meta ?? undefined };
  }

  async getUserStats(userId: string): Promise<{ tasksCompleted: number; goalsCompleted: number; messagesSent: number; eventsAttended: number; currentStreak: number; longestStreak: number; xp: number }> {
    const [tasks, goals, messages, events, user] = await Promise.all([
      this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed = 1').bind(userId).all(),
      this.db.prepare('SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND completed = 1').bind(userId).all(),
      this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE sender_id = ?').bind(userId).all(),
      this.db.prepare('SELECT COUNT(*) as count FROM event_attendees WHERE user_id = ?').bind(userId).all(),
      this.db.prepare('SELECT xp_total as xp, current_streak as streak_current, longest_streak as streak_longest FROM users WHERE id = ? LIMIT 1').bind(userId).all(),
    ]);
    const userRow = user.results?.[0] ?? {};
    return {
      tasksCompleted: Number((tasks.results?.[0] as { count?: number })?.count ?? 0),
      goalsCompleted: Number((goals.results?.[0] as { count?: number })?.count ?? 0),
      messagesSent: Number((messages.results?.[0] as { count?: number })?.count ?? 0),
      eventsAttended: Number((events.results?.[0] as { count?: number })?.count ?? 0),
      currentStreak: Number(userRow.streak_current ?? 0),
      longestStreak: Number(userRow.streak_longest ?? 0),
      xp: Number(userRow.xp ?? 0),
    };
  }

  async getPersonalRecord(userId: string, recordType: string): Promise<PersonalRecordRecord | null> {
    const result = await this.db
      .prepare('SELECT id, user_id, record_type, record_value, record_unit, recorded_at, metadata FROM personal_records WHERE user_id = ? AND record_type = ? LIMIT 1')
      .bind(userId, recordType)
      .all();
    const row = result.results?.[0];
    return row ? this.mapPersonalRecord(row) : null;
  }

  async upsertPersonalRecord(userId: string, recordType: string, value: number, unit?: string, metadata?: Record<string, unknown>): Promise<PersonalRecordRecord> {
    const id = this.createId('pr');
    const now = this.now();
    const meta = metadata ? JSON.stringify(metadata) : null;
    const existing = await this.getPersonalRecord(userId, recordType);
    if (existing) {
      if (value > existing.recordValue) {
        await this.db
          .prepare('UPDATE personal_records SET record_value = ?, record_unit = ?, recorded_at = ?, metadata = ? WHERE id = ?')
          .bind(value, unit ?? existing.recordUnit ?? null, now, meta, existing.id)
          .run();
        return { id: existing.id, userId, recordType, recordValue: value, recordUnit: unit ?? existing.recordUnit, recordedAt: now, metadata: meta ?? undefined };
      }
      return existing;
    }
    await this.db
      .prepare('INSERT OR REPLACE INTO personal_records (id, user_id, record_type, record_value, record_unit, recorded_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, userId, recordType, value, unit ?? null, now, meta)
      .run();
    return { id, userId, recordType, recordValue: value, recordUnit: unit, recordedAt: now, metadata: meta ?? undefined };
  }

  private mapAchievement(row: Record<string, unknown>): AchievementRecord {
    return {
      id: String(row.id ?? ''),
      achievementKey: String(row.achievement_key ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      category: String(row.category ?? ''),
      criteria: String(row.criteria ?? ''),
      points: Number(row.points ?? 0),
      createdAt: String(row.created_at ?? ''),
    };
  }

  private mapUserAchievement(row: Record<string, unknown>): UserAchievementRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      achievementId: String(row.achievement_id ?? ''),
      unlockedAt: String(row.unlocked_at ?? ''),
      metadata: row.metadata == null ? undefined : String(row.metadata),
    };
  }

  private mapPersonalRecord(row: Record<string, unknown>): PersonalRecordRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      recordType: String(row.record_type ?? ''),
      recordValue: Number(row.record_value ?? 0),
      recordUnit: row.record_unit == null ? undefined : String(row.record_unit),
      recordedAt: String(row.recorded_at ?? ''),
      metadata: row.metadata == null ? undefined : String(row.metadata),
    };
  }
}
