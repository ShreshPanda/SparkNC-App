import { UserStatsRepository } from '../repositories/UserStatsRepository';

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function previousDay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00.000Z');
  date.setUTCDate(date.getUTCDate() - 1);
  return toIsoDate(date);
}

export interface StreakResult {
  current: number;
  longest: number;
  updated: boolean;
}

export class StreakService {
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

  async getStreak(userId: string): Promise<{ current: number; longest: number }> {
    const stats = await this.repository.getStats(userId);
    return {
      current: stats?.currentStreak ?? 0,
      longest: stats?.longestStreak ?? 0,
    };
  }

  async recordActivity(userId: string): Promise<StreakResult> {
    const stats = await this.repository.getStats(userId);
    const today = toIsoDate(new Date());

    if (stats?.lastActivityAt === today) {
      return { current: stats.currentStreak, longest: stats.longestStreak, updated: false };
    }

    let current = 1;
    let longest = 1;

    if (stats) {
      longest = Math.max(stats.longestStreak, 1);
      if (stats.lastActivityAt === previousDay(today)) {
        current = stats.currentStreak + 1;
        longest = Math.max(current, longest);
      }
    }

    await this.repository.updateStreak(userId, current, longest, today);
    return { current, longest, updated: true };
  }
}
