import { PortfolioRepository } from '../repositories/PortfolioRepository';
import { PortfolioService } from '../services/PortfolioService';

export interface PortfolioControllerContext {
  env?: unknown;
  userId?: string;
}

function createService(context?: PortfolioControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new PortfolioService(new PortfolioRepository(db));
}

export async function getPortfolioController(_input: unknown, context?: PortfolioControllerContext) {
  const userId = context?.userId;
  if (!userId) return { ok: false, code: 'UNAUTHORIZED', message: 'Unauthorized' };
  const service = createService(context);
  const portfolio = await service.getPortfolio(userId);
  return { ok: true, portfolio };
}
