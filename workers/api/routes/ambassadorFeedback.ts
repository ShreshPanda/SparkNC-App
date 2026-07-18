import { listAmbassadorFeedbackController, submitAmbassadorFeedbackController } from '../controllers/ambassadorFeedback';

export function createAmbassadorFeedbackRoutes() {
  return [
    {
      method: 'POST',
      path: '/ambassador/feedback',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => submitAmbassadorFeedbackController(input as any, context),
    },
    {
      method: 'GET',
      path: '/ambassador/feedback',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listAmbassadorFeedbackController(context),
    },
  ];
}
