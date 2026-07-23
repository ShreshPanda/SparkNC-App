import { StudentInsightRepository, type StudentStatsRecord } from '../repositories/StudentInsightRepository';
import { OnboardingRepository } from '../repositories/OnboardingRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface OpportunityRecommendation {
  id: string;
  title: string;
  category: 'leadership' | 'volunteer' | 'event' | 'club' | 'workshop' | 'competition' | 'community';
  score: number;
  reason: string;
  action: string;
}

type OpportunityRule = {
  id: string;
  title: string;
  category: OpportunityRecommendation['category'];
  action: string;
  score: (stats: StudentStatsRecord, interests: string[]) => number;
  reason: (stats: StudentStatsRecord, interests: string[]) => string;
};

const OPPORTUNITY_CATALOG: OpportunityRule[] = [
  {
    id: 'leadership-club-role',
    title: 'Run for a club leadership role',
    category: 'leadership',
    action: 'Explore open leadership positions',
    score: (s) => Math.min(100, (s.goalsCompleted * 10) + (s.eventsAttended * 5) + (s.xp / 50)),
    reason: (s) => `You have completed ${s.goalsCompleted} goals and attended ${s.eventsAttended} events.`,
  },
  {
    id: 'volunteer-hours',
    title: 'Volunteer two hours this week',
    category: 'volunteer',
    action: 'Find a volunteer opportunity',
    score: (s, i) => 60 + (i.includes('community') ? 25 : 0) + Math.min(20, s.eventsAttended * 3),
    reason: () => 'Volunteering builds community impact and leadership experience.',
  },
  {
    id: 'stem-activities',
    title: 'Complete three STEM activities',
    category: 'event',
    action: 'Browse STEM events',
    score: (s, i) => 40 + (i.includes('science') || i.includes('technology') ? 30 : 0) + Math.min(30, s.tasksCompleted * 2),
    reason: (s, i) => i.length ? `Your interests include ${i.slice(0, 2).join(', ')}.` : `You have completed ${s.tasksCompleted} tasks.`,
  },
  {
    id: 'seven-day-streak',
    title: 'Build a 7-day streak',
    category: 'community',
    action: 'Complete one daily task',
    score: (s) => 70 + (s.currentStreak >= 3 ? 20 : 0) - (s.currentStreak >= 7 ? 90 : 0),
    reason: (s) => s.currentStreak >= 7 ? 'You already have a 7-day streak!' : `Your current streak is ${s.currentStreak} days.`,
  },
  {
    id: 'competition-prep',
    title: 'Join a school competition',
    category: 'competition',
    action: 'View upcoming competitions',
    score: (s, i) => 50 + (i.includes('programming') || i.includes('design') || i.includes('science') ? 30 : 0) + Math.min(20, s.xp / 100),
    reason: (s) => `You have ${s.xp} XP and are ready for a challenge.`,
  },
  {
    id: 'workshop-attendance',
    title: 'Attend a workshop',
    category: 'workshop',
    action: 'See upcoming workshops',
    score: (s) => 55 + Math.min(40, s.eventsAttended * 5) - (s.eventsAttended > 0 ? 10 : 0),
    reason: (s) => s.eventsAttended > 0 ? `You have attended ${s.eventsAttended} events.` : 'Workshops are a great way to learn quickly.',
  },
  {
    id: 'robotics-club',
    title: 'Check out the Robotics Club',
    category: 'club',
    action: 'Learn more',
    score: (s, i) => 45 + (i.includes('robotics') || i.includes('engineering') ? 35 : 0) + Math.min(20, s.tasksCompleted * 2),
    reason: (s) => `You have completed ${s.tasksCompleted} tasks; robotics combines building and problem solving.`,
  },
];

export class OpportunityService {
  constructor(
    private readonly insightRepository: StudentInsightRepository,
    private readonly onboardingRepository: OnboardingRepository,
  ) {}

  async getRecommendations(userId: string): Promise<OpportunityRecommendation[]> {
    assertNonEmpty(userId, 'User id is required');
    const stats = await this.insightRepository.getUserStats(userId);
    const onboarding = await this.onboardingRepository.findByUserId(userId);
    const interests = onboarding?.interests ?? [];

    return OPPORTUNITY_CATALOG
      .map((rule) => {
        const score = Math.round(rule.score(stats, interests));
        const reason = rule.reason(stats, interests);
        return {
          id: rule.id,
          title: rule.title,
          category: rule.category,
          score: Math.max(0, Math.min(100, score)),
          reason,
          action: rule.action,
        };
      })
      .filter((o) => o.score > 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }
}
