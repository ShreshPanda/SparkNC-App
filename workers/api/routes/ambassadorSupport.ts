import { getStudentSupportQueueController, recordSupportMessageController } from '../controllers/ambassadorSupport';
import { requirePermission } from '../middleware/permission';

export function createAmbassadorSupportRoutes() {
  return [
    {
      method: 'GET',
      path: '/ambassador/student-support',
      handler: requirePermission('ambassador.support.view', (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        getStudentSupportQueueController(context)),
    },
    {
      method: 'POST',
      path: '/ambassador/student-support',
      handler: requirePermission('ambassador.support.message', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        recordSupportMessageController(input as any, context)),
    },
  ];
}
