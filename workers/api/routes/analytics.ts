import {
  getOrganizationAnalyticsController,
  getSchoolAnalyticsController,
  snapshotOrganizationAnalyticsController,
  snapshotSchoolAnalyticsController,
} from '../controllers/analytics';

export function createAnalyticsRoutes() {
  return [
    {
      method: 'GET',
      path: '/analytics/overview',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getOrganizationAnalyticsController(context),
    },
    {
      method: 'GET',
      path: '/analytics/school/:id',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => getSchoolAnalyticsController(params?.id ?? '', context),
    },
    {
      method: 'POST',
      path: '/analytics/snapshot/organization',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => snapshotOrganizationAnalyticsController(context),
    },
    {
      method: 'POST',
      path: '/analytics/snapshot/school/:id',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => snapshotSchoolAnalyticsController(params?.id ?? '', context),
    },
  ];
}
