import { getSchoolController } from '../controllers/schools';

export function createSchoolRoutes() {
  return [
    {
      method: 'GET',
      path: '/schools/:id',
      handler: (params: Record<string, string> | undefined, _input: unknown, context: any) => getSchoolController(params?.id ?? '', context),
    },
  ];
}
