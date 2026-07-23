import { createActivityRoutes } from './activity';
import { createAdminRoutes } from './admin';
import { createAnnouncementRoutes } from './announcements';
import { createAuthRoutes } from './auth';
import { createEventRoutes } from './events';
import { createGoalRoutes } from './goals';
import { createAchievementsRoutes } from './achievements';
import { createAIMemoryRoutes } from './aiMemory';
import { createAIRoutes } from './ai';
import { createAmbassadorSupportRoutes } from './ambassadorSupport';
import { createAnalyticsRoutes } from './analytics';
import { createCommunityRoutes } from './community';
import { createCommunityModerationRoutes } from './communityModeration';
import { createEngagementAnalyticsRoutes } from './engagementAnalytics';
import { createAmbassadorRoutes } from './ambassador';
import { createAmbassadorFeedbackRoutes } from './ambassadorFeedback';
import { createAuditRoutes } from './audit';
import { createDelightRoutes } from './delight';
import { createDemoRoutes } from './demo';
import { createDemoSeedRoutes } from './demoSeed';
import { createExecutiveRoutes } from './executive';
import { createFeedbackAnalysisRoutes } from './feedbackAnalysis';
import { createFeedbackRoutes } from './feedback';
import { createFeatureRequestRoutes } from './featureRequests';
import { createJourneyRoutes } from './journey';
import { createMetricsRoutes } from './metrics';
import { createPilotOperationsRoutes } from './pilotOperations';
import { createOpportunityRoutes } from './opportunities';
import { createSchoolRoutes } from './schools';
import { createPortfolioRoutes } from './portfolio';
import { createSparkMomentsRoutes } from './sparkMoments';
import { createGrowthRoutes } from './growth';
import { createImpactAnalyticsRoutes } from './impactAnalytics';
import { createImpactReportRoutes } from './impactReports';
import { createImprovementRecommendationRoutes } from './improvementRecommendations';
import { createInsightsRoutes } from './insights';
import { createMessageRoutes } from './messages';
import { createNotificationRoutes } from './notifications';
import { createOnboardingRoutes } from './onboarding';
import { createPilotRoutes } from './pilot';
import { createTaskRoutes } from './tasks';
import { createUserRoutes } from './users';

export const routeRegistry = {
  auth: ['/auth/login', '/auth/logout'],
  users: ['/users/:id'],
  tasks: ['/tasks', '/tasks/:id'],
  goals: ['/goals', '/goals/:id'],
  messages: ['/messages'],
  events: ['/events'],
  announcements: ['/announcements'],
  notifications: ['/notifications'],
  insights: ['/insights', '/insights/dashboard', '/insights/generate'],
  growth: ['/growth-timeline', '/growth-timeline/generate'],
  achievements: ['/achievements', '/achievements/check'],
  ai: ['/ai/chat'],
  analytics: ['/analytics/overview', '/analytics/school/:id', '/analytics/snapshot/organization', '/analytics/snapshot/school/:id'],
  ambassador: ['/ambassador/dashboard'],
  audit: ['/audit'],
  activity: ['/activity/session', '/activity/stats'],
  feedback: ['/feedback', '/feedback/analyze', '/feedback/insights'],
  'ambassador-feedback': ['/ambassador/feedback'],
  'feature-requests': ['/feature-requests', '/feature-requests/:id/vote', '/feature-requests/:id/status'],
  'journey': ['/journey'],
  'portfolio': ['/portfolio'],
  'executive-dashboard': ['/executive/dashboard'],
  'delight': ['/delight'],
  'metrics': ['/metrics'],
  'pilot-operations': ['/pilot/operations'],
  'spark-moments': ['/spark-moments', '/spark-moments/trigger'],
  'schools': ['/schools/:id'],
  'pilot': ['/pilot/groups', '/pilot/participants', '/pilot/me'],
  'opportunities': ['/opportunities'],
  'onboarding': ['/onboarding', '/onboarding/complete'],
  'ai-memory': ['/ai/memory'],
  'engagement-analytics': ['/analytics/engagement', '/analytics/retention', '/analytics/features'],
  'ambassador-support': ['/ambassador/student-support'],
  'community-moderation': ['/community/reports', '/community/moderate/posts', '/community/moderate/groups'],
  'impact-analytics': ['/impact-analytics'],
  'impact-reports': ['/impact-reports', '/impact-reports/generate'],
  recommendations: ['/recommendations', '/recommendations/generate', '/recommendations/:id/status'],
  demo: ['/demo'],
  admin: ['/admin/users', '/admin/events', '/admin/announcements'],
  modules: [
    ...createAuthRoutes(),
    ...createUserRoutes(),
    ...createTaskRoutes(),
    ...createGoalRoutes(),
    ...createEventRoutes(),
    ...createMessageRoutes(),
    ...createAnnouncementRoutes(),
    ...createNotificationRoutes(),
    ...createInsightsRoutes(),
    ...createGrowthRoutes(),
    ...createAchievementsRoutes(),
    ...createAIRoutes(),
    ...createAnalyticsRoutes(),
    ...createEngagementAnalyticsRoutes(),
    ...createAmbassadorRoutes(),
    ...createAmbassadorSupportRoutes(),
    ...createAuditRoutes(),
    ...createCommunityRoutes(),
    ...createCommunityModerationRoutes(),
    ...createFeedbackRoutes(),
    ...createFeedbackAnalysisRoutes(),
    ...createAmbassadorFeedbackRoutes(),
    ...createFeatureRequestRoutes(),
    ...createJourneyRoutes(),
    ...createPortfolioRoutes(),
    ...createExecutiveRoutes(),
    ...createDelightRoutes(),
    ...createDemoSeedRoutes(),
    ...createMetricsRoutes(),
    ...createPilotOperationsRoutes(),
    ...createOpportunityRoutes(),
    ...createSchoolRoutes(),
    ...createSparkMomentsRoutes(),
    ...createImpactAnalyticsRoutes(),
    ...createImpactReportRoutes(),
    ...createImprovementRecommendationRoutes(),
    ...createDemoRoutes(),
    ...createAIMemoryRoutes(),
    ...createOnboardingRoutes(),
    ...createPilotRoutes(),
    ...createActivityRoutes(),
    ...createAdminRoutes(),
  ],
} as const;
