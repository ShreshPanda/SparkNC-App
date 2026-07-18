export interface HealthReport {
  status: 'ok' | 'degraded' | 'error';
  database: 'connected' | 'disconnected';
  version: string;
  timestamp: string;
}

export async function healthController(
  db?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  },
  envErrors: string[] = [],
): Promise<HealthReport> {
  const timestamp = new Date().toISOString();
  let database: 'connected' | 'disconnected' = 'disconnected';

  if (db) {
    try {
      await db.prepare('SELECT 1').all();
      database = 'connected';
    } catch {
      database = 'disconnected';
    }
  }

  const critical = envErrors.some((e) => e.includes('DB binding'));
  const status: HealthReport['status'] =
    critical || database === 'disconnected' ? 'error' : envErrors.length > 0 ? 'degraded' : 'ok';

  return {
    status,
    database,
    version: '1.0.0',
    timestamp,
  };
}

export const APP_VERSION = '1.5.0';

export interface MigrationState {
  appliedMigrations: number;
  tables: string[];
}

export interface StatusReport extends HealthReport {
  environment: 'production' | 'staging' | 'development' | 'unknown';
  authConfigured: boolean;
  routes: number;
  migrations: MigrationState;
}

export function versionController(): { version: string; timestamp: string } {
  return { version: APP_VERSION, timestamp: new Date().toISOString() };
}

export async function statusController(
  db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  } | undefined,
  envErrors: string[],
  env: { ENVIRONMENT?: string } = {},
  isConfigured: boolean = false,
  routeCount: number = 0,
): Promise<StatusReport> {
  const health = await healthController(db, envErrors);

  let appliedMigrations = 0;
  const tables: string[] = [];
  if (db) {
    try {
      const migrationsResult = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").bind().all();
      const allTables = (migrationsResult.results ?? []).map((row) => String(row.name ?? ''));
      tables.push(...allTables.filter(Boolean));
      appliedMigrations = tables.length;
    } catch {
      // ignore
    }
  }

  const environment: StatusReport['environment'] =
    env.ENVIRONMENT === 'production' || env.ENVIRONMENT === 'staging' || env.ENVIRONMENT === 'development'
      ? env.ENVIRONMENT
      : 'unknown';

  return {
    ...health,
    version: APP_VERSION,
    environment,
    authConfigured: isConfigured,
    routes: routeCount,
    migrations: { appliedMigrations, tables },
  };
}
