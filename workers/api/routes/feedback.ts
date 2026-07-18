import {
  listMyFeedbackController,
  listRecentFeedbackController,
  submitFeedbackController,
} from '../controllers/studentFeedback';

export function createFeedbackRoutes() {
  return [
    {
      method: 'POST',
      path: '/feedback',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => submitFeedbackController(input as any, context),
    },
    {
      method: 'GET',
      path: '/feedback',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listMyFeedbackController(context),
    },
    {
      method: 'GET',
      path: '/feedback/all',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listRecentFeedbackController(undefined, context),
    },
  ];
}
