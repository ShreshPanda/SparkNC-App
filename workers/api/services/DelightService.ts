export type DelightType = 'birthday' | 'anniversary' | 'weekly_recap' | 'semester_recap' | 'xp_milestone' | 'achievement_unlock' | 'streak_milestone' | 'welcome_back' | 'community_appreciation';

export interface DelightEvent {
  id: string;
  userId: string;
  type: DelightType;
  title: string;
  deliveredAt: string;
}

export class DelightService {
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

  async shouldCelebrateBirthday(userId: string, birthDate: string | undefined): Promise<DelightEvent | null> {
    if (!birthDate) return null;
    const today = new Date();
    const [month, day] = [today.getMonth() + 1, today.getDate()];
    const b = new Date(birthDate);
    if (b.getMonth() + 1 === month && b.getDate() === day) {
      return this.logEvent(userId, 'birthday', 'Happy birthday! 🎉');
    }
    return null;
  }

  async checkXPMilestone(userId: string, previousXP: number, currentXP: number): Promise<DelightEvent | null> {
    const previousMilestone = Math.floor(previousXP / 100) * 100;
    const currentMilestone = Math.floor(currentXP / 100) * 100;
    if (currentMilestone > previousMilestone && currentMilestone > 0) {
      return this.logEvent(userId, 'xp_milestone', `You reached ${currentMilestone} XP!`);
    }
    return null;
  }

  async checkStreakMilestone(userId: string, streak: number): Promise<DelightEvent | null> {
    if (streak === 7 || streak === 30 || streak === 100) {
      return this.logEvent(userId, 'streak_milestone', `${streak}-day streak! Keep it going.`);
    }
    return null;
  }

  async welcomeBack(userId: string, daysInactive: number): Promise<DelightEvent | null> {
    if (daysInactive > 7) {
      return this.logEvent(userId, 'welcome_back', 'Welcome back! We saved your spot.');
    }
    return null;
  }

  async getRecentDelights(userId: string, limit = 10): Promise<DelightEvent[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, event_type, title, delivered_at FROM delight_events WHERE user_id = ? ORDER BY delivered_at DESC LIMIT ?')
      .bind(userId, limit)
      .all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      type: String(row.event_type ?? '') as DelightType,
      title: String(row.title ?? ''),
      deliveredAt: String(row.delivered_at ?? ''),
    }));
  }

  private async logEvent(userId: string, type: DelightType, title: string): Promise<DelightEvent> {
    const id = `delight-${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date().toISOString();
    await this.db
      .prepare('INSERT INTO delight_events (id, user_id, event_type, title, delivered_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, userId, type, title, now)
      .run();
    return { id, userId, type, title, deliveredAt: now };
  }
}
