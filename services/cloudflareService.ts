import {
  User,
  User as UserProfile,
  Task as TaskItem,
  Goal as GoalItem,
  Message as MessageItem,
  Event as EventItem,
  Conversation,
  Announcement,
  Notification,
  SchoolIdentity,
  StudentDashboard,
  StudentInsight,
  GrowthEvent,
  Achievement,
  AnalyticsOverview,
  AIChatResponse,
  AmbassadorStudentSupport,
  StudentFeedback,
  AmbassadorFeedback,
  FeatureRequest,
  FeedbackInsight,
  ImpactReport,
  ImprovementRecommendation,
  ImpactAnalytics,
  DemoScenario,
  HealthStatusReport,
  NotificationPreference,
  GrowthStatistics,
  GrowthStory,
  OpportunityRecommendation,
  AICompanionOutput,
  AdminCommandCenterReport,
  AmbassadorCommandCenter,
  RecognitionSummary,
} from '../shared/types';
import * as demo from './demoData';

const workerUrl = (process.env.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL ?? '').replace(/\/$/, '');

let sessionCookie: string | null = null;

export function getSessionCookie(): string | null {
  return sessionCookie;
}

export function setSessionCookie(cookie: string | null): void {
  sessionCookie = cookie;
}

export function clearSessionCookie(): void {
  sessionCookie = null;
}

