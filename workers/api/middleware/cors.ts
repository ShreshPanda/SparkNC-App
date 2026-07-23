function allowedOrigins(value?: string): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

export function isAllowedOrigin(request: Request, allowedOriginsValue?: string): boolean {
  const origin = request.headers.get('Origin');
  return !origin || allowedOrigins(allowedOriginsValue).has(origin);
}

export function createCorsResponse(request: Request, allowedOriginsValue?: string): Response | undefined {
  if (request.method !== 'OPTIONS') return undefined;
  if (!isAllowedOrigin(request, allowedOriginsValue)) {
    return Response.json({ success: false, error: { code: 'CORS_ORIGIN_DENIED', message: 'Origin is not allowed' } }, { status: 403 });
  }

  return new Response(null, { status: 204, headers: corsHeaders(request, allowedOriginsValue) });
}

export function withCors(response: Response, request: Request, allowedOriginsValue?: string): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of corsHeaders(request, allowedOriginsValue)) {
    headers.set(name, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function corsHeaders(request: Request, allowedOriginsValue?: string): Headers {
  const headers = new Headers();
  const origin = request.headers.get('Origin');
  if (!origin || !isAllowedOrigin(request, allowedOriginsValue)) return headers;

  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');
  headers.set('Access-Control-Expose-Headers', 'X-Request-Id');
  headers.set('Vary', 'Origin');
  return headers;
}
