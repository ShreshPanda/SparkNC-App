import { ImpactReportService } from '../services/impactReportService';
import { ImpactReportRepository } from '../repositories/ImpactReportRepository';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';

export interface ImpactReportControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createImpactReportService(context?: ImpactReportControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new ImpactReportService(
    new ImpactReportRepository(db),
    new AnalyticsRepository(db),
    new StudentFeedbackRepository(db),
    new AmbassadorFeedbackRepository(db),
  );
}

export async function generateMonthlyReportController(input: { periodStart?: string; periodEnd?: string }, context?: ImpactReportControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createImpactReportService(context);
  return service.generateMonthlyReport(userId, input.periodStart, input.periodEnd);
}

export async function listImpactReportsController(context?: ImpactReportControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createImpactReportService(context);
  return service.listReports();
}
