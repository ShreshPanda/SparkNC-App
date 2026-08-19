import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { radius, shadows, spacing, spark, typography } from '../../theme';

type MenuItem = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  href: string;
  color: string;
};

type MenuGroup = {
  heading: string;
  items: MenuItem[];
};

export default function MoreScreen() {
  const { colors } = useTheme();

  const groups: MenuGroup[] = [
    {
      heading: 'Your Progress',
      items: [
        { title: 'Goals', subtitle: 'Track and complete your goals', icon: 'flag', href: '/(tabs)/goals', color: spark.blue },
        { title: 'Growth Timeline', subtitle: 'Your activity over time', icon: 'time', href: '/(tabs)/growth', color: spark.blue },
        { title: 'Journey', subtitle: 'Month-by-month story', icon: 'map', href: '/(tabs)/journey', color: spark.blue },
        { title: 'Progress Stats', subtitle: 'Detailed metrics', icon: 'stats-chart', href: '/(tabs)/progress', color: spark.blue },
        { title: 'Portfolio', subtitle: 'Your showcase of work', icon: 'briefcase', href: '/(tabs)/portfolio', color: spark.blue },
        { title: 'Achievements', subtitle: 'Badges and milestones', icon: 'trophy', href: '/(tabs)/achievements', color: spark.yellow },
        { title: 'Showcase', subtitle: 'Featured projects', icon: 'star', href: '/(tabs)/showcase', color: spark.yellow },
      ],
    },
    {
      heading: 'Communication',
      items: [
        { title: 'Messages', subtitle: 'Chat with ambassadors and peers', icon: 'chatbubble', href: '/(tabs)/messages', color: spark.blue },
        { title: 'Notifications', subtitle: 'Alerts and updates', icon: 'notifications', href: '/(tabs)/notifications', color: spark.yellow },
        { title: 'Feedback', subtitle: 'Share your experience', icon: 'chatbox-ellipses', href: '/(tabs)/feedback', color: spark.green },
      ],
    },
    {
      heading: 'Leadership & Impact',
      items: [
        { title: 'Ambassador View', subtitle: 'Support your students', icon: 'people', href: '/(tabs)/ambassador', color: spark.blue },
        { title: 'Ambassador Feedback', subtitle: 'Observations and notes', icon: 'people-circle', href: '/(tabs)/ambassador-feedback', color: spark.blue },
        { title: 'Analytics', subtitle: 'Program-wide data', icon: 'bar-chart', href: '/(tabs)/analytics', color: spark.blue },
        { title: 'Impact Reports', subtitle: 'Outcomes and insights', icon: 'pulse', href: '/(tabs)/impact', color: spark.green },
        { title: 'Admin Center', subtitle: 'Manage the platform', icon: 'shield', href: '/(tabs)/admin', color: spark.blue },
      ],
    },
    {
      heading: 'Account',
      items: [
        { title: 'Profile', subtitle: 'Your info and preferences', icon: 'person', href: '/(tabs)/profile', color: spark.blue },
        { title: 'Settings', subtitle: 'App preferences', icon: 'settings', href: '/(tabs)/settings', color: colors.muted },
      ],
    },
  ];

  return (
    <AppShell title="More">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {groups.map((group) => (
          <View key={group.heading} style={styles.group}>
            <Text style={[styles.groupHeading, { color: colors.muted }]}>{group.heading.toUpperCase()}</Text>
            <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
              {group.items.map((item, index) => (
                <Link key={item.title} href={item.href as never} asChild>
                  <Pressable
                    style={[
                      styles.row,
                      index > 0 && { borderTopColor: colors.border, borderTopWidth: 0.5 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: item.color + '18' }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={[styles.rowTitle, { color: colors.foreground }]}>{item.title}</Text>
                      <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        ))}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>SparkNC v1.0.0</Text>
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl, paddingBottom: spacing.xxxl },
  group: { gap: spacing.sm },
  groupHeading: { ...typography.labelSmall, marginLeft: spacing.xs },
  groupCard: { borderRadius: radius.xl, borderWidth: 0.5, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md + 2, gap: spacing.md },
  iconCircle: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...typography.bodyMedium, fontWeight: '600' as const },
  rowSubtitle: { ...typography.caption },
  footer: { alignItems: 'center', paddingTop: spacing.lg },
  footerText: { ...typography.caption, fontWeight: '600' },
});
