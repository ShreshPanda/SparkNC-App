import { PilotOperationsRepository } from '../repositories/PilotOperationsRepository';
import { PilotOperationsDashboardService } from '../services/PilotOperationsDashboardService';

export interface PilotOperationsControllerContext {
  env?: unknown;
  userId?: string;
  isAuthenticated?: boolean;
}

function createService(context?: PilotOperationsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new PilotOperationsDashboardService(new PilotOperationsRepository(db));
}

export async function getPilotOperationsDashboardController(input: { days?: number; features?: string[] }, context?: PilotOperationsControllerContext) {
  const userId = context?.userId;
  if (!userId || !context?.isAuthenticated) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  }
  const service = createService(context);
  const dashboard = await service.buildDashboard(input.days ?? 30, input.features);
  return { ok: true, dashboard };
}
