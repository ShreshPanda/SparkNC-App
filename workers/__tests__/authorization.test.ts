import { describe, it, expect, vi } from 'vitest';
import { createPermissionService } from '../api/services/permissionService';
import { requirePermission } from '../api/middleware/permission';
import { MessageService } from '../api/services/messageService';
import { EventService } from '../api/services/eventService';
import { AnnouncementService } from '../api/services/announcementService';
import { registerController } from '../api/controllers/auth';
import { CommunityService } from '../api/services/communityService';

// Mirrors the expected post-022 seed sets (legacy strings preserved).
const SEEDS: Record<string, string[]> = {
  student: ['student.tasks.manage', 'student.messages.send', 'events.read', 'messages.read', 'messages.send', 'student.achievements.read', 'student.achievements.update', 'community.groups.join', 'community.posts.read', 'community.posts.create'],
  ambassador: ['student.tasks.manage', 'student.messages.send', 'events.read', 'messages.read', 'ambassador.students.view', 'ambassador.messages.respond', 'messages.send', 'ambassador.dashboard.read', 'ambassador.students.read', 'ambassador.support.view', 'ambassador.support.message', 'community.groups.join', 'community.posts.read', 'community.posts.create'],
  lab_leader: ['messages.send', 'messages.read', 'events.read'],
  location_manager: ['student.tasks.manage', 'student.messages.send', 'events.read', 'messages.read', 'events.manage', 'announcements.manage', 'messages.send'],
  board_member: [],
  admin: ['*'],
};

function serviceFor(permissions: string[]) {
  const db = {
    prepare: () => ({
      bind: () => ({
        all: async () => ({ results: [{ id: 'r', name: 'x', permissions: JSON.stringify(permissions), created_at: '', updated_at: '' }] }),
        run: async () => ({}),
      }),
    }),
  };
  return createPermissionService(db as never);
}

async function allows(role: string, permission: string) {
  return serviceFor(SEEDS[role]).hasPermission(role as never, permission);
}

describe('permission matrix (post-022 seeds)', () => {
  it.each([
    ['messages.send', true], ['student.achievements.read', true], ['student.achievements.update', true],
    ['community.posts.read', true], ['community.posts.create', true], ['community.groups.join', true],
    ['announcements.manage', false], ['events.manage', false], ['admin.users.read', false],
    ['community.moderate.review', false], ['pilot.manage', false], ['notifications.send', false],
    ['ambassador.dashboard.read', false], ['community.groups.create', false],
  ])('student %s → %s', async (perm, expected) => {
    expect(await allows('student', perm)).toBe(expected);
  });

  it.each([
    ['ambassador.dashboard.read', true], ['ambassador.students.read', true],
    ['ambassador.support.view', true], ['ambassador.support.message', true],
    ['messages.send', true], ['community.posts.create', true],
    ['announcements.manage', false], ['events.manage', false], ['admin.analytics.read', false],
  ])('ambassador %s → %s', async (perm, expected) => {
    expect(await allows('ambassador', perm)).toBe(expected);
  });

  it.each([
    ['messages.send', true], ['messages.read', true], ['events.read', true],
    ['events.manage', false], ['announcements.manage', false], ['community.posts.create', false],
    ['ambassador.dashboard.read', false], ['admin.analytics.read', false], ['community.moderate.review', false],
  ])('lab_leader %s → %s', async (perm, expected) => {
    expect(await allows('lab_leader', perm)).toBe(expected);
  });

  it.each([
    ['messages.send', true], ['events.manage', true], ['announcements.manage', true],
    ['community.moderate.review', false], ['admin.users.read', false], ['ambassador.students.read', false],
  ])('location_manager %s → %s', async (perm, expected) => {
    expect(await allows('location_manager', perm)).toBe(expected);
  });

  it.each([
    ['admin.users.read', false], ['ambassador.dashboard.read', false], ['messages.send', false], ['events.read', false],
  ])('board_member %s → %s (empty grant set)', async (perm, expected) => {
    expect(await allows('board_member', perm)).toBe(expected);
  });

  it.each([
    ['admin.users.read', true], ['community.moderate.review', true], ['pilot.manage', true], ['anything.at.all', true],
  ])('admin %s → %s (wildcard)', async (perm, expected) => {
    expect(await allows('admin', perm)).toBe(expected);
  });
});

