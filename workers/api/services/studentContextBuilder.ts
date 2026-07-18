import { StudentInsightRepository } from '../repositories/StudentInsightRepository';

export interface StudentContext {
  name?: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  tasksTotal: number;
  tasksCompleted: number;
  goalsCompleted: number;
  eventsAttended: number;
  messagesSent: number;
  pendingTasks: { id: string; title: string }[];
  activeGoals: { id: string; title: string; progress: number }[];
  insights: { title: string; description: string }[];
}

export class StudentContextBuilder {
  constructor(private readonly insightRepository: StudentInsightRepository) {}

  async build(userId: string): Promise<StudentContext> {
    const [stats, insights, pendingTasks, activeGoals] = await Promise.all([
      this.insightRepository.getUserStats(userId),
      this.insightRepository.listInsights(userId).then((list) => list.slice(0, 5)),
      this.getPendingTasks(userId),
      this.getActiveGoals(userId),
    ]);

    return {
      xp: stats.xp,
      level: stats.level,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      tasksTotal: stats.tasksTotal,
      tasksCompleted: stats.tasksCompleted,
      goalsCompleted: stats.goalsCompleted,
      eventsAttended: stats.eventsAttended,
      messagesSent: stats.messagesSent,
      pendingTasks,
      activeGoals,
      insights: insights.map((i) => ({ title: i.title, description: i.description })),
    };
  }

  private async getPendingTasks(userId: string): Promise<{ id: string; title: string }[]> {
    const result = await this.insightRepository['db']
      ?.prepare('SELECT id, title FROM tasks WHERE user_id = ? AND completed = 0 ORDER BY created_at DESC LIMIT 5')
      .bind(userId)
      .all();
    return (result?.results ?? []).map((row: any) => ({ id: String(row.id ?? ''), title: String(row.title ?? '') }));
  }

  private async getActiveGoals(userId: string): Promise<{ id: string; title: string; progress: number }[]> {
    const result = await this.insightRepository['db']
      ?.prepare('SELECT id, title, progress FROM goals WHERE user_id = ? AND completed = 0 ORDER BY created_at DESC LIMIT 3')
      .bind(userId)
      .all();
    return (result?.results ?? []).map((row: any) => ({ id: String(row.id ?? ''), title: String(row.title ?? ''), progress: Number(row.progress ?? 0) }));
  }
}
