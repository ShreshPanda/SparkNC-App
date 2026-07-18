import { MessageService } from '../services/messageService';
import { MessageRepository } from '../repositories/MessageRepository';
import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface MessageControllerContext {
  env?: unknown;
  userId?: string;
}

export interface MessageInput {
  recipientId: string;
  body: string;
}

function createMessageService(context?: MessageControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  const notificationService = new NotificationService(new NotificationRepository(db));
  return new MessageService(new MessageRepository(db), notificationService);
}

export async function listConversationsController(context?: MessageControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createMessageService(context);
  return service.listConversations(userId);
}

export async function getConversationController(conversationId: string, context?: MessageControllerContext) {
  assertNonEmpty(conversationId, 'Conversation id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createMessageService(context);
  const conversation = await service.getConversation(conversationId, userId);
  if (!conversation) {
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Conversation not found' } }, { status: 404 });
  }
  return conversation;
}

export async function listMessagesController(conversationId: string, context?: MessageControllerContext) {
  assertNonEmpty(conversationId, 'Conversation id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createMessageService(context);
  return service.listMessages(conversationId, userId);
}

export async function sendMessageController(input: MessageInput, context?: MessageControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createMessageService(context);
  return service.sendMessage(input, userId);
}

export async function markConversationReadController(conversationId: string, context?: MessageControllerContext) {
  assertNonEmpty(conversationId, 'Conversation id is required');
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createMessageService(context);
  await service.markRead(conversationId, userId);
  return { success: true, conversationId };
}
