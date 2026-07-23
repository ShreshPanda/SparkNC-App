import { JourneyRepository, type JourneyEvent } from '../repositories/JourneyRepository';
import { SparkJourneyService } from '../services/SparkJourneyService';

export interface JourneyControllerContext {
  env?: unknown;
  userId?: string;
}

function createService(context?: JourneyControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new SparkJourneyService(new JourneyRepository(db));
}

export async function getJourneyController(input: { year?: number; semester?: 'fall' | 'spring' | 'summer'; category?: string } | undefined, context?: JourneyControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createService(context);
  const safeInput = input ?? {};
  const category = safeInput.category as JourneyEvent['category'] | undefined;
  const journey = await service.getJourney(userId, { year: safeInput.year, semester: safeInput.semester, category });
  return { ok: true, journey };
}
