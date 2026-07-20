import { getDelightsController } from '../controllers/delight';

export function createDelightRoutes() {
  return [
    {
      method: 'GET',
      path: '/delight',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        getDelightsController(undefined, context),
    },
  ];
}
