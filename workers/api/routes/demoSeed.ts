import { demoSeedController } from '../controllers/demoSeed';

export function createDemoSeedRoutes() {
  return [
    {
      method: 'POST',
      path: '/demo/seed',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        demoSeedController(input, context),
    },
  ];
}
