// SparkNC Shimmer
// Theme-aware placeholder shimmer for hero and metric areas.

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '../providers/ThemeProvider';

interface SparkShimmerProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
}

export function SparkShimmer({ width = '100%', height = 16, borderRadius = 8 }: SparkShimmerProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(-300);

  useEffect(() => {
    translateX.value = withRepeat(withTiming(300, { duration: 1400 }), -1, true);
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { width, height, borderRadius, backgroundColor: colors.border },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shine,
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  shine: {
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
});
