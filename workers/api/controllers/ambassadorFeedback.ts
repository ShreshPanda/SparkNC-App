import { AmbassadorFeedbackService, type SubmitAmbassadorFeedbackInput } from '../services/ambassadorFeedbackService';
import { AmbassadorFeedbackRepository } from '../repositories/AmbassadorFeedbackRepository';

export interface AmbassadorFeedbackControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createAmbassadorFeedbackService(context?: AmbassadorFeedbackControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AmbassadorFeedbackService(new AmbassadorFeedbackRepository(db));
}

export async function submitAmbassadorFeedbackController(input: SubmitAmbassadorFeedbackInput, context?: AmbassadorFeedbackControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAmbassadorFeedbackService(context);
  return service.submit(userId, input);
}

export async function listAmbassadorFeedbackController(context?: AmbassadorFeedbackControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAmbassadorFeedbackService(context);
  return service.listForAmbassador(userId);
}
