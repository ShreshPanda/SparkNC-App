import { loginController, logoutController, meController, registerController } from '../controllers/auth';

export function createAuthRoutes() {
  return [
    {
      method: 'POST',
      path: '/auth/register',
      handler: (params: unknown, input: unknown, context?: { env?: unknown; userId?: string; request?: Request; headers?: Headers }) => registerController(input as any, context),
    },
    {
      method: 'POST',
      path: '/auth/login',
      handler: (params: unknown, input: unknown, context?: { env?: unknown; userId?: string; request?: Request; headers?: Headers }) => loginController(input as any, context),
    },
    {
      method: 'POST',
      path: '/auth/logout',
      handler: (_params: unknown, _input: unknown, context?: { env?: unknown; userId?: string; request?: Request; headers?: Headers }) => logoutController(_input, context),
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: (_params: unknown, _input: unknown, context?: { env?: unknown; userId?: string; request?: Request; headers?: Headers }) => meController(_input, context),
    },
  ];
}

