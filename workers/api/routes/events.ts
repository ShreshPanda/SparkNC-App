import {
  createEventController,
  deleteEventController,
  getEventController,
  listEventAttendeesController,
  listEventsController,
  registerForEventController,
  unregisterFromEventController,
  updateEventController,
} from '../controllers/events';
import { requirePermission } from '../middleware/permission';

export function createEventRoutes() {
  return [
    {
      method: 'GET',
      path: '/events',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listEventsController(context),
    },
    {
      method: 'GET',
      path: '/events/:id',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => getEventController(params?.id ?? '', context),
    },
    {
      method: 'POST',
      path: '/events',
      handler: requirePermission('events.manage', (_params: Record<string, string> | undefined, input: unknown, context: any) => createEventController(input as any, context)),
    },
    {
      method: 'PUT',
      path: '/events/:id',
      handler: requirePermission('events.manage', (params: Record<string, string> | undefined, input: unknown, context: any) => updateEventController(params?.id ?? '', input as any, context)),
    },
    {
      method: 'DELETE',
      path: '/events/:id',
      handler: requirePermission('events.manage', (params: Record<string, string> | undefined, _input: unknown, context: any) => deleteEventController(params?.id ?? '', context)),
    },
    {
      method: 'POST',
      path: '/events/:id/register',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => registerForEventController(params?.id ?? '', context),
    },
    {
      method: 'POST',
      path: '/events/:id/unregister',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => unregisterFromEventController(params?.id ?? '', context),
    },
    {
      method: 'GET',
      path: '/events/:id/attendees',
      handler: requirePermission('events.manage', (params: Record<string, string> | undefined, _input: unknown, context: any) => listEventAttendeesController(params?.id ?? '', context)),
    },
  ];
}
