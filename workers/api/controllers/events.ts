import { assertNonEmpty } from '../validators/baseValidator';

export interface EventInput {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
}

export async function listEventsController() {
  return {
    ok: true,
    items: [],
    message: 'Events route is prepared for D1-backed implementation',
  };
}

export async function createEventController(input: EventInput) {
  assertNonEmpty(input.title, 'Event title is required');
  assertNonEmpty(input.startsAt, 'Event start time is required');

  return {
    ok: true,
    item: {
      id: `event-${Date.now()}`,
      title: input.title,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      location: input.location,
    },
    message: 'Event creation route is ready for persistence',
  };
}
