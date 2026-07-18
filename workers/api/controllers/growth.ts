import { GrowthTimelineService } from '../services/growthTimelineService';
import { GrowthTimelineRepository } from '../repositories/GrowthTimelineRepository';
import { GrowthStatisticsService } from '../services/growthStatisticsService';
import { GrowthStoryService } from '../services/growthStoryService';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';
import { AchievementsRepository } from '../repositories/AchievementsRepository';

export interface GrowthControllerContext {
  env?: unknown;
  userId?: string;
}

function createGrowthTimelineService(context?: GrowthControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new GrowthTimelineService(new GrowthTimelineRepository(db));
}

function createGrowthStatisticsService(context?: GrowthControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new GrowthStatisticsService(new StudentInsightRepository(db), new AchievementsRepository(db));
}

function createGrowthStoryService(context?: GrowthControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new GrowthStoryService(new StudentInsightRepository(db), new GrowthTimelineRepository(db));
}

export async function getGrowthTimelineController(context?: GrowthControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createGrowthTimelineService(context);
  return service.getTimeline(userId);
}

export async function generateGrowthTimelineController(context?: GrowthControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createGrowthTimelineService(context);
  const events = await service.generateTimeline(userId);
  return { generated: events.length, events };
}

export async function getGrowthStatisticsController(context?: GrowthControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createGrowthStatisticsService(context);
  return service.getStatistics(userId);
}

export async function getGrowthStoryController(context?: GrowthControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createGrowthStoryService(context);
  return service.generateStory(userId);
}
