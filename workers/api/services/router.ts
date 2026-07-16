import { routeRegistry } from '../routes';

export interface RouteContext {
  env?: unknown;
  userId?: string;
}

export interface RouteDefinition {
  method: string;
  path: string;
  handler: (params?: Record<string, string>, input?: unknown, context?: RouteContext) => Promise<unknown> | unknown;
}

export function createApiRouter() {
  return {
    routes: routeRegistry.modules as RouteDefinition[],
    version: 'v1',
  };
}

export function matchRoute(pathname: string, method: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const routeDefinitions = routeRegistry.modules as RouteDefinition[];

  for (const route of routeDefinitions) {
    if (route.method.toUpperCase() !== method.toUpperCase()) {
      continue;
    }

    const routeSegments = route.path.split('/').filter(Boolean);
    const pathSegments = normalizedPath.split('/').filter(Boolean);

    if (routeSegments.length !== pathSegments.length) {
      continue;
    }

    const params: Record<string, string> = {};
    let matches = true;

    for (let index = 0; index < routeSegments.length; index += 1) {
      const routeSegment = routeSegments[index];
      const pathSegment = pathSegments[index];

      if (routeSegment.startsWith(':')) {
        params[routeSegment.slice(1)] = pathSegment;
      } else if (routeSegment !== pathSegment) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return { route, params };
    }
  }

  return null;
}
