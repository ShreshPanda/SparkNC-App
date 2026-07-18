import { OnboardingService } from '../services/onboardingService';
import { OnboardingRepository } from '../repositories/OnboardingRepository';

export interface OnboardingControllerContext {
  env?: unknown;
  userId?: string;
}

function createService(context?: OnboardingControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new OnboardingService(new OnboardingRepository(db));
}

export async function saveOnboardingController(input: { goals?: string[]; interests?: string[]; growthAreas?: string[]; supportStyle?: string; completed?: boolean }, context?: OnboardingControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createService(context);
  const profile = await service.saveProfile({ ...input, userId });
  return { ok: true, profile };
}

export async function getOnboardingController(context?: OnboardingControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createService(context);
  const profile = await service.getProfile(userId);
  return { ok: true, profile };
}

export async function getOnboardingStatusController(context?: OnboardingControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createService(context);
  const complete = await service.isOnboardingComplete(userId);
  return { ok: true, complete };
}
