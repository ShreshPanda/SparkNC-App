import { getSparkMomentsController, triggerSparkMomentsController } from '../controllers/sparkMoments';

export function createSparkMomentsRoutes() {
  return [
    {
      method: 'GET',
      path: '/spark-moments',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getSparkMomentsController(undefined, context),
    },
    {
      method: 'POST',
      path: '/spark-moments/trigger',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        triggerSparkMomentsController(input as any, context),
    },
  ];
}
