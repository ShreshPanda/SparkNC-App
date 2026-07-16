import { assertNonEmpty } from '../validators/baseValidator';

export interface MessageInput {
  recipientId: string;
  body: string;
  threadId?: string;
}

export async function listMessagesController() {
  return {
    ok: true,
    items: [],
    message: 'Messages route is prepared for D1-backed implementation',
  };
}

export async function createMessageController(input: MessageInput) {
  assertNonEmpty(input.recipientId, 'Recipient id is required');
  assertNonEmpty(input.body, 'Message body is required');

  return {
    ok: true,
    item: {
      id: `message-${Date.now()}`,
      recipientId: input.recipientId,
      body: input.body,
      threadId: input.threadId,
    },
    message: 'Message creation route is ready for persistence',
  };
}
