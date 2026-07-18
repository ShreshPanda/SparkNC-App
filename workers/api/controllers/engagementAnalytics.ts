import { EngagementAnalyticsService } from '../services/EngagementAnalyticsService';
import { EngagementAnalyticsRepository } from '../repositories/EngagementAnalyticsRepository';

export interface EngagementAnalyticsControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createService(context?: EngagementAnalyticsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new EngagementAnalyticsService(new EngagementAnalyticsRepository(db));
}

export async function getEngagementController(context?: EngagementAnalyticsControllerContext) {
  const service = createService(context);
  const summary = await service.getEngagementSummary();
  return { ok: true, ...summary };
}

export async function getRetentionController(context?: EngagementAnalyticsControllerContext) {
  const service = createService(context);
  const cohort = await service.getRetentionCohort(7);
  return { ok: true, retention: cohort };
}

export async function getFeatureUsageController(context?: EngagementAnalyticsControllerContext) {
  const service = createService(context);
  const featureUsage = await service.getFeatureUsage(30);
  return { ok: true, featureUsage };
}
