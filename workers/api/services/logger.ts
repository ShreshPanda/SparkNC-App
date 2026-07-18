export interface LoggerEnv {
  ENVIRONMENT?: string;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'password_salt',
  'salt',
  'secret',
  'token',
  'apiToken',
  'cookie',
  'authorization',
  'sessionId',
]);

function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);

  const record = value as Record<string, unknown>;
  const copy: Record<string, unknown> = {};
  for (const key of Object.keys(record)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      copy[key] = '[REDACTED]';
    } else {
      copy[key] = redact(record[key]);
    }
  }
  return copy;
}

export interface Logger {
  log(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export function createLogger(env: LoggerEnv): Logger {
  const isProduction = env.ENVIRONMENT === 'production';

  function write(level: string, message: string, meta?: Record<string, unknown>) {
    const safeMeta = meta ? redact(meta) : undefined;
    const entry = {
      level,
      message,
      ...(safeMeta ? safeMeta : {}),
      timestamp: new Date().toISOString(),
    };

    if (isProduction) {
      // In production only log warnings and errors by default. The structured entry
      // can be shipped to a logging service such as Cloudflare Workers Analytics.
      if (level === 'error' || level === 'warn') {
        console[level === 'error' ? 'error' : 'warn'](JSON.stringify(entry));
      }
      return;
    }

    // Development: detailed console output.
    if (level === 'error') {
      console.error(JSON.stringify(entry, null, 2));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry, null, 2));
    } else {
      console.log(JSON.stringify(entry, null, 2));
    }
  }

  return {
    log: (message, meta) => write('info', message, meta),
    info: (message, meta) => write('info', message, meta),
    debug: (message, meta) => write('debug', message, meta),
    warn: (message, meta) => write('warn', message, meta),
    error: (message, meta) => write('error', message, meta),
  };
}
