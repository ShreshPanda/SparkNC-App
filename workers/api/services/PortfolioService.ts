import { PortfolioRepository, type PortfolioRecord } from '../repositories/PortfolioRepository';

export interface PortfolioSummary {
  projects: PortfolioRecord[];
  goals: PortfolioRecord[];
  achievements: PortfolioRecord[];
  events: PortfolioRecord[];
  skills: PortfolioRecord[];
  certificates: PortfolioRecord[];
  leadership: PortfolioRecord[];
  community: PortfolioRecord[];
  xp: number;
  streak: number;
}

export class PortfolioService {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  async getPortfolio(userId: string): Promise<PortfolioSummary> {
    const all = await this.portfolioRepository.listForUser(userId);
    const byType = (type: PortfolioRecord['type']) => all.filter((r) => r.type === type);

    const [xp, streak] = [0, 0];
    return {
      projects: byType('project'),
      goals: byType('goal'),
      achievements: byType('achievement'),
      events: byType('event'),
      skills: byType('skill'),
      certificates: byType('certificate'),
      leadership: byType('community').filter((r) => r.metadata?.includes('leader')),
      community: byType('community'),
      xp,
      streak,
    };
  }

  async addPortfolioRecord(userId: string, record: Omit<PortfolioRecord, 'userId'>): Promise<void> {
    await this.portfolioRepository.addRecord({ ...record, userId });
  }

  async removePortfolioRecord(userId: string, id: string): Promise<void> {
    await this.portfolioRepository.removeRecord(userId, id);
  }
}
