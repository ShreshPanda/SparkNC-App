export type SparkRole = 'student' | 'ambassador' | 'lab_leader' | 'location_manager' | 'board_member' | 'admin';

export type SparkPermission = string;

export interface User {
  id: string;
  email: string;
  name: string;
  role: SparkRole;
  schoolId?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: SparkRole;
  description?: string;
  permissions: SparkPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface SchoolIdentity {
  id: string;
  name: string;
  slug: string;
  city?: string;
  country?: string;
  primaryColor?: string;
  secondaryColor?: string;
  mascot?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  progress: number;
  completed: boolean;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  createdBy: string;
  schoolId?: string;
  createdAt: string;
  updatedAt: string;
  isRegistered?: boolean;
  attendeeCount?: number;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readStatus: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  activityType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  scope: 'global' | 'school' | 'location';
  schoolId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
}

export interface StudentStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  tasksTotal: number;
  tasksCompleted: number;
  goalsTotal: number;
  goalsCompleted: number;
  eventsAttended: number;
  messagesSent: number;
  notificationsReceived: number;
  engagementScore: number;
}

export interface StudentInsight {
  id: string;
  userId: string;
  insightType: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high';
  data?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface StudentDashboard extends StudentStats {
  insights: StudentInsight[];
}

export interface GrowthEvent {
  id: string;
  userId: string;
  eventType: string;
  title: string;
  description?: string;
  occurredAt: string;
  metadata?: string;
}

export interface Achievement {
  id: string;
  achievementKey: string;
  title: string;
  description: string;
  category: string;
  criteria: string;
  points: number;
  createdAt: string;
  unlockedAt?: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  metadata?: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  recordType: string;
  recordValue: number;
  recordUnit?: string;
  recordedAt: string;
  metadata?: string;
}

export interface AnalyticsOverview {
  dailyActiveStudents: number;
  weeklyActiveStudents: number;
  totalStudents: number;
  totalTasksCompleted: number;
  totalGoalsCompleted: number;
  totalEventsAttended: number;
  totalMessagesSent: number;
  averageEngagementScore: number;
  xpTrend: { date: string; xp: number }[];
}

export interface AIChatMessage {
  role: string;
  content: string;
}

export interface AIChatResponse {
  reply: string;
  memories: AIChatMessage[];
}

export interface AmbassadorStudentSupport {
  student: { id: string; name?: string; email?: string; schoolId?: string; lastActive?: string };
  stats: StudentStats;
  status: 'thriving' | 'active' | 'at_risk' | 'needs_attention';
  reason: string;
  suggestedAction: string;
}

export interface StudentFeedback {
  id: string;
  userId: string;
  category: string;
  rating?: number;
  feedbackText?: string;
  sentiment?: 'positive' | 'neutral' | 'needs_support';
  createdAt: string;
}

export interface AmbassadorFeedback {
  id: string;
  ambassadorId: string;
  studentId?: string;
  category: string;
  observation: string;
  suggestedImprovement?: string;
  createdAt: string;
}

export interface FeatureRequest {
  id: string;
  createdBy: string;
  title: string;
  description?: string;
  category: string;
  votes: number;
  status: 'Submitted' | 'Reviewed' | 'Planned' | 'Completed';
  createdAt: string;
}

export interface FeedbackInsight {
  id: string;
  scope: string;
  scopeId?: string;
  insightType: string;
  title: string;
  description: string;
  data?: string;
  createdAt: string;
}

export interface ImpactReport {
  id: string;
  scope: string;
  scopeId?: string;
  reportType: string;
  periodStart?: string;
  periodEnd?: string;
  metrics: string;
  createdBy?: string;
  createdAt: string;
}

export interface ImprovementRecommendation {
  id: string;
  scope: string;
  scopeId?: string;
  recommendationType: string;
  title: string;
  description: string;
  evidence?: string;
  status: string;
  createdAt: string;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  needsSupport: number;
  total: number;
  averageRating: number;
}

export interface ImpactAnalytics {
  studentExperience: {
    averageSatisfaction: number;
    feedbackCount: number;
    sentimentDistribution: { positive: number; neutral: number; needsSupport: number };
    topThemes: { category: string; count: number }[];
    commonChallenges: { text: string; count: number }[];
  };
  engagement: {
    totalStudents: number;
    weeklyActiveStudents: number;
    dailyActiveStudents: number;
    taskCompletionRate: number;
    goalCompletionRate: number;
    eventParticipationRate: number;
  };
  growth: {
    totalTasksCompleted: number;
    totalGoalsCompleted: number;
    totalEventsAttended: number;
    totalMessagesSent: number;
    xpTrend: { date: string; xp: number }[];
  };
  featureRequests: { status: string; count: number }[];
}

export interface DemoScenario {
  students: { id: string; name: string; xp: number; streak: number; goals: number; tasks: number; insights: string[] }[];
  ambassadorView: { studentId: string; name: string; status: 'thriving' | 'active' | 'at_risk' | 'needs_attention'; recommendation: string }[];
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

export interface HealthStatusReport {
  status: 'ok' | 'degraded' | 'error';
  database: 'connected' | 'disconnected';
  version: string;
  timestamp: string;
  environment: 'production' | 'staging' | 'development' | 'unknown';
  authConfigured: boolean;
  routes: number;
  migrations: { appliedMigrations: number; tables: string[] };
}

export interface NotificationPreference {
  id?: string;
  sendDeadlines: boolean;
  sendStreakAlerts: boolean;
  sendEvents: boolean;
  sendMessages: boolean;
  sendRecommendations: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  timezone: string;
}

export interface GrowthStatistic {
  name: string;
  score: number;
  label: string;
}

export interface GrowthStatistics {
  xp: number;
  goalsCompleted: number;
  tasksCompleted: number;
  eventsAttended: number;
  currentStreak: number;
  longestStreak: number;
  engagementScore: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  categories: GrowthStatistic[];
  observations: string[];
}

export interface GrowthStory {
  title: string;
  summary: string;
  paragraphs: string[];
  milestones: string[];
}

export interface OpportunityRecommendation {
  id: string;
  title: string;
  category: 'leadership' | 'volunteer' | 'event' | 'club' | 'workshop' | 'competition' | 'community';
  score: number;
  reason: string;
  action: string;
}

export interface AICompanionOutput {
  reply: string;
  intent?: string;
  memories: { role: string; content: string }[];
}

export interface AdminOverview {
  metrics: {
    dailyActiveStudents: number;
    weeklyActiveStudents: number;
    totalStudents: number;
    totalTasksCompleted: number;
    totalGoalsCompleted: number;
    totalEventsAttended: number;
    totalMessagesSent: number;
    averageEngagementScore: number;
    xpTrend: { date: string; xp: number }[];
  };
}

export interface AdminStudentSupportRecord {
  id: string;
  name?: string;
  email?: string;
  xp: number;
  currentStreak: number;
  lastActive?: string;
  incompleteTasks: number;
}

export interface AdminProgramAnalytics {
  totalEvents: number;
  averageEventAttendance: number;
  ambassadorObservations: number;
  featureRequestsSubmitted: number;
  feedbackSubmissions: number;
}

export interface AdminCommandCenterReport {
  overview: AdminOverview;
  support: {
    inactive: AdminStudentSupportRecord[];
    needSupport: AdminStudentSupportRecord[];
    highlyEngaged: AdminStudentSupportRecord[];
  };
  programAnalytics: AdminProgramAnalytics;
}

export interface AmbassadorStudentRecord {
  id: string;
  name?: string;
  email?: string;
  xp: number;
  currentStreak: number;
  goalsCompleted: number;
  tasksCompleted: number;
  lastActive?: string;
}

export interface AmbassadorCommandCenter {
  engaged: AmbassadorStudentRecord[];
  atRisk: AmbassadorStudentRecord[];
  thriving: AmbassadorStudentRecord[];
  participationTrend: { label: string; count: number }[];
}

export interface RecognitionSummary {
  level: number;
  xp: number;
  achievements: { title: string; description: string; category: string; unlockedAt?: string }[];
  recentlyUnlocked: { title: string; description: string; category: string; unlockedAt?: string }[];
  nextMilestones: string[];
  strongestArea: string;
}
