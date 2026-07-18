import {
  checkAchievementsController,
  getRecognitionSummaryController,
  listAchievementsController,
} from '../controllers/achievements';
import { requirePermission } from '../middleware/permission';

export function createAchievementsRoutes() {
  return [
    {
      method: 'GET',
      path: '/achievements',
      handler: requirePermission('student.achievements.read', (_params: Record<string, string> | undefined, _input: unknown, context: any) => listAchievementsController(context)),
    },
    {
      method: 'POST',
      path: '/achievements/check',
      handler: requirePermission('student.achievements.update', (_params: Record<string, string> | undefined, _input: unknown, context: any) => checkAchievementsController(context)),
    },
    {
      method: 'GET',
      path: '/achievements/recognition',
      handler: requirePermission('student.achievements.read', (_params: Record<string, string> | undefined, _input: unknown, context: any) => getRecognitionSummaryController(context)),
    },
  ];
}
