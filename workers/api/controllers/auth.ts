import { createBetterAuthService } from '../../auth/betterAuth';
import { assertNonEmpty } from '../validators/baseValidator';

export interface LoginInput {
  email: string;
  password: string;
}

export async function loginController(input: LoginInput) {
  assertNonEmpty(input.email, 'Email is required');
  assertNonEmpty(input.password, 'Password is required');

  const auth = createBetterAuthService();

  return {
    ok: true,
    authConfigured: auth.isConfigured,
    message: 'Login route is prepared for Better Auth integration',
  };
}

export async function logoutController() {
  return {
    ok: true,
    message: 'Logout route is prepared for Better Auth integration',
  };
}
