export async function healthController() {
  return {
    ok: true,
    service: 'sparknc-workers',
    platform: 'cloudflare',
  };
}