describe('requirePermission middleware', () => {
  const dbFor = (perms: string[]) => ({
    prepare: () => ({ bind: () => ({ all: async () => ({ results: [{ id: 'r', name: 'x', permissions: JSON.stringify(perms), created_at: '', updated_at: '' }] }), run: async () => ({}) }) }),
  });

  it('returns 401 without a role in context', async () => {
    const handler = vi.fn();
    const res = await requirePermission('messages.send', handler)(undefined, {}, { env: { DB: dbFor(SEEDS.student) } });
    expect((res as Response).status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 403 for a role lacking the permission', async () => {
    const handler = vi.fn();
    const res = await requirePermission('admin.users.read', handler)(undefined, {}, { role: 'student', env: { DB: dbFor(SEEDS.student) } });
    expect((res as Response).status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('invokes the handler when permitted', async () => {
    const handler = vi.fn(async () => 'ok');
    const res = await requirePermission('ambassador.dashboard.read', handler)(undefined, {}, { role: 'ambassador', env: { DB: dbFor(SEEDS.ambassador) } });
    expect(res).toBe('ok');
    expect(handler).toHaveBeenCalled();
  });
});

function messageService(overrides: Record<string, unknown>) {
  const repo = {
    findConversationByParticipants: vi.fn(async () => null),
    createConversation: vi.fn(async () => ({ id: 'c1', participantIds: [], createdAt: '', updatedAt: '' })),
    sendMessage: vi.fn(async () => ({ id: 'm1' })),
    getUserRole: vi.fn(async () => 'student'),
    hasStaffMessage: vi.fn(async () => false),
    ...overrides,
  };
  return { service: new MessageService(repo as never), repo };
}

describe('MessageService initiation policy', () => {
  it('denies a student initiating a new conversation', async () => {
    const { service } = messageService({});
    await expect(service.sendMessage({ recipientId: 'u2', body: 'hi' }, 'u1')).rejects.toThrow(/initiate/i);
  });

  it('denies a student initiating even to staff recipients', async () => {
    const { service } = messageService({});
    await expect(service.sendMessage({ recipientId: 'amb-1', body: 'hi' }, 'u1')).rejects.toThrow(/initiate/i);
  });

  it('allows staff to initiate', async () => {
    const { service, repo } = messageService({ getUserRole: vi.fn(async () => 'ambassador') });
    await service.sendMessage({ recipientId: 'u2', body: 'hi' }, 'amb-1');
    expect(repo.createConversation).toHaveBeenCalled();
    expect(repo.sendMessage).toHaveBeenCalled();
  });

  it('allows a student to reply in a staff-engaged thread', async () => {
    const { service } = messageService({
      findConversationByParticipants: vi.fn(async () => ({ id: 'c1', participantIds: ['u1', 'amb-1'], createdAt: '', updatedAt: '' })),
      hasStaffMessage: vi.fn(async () => true),
    });
    await service.sendMessage({ recipientId: 'amb-1', body: 'reply' }, 'u1');
  });

  it('freezes legacy student-to-student threads (read-only)', async () => {
    const { service } = messageService({
      findConversationByParticipants: vi.fn(async () => ({ id: 'c1', participantIds: ['u1', 'u2'], createdAt: '', updatedAt: '' })),
      hasStaffMessage: vi.fn(async () => false),
    });
    await expect(service.sendMessage({ recipientId: 'u2', body: 'hi' }, 'u1')).rejects.toThrow(/initiate/i);
  });
});

function eventService(repo: Record<string, unknown>) {
  return new EventService(repo as never);
}

describe('EventService school scope', () => {
  const baseRepo = {
    getEvent: vi.fn(async () => ({ id: 'e1', schoolId: 'school-2' })),
    createEvent: vi.fn(async (input: Record<string, unknown>) => ({ id: 'e1', ...input })),
    updateEvent: vi.fn(async () => ({ id: 'e1', schoolId: 'school-1' })),
    deleteEvent: vi.fn(async () => true),
    isRegistered: vi.fn(async () => false),
    listAttendees: vi.fn(async () => []),
  };

  it('forces caller school on create for scoped staff', async () => {
    const service = eventService(baseRepo);
    await service.createEvent({ title: 'T', startsAt: '2026-01-01', schoolId: 'school-2' }, 'u1', { role: 'location_manager', schoolId: 'school-1' });
    expect(baseRepo.createEvent).toHaveBeenCalledWith(expect.objectContaining({ schoolId: 'school-1' }), 'u1');
  });

  it('denies updating another school\u2019s event', async () => {
    const service = eventService(baseRepo);
    await expect(service.updateEvent('e1', { title: 'X' }, 'u1', { role: 'location_manager', schoolId: 'school-1' })).rejects.toThrow(/scope/i);
  });

  it('denies deleting another school\u2019s event', async () => {
    const service = eventService(baseRepo);
    await expect(service.deleteEvent('e1', 'u1', { role: 'location_manager', schoolId: 'school-1' })).rejects.toThrow(/scope/i);
  });

  it('allows admin to manage any school\u2019s event', async () => {
    const service = eventService(baseRepo);
    await service.updateEvent('e1', { title: 'X' }, 'u1', { role: 'admin' });
    await service.deleteEvent('e1', 'u1', { role: 'admin' });
    expect(baseRepo.deleteEvent).toHaveBeenCalled();
  });

  it('denies scoped staff without a school', async () => {
    const service = eventService(baseRepo);
    await expect(service.createEvent({ title: 'T', startsAt: 'x' }, 'u1', { role: 'location_manager' })).rejects.toThrow(/scope/i);
  });

  it.each([
    ['org-wide event (null school) visible to any caller', { id: 'e1', schoolId: undefined }, { role: 'student', schoolId: 'school-1' }, true],
    ['org-wide event visible to caller with no school', { id: 'e1', schoolId: undefined }, { role: 'student' }, true],
    ['school event visible to same school', { id: 'e1', schoolId: 'school-1' }, { role: 'student', schoolId: 'school-1' }, true],
    ['school event hidden from other school', { id: 'e1', schoolId: 'school-2' }, { role: 'student', schoolId: 'school-1' }, false],
    ['school event hidden from caller with no school', { id: 'e1', schoolId: 'school-2' }, { role: 'student' }, false],
    ['school event visible to admin regardless', { id: 'e1', schoolId: 'school-2' }, { role: 'admin' }, true],
  ])('%s', async (_label, event, caller, visible) => {
    const repo = {
      ...baseRepo,
      listEvents: vi.fn(async () => [event]),
      getEvent: vi.fn(async () => event),
    };
    const service = eventService(repo);
    const listed = await service.listEvents('u1', caller);
    expect(listed).toHaveLength(visible ? 1 : 0);
    const fetched = await service.getEvent('e1', 'u1', caller);
    expect(Boolean(fetched)).toBe(visible);
  });

  it('blocks RSVP to another school\u2019s event', async () => {
    const repo = { ...baseRepo, getEvent: vi.fn(async () => ({ id: 'e1', schoolId: 'school-2' })) };
    const service = eventService(repo);
    await expect(service.registerForEvent('e1', 'u1', { role: 'student', schoolId: 'school-1' })).rejects.toThrow(/not found/i);
  });
});

describe('AnnouncementService school scope', () => {
  const repo = {
    getAnnouncement: vi.fn(async () => ({ id: 'a1', schoolId: 'school-2', scope: 'school' })),
    createAnnouncement: vi.fn(async (input: Record<string, unknown>) => ({ id: 'a1', ...input })),
    updateAnnouncement: vi.fn(async () => ({ id: 'a1', schoolId: 'school-1' })),
    deleteAnnouncement: vi.fn(async () => true),
    listReads: vi.fn(async () => []),
  };

  it('denies global announcements for scoped staff', async () => {
    const service = new AnnouncementService(repo as never);
    await expect(service.createAnnouncement({ title: 'T', body: 'B', scope: 'global', schoolId: 'school-1' }, 'u1', { role: 'location_manager', schoolId: 'school-1' })).rejects.toThrow(/scope/i);
  });

  it('forces caller school on school announcements', async () => {
    const service = new AnnouncementService(repo as never);
    await service.createAnnouncement({ title: 'T', body: 'B', scope: 'school', schoolId: 'school-2' }, 'u1', { role: 'location_manager', schoolId: 'school-1' });
    expect(repo.createAnnouncement).toHaveBeenCalledWith(expect.objectContaining({ schoolId: 'school-1' }), 'u1');
  });

  it('denies updating another school\u2019s announcement', async () => {
    const service = new AnnouncementService(repo as never);
    await expect(service.updateAnnouncement('a1', { title: 'X' }, 'u1', { role: 'location_manager', schoolId: 'school-1' })).rejects.toThrow(/scope/i);
  });

  it('denies deleting another school\u2019s announcement', async () => {
    const service = new AnnouncementService(repo as never);
    await expect(service.deleteAnnouncement('a1', 'u1', { role: 'location_manager', schoolId: 'school-1' })).rejects.toThrow(/scope/i);
  });
});

describe('CommunityService group membership enforcement', () => {
  // isMember is checked against the exact groupId from the route params, and
  // the post's userId always comes from the authenticated context — the
  // caller can neither post into a foreign group nor spoof authorship.
  function community(members: Array<[string, string]>) {
    const repo = {
      isMember: vi.fn(async (groupId: string, userId: string) => members.some(([g, u]) => g === groupId && u === userId)),
      createPost: vi.fn(async (input: Record<string, unknown>) => ({ id: 'p1', ...input })),
      listPosts: vi.fn(async () => [{ id: 'p1' }]),
    };
    return { service: new CommunityService(repo as never), repo };
  }

  it('allows an authorized member to post', async () => {
    const { service, repo } = community([['g1', 'student-1']]);
    await service.shareProgress({ groupId: 'g1', body: 'hi', userId: 'student-1' });
    expect(repo.createPost).toHaveBeenCalledWith(expect.objectContaining({ groupId: 'g1', userId: 'student-1' }));
  });

  it('denies a nonmember posting', async () => {
    const { service } = community([['g1', 'student-1']]);
    await expect(service.shareProgress({ groupId: 'g1', body: 'hi', userId: 'student-2' })).rejects.toThrow(/join/i);
  });

  it('denies an ambassador who is not a member', async () => {
    const { service } = community([['g1', 'student-1']]);
    await expect(service.shareProgress({ groupId: 'g1', body: 'hi', userId: 'amb-1' })).rejects.toThrow(/join/i);
  });

  it('denies cross-community posting (member of A cannot post to B)', async () => {
    const { service } = community([['group-a', 'student-1']]);
    await expect(service.shareProgress({ groupId: 'group-b', body: 'hi', userId: 'student-1' })).rejects.toThrow(/join/i);
  });

  it('denies nonmember reads of group posts', async () => {
    const { service } = community([['g1', 'student-1']]);
    await expect(service.listGroupPosts('g1', 'student-2')).rejects.toThrow(/join/i);
  });
});

describe('registration gate', () => {
  it('returns 403 INVITE_REQUIRED for all callers', async () => {
    const res = await registerController({ email: 'a@b.co', password: 'password123', name: 'N' }, { env: { DB: {} } });
    expect((res as Response).status).toBe(403);
    const body = await (res as Response).json() as { error: { code: string } };
    expect(body.error.code).toBe('INVITE_REQUIRED');
  });
});
