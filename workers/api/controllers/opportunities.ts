import { OpportunityService } from '../services/opportunityService';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';
import { OnboardingRepository } from '../repositories/OnboardingRepository';

export interface OpportunitiesControllerContext {
  env?: unknown;
  userId?: string;
}

function createOpportunityService(context?: OpportunitiesControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new OpportunityService(new StudentInsightRepository(db), new OnboardingRepository(db));
}

export async function getOpportunitiesController(context?: OpportunitiesControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createOpportunityService(context);
  return service.getRecommendations(userId);
}
