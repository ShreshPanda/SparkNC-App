export declare const MIGRATIONS_TABLE: string;
export declare const MIGRATIONS_DDL: string;
export declare function migrationScript(name: string, sql: string, appliedAt: string): string;
export declare function baselineScript(names: string[], appliedAt: string): string;
export declare function planMigrations(files: string[], appliedNames: string[], userTableCount: number, baselineNames?: string[]): string[];
