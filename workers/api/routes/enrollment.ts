import { claimEnrollmentController, resolveInvitationController, verifyClaimCodeController } from '../controllers/enrollment';

// Public endpoints — listed in PUBLIC_METHOD_PATHS (POST only) in the
// worker entrypoint. Handlers enforce their own rate limits.
export function createEnrollmentRoutes() {
  return [
    { method: 'POST', path: '/enroll/resolve', handler: (_p: unknown, input: unknown, ctx: any) => resolveInvitationController(input as any, ctx) },
    { method: 'POST', path: '/enroll/verify', handler: (_p: unknown, input: unknown, ctx: any) => verifyClaimCodeController(input as any, ctx) },
    { method: 'POST', path: '/enroll/claim', handler: (_p: unknown, input: unknown, ctx: any) => claimEnrollmentController(input as any, ctx) },
  ];
}
