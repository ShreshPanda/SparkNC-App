import { AuditLogService } from './auditLogService';
import { AuditLogRepository } from '../repositories/AuditLogRepository';

export interface DemoAccount {
  email: string;
  passwordPlaceholder: string;
  role: 'student' | 'ambassador' | 'admin';
  hint: string;
}

export interface DemoFlowStep {
  screen: string;
  action: string;
  expectedOutcome: string;
}

export interface DemoScenario {
  role: 'student' | 'ambassador' | 'admin';
  steps: DemoFlowStep[];
}

export class LeadershipDemoService {
  constructor(
    private readonly demoAccounts: Record<string, DemoAccount>,
    private readonly demoDataService?: { getDemoData: (type: string) => unknown },
  ) {}

  getAccounts(): Record<string, DemoAccount> {
    return this.demoAccounts;
  }

  getScenario(role: DemoScenario['role']): DemoScenario {
    if (role === 'student') {
      return {
        role,
        steps: [
          { screen: 'Login', action: 'Log in as demo student', expectedOutcome: 'Dashboard loads with today’s task and streak' },
          { screen: 'Dashboard', action: 'Tap first task and mark complete', expectedOutcome: 'XP increases, streak stays alive' },
          { screen: 'Growth Timeline', action: 'Open weekly stats', expectedOutcome: 'Week-by-week progress story is visible' },
          { screen: 'AI Companion', action: 'Ask "What should I focus on?"', expectedOutcome: 'Context-aware response with one next step' },
          { screen: 'Achievements', action: 'Open achievements tab', expectedOutcome: 'Recently unlocked achievements are shown' },
        ],
      };
    }

    if (role === 'ambassador') {
      return {
        role,
        steps: [
          { screen: 'Login', action: 'Log in as demo ambassador', expectedOutcome: 'Support queue loads' },
          { screen: 'Student Support', action: 'Select an inactive student', expectedOutcome: 'Recommended action is displayed' },
          { screen: 'Send Message', action: 'Send encouragement', expectedOutcome: 'Message is queued and logged' },
          { screen: 'Impact', action: 'View support impact summary', expectedOutcome: 'Improvement trends are visible' },
        ],
      };
    }

    return {
      role,
      steps: [
        { screen: 'Login', action: 'Log in as demo admin', expectedOutcome: 'Admin dashboard loads' },
        { screen: 'Analytics', action: 'Open engagement overview', expectedOutcome: 'DAU, WAU, MAU, and feature usage shown' },
        { screen: 'Student Support', action: 'Filter by at-risk students', expectedOutcome: 'Inactive cohort is listed' },
        { screen: 'Reports', action: 'Generate an impact report', expectedOutcome: 'Monthly summary is generated' },
        { screen: 'Audit', action: 'Open audit log', expectedOutcome: 'Recent sensitive actions are logged without private data' },
      ],
    };
  }

  async logDemoAccess(actorId: string, env: unknown): Promise<void> {
    const db = (env as any)?.DB;
    if (!db) return;
    const audit = new AuditLogService(new AuditLogRepository(db));
    await audit.log(actorId, 'demo.access', 'demo', undefined, { reason: 'Leadership demo session' });
  }
}

export const DEFAULT_DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  student: { email: 'demo.student@sparknc.example', passwordPlaceholder: 'demo-student-!secure', role: 'student', hint: 'Use for dashboard, tasks, and AI companion demo.' },
  ambassador: { email: 'demo.ambassador@sparknc.example', passwordPlaceholder: 'demo-ambassador-!secure', role: 'ambassador', hint: 'Use for student support and impact demo.' },
  admin: { email: 'demo.admin@sparknc.example', passwordPlaceholder: 'demo-admin-!secure', role: 'admin', hint: 'Use for analytics, reports, and audit demo.' },
};
