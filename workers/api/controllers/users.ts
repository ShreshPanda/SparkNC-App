import { assertNonEmpty } from '../validators/baseValidator';

export async function getUserController(userId: string) {
  assertNonEmpty(userId, 'User id is required');

  return {
    ok: true,
    userId,
    message: 'User profile route is ready for D1-backed implementation',
  };
}
