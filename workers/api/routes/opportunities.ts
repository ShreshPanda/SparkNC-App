import { getOpportunitiesController } from '../controllers/opportunities';

export function createOpportunityRoutes() {
  return [
    {
      method: 'GET',
      path: '/opportunities',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getOpportunitiesController(context),
    },
  ];
}
