import { AmbassadorDashboardService } from '../services/ambassadorDashboardService';
import { AmbassadorCommandCenterService } from '../services/ambassadorCommandCenterService';
import { AmbassadorRepository } from '../repositories/AmbassadorRepository';
import { AmbassadorCommandCenterRepository } from '../repositories/AmbassadorCommandCenterRepository';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';

export interface AmbassadorControllerContext {
  env?: unknown;
  userId?: string;
  schoolId?: string;
}

function createAmbassadorDashboardService(context?: AmbassadorControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AmbassadorDashboardService(new AmbassadorRepository(db), new StudentInsightRepository(db));
}

function createAmbassadorCommandCenterService(context?: AmbassadorControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AmbassadorCommandCenterService(new AmbassadorCommandCenterRepository(db));
}

export async function getAmbassadorDashboardController(context?: AmbassadorControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAmbassadorDashboardService(context);
  return service.getDashboard(userId);
}

export async function getAmbassadorCommandCenterController(context?: AmbassadorControllerContext) {
  const userId = context?.userId;
  const schoolId = context?.schoolId;
  if (!userId || !schoolId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAmbassadorCommandCenterService(context);
  return service.getStudentOverview(schoolId, userId);
}
