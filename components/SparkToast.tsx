// SparkNC Toast
// Slide-up feedback toast.

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

type SparkToastVariant = 'success' | 'error' | 'info';

interface SparkToastProps {
  message: string;
  variant?: SparkToastVariant;
  onPress?: () => void;
}

export function SparkToast({ message, variant = 'info', onPress }: SparkToastProps) {
  const { colors } = useTheme();
  const translateY = useSharedValue(100);

  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const bg =
    variant === 'success'
      ? colors.success
      : variant === 'error'
      ? colors.error
      : colors.primary;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bg },
        animatedStyle,
      ]}
    >
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={message}>
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 100,
  },
  text: { ...typography.body, color: '#FFFFFF', textAlign: 'center' },
});
