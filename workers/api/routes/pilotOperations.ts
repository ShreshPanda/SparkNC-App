import { getPilotOperationsDashboardController } from '../controllers/pilotOperations';
import { requirePermission } from '../middleware/permission';

export function createPilotOperationsRoutes() {
  return [
    {
      method: 'GET',
      path: '/pilot/operations',
      handler: requirePermission('admin.pilot.view', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        getPilotOperationsDashboardController(input as any, context)),
    },
  ];
}
