import { PilotRepository, PilotUserRecord } from '../repositories/PilotRepository';

export interface CreatePilotInput {
  userId: string;
  pilotGroup: string;
  status?: 'active' | 'paused' | 'completed';
}

export class PilotService {
  constructor(private readonly repository: PilotRepository) {}

  async createPilotUser(input: CreatePilotInput): Promise<PilotUserRecord> {
    return this.repository.addPilotUser({
      userId: input.userId,
      pilotGroup: input.pilotGroup,
      status: input.status ?? 'active',
    });
  }

  async getParticipants(group?: string): Promise<{ group?: string; participants: PilotUserRecord[] }> {
    const participants = await this.repository.listPilotUsers(group);
    return { group, participants };
  }

  async getGroups(): Promise<string[]> {
    return this.repository.listGroups();
  }

  async updateStatus(id: string, status: 'active' | 'paused' | 'completed'): Promise<void> {
    return this.repository.updateStatus(id, status);
  }

  async recordActivity(userId: string): Promise<void> {
    return this.repository.updateLastActive(userId);
  }
}
