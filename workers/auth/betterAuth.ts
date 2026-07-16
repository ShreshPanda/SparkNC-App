import { getCloudflareEnv } from '../config/env';

export interface BetterAuthConfig {
  secret: string;
  baseURL: string;
}

export function createBetterAuthConfig(overrides: Partial<BetterAuthConfig> = {}): BetterAuthConfig {
  const env = getCloudflareEnv();

  return {
    secret: overrides.secret ?? env.betterAuthSecret,
    baseURL: overrides.baseURL ?? env.betterAuthUrl,
  };
}

export function createBetterAuthService() {
  const config = createBetterAuthConfig();

  return {
    config,
    isConfigured: Boolean(config.secret && config.baseURL),
  };
}
