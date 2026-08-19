import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, Vibration, type PressableProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { colors as baseColors, spacing, typography } from '../theme';

type SparkButtonVariant = 'primary' | 'secondary' | 'danger' | 'muted';

interface SparkButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: SparkButtonVariant;
  loading?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SparkButton({ title, variant = 'primary', loading, disabled, onPress, ...rest }: SparkButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const backgroundColor = {
    primary: colors.accent,
    secondary: colors.highlight,
    danger: colors.error,
    muted: colors.muted,
  }[variant];

  const animate = (to: number) => {
    Animated.spring(scale, { toValue: to, useNativeDriver: true, friction: 6, tension: 120 }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        Vibration.vibrate(30);
        animate(0.94);
      }}
      onPressOut={() => animate(1)}
      disabled={disabled || loading}
      style={[styles.button, { backgroundColor, opacity: disabled ? 0.5 : 1, transform: [{ scale }] }]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      {...rest}
    >
      {loading ? <ActivityIndicator color={baseColors.white} size="small" /> : <Text style={styles.text}>{title}</Text>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 16, alignItems: 'center' },
  text: { color: baseColors.white, ...typography.body, fontWeight: '700' },
});
