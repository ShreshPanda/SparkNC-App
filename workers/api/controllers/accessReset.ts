import { AccessResetService } from '../services/accessResetService';
import { AccessResetRepository } from '../repositories/AccessResetRepository';
import { clientIp, D1RateLimiter, rateLimitedResponse } from '../services/rateLimitService';
import type { Caller } from '../services/rosterService';
import { assertNonEmpty } from '../validators/baseValidator';

type Db = ConstructorParameters<typeof AccessResetRepository>[0];

interface Ctx {
  env?: unknown;
  userId?: string;
  role?: string;
  schoolId?: string;
  headers?: Headers;
}

function service(context?: Ctx): { service: AccessResetService; db: Db } {
  const db = (context?.env as Record<string, unknown> | undefined)?.DB as Db;
  return { service: new AccessResetService(new AccessResetRepository(db)), db };
}

function error(message: string, code: string, status: number): Response {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

// Authenticated initiation — route is permission-gated; school scope is
// enforced in the service. The raw token is returned exactly once.
export async function initiateResetController(input: { userId?: string }, context?: Ctx) {
  if (!context?.userId) return error('Unauthorized', 'UNAUTHORIZED', 401);
  const { service: svc, db } = service(context);
  // Durable multi-key limit: initiating staff account, target account, and
  // client IP — all increment before any reject decision, and the key is
  // computed from the submitted id whether or not the target exists (no
  // existence oracle through 429s).
  try {
    const decision = await new D1RateLimiter(db).check([
      { scope: 'reset:init:staff', subject: context.userId, max: 10, windowMs: 600_000 },
      { scope: 'reset:init:target', subject: String(input?.userId ?? 'missing'), max: 3, windowMs: 600_000 },
      { scope: 'reset:init:ip', subject: clientIp(context?.headers), max: 20, windowMs: 600_000 },
    ]);
    if (!decision.allowed) return rateLimitedResponse(decision.retryAfterMs);
  } catch {
    return rateLimitedResponse(60_000);
  }
  const caller: Caller = { userId: context.userId, role: context.role, schoolId: context.schoolId };
  try {
    assertNonEmpty(input?.userId, 'User id is required');
    const result = await svc.initiate(input.userId!, caller);
    return { ok: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reset initiation failed';
    if (/scope|forbidden/i.test(message)) return error('Forbidden', 'FORBIDDEN', 403);
    return error('Reset initiation failed', 'RESET_INITIATE_FAILED', 400);
  }
}

// Public completion — token + new access phrase only.
export async function completeResetController(input: { resetToken?: string; accessPhrase?: string }, context?: Ctx) {
  const { service: svc, db } = service(context);
  try {
    const decision = await new D1RateLimiter(db).check([
      { scope: 'reset:complete:tok', subject: input?.resetToken || 'missing', max: 5, windowMs: 600_000 },
      { scope: 'reset:complete:ip', subject: clientIp(context?.headers), max: 20, windowMs: 600_000 },
    ]);
    if (!decision.allowed) return rateLimitedResponse(decision.retryAfterMs);
  } catch {
    return rateLimitedResponse(60_000);
  }
  try {
    assertNonEmpty(input?.resetToken, 'Reset token is required');
    assertNonEmpty(input?.accessPhrase, 'Access phrase is required');
    await svc.complete(input.resetToken!, input.accessPhrase!);
    return { ok: true, data: { reset: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('requirements')) {
      return error('Access phrase does not meet requirements', 'PHRASE_POLICY', 400);
    }
    return error('Invalid or expired reset link', 'INVALID_RESET', 400);
  }
}
