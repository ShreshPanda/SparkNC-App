// SparkNC Avatar
// Circle avatar with initials or image, plus optional status dot.

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

interface SparkAvatarProps {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'offline' | 'busy';
}

const SIZES = { sm: 32, md: 44, lg: 64, xl: 96 };

export function SparkAvatar({ name, image, size = 'md', status }: SparkAvatarProps) {
  const { colors } = useTheme();
  const dimension = SIZES[size];
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statusColor = {
    online: colors.success,
    away: colors.warning,
    busy: colors.error,
    offline: colors.muted,
  }[status ?? 'online'];

  return (
    <View style={{ width: dimension, height: dimension }}>
      <View
        style={[
          styles.circle,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: colors.primarySoft,
          },
        ]}
      >
        {image ? (
          <Image source={{ uri: image }} style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }} />
        ) : (
          <Text style={[styles.text, { color: colors.primary, fontSize: dimension / 2.5 }]}>{initials}</Text>
        )}
      </View>
      {status ? (
        <View
          style={[
            styles.dot,
            { backgroundColor: statusColor, borderColor: colors.surface },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: { ...typography.title2 },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
