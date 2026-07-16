import { createGoalController, listGoalsController, updateGoalController } from '../controllers/goals';

export function createGoalRoutes() {
  return [
    {
      method: 'GET',
      path: '/goals',
      handler: (_params: unknown, _input: unknown, context?: { env?: unknown; userId?: string }) => listGoalsController(context),
    },
    {
      method: 'POST',
      path: '/goals',
      handler: (_params: unknown, input: unknown, context?: { env?: unknown; userId?: string }) => createGoalController(input as any, context),
    },
    {
      method: 'PUT',
      path: '/goals/:id',
      handler: (params: { id: string }, input: unknown, context?: { env?: unknown; userId?: string }) => updateGoalController(params.id, input as any, context),
    },
  ];
}
