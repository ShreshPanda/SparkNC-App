import {
  listReportsController,
  moderatePostController,
  removeGroupController,
  reportPostController,
  reviewReportController,
} from '../controllers/communityModeration';
import { requirePermission } from '../middleware/permission';

export function createCommunityModerationRoutes() {
  return [
    {
      method: 'POST',
      path: '/community/reports',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => reportPostController(input as any, context),
    },
    {
      method: 'GET',
      path: '/community/reports',
      handler: requirePermission('community.moderate.review', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        listReportsController(input as any, context)),
    },
    {
      method: 'PATCH',
      path: '/community/reports/:id',
      handler: requirePermission('community.moderate.review', (params: Record<string, string> | undefined, input: unknown, context: any) =>
        reviewReportController({ ...(input as any), reportId: params?.id ?? '' }, context)),
    },
    {
      method: 'POST',
      path: '/community/moderate/posts',
      handler: requirePermission('community.moderate.remove', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        moderatePostController(input as any, context)),
    },
    {
      method: 'POST',
      path: '/community/moderate/groups',
      handler: requirePermission('community.moderate.remove', (_params: Record<string, string> | undefined, input: unknown, context: any) =>
        removeGroupController(input as any, context)),
    },
  ];
}
