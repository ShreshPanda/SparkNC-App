import { UserStatsRepository } from '../repositories/UserStatsRepository';

const DEFAULT_TASK_XP = 50;
const DEFAULT_GOAL_XP = 100;
const DEFAULT_DAILY_XP = 10;

export class XPService {
  constructor(
    private readonly db: {
      prepare: (query: string) => {
        bind: (...values: unknown[]) => {
          run: () => Promise<unknown>;
          all: () => Promise<{ results: Record<string, unknown>[] }>;
        };
      };
    },
  ) {}

  private get repository() {
    return new UserStatsRepository(this.db);
  }

  async getUserXp(userId: string): Promise<number> {
    const stats = await this.repository.getStats(userId);
    return stats?.xpTotal ?? 0;
  }

  async awardTaskCompletion(userId: string, xpReward?: number): Promise<number> {
    const xp = xpReward ?? DEFAULT_TASK_XP;
    await this.repository.addXp(userId, xp);
    return xp;
  }

  async awardGoalCompletion(userId: string, xpReward?: number): Promise<number> {
    const xp = xpReward ?? DEFAULT_GOAL_XP;
    await this.repository.addXp(userId, xp);
    return xp;
  }

  async awardDailyActivity(userId: string): Promise<number> {
    const xp = DEFAULT_DAILY_XP;
    await this.repository.addXp(userId, xp);
    return xp;
  }
}
