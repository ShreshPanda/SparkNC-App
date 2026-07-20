import { SparkMomentsRepository } from '../repositories/SparkMomentsRepository';
import { SparkMomentsService, type UserStats } from '../services/SparkMomentsService';

export interface SparkMomentsControllerContext {
  env?: unknown;
  userId?: string;
  isAuthenticated?: boolean;
}

function createService(context?: SparkMomentsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new SparkMomentsService(new SparkMomentsRepository(db));
}

export async function getSparkMomentsController(_input: unknown, context?: SparkMomentsControllerContext) {
  const userId = context?.userId;
  if (!userId || !context?.isAuthenticated) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  }
  const service = createService(context);
  const moments = await service.listMoments(userId);
  return { ok: true, moments };
}

export async function triggerSparkMomentsController(input: UserStats, context?: SparkMomentsControllerContext) {
  const userId = context?.userId;
  if (!userId || !context?.isAuthenticated) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  }
  const service = createService(context);
  const result = await service.detectAndTrigger(userId, input);
  return { ok: true, ...result };
}
