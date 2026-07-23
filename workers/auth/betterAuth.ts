import { getCloudflareEnv } from '../config/env';

export interface BetterAuthConfig {
  secret: string;
  baseURL: string;
}

export function createBetterAuthConfig(overrides: Partial<BetterAuthConfig> = {}, bindingEnv: Parameters<typeof getCloudflareEnv>[0] = {}): BetterAuthConfig {
  const env = getCloudflareEnv(bindingEnv);

  return {
    secret: overrides.secret ?? env.betterAuthSecret,
    baseURL: overrides.baseURL ?? env.betterAuthUrl,
  };
}

export function createBetterAuthService(bindingEnv: Parameters<typeof getCloudflareEnv>[0] = {}) {
  const config = createBetterAuthConfig({}, bindingEnv);

  return {
    config,
    isConfigured: Boolean(config.secret && config.baseURL),
  };
}
