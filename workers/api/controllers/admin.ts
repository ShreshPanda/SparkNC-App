import { AdminCommandCenterService } from '../services/adminCommandCenterService';
import { AdminCommandCenterRepository } from '../repositories/AdminCommandCenterRepository';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export async function listAdminUsersController(_context?: AdminControllerContext) {
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

export interface AdminControllerContext {
  env?: unknown;
  userId?: string;
}

function createAdminCommandCenterService(context?: AdminControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AdminCommandCenterService(
    new AdminCommandCenterRepository(db),
    new AnalyticsRepository(db),
  );
}

export async function getAdminOverviewController(context?: AdminControllerContext) {
  const service = createAdminCommandCenterService(context);
  return service.getOrganizationOverview();
}

export async function getAdminStudentSupportController(context?: AdminControllerContext) {
  const service = createAdminCommandCenterService(context);
  return service.getStudentSupportInsights();
}

export async function getAdminProgramAnalyticsController(context?: AdminControllerContext) {
  const service = createAdminCommandCenterService(context);
  return service.getProgramAnalytics();
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
