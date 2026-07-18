import { createPermissionService, type SparkPermission } from '../services/permissionService';
import { type SparkRole } from '../services/roleService';

type RouteHandler = (params: Record<string, string> | undefined, input: unknown, context: any) => Promise<unknown>;

export function requirePermission(permission: SparkPermission, handler: RouteHandler): RouteHandler {
  return async (params, input, context) => {
    const role = context?.role as SparkRole | undefined;
    if (!role) {
      return Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const db = (context?.env as any)?.DB;
    if (!db) {
      return Response.json(
        { error: { code: 'SERVER_ERROR', message: 'Database unavailable' } },
        { status: 500 },
      );
    }

    const permissionService = createPermissionService(db);
    const allowed = await permissionService.hasPermission(role, permission);
    if (!allowed) {
      return Response.json(
        { error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 },
      );
    }

    return handler(params, input, context);
  };
}
