import { AuditLogRepository } from '../repositories/AuditLogRepository';

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'password_salt',
  'passwordSalt',
  'passwordhash',
  'passwordsalt',
  'salt',
  'secret',
  'token',
  'apiToken',
  'api_token',
  'apitoken',
  'cookie',
  'authorization',
  'sessionId',
  'session_id',
  'sessionToken',
  'sessionid',
  'sessiontoken',
  'auth',
  'bearer',
  'privateKey',
  'private_key',
  'privatekey',
]);

function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitize);

  const record = value as Record<string, unknown>;
  const copy: Record<string, unknown> = {};
  for (const key of Object.keys(record)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      copy[key] = '[REDACTED]';
    } else {
      copy[key] = sanitize(record[key]);
    }
  }
  return copy;
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const safe = sanitize(metadata);
  return safe as Record<string, unknown>;
}

export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async log(actorId: string | undefined, action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>) {
    return this.repository.log(actorId, action, entityType, entityId, sanitizeMetadata(metadata));
  }

  async list(limit = 100) {
    return this.repository.list(limit);
  }
}
