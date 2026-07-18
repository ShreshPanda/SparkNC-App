import { FeatureRequestRepository, type FeatureRequestRecord } from '../repositories/FeatureRequestRepository';
import { assertNonEmpty, assertLength } from '../validators/baseValidator';

export interface CreateFeatureRequestInput {
  title: string;
  description?: string;
  category: string;
}

export class FeatureRequestService {
  constructor(private readonly repository: FeatureRequestRepository) {}

  async create(userId: string, input: CreateFeatureRequestInput): Promise<FeatureRequestRecord> {
    assertNonEmpty(userId, 'User id is required');
    assertNonEmpty(input.title, 'Title is required');
    assertNonEmpty(input.category, 'Category is required');
    assertLength(input.title, 'Title', 1, 200);
    if (input.description) assertLength(input.description, 'Description', 1, 4000);
    return this.repository.create({ createdBy: userId, title: input.title, description: input.description, category: input.category });
  }

  async list(status?: string): Promise<FeatureRequestRecord[]> {
    return this.repository.list(status, 200);
  }

  async vote(id: string): Promise<void> {
    assertNonEmpty(id, 'Feature request id is required');
    await this.repository.vote(id);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    assertNonEmpty(id, 'Feature request id is required');
    assertNonEmpty(status, 'Status is required');
    const allowed = ['Submitted', 'Reviewed', 'Planned', 'Completed'];
    if (!allowed.includes(status)) {
      throw new Error(`Status must be one of: ${allowed.join(', ')}`);
    }
    await this.repository.updateStatus(id, status);
  }
}
