import { createMessageController, listMessagesController } from '../controllers/messages';

export function createMessageRoutes() {
  return [
    {
      method: 'GET',
      path: '/messages',
      handler: () => listMessagesController(),
    },
    {
      method: 'POST',
      path: '/messages',
      handler: (input: unknown) => createMessageController(input as any),
    },
  ];
}
