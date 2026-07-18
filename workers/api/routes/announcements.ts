import {
  createAnnouncementController,
  deleteAnnouncementController,
  getAnnouncementController,
  listAnnouncementsController,
  markAnnouncementReadController,
  updateAnnouncementController,
} from '../controllers/announcements';
import { requirePermission } from '../middleware/permission';

export function createAnnouncementRoutes() {
  return [
    {
      method: 'GET',
      path: '/announcements',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listAnnouncementsController(context),
    },
    {
      method: 'GET',
      path: '/announcements/:id',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => getAnnouncementController(params?.id ?? '', context),
    },
    {
      method: 'POST',
      path: '/announcements',
      handler: requirePermission('announcements.manage', (_params: Record<string, string> | undefined, input: unknown, context: any) => createAnnouncementController(input as any, context)),
    },
    {
      method: 'PUT',
      path: '/announcements/:id',
      handler: requirePermission('announcements.manage', (params: Record<string, string> | undefined, input: unknown, context: any) => updateAnnouncementController(params?.id ?? '', input as any, context)),
    },
    {
      method: 'DELETE',
      path: '/announcements/:id',
      handler: requirePermission('announcements.manage', (params: Record<string, string> | undefined, _input: unknown, context: any) => deleteAnnouncementController(params?.id ?? '', context)),
    },
    {
      method: 'POST',
      path: '/announcements/:id/read',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => markAnnouncementReadController(params?.id ?? '', context),
    },
  ];
}
