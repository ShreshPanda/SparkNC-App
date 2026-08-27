import React from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

type SparkListRowProps = Omit<PressableProps, 'style'> & {
  title: string;
  subtitle?: string;
  detail?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconBackground?: string;
  iconColor?: string;
  showChevron?: boolean;
  badge?: string;
  badgeColor?: string;
  onPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SparkListRow({
  title,
  subtitle,
  detail,
  icon,
  iconBackground,
  iconColor,
  showChevron = true,
  badge,
  badgeColor,
  onPress,
  ...rest
}: SparkListRowProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: pressed.value > 0 ? colors.primarySoft : 'transparent',
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.99, { damping: 20, stiffness: 200 });
        pressed.value = withSpring(1, { damping: 20, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 200 });
        pressed.value = withSpring(0, { damping: 20, stiffness: 200 });
      }}
      style={[styles.pressable, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...rest}
    >
      <View style={styles.row}>
        {icon ? (
          <View style={[styles.iconPill, { backgroundColor: iconBackground ?? colors.primarySoft }]}>
            <Ionicons name={icon} size={20} color={iconColor ?? colors.primary} />
          </View>
        ) : null}
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <View style={styles.trailing}>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: badgeColor ?? colors.successSoft }]}>
              <Text style={[styles.badgeText, { color: badgeColor ? colors.foreground : colors.success }]} numberOfLines={1}>{badge}</Text>
            </View>
          ) : null}
          {detail ? <Text style={[styles.detail, { color: colors.muted }]} numberOfLines={1}>{detail}</Text> : null}
          {showChevron ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressable: { minHeight: 56, justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2, justifyContent: 'center' },
  title: { ...typography.headline },
  subtitle: { ...typography.subheadline },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detail: { ...typography.footnote },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption1 },
});
