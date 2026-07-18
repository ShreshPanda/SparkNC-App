import { StudentInsightRepository, type StudentStatsRecord } from '../repositories/StudentInsightRepository';
import { AchievementsRepository } from '../repositories/AchievementsRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface GrowthCategory {
  name: string;
  score: number;
  label: string;
}

export interface GrowthStatistics {
  xp: number;
  goalsCompleted: number;
  tasksCompleted: number;
  eventsAttended: number;
  currentStreak: number;
  longestStreak: number;
  engagementScore: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  categories: GrowthCategory[];
}

export class GrowthStatisticsService {
  constructor(
    private readonly insightRepository: StudentInsightRepository,
    private readonly achievementsRepository: AchievementsRepository,
  ) {}

  async getStatistics(userId: string): Promise<GrowthStatistics> {
    assertNonEmpty(userId, 'User id is required');
    const stats = await this.insightRepository.getUserStats(userId);
    const [achievements, unlocked] = await Promise.all([
      this.achievementsRepository.listAchievements(),
      this.achievementsRepository.listUserAchievements(userId),
    ]);
    const categories = this.buildCategories(stats);

    return {
      xp: stats.xp,
      goalsCompleted: stats.goalsCompleted,
      tasksCompleted: stats.tasksCompleted,
      eventsAttended: stats.eventsAttended,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      engagementScore: stats.engagementScore,
      achievementsUnlocked: unlocked.length,
      totalAchievements: achievements.length,
      categories,
    };
  }

  private buildCategories(stats: StudentStatsRecord): GrowthCategory[] {
    return [
      { name: 'Productivity', score: this.normalize(stats.tasksCompleted, 50), label: this.label(stats.tasksCompleted, 'tasks') },
      { name: 'Goal-Setting', score: this.normalize(stats.goalsCompleted, 25), label: this.label(stats.goalsCompleted, 'goals') },
      { name: 'Community', score: this.normalize(stats.eventsAttended + stats.messagesSent, 40), label: this.label(stats.eventsAttended, 'events') },
      { name: 'Consistency', score: this.normalize(stats.currentStreak, 30), label: `${stats.currentStreak}-day streak` },
      { name: 'Impact', score: this.normalize(stats.xp, 1000), label: `${stats.xp} XP` },
    ];
  }

  private normalize(value: number, target: number): number {
    return Math.min(100, Math.round((value / target) * 100));
  }

  private label(value: number, unit: string): string {
    return `${value} ${unit}`;
  }
}
