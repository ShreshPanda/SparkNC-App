import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleProp, StyleSheet, Text, TextStyle, ViewProps } from 'react-native';

type AnimatedNumberProps = ViewProps & {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
};

export function AnimatedNumber({ value, duration = 900, prefix = '', suffix = '', style }: AnimatedNumberProps) {
  const display = useRef(new Animated.Value(0)).current;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    display.setValue(0);
    const listener = display.addListener(({ value: v }) => setCurrent(Math.round(v)));
    const animation = Animated.timing(display, { toValue: value, duration, useNativeDriver: true });
    animation.start();
    return () => display.removeListener(listener);
  }, [value, duration, display]);

  return (
    <Text style={style}>
      {prefix}
      {current}
      {suffix}
    </Text>
  );
}

const styles = StyleSheet.create({});
