import { assertNonEmpty } from '../validators/baseValidator';

export function validateTaskInput(input: Record<string, unknown>) {
  assertNonEmpty(String(input.title ?? ''), 'Task title is required');
  return true;
}

export function validateGoalInput(input: Record<string, unknown>) {
  assertNonEmpty(String(input.title ?? ''), 'Goal title is required');
  return true;
}

export function validateEventInput(input: Record<string, unknown>) {
  assertNonEmpty(String(input.title ?? ''), 'Event title is required');
  assertNonEmpty(String(input.startsAt ?? ''), 'Event start time is required');
  return true;
}
