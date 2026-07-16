import { loginController, logoutController } from '../controllers/auth';

export function createAuthRoutes() {
  return [
    {
      method: 'POST',
      path: '/auth/login',
      handler: loginController,
    },
    {
      method: 'POST',
      path: '/auth/logout',
      handler: logoutController,
    },
  ];
}
