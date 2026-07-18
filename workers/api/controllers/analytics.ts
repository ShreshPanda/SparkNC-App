import { AnalyticsService } from '../services/analyticsService';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';

export interface AnalyticsControllerContext {
  env?: unknown;
  userId?: string;
  schoolId?: string;
}

function createAnalyticsService(context?: AnalyticsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AnalyticsService(new AnalyticsRepository(db));
}

export async function getOrganizationAnalyticsController(context?: AnalyticsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnalyticsService(context);
  return service.getOrganizationOverview();
}

export async function getSchoolAnalyticsController(schoolId: string, context?: AnalyticsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnalyticsService(context);
  return service.getSchoolMetrics(schoolId || context?.schoolId || '');
}

export async function snapshotOrganizationAnalyticsController(context?: AnalyticsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnalyticsService(context);
  return service.snapshotOrganization();
}

export async function snapshotSchoolAnalyticsController(schoolId: string, context?: AnalyticsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnalyticsService(context);
  return service.snapshotSchool(schoolId || context?.schoolId || '');
}
