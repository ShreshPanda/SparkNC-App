import { StudentSupportService } from '../services/StudentSupportService';
import { StudentSupportRepository } from '../repositories/StudentSupportRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface AmbassadorSupportControllerContext {
  env?: unknown;
  userId?: string;
  schoolId?: string;
  locationId?: string;
}

function createService(context?: AmbassadorSupportControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new StudentSupportService(new StudentSupportRepository(db));
}

export async function getStudentSupportQueueController(context?: AmbassadorSupportControllerContext) {
  const service = createService(context);
  const queue = await service.getSupportQueue(context?.schoolId, context?.locationId);
  return { ok: true, queue };
}

export async function recordSupportMessageController(input: { studentUserId: string; message: string }, context?: AmbassadorSupportControllerContext) {
  const ambassadorUserId = context?.userId;
  if (!ambassadorUserId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.studentUserId, 'Student user id is required');
  assertNonEmpty(input.message, 'Message is required');
  const service = createService(context);
  const record = await service.trackSupportInteraction(ambassadorUserId, input.studentUserId, input.message);
  return { ok: true, record };
}
