import { AchievementsRepository, type AchievementRecord, type UserAchievementRecord } from '../repositories/AchievementsRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface EnrichedAchievement extends AchievementRecord {
  unlockedAt?: string;
}

export class AchievementsService {
  constructor(private readonly repository: AchievementsRepository) {}

  async listAchievements(userId: string): Promise<EnrichedAchievement[]> {
    assertNonEmpty(userId, 'User id is required');
    const [all, unlocked] = await Promise.all([
      this.repository.listAchievements(),
      this.repository.listUserAchievements(userId),
    ]);
    const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));
    return all.map((a) => ({ ...a, unlockedAt: unlockedMap.get(a.id) }));
  }

  async checkAndUnlock(userId: string): Promise<UserAchievementRecord[]> {
    assertNonEmpty(userId, 'User id is required');
    const [achievements, stats] = await Promise.all([
      this.repository.listAchievements(),
      this.repository.getUserStats(userId),
    ]);
    const unlocked = await this.repository.listUserAchievements(userId);
    const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
    const newlyUnlocked: UserAchievementRecord[] = [];

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;
      if (this.meetsCriteria(achievement, stats)) {
        newlyUnlocked.push(await this.repository.unlockAchievement(userId, achievement.id, { category: achievement.category }));
      }
    }

    // Personal records
    await this.repository.upsertPersonalRecord(userId, 'longest_streak', stats.longestStreak, 'days');
    await this.repository.upsertPersonalRecord(userId, 'most_messages', stats.messagesSent, 'messages');
    await this.repository.upsertPersonalRecord(userId, 'events_attended', stats.eventsAttended, 'events');
    await this.repository.upsertPersonalRecord(userId, 'goals_completed', stats.goalsCompleted, 'goals');
    await this.repository.upsertPersonalRecord(userId, 'xp', stats.xp, 'xp');

    return newlyUnlocked;
  }

  private meetsCriteria(achievement: AchievementRecord, stats: { tasksCompleted: number; goalsCompleted: number; messagesSent: number; eventsAttended: number; currentStreak: number; longestStreak: number; xp: number }): boolean {
    try {
      const criteria = JSON.parse(achievement.criteria);
      if (criteria.tasksCompleted && stats.tasksCompleted < criteria.tasksCompleted) return false;
      if (criteria.goalsCompleted && stats.goalsCompleted < criteria.goalsCompleted) return false;
      if (criteria.messagesSent && stats.messagesSent < criteria.messagesSent) return false;
      if (criteria.eventsAttended && stats.eventsAttended < criteria.eventsAttended) return false;
      if (criteria.streakDays && stats.longestStreak < criteria.streakDays) return false;
      if (criteria.level && stats.xp < criteria.level * 100) return false;
      return true;
    } catch {
      return false;
    }
  }
}
