import { listAuditLogsController, logAuditActionController } from '../controllers/audit';

export function createAuditRoutes() {
  return [
    {
      method: 'GET',
      path: '/audit',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listAuditLogsController(context),
    },
    {
      method: 'POST',
      path: '/audit',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => logAuditActionController(input as any, context),
    },
  ];
}
