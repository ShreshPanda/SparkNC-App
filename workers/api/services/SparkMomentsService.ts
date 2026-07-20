import { SparkMomentsRepository, type SparkMomentRecord } from '../repositories/SparkMomentsRepository';

export interface UserStats {
  xp: number;
  goalsCompleted: number;
  tasksCompleted: number;
  communityContributions: number;
  streak: number;
}

export interface SparkMoment {
  type: string;
  title: string;
  description: string;
  threshold: number;
  thresholdType: 'xp' | 'goals' | 'tasks' | 'community' | 'streak';
  message: string;
}

const MOMENTS: SparkMoment[] = [
  { type: 'xp_100', title: '100 XP Milestone', description: 'You hit 100 XP!', threshold: 100, thresholdType: 'xp', message: 'Great start — 100 XP in the books!' },
  { type: 'xp_500', title: '500 XP Milestone', description: 'You hit 500 XP!', threshold: 500, thresholdType: 'xp', message: '500 XP! You are building serious momentum.' },
  { type: 'xp_1000', title: '1000 XP Milestone', description: 'You hit 1000 XP!', threshold: 1000, thresholdType: 'xp', message: '1000 XP — that is SparkNC dedication in action.' },
  { type: 'first_goal', title: 'First Goal Complete', description: 'You completed your first goal.', threshold: 1, thresholdType: 'goals', message: 'First goal down. This is what progress feels like.' },
  { type: 'goals_10', title: '10 Goals Complete', description: 'You completed 10 goals.', threshold: 10, thresholdType: 'goals', message: '10 goals completed — consistency is your superpower.' },
  { type: 'first_community', title: 'First Community Contribution', description: 'You posted or helped in the community for the first time.', threshold: 1, thresholdType: 'community', message: 'Welcome to the SparkNC community — your voice matters.' },
  { type: 'top_contributor', title: 'Top Contributor', description: 'You reached 50 community contributions.', threshold: 50, thresholdType: 'community', message: 'Top contributor — you are lifting others up.' },
  { type: 'streak_7', title: '7-Day Streak', description: 'You were active 7 days in a row.', threshold: 7, thresholdType: 'streak', message: '7-day streak! Momentum is building.' },
  { type: 'streak_30', title: '30-Day Streak', description: 'You were active 30 days in a row.', threshold: 30, thresholdType: 'streak', message: '30-day streak — unstoppable focus.' },
];

export class SparkMomentsService {
  constructor(private readonly repo: SparkMomentsRepository) {}

  async detectAndTrigger(userId: string, stats: UserStats): Promise<{ triggered: string[] }> {
    const triggered: string[] = [];
    for (const moment of MOMENTS) {
      const already = await this.repo.hasTriggered(userId, moment.type);
      if (already) continue;
      let hit = false;
      switch (moment.thresholdType) {
        case 'xp': hit = stats.xp >= moment.threshold; break;
        case 'goals': hit = stats.goalsCompleted >= moment.threshold; break;
        case 'tasks': hit = stats.tasksCompleted >= moment.threshold; break;
        case 'community': hit = stats.communityContributions >= moment.threshold; break;
        case 'streak': hit = stats.streak >= moment.threshold; break;
      }
      if (hit) {
        await this.repo.insert({
          userId,
          type: moment.type,
          title: moment.title,
          description: `${moment.message} (${moment.description})`,
          metadata: JSON.stringify({ threshold: moment.threshold, thresholdType: moment.thresholdType }),
        });
        triggered.push(moment.type);
      }
    }
    return { triggered };
  }

  async listMoments(userId: string): Promise<SparkMomentRecord[]> {
    return this.repo.listByUser(userId);
  }

  async acknowledge(userId: string, momentId: string): Promise<void> {
    return this.repo.acknowledge(momentId, userId);
  }

  getPossibleMoments(): SparkMoment[] {
    return MOMENTS;
  }
}
