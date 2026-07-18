import { AnnouncementService } from '../services/announcementService';
import { AnnouncementRepository } from '../repositories/AnnouncementRepository';
import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface AnnouncementControllerContext {
  env?: unknown;
  userId?: string;
  schoolId?: string;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  scope: 'global' | 'school' | 'location';
  schoolId?: string;
}

function createAnnouncementService(context?: AnnouncementControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  const notificationService = new NotificationService(new NotificationRepository(db));
  return new AnnouncementService(new AnnouncementRepository(db), notificationService);
}

export async function listAnnouncementsController(context?: AnnouncementControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnnouncementService(context);
  return service.listAnnouncements(userId, context?.schoolId);
}

export async function getAnnouncementController(announcementId: string, context?: AnnouncementControllerContext) {
  assertNonEmpty(announcementId, 'Announcement id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnnouncementService(context);
  const announcement = await service.getAnnouncement(announcementId, userId, context?.schoolId);
  if (!announcement) {
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Announcement not found' } }, { status: 404 });
  }
  return announcement;
}

export async function createAnnouncementController(input: AnnouncementInput, context?: AnnouncementControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnnouncementService(context);
  return service.createAnnouncement(input, userId);
}

export async function updateAnnouncementController(announcementId: string, input: AnnouncementInput, context?: AnnouncementControllerContext) {
  assertNonEmpty(announcementId, 'Announcement id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnnouncementService(context);
  const announcement = await service.updateAnnouncement(announcementId, input, userId);
  if (!announcement) {
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Announcement not found' } }, { status: 404 });
  }
  return announcement;
}

export async function deleteAnnouncementController(announcementId: string, context?: AnnouncementControllerContext) {
  assertNonEmpty(announcementId, 'Announcement id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnnouncementService(context);
  const deleted = await service.deleteAnnouncement(announcementId, userId);
  return { deleted, announcementId };
}

export async function markAnnouncementReadController(announcementId: string, context?: AnnouncementControllerContext) {
  assertNonEmpty(announcementId, 'Announcement id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAnnouncementService(context);
  await service.markRead(announcementId, userId);
  return { success: true, announcementId };
}
