import { PilotService } from '../services/pilotService';
import { PilotRepository } from '../repositories/PilotRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface PilotControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createPilotService(context?: PilotControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new PilotService(new PilotRepository(db));
}

export async function createPilotGroupController(input: { group: string }, context?: PilotControllerContext) {
  assertNonEmpty(input.group, 'Pilot group name is required');
  const service = createPilotService(context);
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  // Creating a group is equivalent to enrolling the current admin as the first pilot user.
  const record = await service.createPilotUser({ userId, pilotGroup: input.group });
  return { ok: true, group: record.pilotGroup };
}

export async function listPilotGroupsController(context?: PilotControllerContext) {
  const service = createPilotService(context);
  const groups = await service.getGroups();
  return { ok: true, groups };
}

export async function listPilotParticipantsController(input: { group?: string }, context?: PilotControllerContext) {
  const service = createPilotService(context);
  const result = await service.getParticipants(input.group);
  return { ok: true, ...result };
}

export async function addPilotParticipantController(input: { userId: string; group: string }, context?: PilotControllerContext) {
  assertNonEmpty(input.userId, 'User id is required');
  assertNonEmpty(input.group, 'Pilot group is required');
  const service = createPilotService(context);
  const record = await service.createPilotUser({ userId: input.userId, pilotGroup: input.group });
  return { ok: true, participant: record };
}

export async function updatePilotStatusController(input: { id: string; status: 'active' | 'paused' | 'completed' }, context?: PilotControllerContext) {
  assertNonEmpty(input.id, 'Pilot id is required');
  assertNonEmpty(input.status, 'Status is required');
  const service = createPilotService(context);
  await service.updateStatus(input.id, input.status);
  return { ok: true };
}

export async function myPilotStatusController(context?: PilotControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createPilotService(context);
  const participants = await service.getParticipants();
  const mine = participants.participants.find((p) => p.userId === userId);
  return { ok: true, pilot: mine ?? null };
}
