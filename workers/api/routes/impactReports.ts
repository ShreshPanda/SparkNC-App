import { generateMonthlyReportController, listImpactReportsController } from '../controllers/impactReports';

export function createImpactReportRoutes() {
  return [
    {
      method: 'POST',
      path: '/impact-reports/generate',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => generateMonthlyReportController(input as any, context),
    },
    {
      method: 'GET',
      path: '/impact-reports',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => listImpactReportsController(context),
    },
  ];
}
