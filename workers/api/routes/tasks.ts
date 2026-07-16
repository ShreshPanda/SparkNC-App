import { createTaskController, deleteTaskController, listTasksController, updateTaskController } from '../controllers/tasks';

export function createTaskRoutes() {
  return [
    {
      method: 'GET',
      path: '/tasks',
      handler: (_params: unknown, _input: unknown, context?: { env?: unknown; userId?: string }) => listTasksController(context),
    },
    {
      method: 'POST',
      path: '/tasks',
      handler: (_params: unknown, input: unknown, context?: { env?: unknown; userId?: string }) => createTaskController(input as any, context),
    },
    {
      method: 'PUT',
      path: '/tasks/:id',
      handler: (params: { id: string }, input: unknown, context?: { env?: unknown; userId?: string }) => updateTaskController(params.id, input as any, context),
    },
    {
      method: 'DELETE',
      path: '/tasks/:id',
      handler: (params: { id: string }, _input: unknown, context?: { env?: unknown; userId?: string }) => deleteTaskController(params.id, context),
    },
  ];
}
