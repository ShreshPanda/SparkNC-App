import { AuditLogService } from '../services/auditLogService';
import { AuditLogRepository } from '../repositories/AuditLogRepository';

export interface AuditControllerContext {
  env?: unknown;
  userId?: string;
}

function createAuditLogService(context?: AuditControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AuditLogService(new AuditLogRepository(db));
}

export async function listAuditLogsController(context?: AuditControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAuditLogService(context);
  return service.list(200);
}

export async function logAuditActionController(input: { action: string; entityType?: string; entityId?: string; metadata?: Record<string, unknown> }, context?: AuditControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAuditLogService(context);
  return service.log(userId, input.action, input.entityType, input.entityId, input.metadata);
}
