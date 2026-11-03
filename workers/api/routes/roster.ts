import { requirePermission } from '../middleware/permission';
import {
  createRosterController,
  listRostersController,
  listEntriesController,
  addEntryController,
  updateEntryController,
  revokeEntryController,
  importPreviewController,
  importCommitController,
} from '../controllers/roster';

export function createRosterRoutes() {
  return [
    { method: 'POST', path: '/rosters', handler: requirePermission('roster.manage', (_p: unknown, input: unknown, ctx: any) => createRosterController(input as any, ctx)) },
    { method: 'GET', path: '/rosters', handler: requirePermission('roster.manage', (_p: unknown, _i: unknown, ctx: any) => listRostersController(ctx)) },
    { method: 'GET', path: '/rosters/:id/entries', handler: requirePermission('roster.manage', (p: { id?: string } | undefined, _i: unknown, ctx: any) => listEntriesController(p?.id ?? '', ctx)) },
    { method: 'POST', path: '/rosters/:id/entries', handler: requirePermission('roster.manage', (p: { id?: string } | undefined, input: unknown, ctx: any) => addEntryController(p?.id ?? '', input as any, ctx)) },
    { method: 'PUT', path: '/rosters/entries/:id', handler: requirePermission('roster.manage', (p: { id?: string } | undefined, input: unknown, ctx: any) => updateEntryController(p?.id ?? '', input as any, ctx)) },
    { method: 'POST', path: '/rosters/entries/:id/revoke', handler: requirePermission('roster.manage', (p: { id?: string } | undefined, _i: unknown, ctx: any) => revokeEntryController(p?.id ?? '', ctx)) },
    { method: 'POST', path: '/rosters/:id/import/preview', handler: requirePermission('roster.manage', (p: { id?: string } | undefined, input: unknown, ctx: any) => importPreviewController(p?.id ?? '', input as any, ctx)) },
    { method: 'POST', path: '/rosters/:id/import/commit', handler: requirePermission('roster.manage', (p: { id?: string } | undefined, input: unknown, ctx: any) => importCommitController(p?.id ?? '', input as any, ctx)) },
  ];
}
