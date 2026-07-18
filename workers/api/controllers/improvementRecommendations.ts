import { ImprovementRecommendationService } from '../services/improvementRecommendationService';
import { ImprovementRecommendationRepository } from '../repositories/ImprovementRecommendationRepository';
import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface ImprovementRecommendationControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createImprovementRecommendationService(context?: ImprovementRecommendationControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new ImprovementRecommendationService(
    new ImprovementRecommendationRepository(db),
    new StudentFeedbackRepository(db),
    new AmbassadorFeedbackRepository(db),
    new AnalyticsRepository(db),
  );
}

export async function generateRecommendationsController(context?: ImprovementRecommendationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createImprovementRecommendationService(context);
  return service.generateForOrganization();
}

export async function listRecommendationsController(context?: ImprovementRecommendationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createImprovementRecommendationService(context);
  return service.list('organization');
}

export async function updateRecommendationStatusController(id: string, input: { status: string }, context?: ImprovementRecommendationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createImprovementRecommendationService(context);
  await service.updateStatus(id, input.status);
  return { success: true, id, status: input.status };
}
