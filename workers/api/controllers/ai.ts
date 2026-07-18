import { AICompanionService, type AICompanionInput } from '../services/aiCompanionService';
import { PromptService } from '../services/promptService';
import { MemoryService } from '../services/memoryService';
import { StudentContextBuilder } from '../services/studentContextBuilder';
import { MemoryRepository } from '../repositories/MemoryRepository';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';

export interface AIControllerContext {
  env?: unknown;
  userId?: string;
}

export type { AICompanionInput };

function createAICompanionService(context?: AIControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  const insightRepository = new StudentInsightRepository(db);
  return new AICompanionService(
    new StudentContextBuilder(insightRepository),
    new PromptService(),
    new MemoryService(new MemoryRepository(db)),
  );
}

export async function chatController(input: AICompanionInput, context?: AIControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createAICompanionService(context);
  return service.interact(userId, input);
}
