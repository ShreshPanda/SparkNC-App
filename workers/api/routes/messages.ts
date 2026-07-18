import {
  getConversationController,
  listConversationsController,
  listMessagesController,
  markConversationReadController,
  sendMessageController,
} from '../controllers/messages';
import { requirePermission } from '../middleware/permission';

export function createMessageRoutes() {
  return [
    {
      method: 'GET',
      path: '/conversations',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listConversationsController(context),
    },
    {
      method: 'GET',
      path: '/conversations/:id',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => getConversationController(params?.id ?? '', context),
    },
    {
      method: 'GET',
      path: '/conversations/:id/messages',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => listMessagesController(params?.id ?? '', context),
    },
    {
      method: 'POST',
      path: '/messages',
      handler: requirePermission('messages.send', (_params: Record<string, string> | undefined, input: unknown, context: any) => sendMessageController(input as any, context)),
    },
    {
      method: 'POST',
      path: '/conversations/:id/read',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => markConversationReadController(params?.id ?? '', context),
    },
  ];
}
