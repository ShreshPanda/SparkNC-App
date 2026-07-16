import { getUserController } from '../controllers/users';

export function createUserRoutes() {
  return [
    {
      method: 'GET',
      path: '/users/:id',
      handler: (params: { id: string }) => getUserController(params.id),
    },
  ];
}
