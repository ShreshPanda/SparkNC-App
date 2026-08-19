import type {
  Task,
  Goal,
  Event,
  Conversation,
  Message,
  Announcement,
  Notification,
  SchoolIdentity,
  StudentDashboard,
  StudentInsight,
  GrowthEvent,
  Achievement,
  AnalyticsOverview,
  AmbassadorStudentSupport,
  StudentFeedback,
  AmbassadorFeedback,
  FeatureRequest,
  ImpactAnalytics,
  ImprovementRecommendation,
  NotificationPreference,
  GrowthStatistics,
  GrowthStory,
  OpportunityRecommendation,
  AICompanionOutput,
  AdminCommandCenterReport,
  AmbassadorCommandCenter,
  RecognitionSummary,
  ImpactReport,
} from '../shared/types';

const now = new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

export const demoTasks: Task[] = [
  { id: 'task-1', userId: 'demo', title: 'Finish chemistry lab report', description: 'Sections 3 and 4, due Friday', category: 'Homework', dueDate: daysAhead(2).split('T')[0], completed: false, xpReward: 50, createdAt: daysAgo(1), updatedAt: now },
  { id: 'task-2', userId: 'demo', title: 'RSVP to Thursday workshop', description: 'Leadership series — session 2', category: 'Event', completed: false, xpReward: 20, createdAt: daysAgo(2), updatedAt: now },
  { id: 'task-3', userId: 'demo', title: 'Message ambassador about goal', category: 'Communication', completed: false, xpReward: 15, createdAt: daysAgo(1), updatedAt: now },
  { id: 'task-4', userId: 'demo', title: 'Update portfolio with project', description: 'Add the robotics build to showcase', category: 'Portfolio', completed: false, xpReward: 30, createdAt: daysAgo(3), updatedAt: now },
  { id: 'task-5', userId: 'demo', title: 'Review feedback from last week', category: 'Wellness', completed: true, xpReward: 10, createdAt: daysAgo(5), updatedAt: daysAgo(4) },
];

export const demoGoals: Goal[] = [
  { id: 'goal-1', userId: 'demo', title: 'Reach 1,500 XP this month', description: 'Stay consistent with daily tasks', progress: 82, completed: false, xpReward: 100, createdAt: daysAgo(10), updatedAt: now },
  { id: 'goal-2', userId: 'demo', title: 'Attend 3 workshops', progress: 66, completed: false, xpReward: 60, createdAt: daysAgo(14), updatedAt: now },
  { id: 'goal-3', userId: 'demo', title: 'Build a portfolio project', description: 'Robotics arm documentation', progress: 45, completed: false, xpReward: 80, createdAt: daysAgo(20), updatedAt: now },
  { id: 'goal-4', userId: 'demo', title: 'Maintain a 10-day streak', progress: 100, completed: true, xpReward: 50, createdAt: daysAgo(12), updatedAt: daysAgo(2) },
];

export const demoEvents: Event[] = [
  { id: 'event-1', userId: 'demo', title: 'Leadership Workshop Series', description: 'Session 2: Building teams that work', startsAt: daysAhead(2), endsAt: daysAhead(2), location: 'Innovation Lab', createdBy: 'admin', schoolId: 'school-1', createdAt: daysAgo(7), updatedAt: now, isRegistered: true, attendeeCount: 24 },
  { id: 'event-2', userId: 'demo', title: 'SparkNC Showcase Night', description: 'Present your projects to the community', startsAt: daysAhead(9), endsAt: daysAhead(9), location: 'Main Auditorium', createdBy: 'admin', schoolId: 'school-1', createdAt: daysAgo(5), updatedAt: now, attendeeCount: 87 },
  { id: 'event-3', userId: 'demo', title: 'Ambassador Office Hours', startsAt: daysAhead(1), location: 'Room 204', createdBy: 'admin', schoolId: 'school-1', createdAt: daysAgo(3), updatedAt: now, attendeeCount: 8 },
];

export const demoConversations: Conversation[] = [
  { id: 'conv-1', participantIds: ['demo', 'ambassador-1'], unreadCount: 2, createdAt: daysAgo(5), updatedAt: daysAgo(1) },
  { id: 'conv-2', participantIds: ['demo', 'lab-leader-1'], unreadCount: 0, createdAt: daysAgo(10), updatedAt: daysAgo(3) },
];

