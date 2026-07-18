import { StudentFeedbackRepository, type StudentFeedbackRecord } from '../repositories/StudentFeedbackRepository';
import { assertNonEmpty, assertLength } from '../validators/baseValidator';

export interface SubmitFeedbackInput {
  category: string;
  rating?: number;
  feedbackText?: string;
}

export class StudentFeedbackService {
  constructor(private readonly repository: StudentFeedbackRepository) {}

  async submit(userId: string, input: SubmitFeedbackInput): Promise<StudentFeedbackRecord> {
    assertNonEmpty(userId, 'User id is required');
    assertNonEmpty(input.category, 'Category is required');
    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
    if (input.feedbackText) {
      assertLength(input.feedbackText, 'Feedback text', 1, 4000);
    }
    const sentiment = this.determineSentiment(input.rating, input.feedbackText);
    return this.repository.create({ userId, category: input.category, rating: input.rating, feedbackText: input.feedbackText, sentiment });
  }

  async listMyFeedback(userId: string): Promise<StudentFeedbackRecord[]> {
    assertNonEmpty(userId, 'User id is required');
    return this.repository.listByUser(userId);
  }

  async listRecent(category?: string): Promise<StudentFeedbackRecord[]> {
    if (category) return this.repository.listByCategory(category);
    return this.repository.listAll();
  }

  determineSentiment(rating?: number, text?: string): 'positive' | 'neutral' | 'needs_support' {
    if (rating !== undefined) {
      if (rating <= 2) return 'needs_support';
      if (rating >= 4) return 'positive';
    }
    const lower = (text ?? '').toLowerCase();
    const positiveWords = ['love', 'great', 'awesome', 'helpful', 'enjoying', 'motivated', 'organized', 'connected', 'good', 'excellent'];
    const supportWords = ['struggling', 'hard', 'difficult', 'stress', 'overwhelm', 'forgot', 'confused', 'stuck', 'problem', 'issue', 'not working'];
    const positive = positiveWords.some((w) => lower.includes(w));
    const support = supportWords.some((w) => lower.includes(w));
    if (support) return 'needs_support';
    if (positive) return 'positive';
    return 'neutral';
  }
}
