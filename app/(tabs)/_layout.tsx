import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePresentation } from '../../providers/PresentationProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { spark } from '../../theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { enabled } = usePresentation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand ?? spark.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: enabled
          ? { display: 'none' }
          : {
              backgroundColor: spark.white,
              borderTopColor: colors.border,
              borderTopWidth: 0.5,
              height: 84,
              paddingTop: 10,
              paddingBottom: 24,
            },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
        tabBarIconStyle: { marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="home" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="checkmark-circle" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="calendar" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Spark AI',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="sparkles" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="grid-outline" color={color} size={24} />,
        }}
      />

      {/* Hidden from tab bar — accessible via More screen */}
      <Tabs.Screen name="goals" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="growth" options={{ href: null }} />
      <Tabs.Screen name="journey" options={{ href: null }} />
      <Tabs.Screen name="portfolio" options={{ href: null }} />
      <Tabs.Screen name="achievements" options={{ href: null }} />
      <Tabs.Screen name="ambassador" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="feedback" options={{ href: null }} />
      <Tabs.Screen name="ambassador-feedback" options={{ href: null }} />
      <Tabs.Screen name="impact" options={{ href: null }} />
      <Tabs.Screen name="showcase" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