export const demoMessages: Message[] = [
  { id: 'msg-1', conversationId: 'conv-1', senderId: 'ambassador-1', body: 'Hey Ava! Great work on your streak this week. Keep it up!', readStatus: 'read', createdAt: daysAgo(2) },
  { id: 'msg-2', conversationId: 'conv-1', senderId: 'ambassador-1', body: 'Have you thought about the showcase night? I think your robotics project would be perfect.', readStatus: 'delivered', createdAt: daysAgo(1) },
  { id: 'msg-3', conversationId: 'conv-2', senderId: 'lab-leader-1', body: 'The lab is open Thursday if you want to finish the report.', readStatus: 'read', createdAt: daysAgo(3) },
];

export const demoAnnouncements: Announcement[] = [
  { id: 'ann-1', title: 'Welcome to SparkNC Fall 2026!', body: 'We are excited to kick off the new semester. Check your dashboard for personalized opportunities.', scope: 'global', createdBy: 'admin', createdAt: daysAgo(7), updatedAt: now, isRead: false },
  { id: 'ann-2', title: 'Showcase Night Registration Open', body: 'Sign up to present your project on September 5th. Limited spots available.', scope: 'school', schoolId: 'school-1', createdBy: 'admin', createdAt: daysAgo(5), updatedAt: now, isRead: false },
];

export const demoNotifications: Notification[] = [
  { id: 'notif-1', userId: 'demo', title: 'Streak milestone!', body: 'You hit a 12-day streak. Keep it going!', kind: 'success', isRead: false, createdAt: daysAgo(1) },
  { id: 'notif-2', userId: 'demo', title: 'Workshop reminder', body: 'Leadership Workshop Series is in 2 days.', kind: 'info', isRead: false, createdAt: daysAgo(1) },
  { id: 'notif-3', userId: 'demo', title: 'New message', body: 'Your ambassador sent you a message.', kind: 'info', isRead: true, createdAt: daysAgo(2) },
  { id: 'notif-4', userId: 'demo', title: 'Goal progress', body: 'You are 82% to your XP goal this month.', kind: 'info', isRead: true, createdAt: daysAgo(3) },
];

export const demoSchool: SchoolIdentity = {
  id: 'school-1', name: 'North County High', slug: 'north-county', city: 'Raleigh', country: 'US', mascot: 'Falcons', primaryColor: '#4F46E5', secondaryColor: '#10B981',
};

export const demoStudentDashboard: StudentDashboard = {
  xp: 1240, level: 3, currentStreak: 12, longestStreak: 18, tasksTotal: 28, tasksCompleted: 23, goalsTotal: 4, goalsCompleted: 1, eventsAttended: 6, messagesSent: 14, notificationsReceived: 22, engagementScore: 87,
  insights: [
    { id: 'insight-1', userId: 'demo', insightType: 'streak', title: 'Streak strength', description: 'Your 12-day streak is in the top 15% of students.', priority: 'normal', createdAt: daysAgo(1) },
    { id: 'insight-2', userId: 'demo', insightType: 'engagement', title: 'Strong event participation', description: 'You have attended 6 events this month.', priority: 'low', createdAt: daysAgo(2) },
  ],
};

export const demoStudentInsights: StudentInsight[] = demoStudentDashboard.insights;

export const demoGrowthEvents: GrowthEvent[] = [
  { id: 'ge-1', userId: 'demo', eventType: 'task_complete', title: 'Completed: Review feedback', description: 'Earned 10 XP', occurredAt: daysAgo(4) },
  { id: 'ge-2', userId: 'demo', eventType: 'goal_progress', title: 'Goal: 1,500 XP reached 82%', occurredAt: daysAgo(1) },
  { id: 'ge-3', userId: 'demo', eventType: 'streak', title: '12-day streak achieved', description: 'Personal record is 18 days', occurredAt: daysAgo(1) },
  { id: 'ge-4', userId: 'demo', eventType: 'event_attend', title: 'Attended: Leadership Workshop', occurredAt: daysAgo(7) },
  { id: 'ge-5', userId: 'demo', eventType: 'level_up', title: 'Reached Level 3', description: '1,240 total XP', occurredAt: daysAgo(10) },
];

