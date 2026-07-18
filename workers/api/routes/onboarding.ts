import {
  getOnboardingController,
  getOnboardingStatusController,
  saveOnboardingController,
} from '../controllers/onboarding';

export function createOnboardingRoutes() {
  return [
    {
      method: 'POST',
      path: '/onboarding',
      handler: (_params: Record<string, string> | undefined, input: unknown, context: any) => saveOnboardingController(input as any, context),
    },
    {
      method: 'GET',
      path: '/onboarding',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getOnboardingController(context),
    },
    {
      method: 'GET',
      path: '/onboarding/complete',
      handler: (_params: Record<string, string> | undefined, _input: unknown, context: any) => getOnboardingStatusController(context),
    },
  ];
}
