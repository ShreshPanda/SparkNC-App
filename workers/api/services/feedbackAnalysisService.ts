import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';
import { FeedbackInsightsRepository, type FeedbackInsightRecord } from '../repositories/FeedbackInsightsRepository';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface SentimentSummary {
  positive: number;
  neutral: number;
  needsSupport: number;
  total: number;
  averageRating: number;
}

export class FeedbackAnalysisService {
  constructor(
    private readonly studentFeedback: StudentFeedbackRepository,
    private readonly ambassadorFeedback: AmbassadorFeedbackRepository,
    private readonly insights: FeedbackInsightsRepository,
    private readonly analytics: AnalyticsRepository,
  ) {}

  async analyzeOrganization(): Promise<{ insights: FeedbackInsightRecord[]; summary: SentimentSummary }> {
    await this.insights.clear('organization');
    const [student, ambassador] = await Promise.all([
      this.studentFeedback.listAll(1000),
      this.ambassadorFeedback.listAll(1000),
    ]);
    const summary = this.computeSentimentSummary(student);
    const analyticsOverview = await this.analytics.getOverview();
    const generated: FeedbackInsightRecord[] = [];

    if (summary.needsSupport > summary.positive && summary.total > 0) {
      generated.push(await this.insights.create({
        scope: 'organization',
        insightType: 'sentiment',
        title: 'Students are seeking more support',
        description: `A notable portion of ${summary.needsSupport} feedback entries indicate students need help.`,
        data: JSON.stringify(summary),
      }));
    }

    const avgRating = summary.total ? (summary.averageRating / summary.total).toFixed(1) : 'N/A';
    if (summary.total > 0) {
      generated.push(await this.insights.create({
        scope: 'organization',
        insightType: 'satisfaction',
        title: `Average student satisfaction rating is ${avgRating}`,
        description: `Based on ${summary.total} student feedback submissions.`,
        data: JSON.stringify(summary),
      }));
    }

    const commonCategories = this.aggregateCategories(student);
    const topCategory = Object.entries(commonCategories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      generated.push(await this.insights.create({
        scope: 'organization',
        insightType: 'trend',
        title: `Most common feedback theme: ${topCategory[0]}`,
        description: `${topCategory[1]} submissions in the ${topCategory[0]} category.`,
        data: JSON.stringify(commonCategories),
      }));
    }

    const lowEventFeedback = ambassador.filter((f) => f.category === 'Event feedback' || f.category === 'Student Engagement').slice(0, 10);
    if (lowEventFeedback.length > 0) {
      const reminders = lowEventFeedback.filter((f) => f.observation.toLowerCase().includes('deadline') || f.observation.toLowerCase().includes('forget'));
      if (reminders.length > 0) {
        generated.push(await this.insights.create({
          scope: 'organization',
          insightType: 'ambassador_observation',
          title: 'Students are forgetting deadlines',
          description: 'Ambassadors noted students are missing deadlines. Consider increasing reminder frequency.',
          data: JSON.stringify({ count: reminders.length }),
        }));
      }
    }

    if (analyticsOverview.totalTasksCompleted > 0 && analyticsOverview.totalStudents > 0) {
      const completionRate = analyticsOverview.totalTasksCompleted / analyticsOverview.totalStudents;
      generated.push(await this.insights.create({
        scope: 'organization',
        insightType: 'engagement',
        title: `Task completion rate: ${(completionRate * 100).toFixed(0)}%`,
        description: `Across ${analyticsOverview.totalStudents} students and ${analyticsOverview.totalTasksCompleted} completed tasks.`,
        data: JSON.stringify({ completionRate, totalStudents: analyticsOverview.totalStudents, totalTasksCompleted: analyticsOverview.totalTasksCompleted }),
      }));
    }

    return { insights: generated, summary };
  }

  private computeSentimentSummary(records: { sentiment?: string; rating?: number }[]): SentimentSummary {
    const summary: SentimentSummary = { positive: 0, neutral: 0, needsSupport: 0, total: 0, averageRating: 0 };
    for (const r of records) {
      summary.total++;
      if (r.rating !== undefined) summary.averageRating += r.rating;
      if (r.sentiment === 'positive') summary.positive++;
      else if (r.sentiment === 'needs_support') summary.needsSupport++;
      else summary.neutral++;
    }
    return summary;
  }

  private aggregateCategories(records: { category: string }[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const r of records) {
      counts[r.category] = (counts[r.category] ?? 0) + 1;
    }
    return counts;
  }
}
