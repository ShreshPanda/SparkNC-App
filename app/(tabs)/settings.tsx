import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { SparkCard } from '../../components/SparkCard';
import { SparkListRow } from '../../components/SparkListRow';
import { usePresentation } from '../../providers/PresentationProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { authService } from '../../services/authService';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { NotificationPreference } from '../../shared/types';

const defaultPrefs: NotificationPreference = {
  sendDeadlines: true,
  sendStreakAlerts: true,
  sendEvents: true,
  sendMessages: true,
  sendRecommendations: true,
  quietHoursStart: 22,
  quietHoursEnd: 8,
  timezone: 'America/New_York',
};

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { enabled: presentationMode, toggle: togglePresentation } = usePresentation();
  const [prefs, setPrefs] = useState<NotificationPreference>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getNotificationPreferences();
      setPrefs({ ...defaultPrefs, ...data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(update: Partial<NotificationPreference>) {
    const next = { ...prefs, ...update };
    setPrefs(next);
    try {
      setSaving(true);
      setSaved(false);
      await cloudflareService.updateNotificationPreferences(update);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try {
      await authService.signOut();
    } finally {
      // Navigation will redirect through auth gate on next render.
    }
  }

  function toggle(field: keyof NotificationPreference) {
    return (value: boolean) => save({ [field]: value });
  }

  if (loading) {
    return (
      <AppShell title="Settings" overline="ACCOUNT" mode="clean">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  const notificationOptions: { label: string; field: keyof NotificationPreference }[] = [
    { label: 'Deadline reminders', field: 'sendDeadlines' },
    { label: 'Streak alerts', field: 'sendStreakAlerts' },
    { label: 'Event updates', field: 'sendEvents' },
    { label: 'Message alerts', field: 'sendMessages' },
    { label: 'Recommendations', field: 'sendRecommendations' },
  ];

  return (
    <AppShell title="Settings">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
        {saved ? <Text style={[styles.success, { color: colors.success }]}>Saved</Text> : null}
        {saving ? <Text style={[styles.footnote, { color: colors.muted }]}>Saving…</Text> : null}

        <SparkCard variant="grouped">
          <Text style={[styles.heading, { color: colors.foreground }]}>Notification Preferences</Text>
          {notificationOptions.map((opt, index) => (
            <React.Fragment key={opt.field}>
              <ToggleRow label={opt.label} value={prefs[opt.field] as boolean} onValueChange={toggle(opt.field)} colors={colors} />
              {index < notificationOptions.length - 1 ? <View style={[styles.separator, { backgroundColor: colors.border }]} /> : null}
            </React.Fragment>
          ))}
        </SparkCard>

        <SparkCard variant="grouped">
          <Text style={[styles.heading, { color: colors.foreground }]}>Presentation</Text>
          <ToggleRow
            label="Presentation mode"
            value={presentationMode}
            onValueChange={togglePresentation}
            colors={colors}
          />
          <Text style={[styles.caption, { color: colors.muted }]}>
            Enlarges headers and hides navigation while presenting.
          </Text>
        </SparkCard>

        <SparkCard variant="grouped">
          <Text style={[styles.heading, { color: colors.foreground }]}>Account</Text>
          <SparkListRow
            title="Sign out"
            icon="log-out-outline"
            iconColor={colors.error}
            iconBackground={colors.errorSoft}
            showChevron={false}
            onPress={logout}
          />
        </SparkCard>
      </ScrollView>
    </AppShell>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  colors,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: any;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.body, { color: colors.foreground }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} thumbColor={colors.primary} trackColor={{ false: colors.border, true: colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { ...typography.title2, padding: spacing.lg, paddingBottom: spacing.md },
  body: { ...typography.body },
  footnote: { ...typography.footnote },
  caption: { ...typography.footnote, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg },
  success: { ...typography.footnote },
  error: { ...typography.footnote },
});
