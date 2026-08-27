import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { EmptyPortfolioIllustration } from '../../components/visual/EmptyIllustration';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
import { SparkSection } from '../../components/SparkSection';
import { SparkAvatar } from '../../components/SparkAvatar';
import { SparkBadge } from '../../components/SparkBadge';
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
      <AppShell title="Portfolio" overline="YOUR STORY" mode="editorial">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
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
    <AppShell title="Portfolio" overline="YOUR STORY" mode="editorial">
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
          <SparkEmptyState
            illustration={<EmptyPortfolioIllustration />}
            title="Your portfolio is ready to grow"
            message="Finish tasks, goals, and events to show your progress here."
            action={{ label: 'Refresh', onPress: load }}
          />
        ) : (
          <>
            {sections.map((s, i) => (
              <FadeIn key={s.title} delay={80 + i * 40}>
                <SparkSection title={s.title} inset={false}>
                  <SparkCard variant="grouped" style={styles.sectionCard}>
                    <SectionContent title={s.title} icon={s.icon} items={s.items} />
                  </SparkCard>
                </SparkSection>
              </FadeIn>
            ))}
          </>
        )}

        <FadeIn delay={500}>
          <SparkButton title="Refresh" onPress={load} variant="secondary" />
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

function SectionContent({ title, icon, items }: { title: string; icon: React.ComponentProps<typeof Ionicons>['name']; items: PortfolioRecord[] }) {
  const { colors } = useTheme();
  const isTags = title === 'Skills' || title === 'Badges';
  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={20} color={colors.primary} />
          <Text style={[styles.heading, { color: colors.foreground }]}>{title}</Text>
        </View>
        <SparkBadge label={`${items.length}`} color={colors.primary} size="sm" />
      </View>
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>Nothing here yet.</Text>
      ) : isTags ? (
        <View style={styles.tagRow}>
          {items.map((item) => (
            <SparkBadge key={`${item.type}-${item.title}`} label={item.title} color={colors.border} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { padding: spacing.xl, borderRadius: 24, gap: spacing.sm },
  heroTitle: { ...typography.title1 },
  heroBody: { ...typography.body },
  heroCaption: { ...typography.footnote },
  sectionCard: { padding: spacing.md, borderRadius: 20, gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heading: { ...typography.title3 },
  empty: { ...typography.body },
  item: { paddingVertical: spacing.xs },
  itemTitle: { ...typography.headline },
  itemDesc: { ...typography.body },
  itemDate: { ...typography.footnote },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { ...typography.body },
});
