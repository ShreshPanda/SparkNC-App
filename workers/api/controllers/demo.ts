import { DemoDataService } from '../services/demoDataService';

export interface DemoControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

const demoService = new DemoDataService();

export async function getDemoScenarioController(_context?: DemoControllerContext) {
  return demoService.generateScenario();
}
