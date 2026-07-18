import { StudentInsightRepository, type StudentInsightRecord, type StudentStatsRecord } from '../repositories/StudentInsightRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export class StudentInsightService {
  constructor(private readonly repository: StudentInsightRepository) {}

  async getDashboard(userId: string): Promise<StudentStatsRecord & { insights: StudentInsightRecord[] }> {
    assertNonEmpty(userId, 'User id is required');
    const [stats, insights] = await Promise.all([
      this.repository.getUserStats(userId),
      this.repository.listInsights(userId),
    ]);
    return { ...stats, insights };
  }

  async listInsights(userId: string): Promise<StudentInsightRecord[]> {
    assertNonEmpty(userId, 'User id is required');
    await this.repository.deleteExpiredInsights(userId);
    return this.repository.listInsights(userId);
  }

  async generateInsights(userId: string): Promise<StudentInsightRecord[]> {
    assertNonEmpty(userId, 'User id is required');
    await this.repository.deleteExpiredInsights(userId);
    const stats = await this.repository.getUserStats(userId);
    const taskTimes = await this.repository.getCompletedTaskTimes(userId);
    const recentMessages = await this.repository.getRecentMessagesCount(userId, 7);

    const insights: Omit<StudentInsightRecord, 'id' | 'userId' | 'createdAt'>[] = [];

    if (stats.tasksCompleted > 0 && taskTimes.length > 0) {
      const hourlyCounts = new Array(24).fill(0);
      for (const t of taskTimes) {
        hourlyCounts[t.hour]++;
      }
      const peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
      const formattedHour = peakHour === 0 ? '12 AM' : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`;
      insights.push({
        insightType: 'productivity_pattern',
        title: 'Peak productivity time',
        description: `You complete most tasks around ${formattedHour}.`,
        priority: 'normal',
        expiresAt: this.futureDate(7),
      });
    }

    if (stats.currentStreak > 0 && stats.currentStreak >= 5) {
      insights.push({
        insightType: 'streak',
        title: 'Streak momentum',
        description: `Your ${stats.currentStreak}-day streak is strong. Keep it up!`,
        priority: 'normal',
        expiresAt: this.futureDate(2),
      });
    } else if (stats.currentStreak === 0 && stats.tasksCompleted > 0) {
      insights.push({
        insightType: 'streak_risk',
        title: 'Streak at risk',
        description: 'You have no active streak. Complete a small task today to restart.',
        priority: 'high',
        expiresAt: this.futureDate(1),
      });
    }

    if (stats.tasksCompleted > 0) {
      insights.push({
        insightType: 'completion_rate',
        title: 'Completion momentum',
        description: `You have completed ${stats.tasksCompleted} tasks so far.`,
        priority: 'low',
        expiresAt: this.futureDate(7),
      });
    }

    if (recentMessages >= 5) {
      insights.push({
        insightType: 'community',
        title: 'Community helper',
        description: `You sent ${recentMessages} messages this week. Keep connecting!`,
        priority: 'normal',
        expiresAt: this.futureDate(7),
      });
    }

    if (stats.eventsAttended >= 1) {
      insights.push({
        insightType: 'engagement',
        title: 'Event participant',
        description: `You registered for ${stats.eventsAttended} event${stats.eventsAttended === 1 ? '' : 's'}.`,
        priority: 'low',
        expiresAt: this.futureDate(30),
      });
    }

    const saved: StudentInsightRecord[] = [];
    for (const insight of insights) {
      saved.push(await this.repository.saveInsight(userId, insight));
    }
    return saved;
  }

  private futureDate(days: number): string {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }
}
