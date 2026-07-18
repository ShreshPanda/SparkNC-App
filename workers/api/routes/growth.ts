import {
  generateGrowthTimelineController,
  getGrowthStatisticsController,
  getGrowthStoryController,
  getGrowthTimelineController,
} from '../controllers/growth';

export function createGrowthRoutes() {
  return [
    {
      method: 'GET',
      path: '/growth-timeline',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getGrowthTimelineController(context),
    },
    {
      method: 'POST',
      path: '/growth-timeline/generate',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => generateGrowthTimelineController(context),
    },
    {
      method: 'GET',
      path: '/growth-timeline/stats',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getGrowthStatisticsController(context),
    },
    {
      method: 'GET',
      path: '/growth-timeline/story',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getGrowthStoryController(context),
    },
  ];
}
