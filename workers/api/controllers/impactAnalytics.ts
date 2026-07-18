import { ImpactAnalyticsService } from '../services/impactAnalyticsService';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';
import { FeatureRequestRepository } from '../repositories/FeatureRequestRepository';

export interface ImpactAnalyticsControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createImpactAnalyticsService(context?: ImpactAnalyticsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new ImpactAnalyticsService(
    new AnalyticsRepository(db),
    new StudentFeedbackRepository(db),
    new AmbassadorFeedbackRepository(db),
    new FeatureRequestRepository(db),
  );
}

export async function getImpactAnalyticsController(context?: ImpactAnalyticsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createImpactAnalyticsService(context);
  return service.getOrganizationImpact();
}
