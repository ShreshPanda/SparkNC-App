import { DemoSeedService } from '../services/demoSeedService';

export interface DemoSeedControllerContext {
  env?: unknown;
  request?: Request;
}

export async function demoSeedController(_input: unknown, context?: DemoSeedControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } } | undefined;
  const secret = env?.DEMO_SEED_SECRET as string | undefined;
  const request = context?.request;

  if (!secret) {
    return Response.json(
      { ok: false, error: { code: 'NOT_CONFIGURED', message: 'DEMO_SEED_SECRET is not configured' } },
      { status: 503 },
    );
  }

  const header = request?.headers.get('X-Seed-Key');
  if (header !== secret) {
    return Response.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing X-Seed-Key header' } },
      { status: 401 },
    );
  }

  if (!db) {
    return Response.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Database unavailable' } },
      { status: 500 },
    );
  }

  try {
    const service = new DemoSeedService();
    const result = await service.seed(db);
    return { ok: true, data: result };
  } catch (err) {
    return Response.json(
      { ok: false, error: { code: 'SEED_ERROR', message: err instanceof Error ? err.message : 'Failed to seed demo data' } },
      { status: 500 },
    );
  }
}
