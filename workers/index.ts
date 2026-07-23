import { healthController, statusController, versionController } from './api/controllers/health';
import { createApiRouter, matchRoute } from './api/services/router';
import { createBetterAuthService } from './auth/betterAuth';
import { createAuthContext } from './api/middleware/auth';
import { createLogger } from './api/services/logger';
import { AuditLogService } from './api/services/auditLogService';
import { AuditLogRepository } from './api/repositories/AuditLogRepository';
import { RateLimitMiddleware } from './api/middleware/rateLimit';
import { createCorsResponse, isAllowedOrigin, withCors } from './api/middleware/cors';
import { MetricsRepository } from './api/repositories/MetricsRepository';
import { ObservabilityService } from './api/services/ObservabilityService';

declare const crypto: Crypto;

interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

const rateLimitMiddleware = new RateLimitMiddleware();

export interface Env {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  R2_BUCKET_NAME?: string;
  D1_DATABASE_ID?: string;
  KV_NAMESPACE_ID?: string;
  SESSION_SECRET?: string;
  ENVIRONMENT?: string;
  COOKIE_SAMESITE?: string;
  COOKIE_SECURE?: string;
  ALLOWED_ORIGINS?: string;
  DB?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  };
}

function validateEnv(env: Env): string[] {
  const errors: string[] = [];
  const environment = env.ENVIRONMENT ?? 'unknown';
  if (!env.DB || typeof env.DB.prepare !== 'function') {
    errors.push('Missing DB binding. Add a D1 database named DB in wrangler.jsonc and deploy.');
  }
  if (!env.SESSION_SECRET || String(env.SESSION_SECRET).length < 32) {
    errors.push('Missing or too short SESSION_SECRET. Set it as a Worker secret with at least 32 characters.');
  }
  if (environment === 'production') {
    if (!env.BETTER_AUTH_SECRET || String(env.BETTER_AUTH_SECRET).length < 32) {
      errors.push('Missing or too short BETTER_AUTH_SECRET. Set it as a Worker secret with at least 32 characters.');
    }
    if (!env.BETTER_AUTH_URL || !/^https:\/\//.test(env.BETTER_AUTH_URL)) {
      errors.push('Missing or invalid BETTER_AUTH_URL. Set it to the production HTTPS Worker URL.');
    }
    if (env.COOKIE_SECURE !== 'true') {
      errors.push('COOKIE_SECURE must be true in production.');
    }
    if (!env.ALLOWED_ORIGINS || env.ALLOWED_ORIGINS.includes('<')) {
      errors.push('Missing ALLOWED_ORIGINS. Configure a comma-separated list of approved HTTPS web origins.');
    }
  }
  return errors;
}

function generateRequestId(): string {
  return crypto.randomUUID();
}

interface StandardSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
  requestId: string;
}

interface StandardError {
  success: false;
  error: {
    message: string;
    code?: string;
  };
  timestamp: string;
  requestId: string;
}

function createSuccessResponse<T>(data: T, requestId: string, timestamp: string): StandardSuccess<T> {
  return { success: true, data, timestamp, requestId };
}

function createErrorResponse(error: { message: string; code?: string } | string, requestId: string, timestamp: string): StandardError {
  if (typeof error === 'string') {
    return { success: false, error: { message: error }, timestamp, requestId };
  }
  return { success: false, error: { message: error.message, code: error.code }, timestamp, requestId };
}

async function standardizeControllerResponse(response: Response, requestId: string, timestamp: string): Promise<Response> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return response;
  }

  try {
    const body = (await response.json()) as Record<string, unknown>;
    const error = (typeof body.error === 'object' && body.error ? body.error : {}) as { message?: string; code?: string };
    const status = response.status >= 400 ? response.status : 500;
    const message = error.message ?? 'Unknown error';
    const code = error.code ?? 'ERROR';
    return Response.json(createErrorResponse({ message: String(message), code: String(code) }, requestId, timestamp), { status });
  } catch {
    return response;
  }
}

function isSensitiveRequest(method: string, pathname: string): boolean {
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (mutating.includes(method)) return true;
  const sensitiveGetPrefixes = [
    '/admin/',
    '/ambassador/',
    '/analytics/',
    '/ai/',
    '/impact-',
    '/notifications/schedule',
    '/feedback/all',
    '/feedback/insights',
    '/growth-timeline/stats',
    '/growth-timeline/story',
    '/recommendations',
  ];
  return sensitiveGetPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function getResourceTypeFromPath(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (!first) return undefined;
  const scoped = ['admin', 'ambassador'];
  if (scoped.includes(first) && segments[1]) return segments[1].replace(/s$/, '');
  if (first === 'recommendations') return 'recommendation';
  if (first === 'feature-requests') return 'feature_request';
  if (first.startsWith('impact-')) return 'impact_report';
  return first.replace(/s$/, '');
}

function errorStatus(code?: string): number {
  if (code === 'UNAUTHORIZED') return 401;
  if (code === 'FORBIDDEN') return 403;
  if (code === 'NOT_FOUND') return 404;
  if (code === 'CONFLICT') return 409;
  if (code === 'RATE_LIMIT') return 429;
  return 400;
}

function extractSetCookie(payload: unknown): { setCookie?: string; data: unknown } {
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && !(payload instanceof Response) && 'setCookie' in payload) {
    const record = payload as Record<string, unknown>;
    const { setCookie, ...rest } = record;
    return {
      setCookie: typeof setCookie === 'string' ? setCookie : undefined,
      data: rest,
    };
  }
  return { data: payload };
}

