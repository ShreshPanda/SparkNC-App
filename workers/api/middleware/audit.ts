import { AuditLogService } from '../services/auditLogService';
import { AuditLogRepository } from '../repositories/AuditLogRepository';

export type AuditHandler = (
  params: Record<string, string> | undefined,
  input: unknown,
  context: any,
) => Promise<unknown>;

export interface AuditOptions {
  resourceType?: string;
  resourceIdParam?: string;
  getResourceId?: (params?: Record<string, string>) => string | undefined;
}

function getDb(context?: any) {
  const env = context?.env as Record<string, unknown> | undefined;
  return env?.DB as {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  } | undefined;
}

function extractResourceId(params: Record<string, string> | undefined, options: AuditOptions): string | undefined {
  if (options.getResourceId) {
    return options.getResourceId(params);
  }
  if (options.resourceIdParam && params) {
    return params[options.resourceIdParam];
  }
  return undefined;
}

function isResponse(value: unknown): boolean {
  return value !== null && typeof value === 'object' && 'status' in value && typeof (value as any).status === 'number';
}

export function withAudit(action: string, options: AuditOptions = {}): (handler: AuditHandler) => AuditHandler {
  return (handler: AuditHandler): AuditHandler => {
    return async (params, input, context) => {
      const actorId = context?.userId as string | undefined;
      const db = getDb(context);
      const audit = db ? new AuditLogService(new AuditLogRepository(db)) : undefined;

      let result: unknown;
      let error: Error | undefined;
      let status = 200;

      try {
        result = await handler(params, input, context);
        if (isResponse(result)) {
          status = (result as any).status ?? 200;
        } else {
          status = 200;
        }
      } catch (err) {
        error = err instanceof Error ? err : new Error(String(err));
        status = 500;
        throw err;
      } finally {
        try {
          const resourceId = extractResourceId(params, options);
          const safeStatus = status ?? 500;
          const metadata: Record<string, unknown> = {
            status: safeStatus,
            success: safeStatus < 400,
            resourceType: options.resourceType,
          };
          if (error) {
            metadata.error = error.message;
          }
          if (audit) {
            await audit.log(actorId, action, options.resourceType, resourceId, metadata);
          }
        } catch {
          // Never block a request because audit logging failed.
        }
      }

      return result;
    };
  };
}
