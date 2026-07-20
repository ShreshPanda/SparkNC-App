import { DelightService } from '../services/DelightService';

export interface DelightControllerContext {
  env?: unknown;
  userId?: string;
}

function createService(context?: DelightControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new DelightService(db);
}

export async function getDelightsController(_input: unknown, context?: DelightControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createService(context);
  const delights = await service.getRecentDelights(userId);
  return { ok: true, delights };
}
