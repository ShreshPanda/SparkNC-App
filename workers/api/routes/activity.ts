import { createSessionActivityController, getActivityStatsController } from '../controllers/activity';

export function createActivityRoutes() {
  return [
    {
      method: 'POST',
      path: '/activity/session',
      handler: (input: unknown) => createSessionActivityController(input as any),
    },
    {
      method: 'GET',
      path: '/activity/stats',
      handler: (params: { userId?: string }) => getActivityStatsController(params.userId ?? ''),
    },
  ];
}
