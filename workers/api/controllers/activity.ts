import { assertNonEmpty } from '../validators/baseValidator';

export interface SessionInput {
  userId: string;
  activityType: string;
  entityType?: string;
  entityId?: string;
}

export async function createSessionActivityController(input: SessionInput) {
  assertNonEmpty(input.userId, 'User id is required');
  assertNonEmpty(input.activityType, 'Activity type is required');

  return {
    ok: true,
    activity: {
      id: `activity-${Date.now()}`,
      userId: input.userId,
      activityType: input.activityType,
      entityType: input.entityType,
      entityId: input.entityId,
    },
    message: 'Activity session route is ready for persistence',
  };
}

export async function getActivityStatsController(userId: string) {
  assertNonEmpty(userId, 'User id is required');

  return {
    ok: true,
    userId,
    stats: {
      sessions: 0,
      lastActiveAt: null,
    },
    message: 'Activity stats route is ready for persistence',
  };
}
