import { getMetricsController } from '../controllers/metrics';
import { requirePermission } from '../middleware/permission';

export function createMetricsRoutes() {
  return [
    {
      method: 'GET',
      path: '/metrics',
      handler: requirePermission('admin.executive.view', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        getMetricsController(input as any, context)),
    },
  ];
}
