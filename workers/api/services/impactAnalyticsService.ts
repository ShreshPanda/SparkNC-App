import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';
import { FeatureRequestRepository } from '../repositories/FeatureRequestRepository';

export interface ImpactAnalytics {
  studentExperience: {
    averageSatisfaction: number;
    feedbackCount: number;
    sentimentDistribution: { positive: number; neutral: number; needsSupport: number };
    topThemes: { category: string; count: number }[];
    commonChallenges: { text: string; count: number }[];
  };
  engagement: {
    totalStudents: number;
    weeklyActiveStudents: number;
    dailyActiveStudents: number;
    taskCompletionRate: number;
    goalCompletionRate: number;
    eventParticipationRate: number;
  };
  growth: {
    totalTasksCompleted: number;
    totalGoalsCompleted: number;
    totalEventsAttended: number;
    totalMessagesSent: number;
    xpTrend: { date: string; xp: number }[];
  };
  featureRequests: { status: string; count: number }[];
}

export class ImpactAnalyticsService {
  constructor(
    private readonly analytics: AnalyticsRepository,
    private readonly studentFeedback: StudentFeedbackRepository,
    private readonly ambassadorFeedback: AmbassadorFeedbackRepository,
    private readonly featureRequests: FeatureRequestRepository,
  ) {}

  async getOrganizationImpact(): Promise<ImpactAnalytics> {
    const [overview, feedback, ambassador, requests] = await Promise.all([
      this.analytics.getOverview(),
      this.studentFeedback.listAll(1000),
      this.ambassadorFeedback.listAll(1000),
      this.featureRequests.list(),
    ]);

    const sentiment = { positive: 0, neutral: 0, needsSupport: 0 };
    let totalRating = 0;
    let ratedCount = 0;
    const themeCounts: Record<string, number> = {};
    const challengeCounts: Record<string, number> = {};

    for (const f of feedback) {
      if (f.sentiment === 'positive') sentiment.positive++;
      else if (f.sentiment === 'needs_support') sentiment.needsSupport++;
      else sentiment.neutral++;
      if (f.rating !== undefined) {
        totalRating += f.rating;
        ratedCount++;
      }
      themeCounts[f.category] = (themeCounts[f.category] ?? 0) + 1;
      if (f.sentiment === 'needs_support' && f.feedbackText) {
        const key = f.feedbackText.toLowerCase().split('.')[0].slice(0, 80);
        challengeCounts[key] = (challengeCounts[key] ?? 0) + 1;
      }
    }

    for (const a of ambassador) {
      if (a.category === 'Student Engagement' || a.category === 'Common struggles') {
        const key = a.observation.toLowerCase().slice(0, 80);
        challengeCounts[key] = (challengeCounts[key] ?? 0) + 1;
      }
    }

    const topThemes = Object.entries(themeCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const commonChallenges = Object.entries(challengeCounts)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const statusCounts: Record<string, number> = {};
    for (const r of requests) {
      statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    }

    const taskCompletionRate = overview.totalStudents ? Math.min(1, overview.totalTasksCompleted / overview.totalStudents) : 0;
    const goalCompletionRate = overview.totalStudents ? Math.min(1, overview.totalGoalsCompleted / overview.totalStudents) : 0;
    const eventParticipationRate = overview.totalStudents ? Math.min(1, overview.totalEventsAttended / overview.totalStudents) : 0;

    return {
      studentExperience: {
        averageSatisfaction: ratedCount ? totalRating / ratedCount : 0,
        feedbackCount: feedback.length,
        sentimentDistribution: sentiment,
        topThemes,
        commonChallenges,
      },
      engagement: {
        totalStudents: overview.totalStudents,
        weeklyActiveStudents: overview.weeklyActiveStudents,
        dailyActiveStudents: overview.dailyActiveStudents,
        taskCompletionRate,
        goalCompletionRate,
        eventParticipationRate,
      },
      growth: {
        totalTasksCompleted: overview.totalTasksCompleted,
        totalGoalsCompleted: overview.totalGoalsCompleted,
        totalEventsAttended: overview.totalEventsAttended,
        totalMessagesSent: overview.totalMessagesSent,
        xpTrend: overview.xpTrend,
      },
      featureRequests: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    };
  }
}
