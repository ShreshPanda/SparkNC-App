import { GoalRepository } from '../repositories/GoalRepository';
import { GrowthTimelineRepository } from '../repositories/GrowthTimelineRepository';
import { GoalService } from '../services/goalService';
import { XPService } from '../services/xpService';
import { StreakService } from '../services/streakService';
import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface GoalControllerContext {
  env?: unknown;
  userId?: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  progress?: number;
  completed?: boolean;
  xpReward?: number;
}

function createGoalService(context?: GoalControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } } | undefined;
  const repository = new GoalRepository(db as never);
  const xpService = new XPService(db as never);
  const streakService = new StreakService(db as never);
  const growthRepository = new GrowthTimelineRepository(db as never);
  const notificationService = new NotificationService(new NotificationRepository(db as never));
  return new GoalService(repository, xpService, streakService, growthRepository, notificationService);
}

export async function listGoalsController(context?: GoalControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createGoalService(context);
  return service.listGoals(userId);
}

export async function getGoalController(goalId: string, context?: GoalControllerContext) {
  assertNonEmpty(goalId, 'Goal id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createGoalService(context);
  return service.getGoal(goalId, userId);
}

export async function createGoalController(input: GoalInput, context?: GoalControllerContext) {
  assertNonEmpty(input.title, 'Goal title is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createGoalService(context);
  return service.createGoal(input, userId);
}

export async function updateGoalController(goalId: string, input: GoalInput, context?: GoalControllerContext) {
  assertNonEmpty(goalId, 'Goal id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createGoalService(context);
  return service.updateGoal(goalId, input, userId);
}

export async function completeGoalController(goalId: string, context?: GoalControllerContext) {
  assertNonEmpty(goalId, 'Goal id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createGoalService(context);
  return service.completeGoal(goalId, userId);
}

export async function deleteGoalController(goalId: string, context?: GoalControllerContext) {
  assertNonEmpty(goalId, 'Goal id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createGoalService(context);
  return service.deleteGoal(goalId, userId);
}

