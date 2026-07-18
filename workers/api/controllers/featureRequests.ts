import { FeatureRequestService, type CreateFeatureRequestInput } from '../services/featureRequestService';
import { FeatureRequestRepository } from '../repositories/FeatureRequestRepository';

export interface FeatureRequestControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createFeatureRequestService(context?: FeatureRequestControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new FeatureRequestService(new FeatureRequestRepository(db));
}

export async function createFeatureRequestController(input: CreateFeatureRequestInput, context?: FeatureRequestControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createFeatureRequestService(context);
  return service.create(userId, input);
}

export async function listFeatureRequestsController(status: string | undefined, context?: FeatureRequestControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createFeatureRequestService(context);
  return service.list(status);
}

export async function voteFeatureRequestController(id: string, context?: FeatureRequestControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createFeatureRequestService(context);
  await service.vote(id);
  return { success: true, id };
}

export async function updateFeatureRequestStatusController(id: string, input: { status: string }, context?: FeatureRequestControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createFeatureRequestService(context);
  await service.updateStatus(id, input.status);
  return { success: true, id, status: input.status };
}
