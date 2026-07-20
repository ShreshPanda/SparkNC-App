import { PilotOperationsRepository } from '../repositories/PilotOperationsRepository';

export interface PilotDashboard {
  active: {
    daily: { date: string; count: number }[];
    monthly: number;
  };
  completions: {
    tasks: number;
    goals: number;
    eventsAttended: number;
  };
  engagement: {
    messagesSent: number;
    communityPosts: number;
    aiInteractions: number;
    featureUsage: Record<string, number>;
  };
  averages: {
    streak: number;
    xp: number;
    satisfaction: number;
  };
  retention: {
    sevenDay: number;
    thirtyDay: number;
  };
  exportable: boolean;
}

export class PilotOperationsDashboardService {
  constructor(private readonly repo: PilotOperationsRepository) {}

  async buildDashboard(days = 30, features: string[] = ['task_complete', 'goal_complete', 'ai_chat', 'event_join']): Promise<PilotDashboard> {
    const [
      daily,
      monthly,
      tasks,
      goals,
      events,
      messages,
      community,
      ai,
      streak,
      xp,
      satisfaction,
    ] = await Promise.all([
      this.repo.dailyActiveUsers(days),
      this.repo.monthlyActiveUsers(),
      this.repo.taskCompletions(days),
      this.repo.goalCompletions(days),
      this.repo.eventsAttended(days),
      this.repo.messagesSent(days),
      this.repo.communityActivity(days),
      this.repo.aiInteractions(days),
      this.repo.averageStreak(),
      this.repo.averageXP(),
      this.repo.satisfactionScore(),
    ]);

    const featureUsage: Record<string, number> = {};
    for (const feature of features) {
      featureUsage[feature] = await this.repo.featureUsage(feature, days);
    }

    const retention7 = this.computeRetention(daily, 7);
    const retention30 = this.computeRetention(daily, 30);

    return {
      active: { daily, monthly },
      completions: { tasks, goals, eventsAttended: events },
      engagement: { messagesSent: messages, communityPosts: community, aiInteractions: ai, featureUsage },
      averages: { streak, xp, satisfaction },
      retention: { sevenDay: retention7, thirtyDay: retention30 },
      exportable: true,
    };
  }

  private computeRetention(daily: { date: string; count: number }[], days: number): number {
    if (daily.length < days) return 0;
    const recent = daily.slice(-days);
    const active = recent.filter((d) => d.count > 0).length;
    return Math.round((active / days) * 100);
  }
}
