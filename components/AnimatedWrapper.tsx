import React, { useEffect } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, useReducedMotion } from 'react-native-reanimated';

interface FadeInProps extends ViewProps {
  delay?: number;
  children: React.ReactNode;
}

export function FadeIn({ children, delay = 0, style, ...rest }: FadeInProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 12);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, [opacity, translateY, delay, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]} {...rest}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
