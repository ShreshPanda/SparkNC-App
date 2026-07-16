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
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="settings" color={color} size={20} /> }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="shield" color={color} size={20} /> }} />
    </Tabs>
  );
}
