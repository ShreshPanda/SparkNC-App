import { getAmbassadorCommandCenterController, getAmbassadorDashboardController } from '../controllers/ambassador';
import { requirePermission } from '../middleware/permission';

export function createAmbassadorRoutes() {
  return [
    {
      method: 'GET',
      path: '/ambassador/dashboard',
      handler: requirePermission('ambassador.dashboard.read', (_params: Record<string, string> | undefined, _input: unknown, context: any) => getAmbassadorDashboardController(context)),
    },
    {
      method: 'GET',
      path: '/ambassador/command-center',
      handler: requirePermission('ambassador.students.read', (_params: Record<string, string> | undefined, _input: unknown, context: any) => getAmbassadorCommandCenterController(context)),
    },
  ];
}
