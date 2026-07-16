export interface RepositoryResult<T> {
  data?: T;
  error?: string;
}

export class BaseRepository {
  protected createId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  protected now(): string {
    return new Date().toISOString();
  }
}
