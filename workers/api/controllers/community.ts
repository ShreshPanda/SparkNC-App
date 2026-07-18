import { CommunityService } from '../services/communityService';
import { CommunityRepository } from '../repositories/CommunityRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface CommunityControllerContext {
  env?: unknown;
  userId?: string;
}

function createCommunityService(context?: CommunityControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new CommunityService(new CommunityRepository(db));
}

export async function createGroupController(input: { name: string; description?: string; kind?: string }, context?: CommunityControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.name, 'Group name is required');
  const service = createCommunityService(context);
  const group = await service.createGroup({
    name: input.name,
    description: input.description,
    kind: input.kind as any,
    createdBy: userId,
  });
  return { ok: true, group };
}

export async function listGroupsController(context?: CommunityControllerContext) {
  const service = createCommunityService(context);
  return service.listGroups();
}

export async function joinGroupController(input: { groupId: string }, context?: CommunityControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.groupId, 'Group id is required');
  const service = createCommunityService(context);
  return service.joinGroup(input.groupId, userId);
}

export async function createGroupPostController(input: { groupId: string; title?: string; body: string; kind?: string }, context?: CommunityControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.groupId, 'Group id is required');
  assertNonEmpty(input.body, 'Post body is required');
  const service = createCommunityService(context);
  const post = await service.shareProgress({
    groupId: input.groupId,
    title: input.title,
    body: input.body,
    kind: input.kind as any,
    userId,
  });
  return { ok: true, post };
}

export async function listGroupPostsController(input: { groupId: string }, context?: CommunityControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.groupId, 'Group id is required');
  const service = createCommunityService(context);
  const posts = await service.listGroupPosts(input.groupId, userId);
  return { ok: true, posts };
}
