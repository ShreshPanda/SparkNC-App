import { BaseRepository } from './baseRepository';

export class PilotOperationsRepository extends BaseRepository {
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

  private async scalar(query: string, ...values: unknown[]): Promise<number> {
    const { results } = await this.db.prepare(query).bind(...values).all();
    const row = results[0] ?? {};
    return Number(Object.values(row)[0] ?? 0);
  }

  async dailyActiveUsers(days = 30): Promise<{ date: string; count: number }[]> {
    const { results } = await this.db
      .prepare('SELECT date(created_at) as day, COUNT(DISTINCT user_id) as count FROM activity_logs WHERE created_at > datetime("now", ?) GROUP BY day ORDER BY day')
      .bind(`-${days} days`)
      .all();
    return (results ?? []).map((row) => ({ date: String(row.day ?? ''), count: Number(row.count ?? 0) }));
  }

  async monthlyActiveUsers(): Promise<number> {
    return this.scalar('SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE created_at > datetime("now", "-30 days")');
  }

  async taskCompletions(days = 30): Promise<number> {
    return this.scalar('SELECT COUNT(*) FROM tasks WHERE completed = 1 AND completed_at > datetime("now", ?)', `-${days} days`);
  }

  async goalCompletions(days = 30): Promise<number> {
    return this.scalar('SELECT COUNT(*) FROM goals WHERE completed = 1 AND completed_at > datetime("now", ?)', `-${days} days`);
  }

  async eventsAttended(days = 30): Promise<number> {
    return this.scalar('SELECT COUNT(*) FROM event_attendees WHERE created_at > datetime("now", ?)', `-${days} days`);
  }

  async messagesSent(days = 30): Promise<number> {
    return this.scalar('SELECT COUNT(*) FROM messages WHERE created_at > datetime("now", ?)', `-${days} days`);
  }

  async communityActivity(days = 30): Promise<number> {
    return this.scalar('SELECT COUNT(*) FROM group_posts WHERE created_at > datetime("now", ?)', `-${days} days`);
  }

  async aiInteractions(days = 30): Promise<number> {
    return this.scalar('SELECT COUNT(*) FROM ai_memory WHERE created_at > datetime("now", ?)', `-${days} days`);
  }

  async featureUsage(feature: string, days = 30): Promise<number> {
    return this.scalar('SELECT COUNT(*) FROM activity_logs WHERE action = ? AND created_at > datetime("now", ?)', feature, `-${days} days`);
  }

  async averageStreak(): Promise<number> {
    const { results } = await this.db
      .prepare('SELECT AVG(current_streak) as avg FROM users WHERE current_streak IS NOT NULL')
      .all();
    return Number((results[0] ?? {}).avg ?? 0);
  }

  async averageXP(): Promise<number> {
    const { results } = await this.db
      .prepare('SELECT AVG(xp) as avg FROM users WHERE xp IS NOT NULL')
      .all();
    return Math.round(Number((results[0] ?? {}).avg ?? 0));
  }

  async satisfactionScore(): Promise<number> {
    const { results } = await this.db
      .prepare('SELECT AVG(rating) as avg FROM student_feedback WHERE rating IS NOT NULL AND created_at > datetime("now", "-30 days")')
      .all();
    return Number(((results[0] ?? {}).avg ?? 0).toFixed(1));
  }
}
