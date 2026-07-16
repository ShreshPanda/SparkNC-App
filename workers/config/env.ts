export interface CloudflareEnv {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  R2_BUCKET_NAME?: string;
  D1_DATABASE_ID?: string;
  KV_NAMESPACE_ID?: string;
}

export function getCloudflareEnv(env: Partial<CloudflareEnv> = {}) {
  return {
    betterAuthSecret: env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET ?? '',
    betterAuthUrl: env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    accountId: env.CLOUDFLARE_ACCOUNT_ID ?? process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
    apiToken: env.CLOUDFLARE_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN ?? '',
    r2BucketName: env.R2_BUCKET_NAME ?? process.env.R2_BUCKET_NAME ?? 'sparknc-assets',
    d1DatabaseId: env.D1_DATABASE_ID ?? process.env.D1_DATABASE_ID ?? '',
    kvNamespaceId: env.KV_NAMESPACE_ID ?? process.env.KV_NAMESPACE_ID ?? '',
  };
}
