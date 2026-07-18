import { FeedbackAnalysisService } from '../services/feedbackAnalysisService';
import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';
import { FeedbackInsightsRepository } from '../repositories/FeedbackInsightsRepository';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface FeedbackAnalysisControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createFeedbackAnalysisService(context?: FeedbackAnalysisControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new FeedbackAnalysisService(
    new StudentFeedbackRepository(db),
    new AmbassadorFeedbackRepository(db),
    new FeedbackInsightsRepository(db),
    new AnalyticsRepository(db),
  );
}

export async function analyzeFeedbackController(context?: FeedbackAnalysisControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createFeedbackAnalysisService(context);
  return service.analyzeOrganization();
}

export async function listFeedbackInsightsController(context?: FeedbackAnalysisControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  const repo = new FeedbackInsightsRepository(db);
  return repo.list('organization');
}
