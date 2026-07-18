import { getDemoScenarioController } from '../controllers/demo';

export function createDemoRoutes() {
  return [
    {
      method: 'GET',
      path: '/demo',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getDemoScenarioController(context),
    },
  ];
}
