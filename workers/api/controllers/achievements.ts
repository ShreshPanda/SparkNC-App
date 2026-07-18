import { AchievementsService } from '../services/achievementsService';
import { AchievementsRepository } from '../repositories/AchievementsRepository';
import { ImpactRecognitionService } from '../services/impactRecognitionService';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';

export interface AchievementsControllerContext {
  env?: unknown;
  userId?: string;
}

function createAchievementsService(context?: AchievementsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AchievementsService(new AchievementsRepository(db));
}

function createImpactRecognitionService(context?: AchievementsControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  const achievementsRepository = new AchievementsRepository(db);
  return new ImpactRecognitionService(new AchievementsService(achievementsRepository), new StudentInsightRepository(db));
}

export async function listAchievementsController(context?: AchievementsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAchievementsService(context);
  return service.listAchievements(userId);
}

export async function checkAchievementsController(context?: AchievementsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAchievementsService(context);
  const unlocked = await service.checkAndUnlock(userId);
  return { unlocked, count: unlocked.length };
}

export async function getRecognitionSummaryController(context?: AchievementsControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createImpactRecognitionService(context);
  return service.getRecognitionSummary(userId);
}
