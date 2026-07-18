import {
  generateStudentInsightsController,
  getStudentDashboardController,
  listStudentInsightsController,
} from '../controllers/insights';

export function createInsightsRoutes() {
  return [
    {
      method: 'GET',
      path: '/insights',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listStudentInsightsController(context),
    },
    {
      method: 'GET',
      path: '/insights/dashboard',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getStudentDashboardController(context),
    },
    {
      method: 'POST',
      path: '/insights/generate',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => generateStudentInsightsController(context),
    },
  ];
}
