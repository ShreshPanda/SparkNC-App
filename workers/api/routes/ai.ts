import { chatController } from '../controllers/ai';

export function createAIRoutes() {
  return [
    {
      method: 'POST',
      path: '/ai/chat',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => chatController(input as any, context),
    },
    {
      method: 'POST',
      path: '/ai/reflect',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        chatController({ message: 'What progress did I make this week?', intent: 'reflect' }, context),
    },
    {
      method: 'POST',
      path: '/ai/plan',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        chatController({ message: 'Help me organize my priorities.', intent: 'plan' }, context),
    },
    {
      method: 'POST',
      path: '/ai/recommend',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        chatController({ message: 'What opportunities match my goals?', intent: 'recommend' }, context),
    },
    {
      method: 'POST',
      path: '/ai/growth',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        chatController({ message: 'What is my strongest growth area?', intent: 'growth' }, context),
    },
  ];
}
