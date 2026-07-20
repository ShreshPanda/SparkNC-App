import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="grid" color={color} size={20} /> }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="checkmark-circle" color={color} size={20} /> }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="flag" color={color} size={20} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="calendar" color={color} size={20} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="chatbubble" color={color} size={20} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="notifications" color={color} size={20} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="person" color={color} size={20} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="stats-chart" color={color} size={20} /> }} />
      <Tabs.Screen name="growth" options={{ title: 'Timeline', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="time" color={color} size={20} /> }} />
      <Tabs.Screen name="journey" options={{ title: 'Journey', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="map" color={color} size={20} /> }} />
      <Tabs.Screen name="portfolio" options={{ title: 'Portfolio', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="briefcase" color={color} size={20} /> }} />
      <Tabs.Screen name="achievements" options={{ title: 'Achievements', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="trophy" color={color} size={20} /> }} />
      <Tabs.Screen name="ai" options={{ title: 'Spark AI', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="sparkles" color={color} size={20} /> }} />
      <Tabs.Screen name="ambassador" options={{ title: 'Ambassador', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="people" color={color} size={20} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="bar-chart" color={color} size={20} /> }} />
      <Tabs.Screen name="feedback" options={{ title: 'Feedback', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="chatbox-ellipses" color={color} size={20} /> }} />
      <Tabs.Screen name="ambassador-feedback" options={{ title: 'Ambassador', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="people-circle" color={color} size={20} /> }} />
      <Tabs.Screen name="impact" options={{ title: 'Impact', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="pulse" color={color} size={20} /> }} />
      <Tabs.Screen name="showcase" options={{ title: 'Showcase', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="star" color={color} size={20} /> }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="shield" color={color} size={20} /> }} />
    </Tabs>
  );
}
