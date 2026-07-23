import { OrganizationService } from '../services/organizationService';
import { assertNonEmpty } from '../validators/baseValidator';

export interface SchoolControllerContext {
  env?: unknown;
  userId?: string;
}

function createOrganizationService(context?: SchoolControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } } | undefined;
  return new OrganizationService(db as never);
}

export async function getSchoolController(schoolId: string, context?: SchoolControllerContext) {
  assertNonEmpty(schoolId, 'School id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createOrganizationService(context);
  return service.getSchoolById(schoolId);
}
