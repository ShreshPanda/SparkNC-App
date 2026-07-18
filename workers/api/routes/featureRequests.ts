import {
  createFeatureRequestController,
  listFeatureRequestsController,
  updateFeatureRequestStatusController,
  voteFeatureRequestController,
} from '../controllers/featureRequests';

export function createFeatureRequestRoutes() {
  return [
    {
      method: 'POST',
      path: '/feature-requests',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => createFeatureRequestController(input as any, context),
    },
    {
      method: 'GET',
      path: '/feature-requests',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => listFeatureRequestsController(params?.status, context),
    },
    {
      method: 'POST',
      path: '/feature-requests/:id/vote',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => voteFeatureRequestController(params?.id ?? '', context),
    },
    {
      method: 'POST',
      path: '/feature-requests/:id/status',
      handler: (params: Record<string, string> | undefined, input: unknown, context: any) => updateFeatureRequestStatusController(params?.id ?? '', input as any, context),
    },
  ];
}
