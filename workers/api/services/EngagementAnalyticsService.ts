import { EngagementAnalyticsRepository } from '../repositories/EngagementAnalyticsRepository';

export interface EngagementSummary {
  dau: number;
  wau: number;
  mau: number;
  totalRegistered: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  taskCompletions: { today: number; week: number; month: number };
  goalCompletions: { today: number; week: number; month: number };
  communityPosts: { today: number; week: number; month: number };
  featureUsage: { label: string; count: number }[];
  dailyActiveSeries: { label: string; count: number }[];
}

export class EngagementAnalyticsService {
  constructor(private readonly repository: EngagementAnalyticsRepository) {}

  async getEngagementSummary(): Promise<EngagementSummary> {
    const [dau, wau, mau, totalRegistered, newToday, newWeek, newMonth, tasksToday, tasksWeek, tasksMonth, goalsToday, goalsWeek, goalsMonth, postsToday, postsWeek, postsMonth, featureUsage, dailyActiveSeries] = await Promise.all([
      this.repository.activeUsers(1),
      this.repository.activeUsers(7),
      this.repository.activeUsers(30),
      this.repository.totalRegistered(),
      this.repository.newUsers(1),
      this.repository.newUsers(7),
      this.repository.newUsers(30),
      this.repository.completedTasks(1),
      this.repository.completedTasks(7),
      this.repository.completedTasks(30),
      this.repository.completedGoals(1),
      this.repository.completedGoals(7),
      this.repository.completedGoals(30),
      this.repository.communityPosts(1),
      this.repository.communityPosts(7),
      this.repository.communityPosts(30),
      this.repository.featureUsage(30),
      this.repository.dailyActiveSeries(14),
    ]);

    return {
      dau,
      wau,
      mau,
      totalRegistered,
      newToday,
      newThisWeek: newWeek,
      newThisMonth: newMonth,
      taskCompletions: { today: tasksToday, week: tasksWeek, month: tasksMonth },
      goalCompletions: { today: goalsToday, week: goalsWeek, month: goalsMonth },
      communityPosts: { today: postsToday, week: postsWeek, month: postsMonth },
      featureUsage,
      dailyActiveSeries,
    };
  }

  async getRetentionCohort(daysAgo: number): Promise<{ cohortSize: number; retained: number; rate: number }> {
    // Cohort: users created `daysAgo` days ago who were active in the last 7 days.
    const [newThen, activeNow] = await Promise.all([
      this.repository.newUsers(daysAgo + 1),
      this.repository.activeUsers(7),
    ]);
    const retained = activeNow; // Simplified approximation for MVP
    const rate = newThen > 0 ? Math.round((retained / newThen) * 100) : 0;
    return { cohortSize: newThen, retained, rate };
  }

  async getFeatureUsage(days = 30): Promise<{ label: string; count: number }[]> {
    return this.repository.featureUsage(days);
  }
}
