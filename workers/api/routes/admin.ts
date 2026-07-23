import {
  createAdminEventController,
  createAnnouncementController,
  getAdminOverviewController,
  getAdminProgramAnalyticsController,
  getAdminStudentSupportController,
  listAdminUsersController,
} from '../controllers/admin';
import { requirePermission } from '../middleware/permission';

export function createAdminRoutes() {
  return [
    {
      method: 'GET',
      path: '/admin/users',
      handler: requirePermission('admin.users.read', (_params: Record<string, string> | undefined, _input: unknown, context: any) => listAdminUsersController(context)),
    },
    {
      method: 'POST',
      path: '/admin/events',
      handler: requirePermission('admin.events.create', (_params: Record<string, string> | undefined, input: unknown, context: any) => createAdminEventController(input as any, context)),
    },
    {
      method: 'POST',
      path: '/admin/announcements',
      handler: requirePermission('admin.announcements.create', (_params: Record<string, string> | undefined, input: unknown, context: any) => createAnnouncementController(input as any, context)),
    },
    {
      method: 'GET',
      path: '/admin/overview',
      handler: requirePermission('admin.overview.read', (_params: Record<string, string> | undefined, _input: unknown, context: any) => getAdminOverviewController(context)),
    },
    {
      method: 'GET',
      path: '/admin/student-support',
      handler: requirePermission('admin.students.support', (_params: Record<string, string> | undefined, _input: unknown, context: any) => getAdminStudentSupportController(context)),
    },
    {
      method: 'GET',
      path: '/admin/program-analytics',
      handler: requirePermission('admin.analytics.read', (_params: Record<string, string> | undefined, _input: unknown, context: any) => getAdminProgramAnalyticsController(context)),
    },
  ];
}
