// SparkNC Divider
// A subtle hairline divider that respects theme.

import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

interface SparkDividerProps {
  inset?: boolean;
  opacity?: number;
}

export function SparkDivider({ inset = false, opacity = 1 }: SparkDividerProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        opacity,
        marginLeft: inset ? 72 : 0,
        marginRight: inset ? 0 : 0,
      }}
    />
  );
}
