import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Colors, Radius, Spacing } from '../utils/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  glowColor?: string;
}

export function AnimatedCard3D({ children, style, delay = 0, glowColor }: Props) {
  const { dark, colors: c } = useTheme();
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  const handleTouchStart = () => {
    rotateX.value = withSpring(-4, { damping: 12 });
    rotateY.value = withSpring(3, { damping: 12 });
    scale.value = withSpring(0.98);
  };

  const handleTouchEnd = () => {
    rotateX.value = withTiming(0, { duration: 250 });
    rotateY.value = withTiming(0, { duration: 250 });
    scale.value = withTiming(1, { duration: 250 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(350)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
          shadowColor: glowColor || (dark ? Colors.primary : '#000000'),
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
});
