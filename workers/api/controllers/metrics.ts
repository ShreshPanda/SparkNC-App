import { MetricsRepository } from '../repositories/MetricsRepository';
import { ObservabilityService } from '../services/ObservabilityService';

export interface MetricsControllerContext {
  env?: unknown;
  userId?: string;
  isAuthenticated?: boolean;
}

function createService(context?: MetricsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: <T = Record<string, unknown>[]>() => Promise<{ results: T }> } } };
  return new ObservabilityService(new MetricsRepository(db));
}

export async function getMetricsController(input: { sinceHours?: number } = {}, context?: MetricsControllerContext) {
  const userId = context?.userId;
  if (!userId || !context?.isAuthenticated) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  }
  const service = createService(context);
  const dashboard = await service.getDashboard(input.sinceHours ?? 24);
  return { ok: true, metrics: dashboard };
}
