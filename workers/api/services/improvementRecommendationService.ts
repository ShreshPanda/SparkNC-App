import { ImprovementRecommendationRepository, type ImprovementRecommendationRecord } from '../repositories/ImprovementRecommendationRepository';
import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export class ImprovementRecommendationService {
  constructor(
    private readonly repository: ImprovementRecommendationRepository,
    private readonly studentFeedback: StudentFeedbackRepository,
    private readonly ambassadorFeedback: AmbassadorFeedbackRepository,
    private readonly analytics: AnalyticsRepository,
  ) {}

  async generateForOrganization(): Promise<ImprovementRecommendationRecord[]> {
    const [studentFeedback, ambassadorFeedback, overview] = await Promise.all([
      this.studentFeedback.listAll(1000),
      this.ambassadorFeedback.listAll(1000),
      this.analytics.getOverview(),
    ]);

    const created: ImprovementRecommendationRecord[] = [];

    const supportCount = studentFeedback.filter((f) => f.sentiment === 'needs_support').length;
    if (supportCount > 0) {
      const deadlineMentions = studentFeedback.filter((f) => (f.feedbackText ?? '').toLowerCase().includes('deadline') || (f.feedbackText ?? '').toLowerCase().includes('reminder')).length;
      if (deadlineMentions > 0) {
        created.push(await this.repository.create({
          scope: 'organization',
          recommendationType: 'engagement',
          title: 'Increase reminder frequency',
          description: 'Students are struggling with deadlines. Consider more timely reminders or check-ins.',
          evidence: JSON.stringify({ supportCount, deadlineMentions }),
        }));
      }
      created.push(await this.repository.create({
        scope: 'organization',
        recommendationType: 'support',
        title: 'Provide additional student support',
        description: `${supportCount} feedback entries indicate students need help. Consider office hours or mentorship.`,
        evidence: JSON.stringify({ supportCount }),
      }));
    }

    const suggestionCounts: Record<string, number> = {};
    for (const f of studentFeedback.filter((f) => f.category === 'feature_suggestion' || f.category === 'idea')) {
      const key = (f.feedbackText ?? f.category).toLowerCase().slice(0, 60);
      suggestionCounts[key] = (suggestionCounts[key] ?? 0) + 1;
    }
    const topSuggestion = Object.entries(suggestionCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSuggestion) {
      created.push(await this.repository.create({
        scope: 'organization',
        recommendationType: 'product',
        title: `Explore request: ${topSuggestion[0]}`,
        description: `Multiple students suggested this area for improvement. Review feasibility.`,
        evidence: JSON.stringify({ suggestion: topSuggestion[0], count: topSuggestion[1] }),
      }));
    }

    const eventFeedback = ambassadorFeedback.filter((f) => f.category === 'Event feedback');
    const thursdayMentions = eventFeedback.filter((f) => f.observation.toLowerCase().includes('thursday') || f.suggestedImprovement?.toLowerCase().includes('thursday')).length;
    const weekendMentions = eventFeedback.filter((f) => f.observation.toLowerCase().includes('weekend')).length;
    if (thursdayMentions > weekendMentions && eventFeedback.length > 0) {
      created.push(await this.repository.create({
        scope: 'organization',
        recommendationType: 'events',
        title: 'Schedule more events on Thursdays',
        description: 'Ambassador observations suggest Thursdays have higher attendance.',
        evidence: JSON.stringify({ thursdayMentions, weekendMentions }),
      }));
    }

    if (overview.totalStudents > 0 && overview.weeklyActiveStudents / overview.totalStudents < 0.5) {
      created.push(await this.repository.create({
        scope: 'organization',
        recommendationType: 'engagement',
        title: 'Re-engage inactive students',
        description: 'Less than half of students were active this week. Consider a re-engagement campaign.',
        evidence: JSON.stringify({ totalStudents: overview.totalStudents, weeklyActive: overview.weeklyActiveStudents }),
      }));
    }

    return created;
  }

  async list(scope?: string, scopeId?: string, status?: string): Promise<ImprovementRecommendationRecord[]> {
    return this.repository.list(scope, scopeId, status, 100);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.updateStatus(id, status);
  }
}
