import { BaseRepository } from './baseRepository';

export interface AnalyticsSnapshotRecord {
  id: string;
  scope: string;
  scopeId?: string;
  snapshotType: string;
  snapshotDate: string;
  metrics: string;
  createdAt: string;
}

export interface AggregatedMetrics {
  dailyActiveStudents: number;
  weeklyActiveStudents: number;
  totalStudents: number;
  totalTasksCompleted: number;
  totalGoalsCompleted: number;
  totalEventsAttended: number;
  totalMessagesSent: number;
  averageEngagementScore: number;
  xpTrend: { date: string; xp: number }[];
}

export class AnalyticsRepository extends BaseRepository {
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

  async getOverview(): Promise<AggregatedMetrics> {
    const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [totalStudents, dailyActive, weeklyActive, tasksCompleted, goalsCompleted, eventsAttended, messagesSent, engagementSum] = await Promise.all([
      this.db.prepare('SELECT COUNT(*) as count FROM users').bind().all(),
      this.db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM tasks WHERE completed = 1 AND updated_at > ?').bind(sinceDay).all(),
      this.db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM tasks WHERE completed = 1 AND updated_at > ?').bind(sinceWeek).all(),
      this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE completed = 1').bind().all(),
      this.db.prepare('SELECT COUNT(*) as count FROM goals WHERE completed = 1').bind().all(),
      this.db.prepare('SELECT COUNT(*) as count FROM event_attendees').bind().all(),
      this.db.prepare('SELECT COUNT(*) as count FROM messages').bind().all(),
      this.db.prepare('SELECT SUM(xp_total) as total FROM users').bind().all(),
    ]);

    const xpTrend = await this.getXPTrend(7);

    return {
      dailyActiveStudents: Number((dailyActive.results?.[0] as { count?: number })?.count ?? 0),
      weeklyActiveStudents: Number((weeklyActive.results?.[0] as { count?: number })?.count ?? 0),
      totalStudents: Number((totalStudents.results?.[0] as { count?: number })?.count ?? 0),
      totalTasksCompleted: Number((tasksCompleted.results?.[0] as { count?: number })?.count ?? 0),
      totalGoalsCompleted: Number((goalsCompleted.results?.[0] as { count?: number })?.count ?? 0),
      totalEventsAttended: Number((eventsAttended.results?.[0] as { count?: number })?.count ?? 0),
      totalMessagesSent: Number((messagesSent.results?.[0] as { count?: number })?.count ?? 0),
      averageEngagementScore: 0, // computed in service if needed
      xpTrend,
    };
  }

  async getSchoolMetrics(schoolId: string): Promise<AggregatedMetrics> {
    const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [totalStudents, dailyActive, weeklyActive, tasksCompleted, goalsCompleted, eventsAttended, messagesSent] = await Promise.all([
      this.db.prepare('SELECT COUNT(*) as count FROM users WHERE school_id = ?').bind(schoolId).all(),
      this.db.prepare('SELECT COUNT(DISTINCT t.user_id) as count FROM tasks t JOIN users u ON u.id = t.user_id WHERE t.completed = 1 AND t.updated_at > ? AND u.school_id = ?').bind(sinceDay, schoolId).all(),
      this.db.prepare('SELECT COUNT(DISTINCT t.user_id) as count FROM tasks t JOIN users u ON u.id = t.user_id WHERE t.completed = 1 AND t.updated_at > ? AND u.school_id = ?').bind(sinceWeek, schoolId).all(),
      this.db.prepare('SELECT COUNT(*) as count FROM tasks t JOIN users u ON u.id = t.user_id WHERE t.completed = 1 AND u.school_id = ?').bind(schoolId).all(),
      this.db.prepare('SELECT COUNT(*) as count FROM goals g JOIN users u ON u.id = g.user_id WHERE g.completed = 1 AND u.school_id = ?').bind(schoolId).all(),
      this.db.prepare('SELECT COUNT(*) as count FROM event_attendees ea JOIN users u ON u.id = ea.user_id WHERE u.school_id = ?').bind(schoolId).all(),
      this.db.prepare('SELECT COUNT(*) as count FROM messages m JOIN users u ON u.id = m.sender_id WHERE u.school_id = ?').bind(schoolId).all(),
    ]);

    const xpTrend = await this.getSchoolXPTrend(schoolId, 7);

    return {
      dailyActiveStudents: Number((dailyActive.results?.[0] as { count?: number })?.count ?? 0),
      weeklyActiveStudents: Number((weeklyActive.results?.[0] as { count?: number })?.count ?? 0),
      totalStudents: Number((totalStudents.results?.[0] as { count?: number })?.count ?? 0),
      totalTasksCompleted: Number((tasksCompleted.results?.[0] as { count?: number })?.count ?? 0),
      totalGoalsCompleted: Number((goalsCompleted.results?.[0] as { count?: number })?.count ?? 0),
      totalEventsAttended: Number((eventsAttended.results?.[0] as { count?: number })?.count ?? 0),
      totalMessagesSent: Number((messagesSent.results?.[0] as { count?: number })?.count ?? 0),
      averageEngagementScore: 0,
      xpTrend,
    };
  }

  async saveSnapshot(scope: string, snapshotType: string, metrics: Record<string, unknown>, scopeId?: string): Promise<AnalyticsSnapshotRecord> {
    const id = this.createId('snapshot');
    const now = this.now();
    const today = now.split('T')[0];
    const metricsJson = JSON.stringify(metrics);
    await this.db
      .prepare('INSERT INTO analytics_snapshots (id, scope, scope_id, snapshot_type, snapshot_date, metrics, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, scope, scopeId ?? null, snapshotType, today, metricsJson, now)
      .run();
    return { id, scope, scopeId, snapshotType, snapshotDate: today, metrics: metricsJson, createdAt: now };
  }

  private async getXPTrend(days: number): Promise<{ date: string; xp: number }[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const result = await this.db
      .prepare('SELECT DATE(created_at) as date, SUM(xp_reward) as xp FROM tasks WHERE completed = 1 AND created_at > ? GROUP BY DATE(created_at) ORDER BY date')
      .bind(since)
      .all();
    return (result.results ?? []).map((row) => ({ date: String(row.date ?? ''), xp: Number(row.xp ?? 0) }));
  }

  private async getSchoolXPTrend(schoolId: string, days: number): Promise<{ date: string; xp: number }[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const result = await this.db
      .prepare('SELECT DATE(t.created_at) as date, SUM(t.xp_reward) as xp FROM tasks t JOIN users u ON u.id = t.user_id WHERE t.completed = 1 AND t.created_at > ? AND u.school_id = ? GROUP BY DATE(t.created_at) ORDER BY date')
      .bind(since, schoolId)
      .all();
    return (result.results ?? []).map((row) => ({ date: String(row.date ?? ''), xp: Number(row.xp ?? 0) }));
  }
}
