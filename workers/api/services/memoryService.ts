import { MemoryRepository, type MemoryRecord } from '../repositories/MemoryRepository';

export class MemoryService {
  constructor(private readonly repository: MemoryRepository) {}

  async getRecentContext(userId: string, limit = 10): Promise<MemoryRecord[]> {
    return this.repository.listRecent(userId, limit);
  }

  async remember(userId: string, role: MemoryRecord['role'], content: string, context?: string): Promise<MemoryRecord> {
    return this.repository.save(userId, role, content, context);
  }
}
