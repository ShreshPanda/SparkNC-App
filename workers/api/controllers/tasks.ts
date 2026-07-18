import { TaskRepository } from '../repositories/TaskRepository';
import { TaskService } from '../services/taskService';
import { XPService } from '../services/xpService';
import { StreakService } from '../services/streakService';
import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface TaskControllerContext {
  env?: unknown;
  userId?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed?: boolean;
  xpReward?: number;
}

function createTaskService(context?: TaskControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } } | undefined;
  const repository = new TaskRepository(db as never);
  const xpService = new XPService(db as never);
  const streakService = new StreakService(db as never);
  const notificationService = new NotificationService(new NotificationRepository(db as never));
  return new TaskService(repository, xpService, streakService, notificationService);
}

export async function listTasksController(context?: TaskControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createTaskService(context);
  return service.listTasks(userId);
}

export async function getTaskController(taskId: string, context?: TaskControllerContext) {
  assertNonEmpty(taskId, 'Task id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createTaskService(context);
  return service.getTask(taskId, userId);
}

export async function createTaskController(input: TaskInput, context?: TaskControllerContext) {
  assertNonEmpty(input.title, 'Task title is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createTaskService(context);
  return service.createTask(input, userId);
}

export async function updateTaskController(taskId: string, input: TaskInput, context?: TaskControllerContext) {
  assertNonEmpty(taskId, 'Task id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createTaskService(context);
  return service.updateTask(taskId, input, userId);
}

export async function completeTaskController(taskId: string, context?: TaskControllerContext) {
  assertNonEmpty(taskId, 'Task id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createTaskService(context);
  return service.completeTask(taskId, userId);
}

export async function deleteTaskController(taskId: string, context?: TaskControllerContext) {
  assertNonEmpty(taskId, 'Task id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const service = createTaskService(context);
  return service.deleteTask(taskId, userId);
}

