import { createActivityRoutes } from './activity';
import { createAdminRoutes } from './admin';
import { createAuthRoutes } from './auth';
import { createEventRoutes } from './events';
import { createGoalRoutes } from './goals';
import { createMessageRoutes } from './messages';
import { createTaskRoutes } from './tasks';
import { createUserRoutes } from './users';

export const routeRegistry = {
  auth: ['/auth/login', '/auth/logout'],
  users: ['/users/:id'],
  tasks: ['/tasks', '/tasks/:id'],
  goals: ['/goals', '/goals/:id'],
  messages: ['/messages'],
  events: ['/events'],
  activity: ['/activity/session', '/activity/stats'],
  admin: ['/admin/users', '/admin/events', '/admin/announcements'],
  modules: [
    ...createAuthRoutes(),
    ...createUserRoutes(),
    ...createTaskRoutes(),
    ...createGoalRoutes(),
    ...createEventRoutes(),
    ...createMessageRoutes(),
    ...createActivityRoutes(),
    ...createAdminRoutes(),
  ],
} as const;
