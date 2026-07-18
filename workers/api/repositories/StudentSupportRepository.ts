import { BaseRepository } from './baseRepository';

export interface SupportStudent {
  userId: string;
  name?: string;
  email?: string;
  lastActiveAt: string;
  daysInactive: number;
  recentXp: number;
  recentTasks: number;
  recentGoals: number;
  streak?: number;
  risk: 'inactive' | 'needs_encouragement' | 'strong_growth';
}

export class StudentSupportRepository extends BaseRepository {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {
    super();
  }

  async loadStudents(schoolId?: string, locationId?: string): Promise<SupportStudent[]> {
    let query = "SELECT id, name, email, created_at FROM users WHERE role = 'student'";
    const params: unknown[] = [];
    if (schoolId) {
      query += ' AND school_id = ?';
      params.push(schoolId);
    }
    if (locationId) {
      query += ' AND location_id = ?';
      params.push(locationId);
    }
    const result = await this.db.prepare(query).bind(...params).all();
    const users = result.results ?? [];
    const students: SupportStudent[] = [];
    for (const user of users) {
      const userId = String(user.id ?? '');
      const recentActivity = await this.loadRecentActivity(userId);
      const daysInactive = this.daysSince(recentActivity.lastEventAt);
      let risk: SupportStudent['risk'] = 'needs_encouragement';
      if (daysInactive >= 14) risk = 'inactive';
      else if (recentActivity.tasksCompleted + recentActivity.goalsCompleted >= 5 && daysInactive < 3) risk = 'strong_growth';
      students.push({
        userId,
        name: user.name == null ? undefined : String(user.name),
        email: user.email == null ? undefined : String(user.email),
        lastActiveAt: recentActivity.lastEventAt ?? String(user.created_at ?? ''),
        daysInactive,
        recentXp: recentActivity.xpEarned,
        recentTasks: recentActivity.tasksCompleted,
        recentGoals: recentActivity.goalsCompleted,
        streak: recentActivity.streak,
        risk,
      });
    }
    return students;
  }

  private async loadRecentActivity(userId: string): Promise<{ lastEventAt?: string; xpEarned: number; tasksCompleted: number; goalsCompleted: number; streak?: number }> {
    const cutoff = this.daysAgoISO(14);
    const result = await this.db
      .prepare('SELECT action, xp_delta, created_at FROM growth_events WHERE user_id = ? AND created_at >= ? ORDER BY created_at DESC')
      .bind(userId, cutoff)
      .all();
    let xpEarned = 0;
    let tasksCompleted = 0;
    let goalsCompleted = 0;
    let lastEventAt: string | undefined;
    for (const row of result.results ?? []) {
      if (!lastEventAt && row.created_at) lastEventAt = String(row.created_at);
      xpEarned += Number(row.xp_delta ?? 0);
      if (row.action === 'task_completed') tasksCompleted += 1;
      if (row.action === 'goal_completed') goalsCompleted += 1;
    }
    return { lastEventAt, xpEarned, tasksCompleted, goalsCompleted };
  }

  private daysAgoISO(days: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString();
  }

  private daysSince(iso?: string): number {
    if (!iso) return 9999;
    const then = new Date(iso).getTime();
    const now = Date.now();
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
  }
}
