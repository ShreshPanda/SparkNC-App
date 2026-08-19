import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ShimmerProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
}

export function Shimmer({ width, height, borderRadius = 8 }: ShimmerProps) {
  const translate = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translate, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translate]);

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: 'rgba(150,150,150,0.12)' }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{
              translateX: translate.interpolate({
                inputRange: [-1, 1],
                outputRange: [-200, 400],
              }),
            }],
            backgroundColor: 'rgba(255,255,255,0.32)',
            width: 120,
          },
        ]}
      />
    </View>
  );
}
