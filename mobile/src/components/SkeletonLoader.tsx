import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Radius, Spacing } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = Radius.md, style }: Props) {
  const { dark, colors: c } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: dark ? '#1e293b' : '#e2e8f0',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const { colors: c } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.row}>
        <SkeletonLoader width={44} height={44} borderRadius={Radius.md} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonLoader width="70%" height={16} />
          <SkeletonLoader width="40%" height={12} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={12} />
      <SkeletonLoader width="90%" height={12} />
      <View style={[styles.row, { justifyContent: 'space-between', marginTop: 4 }]}>
        <SkeletonLoader width="30%" height={24} borderRadius={Radius.md} />
        <SkeletonLoader width="40%" height={24} borderRadius={Radius.md} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.md, marginVertical: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
});
