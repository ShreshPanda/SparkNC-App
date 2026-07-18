import { EventService } from '../services/eventService';
import { EventRepository } from '../repositories/EventRepository';
import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface EventControllerContext {
  env?: unknown;
  userId?: string;
}

export interface EventInput {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  schoolId?: string;
}

function createEventService(context?: EventControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  const notificationService = new NotificationService(new NotificationRepository(db));
  return new EventService(new EventRepository(db), notificationService);
}

export async function listEventsController(context?: EventControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createEventService(context);
  return service.listEvents(userId);
}

export async function getEventController(eventId: string, context?: EventControllerContext) {
  assertNonEmpty(eventId, 'Event id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createEventService(context);
  const event = await service.getEvent(eventId, userId);
  if (!event) {
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Event not found' } }, { status: 404 });
  }
  return event;
}

export async function createEventController(input: EventInput, context?: EventControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createEventService(context);
  return service.createEvent(input, userId);
}

export async function updateEventController(eventId: string, input: EventInput, context?: EventControllerContext) {
  assertNonEmpty(eventId, 'Event id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createEventService(context);
  const event = await service.updateEvent(eventId, input, userId);
  if (!event) {
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Event not found' } }, { status: 404 });
  }
  return event;
}

export async function deleteEventController(eventId: string, context?: EventControllerContext) {
  assertNonEmpty(eventId, 'Event id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createEventService(context);
  const deleted = await service.deleteEvent(eventId, userId);
  return { deleted, eventId };
}

export async function registerForEventController(eventId: string, context?: EventControllerContext) {
  assertNonEmpty(eventId, 'Event id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createEventService(context);
  return service.registerForEvent(eventId, userId);
}

export async function unregisterFromEventController(eventId: string, context?: EventControllerContext) {
  assertNonEmpty(eventId, 'Event id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createEventService(context);
  return service.unregisterFromEvent(eventId, userId);
}

export async function listEventAttendeesController(eventId: string, context?: EventControllerContext) {
  assertNonEmpty(eventId, 'Event id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createEventService(context);
  const attendees = await service.listAttendees(eventId);
  return { eventId, attendees };
}
