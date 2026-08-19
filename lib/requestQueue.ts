export interface QueuedRequest<T = unknown> {
  id: string;
  method: string;
  url: string;
  body?: Record<string, unknown>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export class OfflineRequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;

  async add<T>(method: string, url: string, body?: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        method,
        url,
        body,
        resolve: resolve as (value: unknown) => void,
        reject,
        timestamp: Date.now(),
      };
      this.queue.push(request as QueuedRequest);
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: { 'Content-Type': 'application/json' },
          body: request.body ? JSON.stringify(request.body) : undefined,
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json().catch(() => ({}));
        request.resolve(data);
      } catch (err) {
        this.queue.unshift(request);
        request.reject(err instanceof Error ? err : new Error(String(err)));
        break;
      }
    }

    this.processing = false;
  }

  flush() {
    this.queue = [];
  }

  length() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineRequestQueue();
