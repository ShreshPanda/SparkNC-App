import { createEventController, listEventsController } from '../controllers/events';

export function createEventRoutes() {
  return [
    {
      method: 'GET',
      path: '/events',
      handler: () => listEventsController(),
    },
    {
      method: 'POST',
      path: '/events',
      handler: (input: unknown) => createEventController(input as any),
    },
  ];
}
