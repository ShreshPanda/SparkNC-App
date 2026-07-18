import { StudentInsightService } from '../services/studentInsightService';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface InsightsControllerContext {
  env?: unknown;
  userId?: string;
}

function createStudentInsightService(context?: InsightsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new StudentInsightService(new StudentInsightRepository(db));
}

export async function getStudentDashboardController(context?: InsightsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createStudentInsightService(context);
  return service.getDashboard(userId);
}

export async function listStudentInsightsController(context?: InsightsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createStudentInsightService(context);
  return service.listInsights(userId);
}

export async function generateStudentInsightsController(context?: InsightsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createStudentInsightService(context);
  const insights = await service.generateInsights(userId);
  return { generated: insights.length, insights };
}
