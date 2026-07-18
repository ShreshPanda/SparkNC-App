import { cloudflareService } from './cloudflareService';

export type SyncOperation = 'create' | 'update' | 'delete' | 'complete';

export interface SyncItem {
  id: string;
  type: 'task' | 'goal' | 'profile' | 'notification';
  operation: SyncOperation;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
}

export interface SyncResult {
  success: boolean;
  syncedIds: string[];
  failedIds: { id: string; error: string }[];
}

export interface SyncStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const PENDING_QUEUE_KEY = 'sparknc_pending_sync_queue';
const LAST_SYNC_KEY = 'sparknc_last_sync';

/**
 * SyncService queues local changes and pushes them to the Worker when online.
 * It is storage-agnostic: pass AsyncStorage, localStorage, or any other store.
 */
export class SyncService {
  constructor(
    private readonly storage: SyncStorage,
    private readonly api: SyncApi,
  ) {}

  async enqueue(item: Omit<SyncItem, 'createdAt' | 'retryCount'>): Promise<void> {
    const queue = await this.getQueue();
    queue.push({ ...item, createdAt: Date.now(), retryCount: 0 });
    await this.saveQueue(queue);
  }

  async sync(): Promise<SyncResult> {
    const queue = await this.getQueue();
    const syncedIds: string[] = [];
    const failedIds: { id: string; error: string }[] = [];
    const remaining: SyncItem[] = [];

    for (const item of queue) {
      try {
        await this.applyRemote(item);
        syncedIds.push(item.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (item.retryCount < 3) {
          item.retryCount += 1;
          remaining.push(item);
        } else {
          failedIds.push({ id: item.id, error: message });
        }
      }
    }

    await this.saveQueue(remaining);
    await this.storage.setItem(LAST_SYNC_KEY, new Date().toISOString());

    return { success: failedIds.length === 0, syncedIds, failedIds };
  }

  async getPendingCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  private async getQueue(): Promise<SyncItem[]> {
    const raw = await this.storage.getItem(PENDING_QUEUE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async saveQueue(queue: SyncItem[]): Promise<void> {
    await this.storage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
  }

  private async applyRemote(item: SyncItem): Promise<unknown> {
    const payload = item.payload as any;
    switch (item.type) {
      case 'task': {
        if (item.operation === 'create') return this.api.createTask(payload);
        if (item.operation === 'update') return this.api.updateTask(item.id, payload);
        if (item.operation === 'delete') return this.api.deleteTask(item.id);
        if (item.operation === 'complete') return this.api.completeTask(item.id);
        break;
      }
      case 'goal': {
        if (item.operation === 'create') return this.api.createGoal(payload);
        if (item.operation === 'update') return this.api.updateGoal(item.id, payload);
        if (item.operation === 'delete') return this.api.deleteGoal(item.id);
        if (item.operation === 'complete') return this.api.completeGoal(item.id);
        break;
      }
      case 'profile': {
        return this.api.updateProfile(item.id, payload);
      }
      case 'notification': {
        // Notifications are read-only locally; nothing to push.
        return undefined;
      }
    }
    return undefined;
  }
}

export function createSyncService(storage: SyncStorage, api: SyncApi) {
  return new SyncService(storage, api);
}
