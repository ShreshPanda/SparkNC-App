import React from 'react';
import { Pressable, Vibration, type PressableProps } from 'react-native';

interface HapticPressableProps extends PressableProps {
  feedbackMs?: number;
}

export function HapticPressable({ onPressIn, feedbackMs = 30, children, ...rest }: HapticPressableProps) {
  return (
    <Pressable
      onPressIn={(e) => {
        Vibration.vibrate(feedbackMs);
        onPressIn?.(e);
      }}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
