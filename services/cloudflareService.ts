import {
  User as UserProfile,
  Task as TaskItem,
  Goal as GoalItem,
  Message as MessageItem,
  Event as EventItem,
  Conversation,
  Announcement,
  Notification,
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
  AICompanionOutput,
  AdminCommandCenterReport,
  AmbassadorCommandCenter,
  RecognitionSummary,
} from '../shared/types';

const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const workerUrl = runtimeEnv.EXPO_PUBLIC_CLOUDFLARE_WORKER_URL ?? '';

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

export interface AuthPayload {
  ok: boolean;
  data: { userId: string; role: string };
}

export interface MePayload {
  ok: boolean;
  data: UserProfile & { xp: number; streak: { current: number; longest: number } };
}

export const cloudflareService = {
  async healthCheck() {
    return api('GET', '/health');
  },

  async register(input: { email: string; password: string; name: string; role?: string }) {
    return api<AuthPayload>('POST', '/auth/register', input);
  },

  async login(input: { email: string; password: string }) {
    return api<AuthPayload>('POST', '/auth/login', input);
  },

  async logout() {
    return api<{ ok: boolean; data: { message: string } }>('POST', '/auth/logout');
  },

  async getMe(): Promise<UserProfile & { xp: number; streak: { current: number; longest: number } }> {
    const result = await api<MePayload>('GET', '/auth/me');
    return result.data;
  },

  async getUserProfile(_id: string): Promise<UserProfile | null> {
    return null;
  },

  // Tasks
  async listTasks(): Promise<TaskItem[]> {
    return api<TaskItem[]>('GET', '/tasks');
  },

  async createTask(input: { title: string; description?: string; category?: string; dueDate?: string; completed?: boolean; xpReward?: number }) {
    return api<{ item: TaskItem; xpAwarded?: number; streak?: { current: number; longest: number } }>('POST', '/tasks', input);
  },

  async completeTask(id: string) {
    return api<{ item: TaskItem; xpAwarded: number; streak: { current: number; longest: number } }>('POST', `/tasks/${id}/complete`);
  },

  async deleteTask(id: string) {
    return api<{ deleted: boolean }>('DELETE', `/tasks/${id}`);
  },

  // Goals
  async listGoals(): Promise<GoalItem[]> {
    return api<GoalItem[]>('GET', '/goals');
  },

  async createGoal(input: { title: string; description?: string; progress?: number; completed?: boolean; xpReward?: number }) {
    return api<{ item: GoalItem; xpAwarded?: number; streak?: { current: number; longest: number } }>('POST', '/goals', input);
  },

  async completeGoal(id: string) {
    return api<{ item: GoalItem; xpAwarded: number; streak: { current: number; longest: number } }>('POST', `/goals/${id}/complete`);
  },

  async deleteGoal(id: string) {
    return api<{ deleted: boolean }>('DELETE', `/goals/${id}`);
  },

  // Events
  async listEvents(): Promise<EventItem[]> {
    return api<EventItem[]>('GET', '/events');
  },

  async getEvent(id: string): Promise<EventItem> {
    return api<EventItem>('GET', `/events/${id}`);
  },

  async createEvent(input: { title: string; description?: string; location?: string; startsAt: string; endsAt?: string; schoolId?: string }) {
    return api<EventItem>('POST', '/events', input);
  },

  async registerForEvent(id: string): Promise<EventItem> {
    return api<EventItem>('POST', `/events/${id}/register`);
  },

  // Conversations / Messages
  async listConversations(): Promise<Conversation[]> {
    return api<Conversation[]>('GET', '/conversations');
  },

  async getConversation(id: string): Promise<Conversation> {
    return api<Conversation>('GET', `/conversations/${id}`);
  },

  async getMessages(conversationId: string): Promise<MessageItem[]> {
    return api<MessageItem[]>('GET', `/conversations/${conversationId}/messages`);
  },

  async sendMessage(input: { recipientId: string; body: string }): Promise<MessageItem> {
    return api<MessageItem>('POST', '/messages', input);
  },

  async markConversationRead(conversationId: string): Promise<{ success: boolean; conversationId: string }> {
    return api<{ success: boolean; conversationId: string }>('POST', `/conversations/${conversationId}/read`);
  },

  // Announcements
  async listAnnouncements(): Promise<Announcement[]> {
    return api<Announcement[]>('GET', '/announcements');
  },

  async getAnnouncement(id: string): Promise<Announcement> {
    return api<Announcement>('GET', `/announcements/${id}`);
  },

  async createAnnouncement(input: { title: string; body: string; scope: 'global' | 'school' | 'location'; schoolId?: string }) {
    return api<Announcement>('POST', '/announcements', input);
  },

  async markAnnouncementRead(id: string): Promise<{ success: boolean; announcementId: string }> {
    return api<{ success: boolean; announcementId: string }>('POST', `/announcements/${id}/read`);
  },

  // Notifications
  async listNotifications(): Promise<Notification[]> {
    return api<Notification[]>('GET', '/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean; notificationId: string }> {
    return api<{ success: boolean; notificationId: string }>('POST', `/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<{ success: boolean; userId: string }> {
    return api<{ success: boolean; userId: string }>('POST', '/notifications/read-all');
  },

  // Student Intelligence
  async getStudentDashboard(): Promise<StudentDashboard> {
    return api<StudentDashboard>('GET', '/insights/dashboard');
  },

  async listStudentInsights(): Promise<StudentInsight[]> {
    return api<StudentInsight[]>('GET', '/insights');
  },

  async generateStudentInsights(): Promise<{ generated: number; insights: StudentInsight[] }> {
    return api<{ generated: number; insights: StudentInsight[] }>('POST', '/insights/generate');
  },

  // Growth Timeline
  async getGrowthTimeline(): Promise<GrowthEvent[]> {
    return api<GrowthEvent[]>('GET', '/growth-timeline');
  },

  async generateGrowthTimeline(): Promise<{ generated: number; events: GrowthEvent[] }> {
    return api<{ generated: number; events: GrowthEvent[] }>('POST', '/growth-timeline/generate');
  },

  // Achievements
  async listAchievements(): Promise<Achievement[]> {
    return api<Achievement[]>('GET', '/achievements');
  },

  async checkAchievements(): Promise<{ unlocked: Achievement[]; count: number }> {
    return api<{ unlocked: Achievement[]; count: number }>('POST', '/achievements/check');
  },

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return api<AnalyticsOverview>('GET', '/analytics/overview');
  },

  async getSchoolAnalytics(schoolId: string): Promise<AnalyticsOverview> {
    return api<AnalyticsOverview>('GET', `/analytics/school/${schoolId}`);
  },

  // Ambassador
  async getAmbassadorDashboard(): Promise<AmbassadorStudentSupport[]> {
    return api<AmbassadorStudentSupport[]>('GET', '/ambassador/dashboard');
  },

  // Feedback
  async submitFeedback(input: { category: string; rating?: number; feedbackText?: string }): Promise<StudentFeedback> {
    return api<StudentFeedback>('POST', '/feedback', input);
  },

  async getMyFeedback(): Promise<StudentFeedback[]> {
    return api<StudentFeedback[]>('GET', '/feedback');
  },

  // Ambassador feedback
  async submitAmbassadorFeedback(input: { category: string; observation: string; studentId?: string; suggestedImprovement?: string }): Promise<AmbassadorFeedback> {
    return api<AmbassadorFeedback>('POST', '/ambassador/feedback', input);
  },

  async getAmbassadorFeedback(): Promise<AmbassadorFeedback[]> {
    return api<AmbassadorFeedback[]>('GET', '/ambassador/feedback');
  },

  // Feature requests
  async createFeatureRequest(input: { title: string; description?: string; category: string }): Promise<FeatureRequest> {
    return api<FeatureRequest>('POST', '/feature-requests', input);
  },

  async listFeatureRequests(status?: string): Promise<FeatureRequest[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return api<FeatureRequest[]>(`GET`, `/feature-requests${query}`);
  },

  async voteFeatureRequest(id: string): Promise<{ success: boolean; id: string }> {
    return api<{ success: boolean; id: string }>('POST', `/feature-requests/${id}/vote`);
  },

  async updateFeatureRequestStatus(id: string, status: string): Promise<{ success: boolean; id: string; status: string }> {
    return api<{ success: boolean; id: string; status: string }>('POST', `/feature-requests/${id}/status`, { status });
  },

  // Impact analytics
  async getImpactAnalytics(): Promise<ImpactAnalytics> {
    return api<ImpactAnalytics>('GET', '/impact-analytics');
  },

  // Impact reports
  async generateImpactReport(periodStart?: string, periodEnd?: string): Promise<ImpactReport> {
    return api<ImpactReport>('POST', '/impact-reports/generate', { periodStart, periodEnd });
  },

  async listImpactReports(): Promise<ImpactReport[]> {
    return api<ImpactReport[]>('GET', '/impact-reports');
  },

  // Recommendations
  async generateRecommendations(): Promise<ImprovementRecommendation[]> {
    return api<ImprovementRecommendation[]>('POST', '/recommendations/generate');
  },

  async listRecommendations(): Promise<ImprovementRecommendation[]> {
    return api<ImprovementRecommendation[]>('GET', '/recommendations');
  },

  async updateRecommendationStatus(id: string, status: string): Promise<{ success: boolean; id: string; status: string }> {
    return api<{ success: boolean; id: string; status: string }>('POST', `/recommendations/${id}/status`, { status });
  },

  // Health & status
  async getVersion(): Promise<{ version: string; timestamp: string }> {
    return api<{ version: string; timestamp: string }>('GET', '/version');
  },

  async getStatus(): Promise<HealthStatusReport> {
    return api<HealthStatusReport>('GET', '/status');
  },

  // Notifications Sprint 5
  async getNotificationPreferences(): Promise<NotificationPreference> {
    return api<NotificationPreference>('GET', '/notifications/preferences');
  },

  async updateNotificationPreferences(prefs: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return api<NotificationPreference>('POST', '/notifications/preferences', prefs);
  },

  async generateNotifications(): Promise<{ generated: number; notifications: unknown[] }> {
    return api<{ generated: number; notifications: unknown[] }>('POST', '/notifications/generate');
  },

  async getNotificationSchedule(): Promise<{ generated: number; scheduled: unknown[] }> {
    return api<{ generated: number; scheduled: unknown[] }>('GET', '/notifications/schedule');
  },

  // Growth Timeline 2.0
  async getGrowthStatistics(): Promise<GrowthStatistics> {
    return api<GrowthStatistics>('GET', '/growth-timeline/stats');
  },

  async getGrowthStory(): Promise<GrowthStory> {
    return api<GrowthStory>('GET', '/growth-timeline/story');
  },

  // AI Companion
  async askAI(message: string): Promise<AICompanionOutput> {
    return api<AICompanionOutput>('POST', '/ai/chat', { message, intent: 'chat' });
  },

  async getAIReflection(): Promise<AICompanionOutput> {
    return api<AICompanionOutput>('POST', '/ai/reflect');
  },

  async getAIPlan(): Promise<AICompanionOutput> {
    return api<AICompanionOutput>('POST', '/ai/plan');
  },

  async getAIRecommendations(): Promise<AICompanionOutput> {
    return api<AICompanionOutput>('POST', '/ai/recommend');
  },

  async getAIGrowth(): Promise<AICompanionOutput> {
    return api<AICompanionOutput>('POST', '/ai/growth');
  },

  // Command centers
  async getAdminOverview(): Promise<AdminCommandCenterReport['overview']> {
    return api<AdminCommandCenterReport['overview']>('GET', '/admin/overview');
  },

  async getAdminStudentSupport(): Promise<AdminCommandCenterReport['support']> {
    return api<AdminCommandCenterReport['support']>('GET', '/admin/student-support');
  },

  async getAdminProgramAnalytics(): Promise<AdminCommandCenterReport['programAnalytics']> {
    return api<AdminCommandCenterReport['programAnalytics']>('GET', '/admin/program-analytics');
  },

  async getAmbassadorCommandCenter(): Promise<AmbassadorCommandCenter> {
    return api<AmbassadorCommandCenter>('GET', '/ambassador/command-center');
  },

  // Recognition
  async getRecognitionSummary(): Promise<RecognitionSummary> {
    return api<RecognitionSummary>('GET', '/achievements/recognition');
  },

  // Demo
  async getDemoScenario(): Promise<DemoScenario> {
    return api<DemoScenario>('GET', '/demo');
  },
};
