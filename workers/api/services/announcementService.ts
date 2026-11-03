import { z } from 'zod';
import { AnnouncementRepository, type AnnouncementRecord } from '../repositories/AnnouncementRepository';
import { assertNonEmpty } from '../validators/baseValidator';
import { NotificationService } from './notificationService';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  scope: z.enum(['global', 'school', 'location']),
  schoolId: z.string().optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  scope: z.enum(['global', 'school', 'location']).optional(),
  schoolId: z.string().optional(),
});

export interface EnrichedAnnouncement {
  id: string;
  title: string;
  body: string;
  scope: 'global' | 'school' | 'location';
  schoolId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
}

export interface CallerScope {
  role?: string;
  schoolId?: string;
}

// Scoped staff may only publish within their own school; 'global' scope is
// admin-only. A caller-supplied schoolId is never trusted for non-admin
// callers.
function enforceCreateScope(caller: CallerScope | undefined, scope: string, inputSchoolId?: string): string | undefined {
  if (!caller || caller.role === 'admin') return inputSchoolId;
  if (!caller.schoolId || scope === 'global') {
    throw new Error('Forbidden: school scope required');
  }
  return caller.schoolId;
}

function enforceRecordScope(caller: CallerScope | undefined, recordSchoolId?: string): void {
  if (!caller || caller.role === 'admin') return;
  if (!caller.schoolId || recordSchoolId !== caller.schoolId) {
    throw new Error('Forbidden: outside school scope');
  }
}

export class AnnouncementService {
  constructor(
    private readonly repository: AnnouncementRepository,
    private readonly notificationService?: NotificationService,
  ) {}

  async listAnnouncements(userId: string, userSchoolId?: string): Promise<EnrichedAnnouncement[]> {
    assertNonEmpty(userId, 'User id is required');
    const announcements = await this.repository.listAnnouncements();
    const visible = announcements.filter((a) => this.isVisible(a, userSchoolId));
    return this.enrichAnnouncements(visible, userId);
  }

  async getAnnouncement(announcementId: string, userId: string, userSchoolId?: string): Promise<EnrichedAnnouncement | null> {
    assertNonEmpty(announcementId, 'Announcement id is required');
    assertNonEmpty(userId, 'User id is required');
    const announcement = await this.repository.getAnnouncement(announcementId);
    if (!announcement || !this.isVisible(announcement, userSchoolId)) return null;
    return this.enrichAnnouncement(announcement, userId);
  }

  async createAnnouncement(input: unknown, createdBy: string, caller?: CallerScope): Promise<EnrichedAnnouncement> {
    assertNonEmpty(createdBy, 'User id is required');
    const parsed = createAnnouncementSchema.parse(input);
    const announcement = await this.repository.createAnnouncement(
      { ...parsed, schoolId: enforceCreateScope(caller, parsed.scope, parsed.schoolId) },
      createdBy,
    );

    if (this.notificationService) {
      await this.notificationService.createNotification({
        userId: createdBy,
        title: 'Announcement published',
        body: `Your announcement "${announcement.title}" is now live.`,
        kind: 'info',
        entityType: 'announcement',
        entityId: announcement.id,
      });
    }

    return this.enrichAnnouncement(announcement, createdBy, true);
  }

  async updateAnnouncement(announcementId: string, input: unknown, _updatedBy: string, caller?: CallerScope): Promise<EnrichedAnnouncement | null> {
    assertNonEmpty(announcementId, 'Announcement id is required');
    const existing = await this.repository.getAnnouncement(announcementId);
    if (!existing) return null;
    enforceRecordScope(caller, existing.schoolId);
    const parsed = updateAnnouncementSchema.parse(input);
    const announcement = await this.repository.updateAnnouncement(
      announcementId,
      caller && caller.role !== 'admin' ? { ...parsed, schoolId: existing.schoolId, scope: parsed.scope === 'global' ? 'school' : parsed.scope } : parsed,
    );
    if (!announcement) return null;
    return this.enrichAnnouncement(announcement, _updatedBy);
  }

  async deleteAnnouncement(announcementId: string, _deletedBy: string, caller?: CallerScope): Promise<boolean> {
    assertNonEmpty(announcementId, 'Announcement id is required');
    const existing = await this.repository.getAnnouncement(announcementId);
    if (existing) {
      enforceRecordScope(caller, existing.schoolId);
    }
    return this.repository.deleteAnnouncement(announcementId);
  }

  async markRead(announcementId: string, userId: string): Promise<void> {
    assertNonEmpty(announcementId, 'Announcement id is required');
    assertNonEmpty(userId, 'User id is required');
    await this.repository.markRead(announcementId, userId);
  }

  private isVisible(announcement: { scope: string; schoolId?: string }, userSchoolId?: string): boolean {
    if (announcement.scope === 'global') return true;
    if (announcement.scope === 'school' || announcement.scope === 'location') {
      return !userSchoolId || userSchoolId === announcement.schoolId;
    }
    return true;
  }

  private async enrichAnnouncements(announcements: AnnouncementRecord[], userId: string): Promise<EnrichedAnnouncement[]> {
    const result: EnrichedAnnouncement[] = [];
    for (const announcement of announcements) {
      const reads = await this.repository.listReads(announcement.id);
      result.push({
        ...announcement,
        isRead: reads.some((r) => r.userId === userId),
      });
    }
    return result;
  }

  private async enrichAnnouncement(announcement: AnnouncementRecord, userId: string, isRead = false): Promise<EnrichedAnnouncement> {
    if (isRead) return { ...announcement, isRead: true };
    const reads = await this.repository.listReads(announcement.id);
    return { ...announcement, isRead: reads.some((r) => r.userId === userId) };
  }
}
