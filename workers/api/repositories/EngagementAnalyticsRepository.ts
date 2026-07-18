import { BaseRepository } from './baseRepository';

export interface ActivityCount {
  label: string;
  count: number;
}

export class EngagementAnalyticsRepository extends BaseRepository {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {
    super();
  }

  async activeUsers(days: number): Promise<number> {
    const cutoff = this.daysAgoISO(days);
    const result = await this.db
      .prepare('SELECT COUNT(DISTINCT user_id) as cnt FROM growth_events WHERE created_at >= ?')
      .bind(cutoff)
      .all();
    return Number(result.results?.[0]?.cnt ?? 0);
  }

  async totalRegistered(): Promise<number> {
    const result = await this.db
      .prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'")
      .bind()
      .all();
    return Number(result.results?.[0]?.cnt ?? 0);
  }

  async newUsers(days: number): Promise<number> {
    const cutoff = this.daysAgoISO(days);
    const result = await this.db
      .prepare('SELECT COUNT(*) as cnt FROM users WHERE created_at >= ?')
      .bind(cutoff)
      .all();
    return Number(result.results?.[0]?.cnt ?? 0);
  }

  async completedTasks(days: number): Promise<number> {
    const cutoff = this.daysAgoISO(days);
    const result = await this.db
      .prepare("SELECT COUNT(*) as cnt FROM growth_events WHERE action = 'task_completed' AND created_at >= ?")
      .bind(cutoff)
      .all();
    return Number(result.results?.[0]?.cnt ?? 0);
  }

  async completedGoals(days: number): Promise<number> {
    const cutoff = this.daysAgoISO(days);
    const result = await this.db
      .prepare("SELECT COUNT(*) as cnt FROM growth_events WHERE action = 'goal_completed' AND created_at >= ?")
      .bind(cutoff)
      .all();
    return Number(result.results?.[0]?.cnt ?? 0);
  }

  async communityPosts(days: number): Promise<number> {
    const cutoff = this.daysAgoISO(days);
    const result = await this.db
      .prepare('SELECT COUNT(*) as cnt FROM group_posts WHERE created_at >= ?')
      .bind(cutoff)
      .all();
    return Number(result.results?.[0]?.cnt ?? 0);
  }

  async featureUsage(days: number): Promise<ActivityCount[]> {
    const cutoff = this.daysAgoISO(days);
    const result = await this.db
      .prepare('SELECT action, COUNT(*) as cnt FROM growth_events WHERE created_at >= ? GROUP BY action ORDER BY cnt DESC')
      .bind(cutoff)
      .all();
    return (result.results ?? []).map((row) => ({
      label: String(row.action ?? 'unknown'),
      count: Number(row.cnt ?? 0),
    }));
  }

  async dailyActiveSeries(days: number): Promise<ActivityCount[]> {
    const series: ActivityCount[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = this.daysAgoISO(i + 1);
      const end = this.daysAgoISO(i);
      const result = await this.db
        .prepare('SELECT COUNT(DISTINCT user_id) as cnt FROM growth_events WHERE created_at >= ? AND created_at < ?')
        .bind(start, end)
        .all();
      series.push({ label: start.slice(0, 10), count: Number(result.results?.[0]?.cnt ?? 0) });
    }
    return series;
  }

  private daysAgoISO(days: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString();
  }
}
