import {
  createNotificationController,
  generateNotificationsController,
  getNotificationPreferencesController,
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
  scheduleNotificationsController,
  updateNotificationPreferencesController,
} from '../controllers/notifications';
import { requirePermission } from '../middleware/permission';

export function createNotificationRoutes() {
  return [
    {
      method: 'GET',
      path: '/notifications',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listNotificationsController(context),
    },
    {
      method: 'POST',
      path: '/notifications',
      handler: requirePermission('notifications.send', (_params: Record<string, string> | undefined, input: unknown, context: any) => createNotificationController(input as any, context)),
    },
    {
      method: 'POST',
      path: '/notifications/:id/read',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => markNotificationReadController(params?.id ?? '', context),
    },
    {
      method: 'POST',
      path: '/notifications/read-all',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => markAllNotificationsReadController(context),
    },
    {
      method: 'GET',
      path: '/notifications/preferences',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getNotificationPreferencesController(context),
    },
    {
      method: 'POST',
      path: '/notifications/preferences',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => updateNotificationPreferencesController(input as any, context),
    },
    {
      method: 'POST',
      path: '/notifications/generate',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => generateNotificationsController(context),
    },
    {
      method: 'GET',
      path: '/notifications/schedule',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => scheduleNotificationsController(context),
    },
  ];
}
