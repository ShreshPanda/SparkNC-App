import { createAdminEventController, createAnnouncementController, listAdminUsersController } from '../controllers/admin';

export function createAdminRoutes() {
  return [
    {
      method: 'GET',
      path: '/admin/users',
      handler: () => listAdminUsersController(),
    },
    {
      method: 'POST',
      path: '/admin/events',
      handler: (input: unknown) => createAdminEventController(input as any),
    },
    {
      method: 'POST',
      path: '/admin/announcements',
      handler: (input: unknown) => createAnnouncementController(input as any),
    },
  ];
}
