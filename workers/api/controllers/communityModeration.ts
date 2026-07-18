import { CommunityModerationService, ModerationActionInput, ReportInput } from '../services/CommunityModerationService';
import { assertNonEmpty } from '../validators/baseValidator';

export interface CommunityModerationControllerContext {
  env?: unknown;
  userId?: string;
}

function createService(context?: CommunityModerationControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new CommunityModerationService(db);
}

export async function reportPostController(input: { postId: string; reason: string; details?: string }, context?: CommunityModerationControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.postId, 'Post id is required');
  assertNonEmpty(input.reason, 'Reason is required');
  const service = createService(context);
  const result = await service.reportPost({
    postId: input.postId,
    reporterId: userId,
    reason: input.reason,
    details: input.details,
  });
  return { ok: true, ...result };
}

export async function listReportsController(input: { status?: 'open' | 'resolved' | 'dismissed' }, context?: CommunityModerationControllerContext) {
  const service = createService(context);
  const reports = await service.listReports(input.status);
  return { ok: true, reports };
}

export async function reviewReportController(input: { reportId: string; status: 'resolved' | 'dismissed'; resolution?: string }, context?: CommunityModerationControllerContext) {
  const moderatorId = context?.userId;
  if (!moderatorId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.reportId, 'Report id is required');
  assertNonEmpty(input.status, 'Status is required');
  const service = createService(context);
  await service.reviewReport(input.reportId, moderatorId, input.status, input.resolution);
  return { ok: true };
}

export async function moderatePostController(input: { postId: string; action: ModerationActionInput['action']; reason?: string }, context?: CommunityModerationControllerContext) {
  const moderatorId = context?.userId;
  if (!moderatorId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.postId, 'Post id is required');
  const service = createService(context);
  await service.takeAction({ targetType: 'post', targetId: input.postId, action: input.action, moderatorId, reason: input.reason });
  return { ok: true };
}

export async function removeGroupController(input: { groupId: string; reason?: string }, context?: CommunityModerationControllerContext) {
  const moderatorId = context?.userId;
  if (!moderatorId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.groupId, 'Group id is required');
  const service = createService(context);
  await service.removeGroup(input.groupId, moderatorId, input.reason);
  return { ok: true };
}