export default {
  async fetch(request: Request, env: Env, executionCtx: WorkerExecutionContext) {
    const logger = createLogger({ ENVIRONMENT: env.ENVIRONMENT });
    const requestId = generateRequestId();
    const timestamp = new Date().toISOString();
    const startedAt = Date.now();
    const url = new URL(request.url);
    const router = createApiRouter();
    const auth = createBetterAuthService(env);
    const observability = env.DB ? new ObservabilityService(new MetricsRepository(env.DB)) : undefined;
    const complete = (response: Response, userId?: string): Response => {
      const headers = new Headers(response.headers);
      headers.set('X-Request-Id', requestId);
      const finalized = withCors(new Response(response.body, { status: response.status, statusText: response.statusText, headers }), request, env.ALLOWED_ORIGINS);
      if (observability) {
        executionCtx.waitUntil(
          observability.logRequest({
            requestId,
            method: request.method,
            path: url.pathname,
            statusCode: finalized.status,
            durationMs: Date.now() - startedAt,
            userId,
          }).catch((error) => logger.error('Failed to persist request metric', { requestId, message: error instanceof Error ? error.message : 'unknown error' })),
        );
      }
      return finalized;
    };

    const corsResponse = createCorsResponse(request, env.ALLOWED_ORIGINS);
    if (corsResponse) return complete(corsResponse);
    if (!isAllowedOrigin(request, env.ALLOWED_ORIGINS)) {
      return complete(Response.json(createErrorResponse({ message: 'Origin is not allowed', code: 'CORS_ORIGIN_DENIED' }, requestId, timestamp), { status: 403 }));
    }

    logger.info('Incoming request', { method: request.method, path: url.pathname, requestId });

    const envErrors = validateEnv(env);

    if (url.pathname === '/health') {
      const health = await healthController(env.DB, envErrors);
      return complete(Response.json(createSuccessResponse({ ...health, routes: router.routes.length, authConfigured: auth.isConfigured }, requestId, timestamp)));
    }

    if (url.pathname === '/version') {
      return complete(Response.json(createSuccessResponse(versionController(), requestId, timestamp)));
    }

    if (url.pathname === '/status') {
      const status = await statusController(env.DB, envErrors, env, auth.isConfigured, router.routes.length);
      return complete(Response.json(createSuccessResponse(status, requestId, timestamp)));
    }

    if (envErrors.length > 0) {
      logger.error('Environment validation failed', { requestId, envErrors });
      const message = envErrors.join('; ');
      return complete(Response.json(createErrorResponse({ message, code: 'INVALID_CONFIG' }, requestId, timestamp), { status: 503 }));
    }

    const rateLimitResponse = rateLimitMiddleware.handle(request);
    if (rateLimitResponse) {
      return complete(await standardizeControllerResponse(rateLimitResponse, requestId, timestamp));
    }

    const match = matchRoute(url.pathname, request.method);
    if (!match) {
      logger.warn('Route not found', { requestId, path: url.pathname, method: request.method });
      return complete(Response.json(createErrorResponse({ message: 'Route not found', code: 'NOT_FOUND' }, requestId, timestamp), { status: 404 }));
    }

    let input: unknown = undefined;
    if (request.method !== 'GET') {
      try {
        input = await request.json();
      } catch {
        input = {};
      }
    }

    const authContext = await createAuthContext(request.headers, env.DB as any);

    try {
      const responsePayload = await (match.route.handler as any)(match.params, input, {
        env,
        userId: authContext.userId,
        isAuthenticated: authContext.isAuthenticated,
        email: authContext.email,
        name: authContext.name,
        role: authContext.role,
        schoolId: authContext.schoolId,
        headers: request.headers,
        request,
      });

      const responseStatus =
        responsePayload && typeof responsePayload === 'object' && 'status' in responsePayload && typeof (responsePayload as any).status === 'number'
          ? (responsePayload as any).status
          : 200;

      if (isSensitiveRequest(request.method, url.pathname) && env.DB) {
        try {
          const audit = new AuditLogService(new AuditLogRepository(env.DB as any));
          await audit.log(
            authContext.userId,
            `${request.method} ${url.pathname}`,
            getResourceTypeFromPath(url.pathname),
            match.params?.id,
            { status: responseStatus, success: responseStatus < 400 },
          );
        } catch {
          // Audit failures must not break user-facing requests.
        }
      }

      if (responsePayload instanceof Response) {
        logger.warn('Controller returned raw Response; standardizing', { requestId, path: url.pathname });
        return complete(await standardizeControllerResponse(responsePayload, requestId, timestamp), authContext.userId);
      }

      if (responsePayload && typeof responsePayload === 'object' && 'ok' in responsePayload && (responsePayload as { ok?: unknown }).ok === false) {
        const payload = responsePayload as { code?: string; message?: string };
        return complete(
          Response.json(
            createErrorResponse({ message: payload.message ?? 'Request failed', code: payload.code ?? 'BAD_REQUEST' }, requestId, timestamp),
            { status: errorStatus(payload.code) },
          ),
          authContext.userId,
        );
      }

      const { setCookie, data } = extractSetCookie(responsePayload);
      const responseHeaders = new Headers();
      responseHeaders.set('content-type', 'application/json');
      if (setCookie) responseHeaders.set('Set-Cookie', setCookie);

      logger.info('Request completed', { requestId, path: url.pathname, method: request.method });
      return complete(
        new Response(JSON.stringify(createSuccessResponse(data, requestId, timestamp)), {
          status: responseStatus,
          headers: responseHeaders,
        }),
        authContext.userId,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      logger.error('Request failed', { requestId, path: url.pathname, method: request.method, message });
      if (observability) {
        executionCtx.waitUntil(observability.logError(requestId, request.method, url.pathname, message).catch(() => undefined));
      }
      return complete(Response.json(createErrorResponse({ message: 'Internal server error', code: 'INTERNAL_ERROR' }, requestId, timestamp), { status: 500 }));
    }
  },
};

