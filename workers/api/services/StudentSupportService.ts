import { StudentSupportRepository, SupportStudent } from '../repositories/StudentSupportRepository';

export interface SupportQueue {
  inactive: SupportStudent[];
  needsEncouragement: SupportStudent[];
  strongGrowth: SupportStudent[];
}

export class StudentSupportService {
  constructor(private readonly repository: StudentSupportRepository) {}

  async getSupportQueue(schoolId?: string, locationId?: string): Promise<SupportQueue> {
    const students = await this.repository.loadStudents(schoolId, locationId);
    const queue: SupportQueue = { inactive: [], needsEncouragement: [], strongGrowth: [] };
    for (const student of students) {
      if (student.risk === 'inactive') queue.inactive.push(student);
      else if (student.risk === 'needs_encouragement') queue.needsEncouragement.push(student);
      else queue.strongGrowth.push(student);
    }
    // Sort inactive by longest inactivity first.
    queue.inactive.sort((a, b) => b.daysInactive - a.daysInactive);
    return queue;
  }

  recommendAction(student: SupportStudent): string {
    if (student.risk === 'inactive') return `Reach out to ${student.name ?? student.email ?? 'student'}; no activity for ${student.daysInactive} days.`;
    if (student.risk === 'strong_growth') return `Celebrate ${student.name ?? student.email ?? 'student'}'s momentum; ${student.recentTasks} tasks and ${student.recentGoals} goals completed recently.`;
    return `Check in with ${student.name ?? student.email ?? 'student'} to see if they need help prioritizing.`;
  }

  async trackSupportInteraction(ambassadorUserId: string, studentUserId: string, message: string): Promise<{ ambassadorUserId: string; studentUserId: string; message: string; sentAt: string }> {
    return { ambassadorUserId, studentUserId, message, sentAt: new Date().toISOString() };
  }
}
