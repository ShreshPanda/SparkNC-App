import { BaseRepository } from '../repositories/baseRepository';

export interface DemoStudent {
  id: string;
  name: string;
  xp: number;
  streak: number;
  goals: number;
  tasks: number;
  insights: string[];
}

export interface DemoAmbassadorView {
  studentId: string;
  name: string;
  status: 'thriving' | 'active' | 'at_risk' | 'needs_attention';
  recommendation: string;
}

export interface DemoScenario {
  students: DemoStudent[];
  ambassadorView: DemoAmbassadorView[];
  adminMetrics: {
    totalStudents: number;
    activeThisMonth: number;
    averageEngagement: number;
    studentSatisfaction: number;
    topImprovement: string;
    xpTrend: { date: string; xp: number }[];
    feedbackThemes: { category: string; count: number }[];
    recommendations: string[];
  };
}

export class DemoDataService extends BaseRepository {
  generateScenario(): DemoScenario {
    const students: DemoStudent[] = [
      { id: this.createId('demo_user'), name: 'Ava Demo', xp: 1240, streak: 12, goals: 4, tasks: 28, insights: ['Consistent weekly activity', 'Strong event participation'] },
      { id: this.createId('demo_user'), name: 'Jordan Demo', xp: 850, streak: 3, goals: 2, tasks: 15, insights: ['Recently lost streak', 'Needs deadline reminders'] },
      { id: this.createId('demo_user'), name: 'Morgan Demo', xp: 2100, streak: 30, goals: 7, tasks: 45, insights: ['Top performer', 'Mentor potential'] },
      { id: this.createId('demo_user'), name: 'Taylor Demo', xp: 420, streak: 1, goals: 1, tasks: 8, insights: ['Just joined', 'Encourage first goal'] },
    ];

    const ambassadorView: DemoAmbassadorView[] = [
      { studentId: students[0].id, name: students[0].name, status: 'thriving', recommendation: 'Acknowledge their consistency' },
      { studentId: students[1].id, name: students[1].name, status: 'at_risk', recommendation: 'Suggest a small next step to rebuild momentum' },
      { studentId: students[2].id, name: students[2].name, status: 'thriving', recommendation: 'Invite to mentor others' },
      { studentId: students[3].id, name: students[3].name, status: 'needs_attention', recommendation: 'Check in on onboarding experience' },
    ];

    const xpTrend = [
      { date: '2026-06-21', xp: 3200 },
      { date: '2026-06-28', xp: 4100 },
      { date: '2026-07-05', xp: 4850 },
      { date: '2026-07-12', xp: 5600 },
      { date: '2026-07-19', xp: 6430 },
    ];

    const adminMetrics = {
      totalStudents: 1250,
      activeThisMonth: 980,
      averageEngagement: 84,
      studentSatisfaction: 91,
      topImprovement: 'Consistency increased 22%',
      xpTrend,
      feedbackThemes: [
        { category: 'Weekly check-in', count: 342 },
        { category: 'Feature suggestion', count: 128 },
        { category: 'Event feedback', count: 86 },
        { category: 'Problem', count: 44 },
      ],
      recommendations: [
        'Increase reminder frequency for deadlines',
        'Schedule more Thursday events',
        'Re-engage inactive students',
      ],
    };

    return { students, ambassadorView, adminMetrics };
  }
}