export const demoAchievements: Achievement[] = [
  { id: 'ach-1', achievementKey: 'first_task', title: 'First Steps', description: 'Complete your first task', category: 'Getting Started', criteria: 'Complete 1 task', points: 10, createdAt: daysAgo(30), unlockedAt: daysAgo(28) },
  { id: 'ach-2', achievementKey: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', category: 'Consistency', criteria: '7 day streak', points: 30, createdAt: daysAgo(30), unlockedAt: daysAgo(18) },
  { id: 'ach-3', achievementKey: 'streak_30', title: 'Unstoppable', description: 'Maintain a 30-day streak', category: 'Consistency', criteria: '30 day streak', points: 100, createdAt: daysAgo(30) },
  { id: 'ach-4', achievementKey: 'event_5', title: 'Community Builder', description: 'Attend 5 events', category: 'Community', criteria: 'Attend 5 events', points: 50, createdAt: daysAgo(30), unlockedAt: daysAgo(7) },
  { id: 'ach-5', achievementKey: 'goal_first', title: 'Goal Getter', description: 'Complete your first goal', category: 'Achievement', criteria: 'Complete 1 goal', points: 40, createdAt: daysAgo(30), unlockedAt: daysAgo(2) },
];

export const demoAnalytics: AnalyticsOverview = {
  dailyActiveStudents: 320, weeklyActiveStudents: 980, totalStudents: 1250, totalTasksCompleted: 4200, totalGoalsCompleted: 380, totalEventsAttended: 540, totalMessagesSent: 2100, averageEngagementScore: 84,
  xpTrend: [
    { date: '2026-07-21', xp: 3200 }, { date: '2026-07-28', xp: 4100 }, { date: '2026-08-04', xp: 4850 }, { date: '2026-08-11', xp: 5600 }, { date: '2026-08-18', xp: 6430 },
  ],
};

export const demoAmbassadorSupport: AmbassadorStudentSupport[] = [
  { student: { id: 'demo_user-2', name: 'Jordan Demo', email: 'jordan@sparknc.org', schoolId: 'school-1', lastActive: daysAgo(4) }, stats: { xp: 850, level: 2, currentStreak: 3, longestStreak: 8, tasksTotal: 15, tasksCompleted: 9, goalsTotal: 2, goalsCompleted: 0, eventsAttended: 2, messagesSent: 3, notificationsReceived: 8, engagementScore: 52 }, status: 'at_risk', reason: 'Streak broken, declining activity', suggestedAction: 'Suggest a small next step to rebuild momentum' },
  { student: { id: 'demo_user-3', name: 'Morgan Demo', email: 'morgan@sparknc.org', schoolId: 'school-1', lastActive: daysAgo(1) }, stats: { xp: 2100, level: 5, currentStreak: 30, longestStreak: 30, tasksTotal: 45, tasksCompleted: 42, goalsTotal: 7, goalsCompleted: 5, eventsAttended: 12, messagesSent: 28, notificationsReceived: 40, engagementScore: 95 }, status: 'thriving', reason: 'Top performer, consistent engagement', suggestedAction: 'Invite to mentor other students' },
  { student: { id: 'demo_user-4', name: 'Taylor Demo', email: 'taylor@sparknc.org', schoolId: 'school-1', lastActive: daysAgo(6) }, stats: { xp: 420, level: 1, currentStreak: 1, longestStreak: 3, tasksTotal: 8, tasksCompleted: 4, goalsTotal: 1, goalsCompleted: 0, eventsAttended: 1, messagesSent: 1, notificationsReceived: 3, engagementScore: 35 }, status: 'needs_attention', reason: 'New student, low engagement', suggestedAction: 'Check in on onboarding experience' },
];

export const demoStudentFeedback: StudentFeedback[] = [
  { id: 'fb-1', userId: 'demo', category: 'Weekly check-in', rating: 5, feedbackText: 'Feeling great about my progress this week!', sentiment: 'positive', createdAt: daysAgo(3) },
  { id: 'fb-2', userId: 'demo', category: 'Feature suggestion', rating: 4, feedbackText: 'Would love a dark mode for late nights.', sentiment: 'neutral', createdAt: daysAgo(8) },
];

export const demoAmbassadorFeedback: AmbassadorFeedback[] = [
  { id: 'afb-1', ambassadorId: 'ambassador-1', studentId: 'demo_user-2', category: 'Engagement', observation: 'Jordan has been less active in the last week.', suggestedImprovement: 'Reach out with a low-pressure check-in message.', createdAt: daysAgo(2) },
  { id: 'afb-2', ambassadorId: 'ambassador-1', studentId: 'demo_user-3', category: 'Mentorship', observation: 'Morgan is ready to mentor peers.', createdAt: daysAgo(5) },
];

export const demoFeatureRequests: FeatureRequest[] = [
  { id: 'fr-1', createdBy: 'demo_user-3', title: 'Dark mode', description: 'A dark theme for evening use', category: 'UI', votes: 47, status: 'Planned', createdAt: daysAgo(10) },
  { id: 'fr-2', createdBy: 'demo_user-2', title: 'Push notifications for streaks', category: 'Notifications', votes: 32, status: 'Reviewed', createdAt: daysAgo(7) },
  { id: 'fr-3', createdBy: 'demo_user-4', title: 'Group study events', category: 'Events', votes: 18, status: 'Submitted', createdAt: daysAgo(4) },
];

export const demoImpactAnalytics: ImpactAnalytics = {
  studentExperience: { averageSatisfaction: 91, feedbackCount: 342, sentimentDistribution: { positive: 280, neutral: 42, needsSupport: 20 }, topThemes: [{ category: 'Weekly check-in', count: 342 }, { category: 'Feature suggestion', count: 128 }, { category: 'Event feedback', count: 86 }, { category: 'Problem', count: 44 }], commonChallenges: [{ text: 'Time management', count: 23 }, { text: 'Streak motivation', count: 15 }] },
  engagement: { totalStudents: 1250, weeklyActiveStudents: 980, dailyActiveStudents: 320, taskCompletionRate: 78, goalCompletionRate: 64, eventParticipationRate: 43 },
  growth: { totalTasksCompleted: 4200, totalGoalsCompleted: 380, totalEventsAttended: 540, totalMessagesSent: 2100, xpTrend: demoAnalytics.xpTrend },
  featureRequests: [{ status: 'Submitted', count: 12 }, { status: 'Reviewed', count: 8 }, { status: 'Planned', count: 5 }, { status: 'Completed', count: 3 }],
};

export const demoRecommendations: ImprovementRecommendation[] = [
  { id: 'rec-1', scope: 'global', recommendationType: 'engagement', title: 'Increase reminder frequency for deadlines', description: 'Students with deadline reminders complete tasks 22% more often.', evidence: 'Task completion data, last 30 days', status: 'Planned', createdAt: daysAgo(3) },
  { id: 'rec-2', scope: 'global', recommendationType: 'scheduling', title: 'Schedule more Thursday events', description: 'Thursday has the highest attendance rate (87%).', status: 'Submitted', createdAt: daysAgo(5) },
];

export const demoNotificationPrefs: NotificationPreference = {
  sendDeadlines: true, sendStreakAlerts: true, sendEvents: true, sendMessages: true, sendRecommendations: false, quietHoursStart: 22, quietHoursEnd: 7, timezone: 'America/New_York',
};

export const demoGrowthStats: GrowthStatistics = {
  xp: 1240, goalsCompleted: 1, tasksCompleted: 23, eventsAttended: 6, currentStreak: 12, longestStreak: 18, engagementScore: 87, achievementsUnlocked: 4, totalAchievements: 12,
  categories: [
    { name: 'Academic', score: 82, label: 'Strong' },
    { name: 'Leadership', score: 65, label: 'Growing' },
    { name: 'Community', score: 90, label: 'Excellent' },
    { name: 'Wellness', score: 70, label: 'Steady' },
  ],
  observations: ['Your community engagement is your strongest area.', 'Leadership is your biggest growth opportunity.'],
};

export const demoGrowthStory: GrowthStory = {
  title: 'Ava\'s SparkNC Journey',
  summary: 'From first task to a 12-day streak, Ava has become a consistent and engaged community member.',
  paragraphs: ['Ava joined SparkNC 30 days ago and completed her first task within a week.', 'She hit a 7-day streak and unlocked the Week Warrior achievement.', 'Her robotics project is now 45% complete and she is mentoring a newer student.'],
  milestones: ['First task completed', '7-day streak', 'Level 3 reached', 'First goal completed', '12-day streak'],
};

export const demoOpportunities: OpportunityRecommendation[] = [
  { id: 'opp-1', title: 'Lead a study group', category: 'leadership', score: 92, reason: 'You have strong academic engagement and attend events regularly.', action: 'Sign up' },
  { id: 'opp-2', title: 'Robotics competition volunteer', category: 'volunteer', score: 85, reason: 'Your robotics project aligns with this event.', action: 'Learn more' },
  { id: 'opp-3', title: 'SparkNC Showcase Night', category: 'event', score: 78, reason: 'Present your portfolio project to the community.', action: 'RSVP' },
];

export const demoAdminCommandCenter: AdminCommandCenterReport = {
  overview: { metrics: demoAnalytics },
  support: {
    inactive: [{ id: 'demo_user-5', name: 'Casey Demo', email: 'casey@sparknc.org', xp: 120, currentStreak: 0, lastActive: daysAgo(14), incompleteTasks: 5 }],
    needSupport: [{ id: 'demo_user-2', name: 'Jordan Demo', email: 'jordan@sparknc.org', xp: 850, currentStreak: 3, lastActive: daysAgo(4), incompleteTasks: 6 }],
    highlyEngaged: [{ id: 'demo_user-3', name: 'Morgan Demo', email: 'morgan@sparknc.org', xp: 2100, currentStreak: 30, lastActive: daysAgo(1), incompleteTasks: 3 }],
  },
  programAnalytics: { totalEvents: 18, averageEventAttendance: 32, ambassadorObservations: 24, featureRequestsSubmitted: 28, feedbackSubmissions: 342 },
};

export const demoAmbassadorCommandCenter: AmbassadorCommandCenter = {
  engaged: [{ id: 'demo_user-1', name: 'Ava Demo', email: 'ava@sparknc.org', xp: 1240, currentStreak: 12, goalsCompleted: 1, tasksCompleted: 23, lastActive: daysAgo(1) }],
  atRisk: [{ id: 'demo_user-2', name: 'Jordan Demo', email: 'jordan@sparknc.org', xp: 850, currentStreak: 3, goalsCompleted: 0, tasksCompleted: 9, lastActive: daysAgo(4) }],
  thriving: [{ id: 'demo_user-3', name: 'Morgan Demo', email: 'morgan@sparknc.org', xp: 2100, currentStreak: 30, goalsCompleted: 5, tasksCompleted: 42, lastActive: daysAgo(1) }],
  participationTrend: [{ label: 'Week 1', count: 240 }, { label: 'Week 2', count: 280 }, { label: 'Week 3', count: 320 }, { label: 'Week 4', count: 410 }],
};

export const demoRecognition: RecognitionSummary = {
  level: 3, xp: 1240,
  achievements: demoAchievements.filter(a => a.unlockedAt).map(a => ({ title: a.title, description: a.description, category: a.category, unlockedAt: a.unlockedAt })),
  recentlyUnlocked: [{ title: 'Goal Getter', description: 'Complete your first goal', category: 'Achievement', unlockedAt: daysAgo(2) }],
  nextMilestones: ['Reach 1,500 XP', '30-day streak', 'Attend 10 events'],
  strongestArea: 'Community engagement',
};

export const demoAIChat: AICompanionOutput = {
  reply: 'You are doing great, Ava! Your 12-day streak puts you in the top 15% of students. To reach your 1,500 XP goal, try completing the chemistry lab report (+50 XP) and RSVPing to the workshop (+20 XP). Would you like me to help you plan your week?',
  intent: 'chat',
  memories: [{ role: 'assistant', content: 'You are doing great, Ava! Your 12-day streak puts you in the top 15% of students.' }],
};

export const demoImpactReports: ImpactReport[] = [
  { id: 'ir-1', scope: 'global', reportType: 'monthly', periodStart: daysAgo(30).split('T')[0], periodEnd: now.split('T')[0], metrics: JSON.stringify(demoImpactAnalytics), createdBy: 'admin', createdAt: daysAgo(1) },
];
