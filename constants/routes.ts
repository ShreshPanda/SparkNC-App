export const appRoutes = {
  auth: {
    login: '/(auth)/login',
    signup: '/(auth)/signup',
  },
  tabs: {
    dashboard: '/(tabs)/dashboard',
    tasks: '/(tabs)/tasks',
    goals: '/(tabs)/goals',
    calendar: '/(tabs)/calendar',
    messages: '/(tabs)/messages',
    notifications: '/(tabs)/notifications',
    settings: '/(tabs)/settings',
    admin: '/(tabs)/admin',
  },
} as const;
