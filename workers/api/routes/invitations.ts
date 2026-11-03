import { requirePermission } from '../middleware/permission';
import {
  issueInvitationController,
  issueSchoolLinkController,
  issueClaimCodeController,
  revokeInvitationController,
  listInvitationsController,
} from '../controllers/roster';

export function createInvitationRoutes() {
  return [
    { method: 'POST', path: '/invitations', handler: requirePermission('invitations.manage', (_p: unknown, input: unknown, ctx: any) => issueInvitationController(input as any, ctx)) },
    { method: 'POST', path: '/invitations/school-link', handler: requirePermission('invitations.manage', (_p: unknown, input: unknown, ctx: any) => issueSchoolLinkController(input as any, ctx)) },
    { method: 'POST', path: '/invitations/claim-code', handler: requirePermission('invitations.manage', (_p: unknown, input: unknown, ctx: any) => issueClaimCodeController(input as any, ctx)) },
    { method: 'POST', path: '/invitations/:id/revoke', handler: requirePermission('invitations.manage', (p: { id?: string } | undefined, _i: unknown, ctx: any) => revokeInvitationController(p?.id ?? '', ctx)) },
    { method: 'GET', path: '/invitations', handler: requirePermission('invitations.manage', (_p: unknown, _i: unknown, ctx: any) => listInvitationsController(ctx)) },
  ];
}
