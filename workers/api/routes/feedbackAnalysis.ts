import { analyzeFeedbackController, listFeedbackInsightsController } from '../controllers/feedbackAnalysis';

export function createFeedbackAnalysisRoutes() {
  return [
    {
      method: 'POST',
      path: '/feedback/analyze',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => analyzeFeedbackController(context),
    },
    {
      method: 'GET',
      path: '/feedback/insights',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listFeedbackInsightsController(context),
    },
  ];
}
