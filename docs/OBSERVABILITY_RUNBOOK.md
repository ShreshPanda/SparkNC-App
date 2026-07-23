# Observability Runbook

## Signals

- Every Worker response receives `X-Request-Id`.
- Worker logs are structured JSON and redact nested sensitive metadata.
- Request metrics persist method, path, status, duration, request ID, and optional user ID.
- Requests above 300 ms are recorded as slow requests.
- Unhandled request errors are persisted without exposing internals to clients.
- Cloudflare Workers observability is enabled in `wrangler.jsonc`.

## Health checks

- `GET /health`: Worker, D1 connectivity, version, and configuration health.
- `GET /version`: deployed release identifier.
- `GET /status`: environment, route count, discovered tables, and authentication configuration status.
- `GET /metrics`: authorized metrics dashboard; requires `admin.executive.view`.

## Incident response

1. Capture the `X-Request-Id` from the response.
2. Search Cloudflare Worker logs using that identifier.
3. Inspect `/metrics` for latency, error, and slow-request changes.
4. Confirm `/health` reports D1 connected and `/status` lists expected tables.
5. If core health or authentication fails, deploy the previous Worker version while retaining the D1 schema; use a compensating migration only when needed.

## Alert thresholds

Configure Cloudflare alerts before pilot traffic for sustained Worker errors, D1 failures, and elevated latency. Start investigation when error rate exceeds 2% for five minutes or when the p95 request duration exceeds 1 second for five minutes.
