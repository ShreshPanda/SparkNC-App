import { getJourneyController } from '../controllers/journey';

export function createJourneyRoutes() {
  return [
    {
      method: 'GET',
      path: '/journey',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        getJourneyController(input as any, context),
    },
  ];
}
