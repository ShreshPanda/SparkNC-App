import { StudentFeedbackService, type SubmitFeedbackInput } from '../services/studentFeedbackService';
import { StudentFeedbackRepository } from '../repositories/StudentFeedbackRepository';

export interface StudentFeedbackControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
}

function createStudentFeedbackService(context?: StudentFeedbackControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new StudentFeedbackService(new StudentFeedbackRepository(db));
}

export async function submitFeedbackController(input: SubmitFeedbackInput, context?: StudentFeedbackControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createStudentFeedbackService(context);
  return service.submit(userId, input);
}

export async function listMyFeedbackController(context?: StudentFeedbackControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createStudentFeedbackService(context);
  return service.listMyFeedback(userId);
}

export async function listRecentFeedbackController(category: string | undefined, context?: StudentFeedbackControllerContext) {
  const userId = context?.userId;
  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }
  const service = createStudentFeedbackService(context);
  return service.listRecent(category);
}
