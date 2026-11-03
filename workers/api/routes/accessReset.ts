import { requirePermission } from '../middleware/permission';
import { completeResetController, initiateResetController } from '../controllers/accessReset';

export function createAccessResetRoutes() {
  return [
    // Authenticated, permission-gated staff initiation.
    { method: 'POST', path: '/access/reset/initiate', handler: requirePermission('students.reset_access', (_p: unknown, input: unknown, ctx: any) => initiateResetController(input as any, ctx)) },
    // Public completion — in PUBLIC_METHOD_PATHS (POST only).
    { method: 'POST', path: '/access/reset', handler: (_p: unknown, input: unknown, ctx: any) => completeResetController(input as any, ctx) },
  ];
}
