import { ImpactReportRepository, type ImpactReportRecord } from '../repositories/ImpactReportRepository';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';

export class ImpactReportService {
  constructor(
    private readonly repository: ImpactReportRepository,
    private readonly analytics: AnalyticsRepository,
    private readonly studentFeedback: StudentFeedbackRepository,
    private readonly ambassadorFeedback: AmbassadorFeedbackRepository,
  ) {}

  async generateMonthlyReport(createdBy?: string, periodStart?: string, periodEnd?: string): Promise<ImpactReportRecord> {
    const now = new Date();
    const start = periodStart ?? new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const end = periodEnd ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [overview, student, ambassador] = await Promise.all([
      this.analytics.getOverview(),
      this.studentFeedback.listAll(1000),
      this.ambassadorFeedback.listAll(1000),
    ]);

    const sentiment = { positive: 0, neutral: 0, needsSupport: 0 };
    let totalRating = 0;
    let ratedCount = 0;
    for (const f of student) {
      if (f.sentiment === 'positive') sentiment.positive++;
      else if (f.sentiment === 'needs_support') sentiment.needsSupport++;
      else sentiment.neutral++;
      if (f.rating !== undefined) {
        totalRating += f.rating;
        ratedCount++;
      }
    }

    const topAmbassadorThemes: Record<string, number> = {};
    for (const a of ambassador) {
      topAmbassadorThemes[a.category] = (topAmbassadorThemes[a.category] ?? 0) + 1;
    }

    const metrics = {
      periodStart: start,
      periodEnd: end,
      studentParticipation: overview.totalStudents,
      activeThisMonth: overview.weeklyActiveStudents,
      averageEngagement: overview.averageEngagementScore,
      taskCompletionRate: overview.totalStudents ? Math.min(1, overview.totalTasksCompleted / overview.totalStudents) : 0,
      goalCompletionRate: overview.totalStudents ? Math.min(1, overview.totalGoalsCompleted / overview.totalStudents) : 0,
      eventParticipationRate: overview.totalStudents ? Math.min(1, overview.totalEventsAttended / overview.totalStudents) : 0,
      totalTasksCompleted: overview.totalTasksCompleted,
      totalGoalsCompleted: overview.totalGoalsCompleted,
      totalEventsAttended: overview.totalEventsAttended,
      totalMessagesSent: overview.totalMessagesSent,
      feedbackCount: student.length,
      averageSatisfaction: ratedCount ? totalRating / ratedCount : 0,
      sentimentDistribution: sentiment,
      topAmbassadorThemes,
      xpTrend: overview.xpTrend,
    };

    return this.repository.create({
      scope: 'organization',
      reportType: 'monthly',
      periodStart: start,
      periodEnd: end,
      metrics,
      createdBy,
    });
  }

  async listReports(): Promise<ImpactReportRecord[]> {
    return this.repository.list('organization', undefined, 50);
  }
}
