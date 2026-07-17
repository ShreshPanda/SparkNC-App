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

    const authContext = await createAuthContext(request.headers, env.DB as any);
    const responsePayload = await (match.route.handler as any)(match.params, input, {
      env,
      userId: authContext.userId,
      headers: request.headers,
      request,
    });


    // If controllers return a setCookie value, propagate it as a Set-Cookie header
    // while preserving the existing response envelope.
    const setCookie = (responsePayload && typeof responsePayload === 'object' && 'setCookie' in responsePayload
      ? (responsePayload as any).setCookie
      : undefined) as string | undefined;

    const responseWithoutSetCookie =
      setCookie && responsePayload && typeof responsePayload === 'object'
        ? (({ setCookie: _ignored, ...rest }) => rest)(responsePayload as any)
        : responsePayload;

    const envelope = {
      ok: true,
      response: responseWithoutSetCookie,
      route: match.route.path,
      authConfigured: auth.isConfigured,
    };

    const headers = new Headers();
    if (setCookie) headers.set('Set-Cookie', setCookie);

    return new Response(JSON.stringify(envelope), {
      status: 200,
      headers: {
        ...Object.fromEntries(headers.entries()),
        'content-type': 'application/json',
      },
    });
  },
};