function applySetCookie(setCookie: string | null) {
  if (!setCookie) return;
  const first = setCookie.split(';')[0].trim();
  if (!first.includes('=')) return;
  const [name, ...valueParts] = first.split('=');
  if (name.trim() === 'sparknc_session') {
    const value = valueParts.join('=');
    if (value) {
      setSessionCookie(first);
    } else {
      clearSessionCookie();
    }
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { message: string };
  timestamp: string;
  requestId: string;
}

async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  if (!workerUrl) {
    throw new Error('EXPO_PUBLIC_CLOUDFLARE_WORKER_URL is not set');
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }
  const response = await fetch(`${workerUrl}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const setCookie = response.headers.get('Set-Cookie') ?? response.headers.get('set-cookie');
  applySetCookie(setCookie);
  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!envelope.success) {
    throw new Error(envelope.error?.message ?? 'Request failed');
  }
  return envelope.data;
}

// Demo fallback wrapper: tries the real API, falls back to demo data on any error.
async function withDemo<T>(apiCall: () => Promise<T>, demoValue: T): Promise<T> {
  try {
    return await apiCall();
  } catch {
    return demoValue;
  }
}

export interface AuthPayload {
  ok: boolean;
  data: { userId: string; role: string };
}

export interface MePayload {
  ok: boolean;
  data: UserProfile & { xp: number; streak: { current: number; longest: number } };
}

export interface JourneyMonth {
  month: string;
  year: number;
  events: { id: string; title: string; description: string; category: string; badge?: string; date: string }[];
}

export interface JourneyPayload {
  ok: boolean;
  journey: JourneyMonth[];
}

export interface PortfolioRecord {
  type: string;
  title: string;
  description?: string;
  date?: string;
}

export interface PortfolioSummary {
  xp: number;
  streak: number;
  projects: PortfolioRecord[];
  goals: PortfolioRecord[];
  achievements: PortfolioRecord[];
  events: PortfolioRecord[];
  skills: PortfolioRecord[];
  certificates: PortfolioRecord[];
  leadership: PortfolioRecord[];
  community: PortfolioRecord[];
  volunteer: PortfolioRecord[];
  badges: PortfolioRecord[];
  reflections: PortfolioRecord[];
}

export interface PortfolioPayload {
  ok: boolean;
  portfolio: PortfolioSummary;
}

export const cloudflareService = {
  async healthCheck() {
    return withDemo(() => api('GET', '/health'), { status: 'ok' });
  },

  async register(input: { email: string; password: string; name: string; role?: string }) {
    return withDemo(() => api<AuthPayload>('POST', '/auth/register', input), { ok: true, data: { userId: 'demo', role: 'student' } });
  },

  async login(input: { email: string; password: string }) {
    return withDemo(() => api<AuthPayload>('POST', '/auth/login', input), { ok: true, data: { userId: 'demo', role: 'student' } });
  },

  async logout() {
    return withDemo(() => api<{ ok: boolean; data: { message: string } }>('POST', '/auth/logout'), { ok: true, data: { message: 'Logged out' } });
  },

  async getMe(): Promise<UserProfile & { xp: number; streak: { current: number; longest: number } }> {
    return withDemo(async () => {
      const result = await api<MePayload>('GET', '/auth/me');
      return result.data;
    }, { id: 'demo', email: 'ava.demo@sparknc.org', name: 'Ava Demo', role: 'student', schoolId: 'school-1', isActive: true, createdAt: '', updatedAt: '', xp: 1240, streak: { current: 12, longest: 18 } });
  },

  async getUserProfile(_id: string): Promise<UserProfile | null> {
    return this.getMe();
  },

  async updateProfile(_id: string, _input: Record<string, unknown>): Promise<UserProfile> {
    return this.getMe();
  },

  async saveOnboarding(input: { goals: string[]; interests: string[]; growthAreas: string[]; supportStyle: string; completed: boolean }) {
    return withDemo(() => api('POST', '/onboarding', input), { ok: true });
  },

  // Tasks
  async listTasks(): Promise<TaskItem[]> {
    return withDemo(() => api<TaskItem[]>('GET', '/tasks'), demo.demoTasks);
  },

  async createTask(input: { title: string; description?: string; category?: string; dueDate?: string; completed?: boolean; xpReward?: number }) {
    const newItem: TaskItem = { id: `task-${Date.now()}`, userId: 'demo', title: input.title, description: input.description, category: input.category, dueDate: input.dueDate, completed: input.completed ?? false, xpReward: input.xpReward ?? 20, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return withDemo(() => api<{ item: TaskItem; xpAwarded?: number; streak?: { current: number; longest: number } }>('POST', '/tasks', input), { item: newItem, xpAwarded: 20, streak: { current: 13, longest: 18 } });
  },

  async completeTask(id: string) {
    const task = demo.demoTasks.find(t => t.id === id) ?? demo.demoTasks[0];
    const completed = { ...task, completed: true, updatedAt: new Date().toISOString() };
    return withDemo(() => api<{ item: TaskItem; xpAwarded: number; streak: { current: number; longest: number } }>('POST', `/tasks/${id}/complete`), { item: completed, xpAwarded: task.xpReward, streak: { current: 13, longest: 18 } });
  },

  async updateTask(id: string, input: { title?: string; description?: string; category?: string; dueDate?: string; completed?: boolean; xpReward?: number }) {
    const task = demo.demoTasks.find(t => t.id === id) ?? demo.demoTasks[0];
    const updated = { ...task, ...input, updatedAt: new Date().toISOString() };
    return withDemo(() => api<{ item: TaskItem }>('PUT', `/tasks/${id}`, input), { item: updated });
  },

  async deleteTask(id: string) {
    return withDemo(() => api<{ deleted: boolean }>('DELETE', `/tasks/${id}`), { deleted: true });
  },

  // Goals
  async listGoals(): Promise<GoalItem[]> {
    return withDemo(() => api<GoalItem[]>('GET', '/goals'), demo.demoGoals);
  },

  async createGoal(input: { title: string; description?: string; progress?: number; completed?: boolean; xpReward?: number }) {
    const newItem: GoalItem = { id: `goal-${Date.now()}`, userId: 'demo', title: input.title, description: input.description, progress: input.progress ?? 0, completed: input.completed ?? false, xpReward: input.xpReward ?? 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return withDemo(() => api<{ item: GoalItem; xpAwarded?: number; streak?: { current: number; longest: number } }>('POST', '/goals', input), { item: newItem, xpAwarded: 50, streak: { current: 13, longest: 18 } });
  },

  async completeGoal(id: string) {
    const goal = demo.demoGoals.find(g => g.id === id) ?? demo.demoGoals[0];
    const completed = { ...goal, completed: true, progress: 100, updatedAt: new Date().toISOString() };
    return withDemo(() => api<{ item: GoalItem; xpAwarded: number; streak: { current: number; longest: number } }>('POST', `/goals/${id}/complete`), { item: completed, xpAwarded: goal.xpReward, streak: { current: 13, longest: 18 } });
  },

  async updateGoal(id: string, input: { title?: string; description?: string; progress?: number; completed?: boolean; xpReward?: number }) {
    const goal = demo.demoGoals.find(g => g.id === id) ?? demo.demoGoals[0];
    const updated = { ...goal, ...input, updatedAt: new Date().toISOString() };
    return withDemo(() => api<{ item: GoalItem }>('PUT', `/goals/${id}`, input), { item: updated });
  },

  async deleteGoal(id: string) {
    return withDemo(() => api<{ deleted: boolean }>('DELETE', `/goals/${id}`), { deleted: true });
  },

  // Events
  async listEvents(): Promise<EventItem[]> {
    return withDemo(() => api<EventItem[]>('GET', '/events'), demo.demoEvents);
  },

  async getEvent(id: string): Promise<EventItem> {
    return withDemo(() => api<EventItem>('GET', `/events/${id}`), demo.demoEvents.find(e => e.id === id) ?? demo.demoEvents[0]);
  },

  async createEvent(input: { title: string; description?: string; location?: string; startsAt: string; endsAt?: string; schoolId?: string }) {
    const newEvent: EventItem = { id: `event-${Date.now()}`, title: input.title, description: input.description, location: input.location, startsAt: input.startsAt, endsAt: input.endsAt, schoolId: input.schoolId, createdBy: 'demo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return withDemo(() => api<EventItem>('POST', '/events', input), newEvent);
  },

  async registerForEvent(id: string): Promise<EventItem> {
    const event = demo.demoEvents.find(e => e.id === id) ?? demo.demoEvents[0];
    return withDemo(() => api<EventItem>('POST', `/events/${id}/register`), { ...event, isRegistered: true });
  },

  // Conversations / Messages
  async listConversations(): Promise<Conversation[]> {
    return withDemo(() => api<Conversation[]>('GET', '/conversations'), demo.demoConversations);
  },

  async getConversation(id: string): Promise<Conversation> {
    return withDemo(() => api<Conversation>('GET', `/conversations/${id}`), demo.demoConversations.find(c => c.id === id) ?? demo.demoConversations[0]);
  },

  async getMessages(conversationId: string): Promise<MessageItem[]> {
    return withDemo(() => api<MessageItem[]>('GET', `/conversations/${conversationId}/messages`), demo.demoMessages.filter(m => m.conversationId === conversationId));
  },

  async sendMessage(input: { recipientId: string; body: string }): Promise<MessageItem> {
    const newMsg: MessageItem = { id: `msg-${Date.now()}`, conversationId: 'conv-1', senderId: 'demo', body: input.body, readStatus: 'sent', createdAt: new Date().toISOString() };
    return withDemo(() => api<MessageItem>('POST', '/messages', input), newMsg);
  },

  async markConversationRead(conversationId: string): Promise<{ success: boolean; conversationId: string }> {
    return withDemo(() => api<{ success: boolean; conversationId: string }>('POST', `/conversations/${conversationId}/read`), { success: true, conversationId });
  },

  // Announcements
  async listAnnouncements(): Promise<Announcement[]> {
    return withDemo(() => api<Announcement[]>('GET', '/announcements'), demo.demoAnnouncements);
  },

  async getAnnouncement(id: string): Promise<Announcement> {
    return withDemo(() => api<Announcement>('GET', `/announcements/${id}`), demo.demoAnnouncements.find(a => a.id === id) ?? demo.demoAnnouncements[0]);
  },

  async createAnnouncement(input: { title: string; body: string; scope: 'global' | 'school' | 'location'; schoolId?: string }) {
    const newAnn: Announcement = { id: `ann-${Date.now()}`, title: input.title, body: input.body, scope: input.scope, schoolId: input.schoolId, createdBy: 'demo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return withDemo(() => api<Announcement>('POST', '/announcements', input), newAnn);
  },

  async markAnnouncementRead(id: string): Promise<{ success: boolean; announcementId: string }> {
    return withDemo(() => api<{ success: boolean; announcementId: string }>('POST', `/announcements/${id}/read`), { success: true, announcementId: id });
  },

  // Schools
  async getSchool(schoolId: string): Promise<SchoolIdentity | null> {
    return withDemo(() => api<SchoolIdentity | null>('GET', `/schools/${encodeURIComponent(schoolId)}`), demo.demoSchool);
  },

  // Notifications
  async listNotifications(): Promise<Notification[]> {
    return withDemo(() => api<Notification[]>('GET', '/notifications'), demo.demoNotifications);
  },

  async markNotificationRead(id: string): Promise<{ success: boolean; notificationId: string }> {
    return withDemo(() => api<{ success: boolean; notificationId: string }>('POST', `/notifications/${id}/read`), { success: true, notificationId: id });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean; userId: string }> {
    return withDemo(() => api<{ success: boolean; userId: string }>('POST', '/notifications/read-all'), { success: true, userId: 'demo' });
  },

  // Student Intelligence
  async getStudentDashboard(): Promise<StudentDashboard> {
    return withDemo(() => api<StudentDashboard>('GET', '/insights/dashboard'), demo.demoStudentDashboard);
  },

  async listStudentInsights(): Promise<StudentInsight[]> {
    return withDemo(() => api<StudentInsight[]>('GET', '/insights'), demo.demoStudentInsights);
  },

  async generateStudentInsights(): Promise<{ generated: number; insights: StudentInsight[] }> {
    return withDemo(() => api<{ generated: number; insights: StudentInsight[] }>('POST', '/insights/generate'), { generated: 2, insights: demo.demoStudentInsights });
  },

  // Growth Timeline
  async getGrowthTimeline(): Promise<GrowthEvent[]> {
    return withDemo(() => api<GrowthEvent[]>('GET', '/growth-timeline'), demo.demoGrowthEvents);
  },

  async generateGrowthTimeline(): Promise<{ generated: number; events: GrowthEvent[] }> {
    return withDemo(() => api<{ generated: number; events: GrowthEvent[] }>('POST', '/growth-timeline/generate'), { generated: 5, events: demo.demoGrowthEvents });
  },

  // Achievements
  async listAchievements(): Promise<Achievement[]> {
    return withDemo(() => api<Achievement[]>('GET', '/achievements'), demo.demoAchievements);
  },

  async checkAchievements(): Promise<{ unlocked: Achievement[]; count: number }> {
    return withDemo(() => api<{ unlocked: Achievement[]; count: number }>('POST', '/achievements/check'), { unlocked: demo.demoAchievements.filter(a => a.unlockedAt), count: 4 });
  },

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return withDemo(() => api<AnalyticsOverview>('GET', '/analytics/overview'), demo.demoAnalytics);
  },

  async getSchoolAnalytics(schoolId: string): Promise<AnalyticsOverview> {
    return withDemo(() => api<AnalyticsOverview>('GET', `/analytics/school/${schoolId}`), demo.demoAnalytics);
  },

  // Ambassador
  async getAmbassadorDashboard(): Promise<AmbassadorStudentSupport[]> {
    return withDemo(() => api<AmbassadorStudentSupport[]>('GET', '/ambassador/dashboard'), demo.demoAmbassadorSupport);
  },

  // Feedback
  async submitFeedback(input: { category: string; rating?: number; feedbackText?: string }): Promise<StudentFeedback> {
    const newFb: StudentFeedback = { id: `fb-${Date.now()}`, userId: 'demo', category: input.category, rating: input.rating, feedbackText: input.feedbackText, sentiment: 'positive', createdAt: new Date().toISOString() };
    return withDemo(() => api<StudentFeedback>('POST', '/feedback', input), newFb);
  },

  async getMyFeedback(): Promise<StudentFeedback[]> {
    return withDemo(() => api<StudentFeedback[]>('GET', '/feedback'), demo.demoStudentFeedback);
  },

  // Ambassador feedback
  async submitAmbassadorFeedback(input: { category: string; observation: string; studentId?: string; suggestedImprovement?: string }): Promise<AmbassadorFeedback> {
    const newFb: AmbassadorFeedback = { id: `afb-${Date.now()}`, ambassadorId: 'demo', studentId: input.studentId, category: input.category, observation: input.observation, suggestedImprovement: input.suggestedImprovement, createdAt: new Date().toISOString() };
    return withDemo(() => api<AmbassadorFeedback>('POST', '/ambassador/feedback', input), newFb);
  },

  async getAmbassadorFeedback(): Promise<AmbassadorFeedback[]> {
    return withDemo(() => api<AmbassadorFeedback[]>('GET', '/ambassador/feedback'), demo.demoAmbassadorFeedback);
  },

  // Feature requests
  async createFeatureRequest(input: { title: string; description?: string; category: string }): Promise<FeatureRequest> {
    const newFr: FeatureRequest = { id: `fr-${Date.now()}`, createdBy: 'demo', title: input.title, description: input.description, category: input.category, votes: 1, status: 'Submitted', createdAt: new Date().toISOString() };
    return withDemo(() => api<FeatureRequest>('POST', '/feature-requests', input), newFr);
  },

  async listFeatureRequests(status?: string): Promise<FeatureRequest[]> {
    return withDemo(() => api<FeatureRequest[]>('GET', '/feature-requests'), demo.demoFeatureRequests);
  },

  async voteFeatureRequest(id: string): Promise<{ success: boolean; id: string }> {
    return withDemo(() => api<{ success: boolean; id: string }>('POST', `/feature-requests/${id}/vote`), { success: true, id });
  },

  async updateFeatureRequestStatus(id: string, status: string): Promise<{ success: boolean; id: string; status: string }> {
    return withDemo(() => api<{ success: boolean; id: string; status: string }>('POST', `/feature-requests/${id}/status`, { status }), { success: true, id, status });
  },

  // Impact analytics
  async getImpactAnalytics(): Promise<ImpactAnalytics> {
    return withDemo(() => api<ImpactAnalytics>('GET', '/impact-analytics'), demo.demoImpactAnalytics);
  },

  // Impact reports
  async generateImpactReport(periodStart?: string, periodEnd?: string): Promise<ImpactReport> {
    return withDemo(() => api<ImpactReport>('POST', '/impact-reports/generate', { periodStart, periodEnd }), demo.demoImpactReports[0]);
  },

  async listImpactReports(): Promise<ImpactReport[]> {
    return withDemo(() => api<ImpactReport[]>('GET', '/impact-reports'), demo.demoImpactReports);
  },

  // Recommendations
  async generateRecommendations(): Promise<ImprovementRecommendation[]> {
    return withDemo(() => api<ImprovementRecommendation[]>('POST', '/recommendations/generate'), demo.demoRecommendations);
  },

  async listRecommendations(): Promise<ImprovementRecommendation[]> {
    return withDemo(() => api<ImprovementRecommendation[]>('GET', '/recommendations'), demo.demoRecommendations);
  },

  async updateRecommendationStatus(id: string, status: string): Promise<{ success: boolean; id: string; status: string }> {
    return withDemo(() => api<{ success: boolean; id: string; status: string }>('POST', `/recommendations/${id}/status`, { status }), { success: true, id, status });
  },

  // Health & status
  async getVersion(): Promise<{ version: string; timestamp: string }> {
    return withDemo(() => api<{ version: string; timestamp: string }>('GET', '/version'), { version: '1.0.0', timestamp: new Date().toISOString() });
  },

  async getStatus(): Promise<HealthStatusReport> {
    return withDemo(() => api<HealthStatusReport>('GET', '/status'), { status: 'ok', database: 'connected', version: '1.0.0', timestamp: new Date().toISOString(), environment: 'production', authConfigured: true, routes: 130, migrations: { appliedMigrations: 12, tables: [] } });
  },

  // Notifications Sprint 5
  async getNotificationPreferences(): Promise<NotificationPreference> {
    return withDemo(() => api<NotificationPreference>('GET', '/notifications/preferences'), demo.demoNotificationPrefs);
  },

  async updateNotificationPreferences(prefs: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return withDemo(() => api<NotificationPreference>('POST', '/notifications/preferences', prefs), { ...demo.demoNotificationPrefs, ...prefs });
  },

  async generateNotifications(): Promise<{ generated: number; notifications: unknown[] }> {
    return withDemo(() => api<{ generated: number; notifications: unknown[] }>('POST', '/notifications/generate'), { generated: 4, notifications: demo.demoNotifications });
  },

  async getNotificationSchedule(): Promise<{ generated: number; scheduled: unknown[] }> {
    return withDemo(() => api<{ generated: number; scheduled: unknown[] }>('GET', '/notifications/schedule'), { generated: 4, scheduled: demo.demoNotifications });
  },

  // Growth Timeline 2.0
  async getGrowthStatistics(): Promise<GrowthStatistics> {
    return withDemo(() => api<GrowthStatistics>('GET', '/growth-timeline/stats'), demo.demoGrowthStats);
  },

  async getGrowthStory(): Promise<GrowthStory> {
    return withDemo(() => api<GrowthStory>('GET', '/growth-timeline/story'), demo.demoGrowthStory);
  },

  // Opportunities
  async getOpportunities(): Promise<OpportunityRecommendation[]> {
    return withDemo(() => api<OpportunityRecommendation[]>('GET', '/opportunities'), demo.demoOpportunities);
  },

  // AI Companion
  async askAI(message: string): Promise<AICompanionOutput> {
    return withDemo(() => api<AICompanionOutput>('POST', '/ai/chat', { message, intent: 'chat' }), { ...demo.demoAIChat, reply: demo.demoAIChat.reply + `\n\nYou asked: "${message}"` });
  },

  async getAIReflection(): Promise<AICompanionOutput> {
    return withDemo(() => api<AICompanionOutput>('POST', '/ai/reflect'), demo.demoAIChat);
  },

  async getAIPlan(): Promise<AICompanionOutput> {
    return withDemo(() => api<AICompanionOutput>('POST', '/ai/plan'), demo.demoAIChat);
  },

  async getAIRecommendations(): Promise<AICompanionOutput> {
    return withDemo(() => api<AICompanionOutput>('POST', '/ai/recommend'), demo.demoAIChat);
  },

  async getAIGrowth(): Promise<AICompanionOutput> {
    return withDemo(() => api<AICompanionOutput>('POST', '/ai/growth'), demo.demoAIChat);
  },

  // Admin
  async listAdminUsers(): Promise<User[]> {
    return withDemo(async () => {
      const result = await api<{ ok: boolean; items: User[] }>('GET', '/admin/users');
      return result.items ?? [];
    }, []);
  },

  async createAdminEvent(input: { title: string; description?: string; startsAt: string; endsAt?: string; location?: string }): Promise<EventItem> {
    const newEvent: EventItem = { id: `event-${Date.now()}`, title: input.title, description: input.description, startsAt: input.startsAt, endsAt: input.endsAt, location: input.location, createdBy: 'demo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return withDemo(async () => {
      const result = await api<{ ok: boolean; item: EventItem }>('POST', '/admin/events', input);
      return result.item;
    }, newEvent);
  },

  async createAdminAnnouncement(input: { title: string; body: string; scope?: string }): Promise<Announcement> {
    const newAnn: Announcement = { id: `ann-${Date.now()}`, title: input.title, body: input.body, scope: (input.scope as Announcement['scope']) ?? 'global', createdBy: 'demo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return withDemo(async () => {
      const result = await api<{ ok: boolean; item: Announcement }>('POST', '/admin/announcements', input);
      return result.item;
    }, newAnn);
  },

  // Command centers
  async getAdminOverview(): Promise<AdminCommandCenterReport['overview']> {
    return withDemo(() => api<AdminCommandCenterReport['overview']>('GET', '/admin/overview'), demo.demoAdminCommandCenter.overview);
  },

  async getAdminStudentSupport(): Promise<AdminCommandCenterReport['support']> {
    return withDemo(() => api<AdminCommandCenterReport['support']>('GET', '/admin/student-support'), demo.demoAdminCommandCenter.support);
  },

  async getAdminProgramAnalytics(): Promise<AdminCommandCenterReport['programAnalytics']> {
    return withDemo(() => api<AdminCommandCenterReport['programAnalytics']>('GET', '/admin/program-analytics'), demo.demoAdminCommandCenter.programAnalytics);
  },

  async getAmbassadorCommandCenter(): Promise<AmbassadorCommandCenter> {
    return withDemo(() => api<AmbassadorCommandCenter>('GET', '/ambassador/command-center'), demo.demoAmbassadorCommandCenter);
  },

  // Recognition
  async getRecognitionSummary(): Promise<RecognitionSummary> {
    return withDemo(() => api<RecognitionSummary>('GET', '/achievements/recognition'), demo.demoRecognition);
  },

  // Demo
  async getJourney(): Promise<JourneyMonth[]> {
    return withDemo(async () => {
      const result = await api<JourneyPayload>('GET', '/journey');
      return result.journey ?? [];
    }, [{ month: 'August', year: 2026, events: demo.demoGrowthEvents.map(e => ({ id: e.id, title: e.title, description: e.description ?? '', category: e.eventType, date: e.occurredAt })) }]);
  },

  async getPortfolio(): Promise<PortfolioSummary> {
    return withDemo(async () => {
      const result = await api<PortfolioPayload>('GET', '/portfolio');
      return result.portfolio ?? emptyPortfolio;
    }, {
      xp: 1240, streak: 12,
      projects: [{ type: 'Project', title: 'Robotics Arm Build', description: '6-week build with documentation', date: '2026-08-01' }],
      goals: demo.demoGoals.filter(g => g.completed).map(g => ({ type: 'Goal', title: g.title, date: g.updatedAt })),
      achievements: demo.demoAchievements.filter(a => a.unlockedAt).map(a => ({ type: 'Achievement', title: a.title, description: a.description, date: a.unlockedAt })),
      events: demo.demoEvents.map(e => ({ type: 'Event', title: e.title, date: e.startsAt })),
      skills: [{ type: 'Skill', title: 'Leadership', description: 'Intermediate' }, { type: 'Skill', title: 'Robotics', description: 'Advanced' }],
      certificates: [{ type: 'Certificate', title: 'Leadership Series 1', date: '2026-07-15' }],
      leadership: [{ type: 'Leadership', title: 'Study Group Lead', description: 'Led 4 sessions' }],
      community: [{ type: 'Community', title: 'Showcase Night Participant', date: '2026-07-20' }],
      volunteer: [{ type: 'Volunteer', title: 'Open House Helper', date: '2026-06-10' }],
      badges: demo.demoAchievements.filter(a => a.unlockedAt).map(a => ({ type: 'Badge', title: a.title, description: a.description })),
      reflections: [{ type: 'Reflection', title: 'Week 4 check-in', description: 'Feeling confident about my progress.' }],
    });
  },

  async getDemoScenario(): Promise<DemoScenario> {
    return withDemo(() => api<DemoScenario>('GET', '/demo'), {
      students: [{ id: 'demo', name: 'Ava Demo', xp: 1240, streak: 12, goals: 4, tasks: 28, insights: ['Consistent weekly activity', 'Strong event participation'] }],
      ambassadorView: [{ studentId: 'demo', name: 'Ava Demo', status: 'thriving', recommendation: 'Acknowledge their consistency' }],
      adminMetrics: { totalStudents: 1250, activeThisMonth: 980, averageEngagement: 84, studentSatisfaction: 91, topImprovement: 'Consistency increased 22%', xpTrend: demo.demoAnalytics.xpTrend, feedbackThemes: [{ category: 'Weekly check-in', count: 342 }], recommendations: ['Increase reminder frequency for deadlines'] },
    });
  },
};

const emptyPortfolio: PortfolioSummary = {
  xp: 0, streak: 0, projects: [], goals: [], achievements: [], events: [], skills: [], certificates: [], leadership: [], community: [], volunteer: [], badges: [], reflections: [],
};
