import { getEngagementController, getFeatureUsageController, getRetentionController } from '../controllers/engagementAnalytics';
import { requirePermission } from '../middleware/permission';

export function createEngagementAnalyticsRoutes() {
  return [
    {
      method: 'GET',
      path: '/analytics/engagement',
      handler: requirePermission('admin.analytics.view', (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        getEngagementController(context)),
    },
    {
      method: 'GET',
      path: '/analytics/retention',
      handler: requirePermission('admin.analytics.view', (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        getRetentionController(context)),
    },
    {
      method: 'GET',
      path: '/analytics/features',
      handler: requirePermission('admin.analytics.view', (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        getFeatureUsageController(context)),
    },
  ];
}
