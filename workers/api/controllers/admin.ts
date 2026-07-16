import { assertNonEmpty } from '../validators/baseValidator';

export async function listAdminUsersController() {
  return {
    ok: true,
    items: [],
    message: 'Admin users endpoint is prepared for role-aware implementation',
  };
}

export async function createAdminEventController(input: { title: string; startsAt: string }) {
  assertNonEmpty(input.title, 'Event title is required');
  assertNonEmpty(input.startsAt, 'Event start time is required');

  return {
    ok: true,
    item: {
      id: `admin-event-${Date.now()}`,
      title: input.title,
      startsAt: input.startsAt,
    },
    message: 'Admin event creation route is ready for persistence',
  };
}

export async function createAnnouncementController(input: { title: string; body: string }) {
  assertNonEmpty(input.title, 'Announcement title is required');
  assertNonEmpty(input.body, 'Announcement body is required');

  return {
    ok: true,
    item: {
      id: `announcement-${Date.now()}`,
      title: input.title,
      body: input.body,
    },
    message: 'Admin announcement route is ready for persistence',
  };
}
