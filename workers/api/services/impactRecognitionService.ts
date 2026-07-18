import { AchievementsService, type EnrichedAchievement } from './achievementsService';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface RecognitionSummary {
  level: number;
  xp: number;
  achievements: EnrichedAchievement[];
  recentlyUnlocked: EnrichedAchievement[];
  nextMilestones: string[];
  strongestArea: string;
}

export class ImpactRecognitionService {
  constructor(
    private readonly achievementsService: AchievementsService,
    private readonly insightRepository: StudentInsightRepository,
  ) {}

  async getRecognitionSummary(userId: string): Promise<RecognitionSummary> {
    assertNonEmpty(userId, 'User id is required');
    const [achievements, stats] = await Promise.all([
      this.achievementsService.listAchievements(userId),
      this.insightRepository.getUserStats(userId),
    ]);
    const recentlyUnlocked = achievements.filter((a) => a.unlockedAt && new Date(a.unlockedAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000);
    const locked = achievements.filter((a) => !a.unlockedAt);
    const nextMilestones = locked.slice(0, 3).map((a) => a.title);
    const strongestArea = this.computeStrongestArea(stats);

    return {
      level: stats.level,
      xp: stats.xp,
      achievements,
      recentlyUnlocked,
      nextMilestones,
      strongestArea,
    };
  }

  private computeStrongestArea(stats: Awaited<ReturnType<StudentInsightRepository['getUserStats']>>): string {
    const scores = [
      { name: 'Productivity', value: stats.tasksCompleted },
      { name: 'Goal-Setting', value: stats.goalsCompleted },
      { name: 'Community', value: stats.eventsAttended + stats.messagesSent },
      { name: 'Consistency', value: stats.currentStreak },
      { name: 'Impact', value: stats.xp / 100 },
    ];
    return scores.sort((a, b) => b.value - a.value)[0]?.name ?? 'Growth';
  }
}
