import { AmbassadorFeedbackRepository, type AmbassadorFeedbackRecord } from '../repositories/AmbassadorFeedbackRepository';
import { assertNonEmpty, assertLength } from '../validators/baseValidator';

export interface SubmitAmbassadorFeedbackInput {
  studentId?: string;
  category: string;
  observation: string;
  suggestedImprovement?: string;
}

export class AmbassadorFeedbackService {
  constructor(private readonly repository: AmbassadorFeedbackRepository) {}

  async submit(ambassadorId: string, input: SubmitAmbassadorFeedbackInput): Promise<AmbassadorFeedbackRecord> {
    assertNonEmpty(ambassadorId, 'Ambassador id is required');
    assertNonEmpty(input.category, 'Category is required');
    assertNonEmpty(input.observation, 'Observation is required');
    if (input.observation) assertLength(input.observation, 'Observation', 1, 4000);
    if (input.suggestedImprovement) assertLength(input.suggestedImprovement, 'Suggested improvement', 1, 4000);
    return this.repository.create({
      ambassadorId,
      studentId: input.studentId,
      category: input.category,
      observation: input.observation,
      suggestedImprovement: input.suggestedImprovement,
    });
  }

  async listForAmbassador(ambassadorId: string): Promise<AmbassadorFeedbackRecord[]> {
    assertNonEmpty(ambassadorId, 'Ambassador id is required');
    return this.repository.listByAmbassador(ambassadorId);
  }

  async listRecent(): Promise<AmbassadorFeedbackRecord[]> {
    return this.repository.listAll(200);
  }

  async listByCategory(category: string): Promise<AmbassadorFeedbackRecord[]> {
    return this.repository.listByCategory(category, 100);
  }
}
