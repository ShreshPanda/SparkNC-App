import { getExecutiveDashboardController } from '../controllers/executive';
import { requirePermission } from '../middleware/permission';

export function createExecutiveRoutes() {
  return [
    {
      method: 'GET',
      path: '/executive/dashboard',
      handler: requirePermission('admin.executive.view', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        getExecutiveDashboardController(input as any, context)),
    },
  ];
}
