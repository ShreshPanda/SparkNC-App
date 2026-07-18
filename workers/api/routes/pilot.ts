import {
  addPilotParticipantController,
  createPilotGroupController,
  listPilotGroupsController,
  listPilotParticipantsController,
  myPilotStatusController,
  updatePilotStatusController,
} from '../controllers/pilot';
import { requirePermission } from '../middleware/permission';

export function createPilotRoutes() {
  return [
    {
      method: 'POST',
      path: '/pilot/groups',
      handler: requirePermission('pilot.manage', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        createPilotGroupController(input as any, context)),
    },
    {
      method: 'GET',
      path: '/pilot/groups',
      handler: requirePermission('pilot.manage', (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        listPilotGroupsController(context)),
    },
    {
      method: 'POST',
      path: '/pilot/participants',
      handler: requirePermission('pilot.manage', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        addPilotParticipantController(input as any, context)),
    },
    {
      method: 'GET',
      path: '/pilot/participants',
      handler: requirePermission('pilot.manage', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        listPilotParticipantsController(input as any, context)),
    },
    {
      method: 'PATCH',
      path: '/pilot/participants/:id',
      handler: requirePermission('pilot.manage', (params: Record<string, string> | undefined, input: unknown, context: any) =>
        updatePilotStatusController({ ...(input as any), id: params?.id ?? '' }, context)),
    },
    {
      method: 'GET',
      path: '/pilot/me',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => myPilotStatusController(context),
    },
  ];
}
