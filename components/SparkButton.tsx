import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, Vibration, type PressableProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, spark, typography } from '../theme';

type SparkButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'muted';

interface SparkButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: SparkButtonVariant;
  loading?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SparkButton({ title, variant = 'primary', loading, disabled, onPress, ...rest }: SparkButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const variantStyles = {
    primary: { bg: colors.brand ?? colors.primary, text: spark.white },
    secondary: { bg: colors.highlight, text: colors.foreground },
    success: { bg: colors.success, text: spark.white },
    danger: { bg: colors.error, text: spark.white },
    muted: { bg: colors.surfaceSubtle ?? colors.border, text: colors.muted },
  }[variant];

  const animate = (to: number) => {
    Animated.spring(scale, { toValue: to, useNativeDriver: true, friction: 6, tension: 120 }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        Vibration.vibrate(30);
        animate(0.96);
      }}
      onPressOut={() => animate(1)}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: variantStyles.bg, opacity: disabled ? 0.5 : 1, transform: [{ scale }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: variantStyles.text }]}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  text: { ...typography.label, fontSize: 16 },
});
