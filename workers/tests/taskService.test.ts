import { describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from '../api/services/taskService';

function createFakeDB(rows: Record<string, unknown>[] = []) {
  return {
    prepare: () => ({
      bind: () => ({
        run: async () => ({ success: true }),
        all: async () => ({ results: rows }),
        first: async () => (rows[0] ?? null),
      }),
    }),
  };
}

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService(createFakeDB() as any);
  });

  it('lists tasks', async () => {
    const rows = [{ id: 't1', title: 'Read chapter', completed: 0 }];
    service = new TaskService(createFakeDB(rows) as any);
    const tasks = await service.listTasks('u1');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Read chapter');
  });

  it('validates required fields on create', async () => {
    await expect(service.createTask('u1', { title: '', dueAt: 'bad-date' } as any)).rejects.toThrow();
  });
});
