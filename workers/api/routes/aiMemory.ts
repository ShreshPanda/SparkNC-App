import {
  createMemoryController,
  deleteMemoryController,
  disableMemoryController,
  listMemoriesController,
} from '../controllers/aiMemory';

export function createAIMemoryRoutes() {
  return [
    {
      method: 'POST',
      path: '/ai/memory',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => createMemoryController(input as any, context),
    },
    {
      method: 'GET',
      path: '/ai/memory',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listMemoriesController(context),
    },
    {
      method: 'PATCH',
      path: '/ai/memory/:id/disable',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) =>
        disableMemoryController({ id: params?.id ?? '' }, context),
    },
    {
      method: 'DELETE',
      path: '/ai/memory/:id',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) =>
        deleteMemoryController({ id: params?.id ?? '' }, context),
    },
  ];
}
