import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationPreferenceRepository, type NotificationPreferenceInput } from '../repositories/NotificationPreferenceRepository';
import { NotificationPreferenceService } from '../services/notificationPreferenceService';
import { NotificationEngineService } from '../services/notificationEngineService';
import { NotificationSchedulerService } from '../services/notificationSchedulerService';
import { assertNonEmpty } from '../validators/baseValidator';

export interface NotificationControllerContext {
  env?: unknown;
  userId?: string;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  kind?: 'info' | 'success' | 'warning' | 'error';
  entityType?: string;
  entityId?: string;
}

function createNotificationService(context?: NotificationControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new NotificationService(new NotificationRepository(db));
}

function createPreferenceService(context?: NotificationControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new NotificationPreferenceService(new NotificationPreferenceRepository(db));
}

function createEngineService(context?: NotificationControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new NotificationEngineService(db);
}

const schedulerService = new NotificationSchedulerService();

export async function listNotificationsController(context?: NotificationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createNotificationService(context);
  return service.listNotifications(userId);
}

export async function createNotificationController(input: CreateNotificationInput, context?: NotificationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createNotificationService(context);
  return service.createNotification(input);
}

export async function markNotificationReadController(notificationId: string, context?: NotificationControllerContext) {
  assertNonEmpty(notificationId, 'Notification id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createNotificationService(context);
  const updated = await service.markRead(notificationId, userId);
  return { success: updated, notificationId };
}

export async function markAllNotificationsReadController(context?: NotificationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createNotificationService(context);
  const updated = await service.markAllRead(userId);
  return { success: updated, userId };
}

export async function getNotificationPreferencesController(context?: NotificationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createPreferenceService(context);
  return service.getPreferences(userId);
}

export async function updateNotificationPreferencesController(input: NotificationPreferenceInput, context?: NotificationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createPreferenceService(context);
  return service.updatePreferences(userId, input);
}

export async function generateNotificationsController(context?: NotificationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const engine = createEngineService(context);
  return engine.generateForUser(userId);
}

export async function scheduleNotificationsController(context?: NotificationControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const engine = createEngineService(context);
  const preferences = await createPreferenceService(context).getPreferences(userId);
  const generated = await engine.generateForUser(userId);
  const scheduled = generated.notifications.map((n) => schedulerService.schedule(n, preferences));
  return { generated: generated.generated, scheduled };
}
