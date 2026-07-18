import { generateRecommendationsController, listRecommendationsController, updateRecommendationStatusController } from '../controllers/improvementRecommendations';

export function createImprovementRecommendationRoutes() {
  return [
    {
      method: 'POST',
      path: '/recommendations/generate',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => generateRecommendationsController(context),
    },
    {
      method: 'GET',
      path: '/recommendations',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listRecommendationsController(context),
    },
    {
      method: 'POST',
      path: '/recommendations/:id/status',
      handler: (params: Record<string, string> | undefined, input: unknown, context: any) => updateRecommendationStatusController(params?.id ?? '', input as any, context),
    },
  ];
}
