import { getPortfolioController } from '../controllers/portfolio';

export function createPortfolioRoutes() {
  return [
    {
      method: 'GET',
      path: '/portfolio',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) =>
        getPortfolioController(undefined, context),
    },
  ];
}
