import { healthController } from './api/controllers/health';
import { createApiRouter, matchRoute } from './api/services/router';
import { createBetterAuthService } from './auth/betterAuth';
import { createAuthContext } from './api/middleware/auth';

export interface Env {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  R2_BUCKET_NAME?: string;
  D1_DATABASE_ID?: string;
  KV_NAMESPACE_ID?: string;
  DB?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  };
}

export default {
  async fetch(request: Request, env: Env) {
    const router = createApiRouter();
    const auth = createBetterAuthService();
    const health = await healthController();
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({
        ...health,
        routes: router.routes,
        authConfigured: auth.isConfigured,
      });
    }

    const match = matchRoute(url.pathname, request.method);
    if (!match) {
      return Response.json(
        {
          message: 'Route not found',
          path: url.pathname,
          methods: router.routes.map((route) => route.method),
        },
        { status: 404 },
      );
    }

    let input: unknown = undefined;
    if (request.method !== 'GET') {
      try {
        input = await request.json();
      } catch {
        input = {};
      }
    }

    const authContext = createAuthContext(request.headers);
    const response = await match.route.handler(match.params, input, {
      env,
      userId: authContext.userId,
    });


    return Response.json({
      ok: true,
      response,
      route: match.route.path,
      authConfigured: auth.isConfigured,
    });
  },
};
