import { BaseRepository } from './baseRepository';

export interface StudentInsightRecord {
  id: string;
  userId: string;
  insightType: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high';
  data?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface StudentStatsRecord {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  tasksTotal: number;
  tasksCompleted: number;
  goalsTotal: number;
  goalsCompleted: number;
  eventsAttended: number;
  messagesSent: number;
  notificationsReceived: number;
  engagementScore: number;
}

export interface TaskTimeRecord {
  completedAt: string;
  hour: number;
}

export class StudentInsightRepository extends BaseRepository {
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

  async getUserStats(userId: string): Promise<StudentStatsRecord> {
    const tasks = await this.db
      .prepare('SELECT completed FROM tasks WHERE user_id = ?')
      .bind(userId)
      .all();
    const goals = await this.db
      .prepare('SELECT completed FROM goals WHERE user_id = ?')
      .bind(userId)
      .all();
    const user = await this.db
      .prepare('SELECT xp, streak_current, streak_longest FROM users WHERE id = ? LIMIT 1')
      .bind(userId)
      .all();
    const events = await this.db
      .prepare('SELECT COUNT(*) as count FROM event_attendees WHERE user_id = ?')
      .bind(userId)
      .all();
    const messages = await this.db
      .prepare('SELECT COUNT(*) as count FROM messages WHERE sender_id = ?')
      .bind(userId)
      .all();
    const notifications = await this.db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ?')
      .bind(userId)
      .all();

    const row = user.results?.[0] ?? {};
    const taskList = tasks.results ?? [];
    const goalList = goals.results ?? [];

    const xp = Number(row.xp ?? 0);
    const level = Math.floor(xp / 100) + 1;
    const currentStreak = Number(row.streak_current ?? 0);
    const longestStreak = Number(row.streak_longest ?? 0);
    const tasksTotal = taskList.length;
    const tasksCompleted = taskList.filter((r) => r.completed).length;
    const goalsTotal = goalList.length;
    const goalsCompleted = goalList.filter((r) => r.completed).length;
    const eventsAttended = Number((events.results?.[0] as { count?: number })?.count ?? 0);
    const messagesSent = Number((messages.results?.[0] as { count?: number })?.count ?? 0);
    const notificationsReceived = Number((notifications.results?.[0] as { count?: number })?.count ?? 0);

    const engagementScore = this.calculateEngagementScore({
      tasksCompleted,
      goalsCompleted,
      eventsAttended,
      messagesSent,
      currentStreak,
    });

    return {
      xp,
      level,
      currentStreak,
      longestStreak,
      tasksTotal,
      tasksCompleted,
      goalsTotal,
      goalsCompleted,
      eventsAttended,
      messagesSent,
      notificationsReceived,
      engagementScore,
    };
  }

  async getCompletedTaskTimes(userId: string): Promise<TaskTimeRecord[]> {
    const result = await this.db
      .prepare('SELECT created_at as completedAt FROM tasks WHERE user_id = ? AND completed = 1')
      .bind(userId)
      .all();
    return (result.results ?? []).map((row) => {
      const date = new Date(String(row.completedAt ?? ''));
      return { completedAt: String(row.completedAt ?? ''), hour: Number.isNaN(date.getTime()) ? 0 : date.getHours() };
    });
  }

  async getRecentMessagesCount(userId: string, days = 7): Promise<number> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM messages WHERE sender_id = ? AND created_at > ?')
      .bind(userId, since)
      .all();
    return Number((result.results?.[0] as { count?: number })?.count ?? 0);
  }

  async listInsights(userId: string): Promise<StudentInsightRecord[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, insight_type, title, description, priority, data, created_at, expires_at FROM student_insights WHERE user_id = ? AND (expires_at IS NULL OR expires_at > ?) ORDER BY created_at DESC')
      .bind(userId, this.now())
      .all();
    return (result.results ?? []).map((row) => this.mapInsight(row));
  }

  async saveInsight(userId: string, insight: Omit<StudentInsightRecord, 'id' | 'userId' | 'createdAt'>): Promise<StudentInsightRecord> {
    const id = this.createId('insight');
    const createdAt = this.now();
    await this.db
      .prepare('INSERT INTO student_insights (id, user_id, insight_type, title, description, priority, data, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(
        id,
        userId,
        insight.insightType,
        insight.title,
        insight.description,
        insight.priority,
        insight.data ?? null,
        createdAt,
        insight.expiresAt ?? null,
      )
      .run();
    return { id, userId, ...insight, createdAt };
  }

  async deleteExpiredInsights(userId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM student_insights WHERE user_id = ? AND expires_at IS NOT NULL AND expires_at <= ?')
      .bind(userId, this.now())
      .run();
  }

  private calculateEngagementScore(input: { tasksCompleted: number; goalsCompleted: number; eventsAttended: number; messagesSent: number; currentStreak: number }): number {
    const score =
      input.tasksCompleted * 5 +
      input.goalsCompleted * 10 +
      input.eventsAttended * 8 +
      input.messagesSent * 2 +
      input.currentStreak * 3;
    return Math.min(1000, score);
  }

  private mapInsight(row: Record<string, unknown>): StudentInsightRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      insightType: String(row.insight_type ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      priority: String(row.priority ?? 'normal') as StudentInsightRecord['priority'],
      data: row.data == null ? undefined : String(row.data),
      createdAt: String(row.created_at ?? ''),
      expiresAt: row.expires_at == null ? undefined : String(row.expires_at),
    };
  }
}
