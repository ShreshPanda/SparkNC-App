// SparkNC Glow
// Simple circular glow for heroes and progress rings.

import React from 'react';
import { View } from 'react-native';

interface SparkGlowProps {
  size: number;
  color: string;
  opacity?: number;
}

export function SparkGlow({ size, color, opacity = 0.25 }: SparkGlowProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
      }}
      pointerEvents="none"
    />
  );
}
