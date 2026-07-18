import { AIMemoryService } from '../services/AIMemoryService';
import { AIMemoryRepository } from '../repositories/AIMemoryRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface AIMemoryControllerContext {
  env?: unknown;
  userId?: string;
}

function createService(context?: AIMemoryControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AIMemoryService(new AIMemoryRepository(db));
}

export async function createMemoryController(input: { key: string; value: string; category?: 'preference' | 'goal' | 'milestone' | 'interaction' }, context?: AIMemoryControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.key, 'Key is required');
  assertNonEmpty(input.value, 'Value is required');
  const service = createService(context);
  const record = await service.remember({ userId, key: input.key, value: input.value, category: input.category });
  return { ok: true, memory: record };
}

export async function listMemoriesController(context?: AIMemoryControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createService(context);
  const memories = await service.getMemoryContext(userId);
  return { ok: true, memories };
}

export async function disableMemoryController(input: { id: string }, context?: AIMemoryControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.id, 'Memory id is required');
  const service = createService(context);
  await service.disableMemory(input.id);
  return { ok: true };
}

export async function deleteMemoryController(input: { id: string }, context?: AIMemoryControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  assertNonEmpty(input.id, 'Memory id is required');
  const service = createService(context);
  await service.deleteMemory(input.id);
  return { ok: true };
}
