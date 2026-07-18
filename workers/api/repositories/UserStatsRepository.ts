import { BaseRepository } from './baseRepository';

export interface UserStatsRecord {
  userId: string;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
}

export class UserStatsRepository extends BaseRepository {
  constructor(
    private readonly db: {
      prepare: (query: string) => {
        bind: (...values: unknown[]) => {
          run: () => Promise<unknown>;
          all: () => Promise<{ results: Record<string, unknown>[] }>;
        };
      };
    },
  ) {
    super();
  }

  async getStats(userId: string): Promise<UserStatsRecord | null> {
    try {
      const result = await this.db
        .prepare('SELECT id, xp_total, current_streak, longest_streak, last_activity_at FROM users WHERE id = ?')
        .bind(userId)
        .all();
      const row = result.results?.[0];
      if (!row) return null;
      return {
        userId: String(row.id ?? ''),
        xpTotal: Number(row.xp_total ?? 0),
        currentStreak: Number(row.current_streak ?? 0),
        longestStreak: Number(row.longest_streak ?? 0),
        lastActivityAt: row.last_activity_at == null ? null : String(row.last_activity_at),
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async addXp(userId: string, amount: number): Promise<void> {
    try {
      await this.db
        .prepare('UPDATE users SET xp_total = xp_total + ?, updated_at = ? WHERE id = ?')
        .bind(amount, this.now(), userId)
        .run();
    } catch (error) {
      throw new Error(`Failed to add XP: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async updateStreak(userId: string, currentStreak: number, longestStreak: number, lastActivityAt: string): Promise<void> {
    try {
      await this.db
        .prepare('UPDATE users SET current_streak = ?, longest_streak = ?, last_activity_at = ?, updated_at = ? WHERE id = ?')
        .bind(currentStreak, longestStreak, lastActivityAt, this.now(), userId)
        .run();
    } catch (error) {
      throw new Error(`Failed to update streak: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }
}
