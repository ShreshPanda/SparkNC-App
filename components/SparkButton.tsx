import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle, type PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

type SparkButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'muted' | 'link';

interface SparkButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: SparkButtonVariant;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SparkButton({
  title,
  variant = 'primary',
  loading,
  disabled,
  icon,
  style,
  onPress,
  ...rest
}: SparkButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const variantStyles = {
    primary: { bg: colors.primary, text: colors.surface, border: undefined },
    secondary: { bg: colors.surface, text: colors.foreground, border: colors.border },
    success: { bg: colors.success, text: colors.surface, border: undefined },
    danger: { bg: colors.error, text: colors.surface, border: undefined },
    muted: { bg: 'transparent', text: colors.muted, border: undefined },
    link: { bg: 'transparent', text: colors.primary, border: undefined },
  }[variant];

  const onPressIn = () => {
    scale.value = withSpring(0.97, { damping: 16, stiffness: 220 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 16, stiffness: 220 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        animatedStyle,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          borderWidth: variantStyles.border ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={variantStyles.text} /> : null}
          <Text style={[styles.text, { color: variantStyles.text }]}>{title}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: { ...typography.headline },
});
