import { getImpactAnalyticsController } from '../controllers/impactAnalytics';

export function createImpactAnalyticsRoutes() {
  return [
    {
      method: 'GET',
      path: '/impact-analytics',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getImpactAnalyticsController(context),
    },
  ];
}
