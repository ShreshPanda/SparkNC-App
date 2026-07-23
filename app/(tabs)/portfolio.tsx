import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { EmptyState } from '../../components/EmptyState';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService, type PortfolioRecord, type PortfolioSummary } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';

export default function PortfolioScreen() {
  const { colors } = useTheme();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Portfolio">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  const p = portfolio ?? {
    xp: 0,
    streak: 0,
    projects: [],
    goals: [],
    achievements: [],
    events: [],
    skills: [],
    certificates: [],
    leadership: [],
    community: [],
    volunteer: [],
    badges: [],
    reflections: [],
  };

  const hasAny =
    p.projects.length + p.goals.length + p.achievements.length + p.events.length + p.skills.length + p.certificates.length + p.leadership.length + p.community.length + p.volunteer.length + p.badges.length + p.reflections.length > 0;

  const sections = [
    { title: 'Projects', icon: 'folder-open-outline' as const, items: p.projects },
    { title: 'Goals completed', icon: 'flag-outline' as const, items: p.goals },
    { title: 'Achievements', icon: 'trophy-outline' as const, items: p.achievements },
    { title: 'Events attended', icon: 'calendar-outline' as const, items: p.events },
    { title: 'Skills', icon: 'hammer-outline' as const, items: p.skills },
    { title: 'Certificates', icon: 'ribbon-outline' as const, items: p.certificates },
    { title: 'Leadership', icon: 'people-outline' as const, items: p.leadership },
    { title: 'Community', icon: 'heart-outline' as const, items: p.community },
    { title: 'Volunteer Work', icon: 'hand-left-outline' as const, items: p.volunteer },
    { title: 'Badges', icon: 'shield-checkmark-outline' as const, items: p.badges },
    { title: 'Reflections', icon: 'chatbubble-ellipses-outline' as const, items: p.reflections },
  ].filter((s) => s.items.length > 0);

  return (
    <AppShell title="Portfolio">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <FadeIn delay={0}>
          <SparkCard style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Text style={[styles.heroTitle, { color: colors.card }]}>Your growth story</Text>
            <Text style={[styles.heroBody, { color: colors.muted }]}>
              {p.xp} XP · {p.streak}-day streak · {sections.length} sections
            </Text>
            <Text style={[styles.heroCaption, { color: colors.card }]}>
              {hasAny ? 'Everything you have accomplished and become.' : 'Start completing tasks and goals to build a portfolio you are proud to share.'}
            </Text>
          </SparkCard>
        </FadeIn>

        {!hasAny ? (
          <EmptyState
            title="Your portfolio is ready to grow"
            message="Finish tasks, goals, and events to show your progress here."
            icon="briefcase-outline"
          />
        ) : (
          <>
            {sections.map((s, i) => (
              <FadeIn key={s.title} delay={80 + i * 40}>
                <Section title={s.title} icon={s.icon} items={s.items} colors={colors} />
              </FadeIn>
            ))}
          </>
        )}

        <FadeIn delay={500}>
          <SparkButton title="Refresh" onPress={load} variant="primary" />
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

function Section({ title, icon, items, colors }: { title: string; icon: React.ComponentProps<typeof Ionicons>['name']; items: PortfolioRecord[]; colors: any }) {
  const isTags = title === 'Skills' || title === 'Badges';
  return (
    <SparkCard style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={20} color={colors.accent} />
          <Text style={[styles.heading, { color: colors.foreground }]}>{title}</Text>
        </View>
        <View style={[styles.countPill, { backgroundColor: colors.highlight }]}>
          <Text style={[styles.countText, { color: colors.foreground }]}>{items.length}</Text>
        </View>
      </View>
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>Nothing here yet.</Text>
      ) : isTags ? (
        <View style={styles.tagRow}>
          {items.map((item) => (
            <View key={`${item.type}-${item.title}`} style={[styles.tag, { backgroundColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.foreground }]}>{item.title}</Text>
            </View>
          ))}
        </View>
      ) : (
        items.map((item) => (
          <View key={`${item.type}-${item.title}`} style={styles.item}>
            <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
            {item.description ? <Text style={[styles.itemDesc, { color: colors.muted }]}>{item.description}</Text> : null}
            {item.date ? <Text style={[styles.itemDate, { color: colors.muted }]}>{new Date(item.date).toLocaleDateString()}</Text> : null}
          </View>
        ))
      )}
    </SparkCard>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { padding: spacing.xl, borderRadius: 24, gap: spacing.sm },
  heroTitle: { ...typography.title, fontSize: 28 },
  heroBody: { ...typography.body },
  heroCaption: { ...typography.caption },
  section: { padding: spacing.md, borderRadius: 20, gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heading: { ...typography.heading },
  countPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 999, minWidth: 28, alignItems: 'center' },
  countText: { ...typography.caption, fontWeight: '700' },
  empty: { ...typography.body },
  item: { paddingVertical: spacing.xs },
  itemTitle: { ...typography.body, fontWeight: '600' },
  itemDesc: { ...typography.body },
  itemDate: { ...typography.caption },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 999 },
  tagText: { ...typography.caption },
  error: { ...typography.body },
});
