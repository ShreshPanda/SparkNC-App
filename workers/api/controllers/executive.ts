import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { EngagementAnalyticsRepository } from '../repositories/EngagementAnalyticsRepository';
import { EngagementAnalyticsService } from '../services/EngagementAnalyticsService';
import { ExecutiveDashboardService } from '../services/ExecutiveDashboardService';

export interface ExecutiveControllerContext {
  env?: unknown;
  userId?: string;
}

function createService(context?: ExecutiveControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new ExecutiveDashboardService(new EngagementAnalyticsService(new EngagementAnalyticsRepository(db)), new AnalyticsRepository(db));
}

export async function getExecutiveDashboardController(input: { organizationId?: string; days?: number }, context?: ExecutiveControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createService(context);
  const dashboard = await service.buildDashboard(input.organizationId, input.days ?? 30);
  return { ok: true, dashboard };
}
