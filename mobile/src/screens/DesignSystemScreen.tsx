import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Layers, Palette, Type, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function DesignSystemScreen() {
  const { dark, colors: c } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>MOBILE DESIGN TOKENS</Text>
        <Text style={[styles.title, { color: c.text }]}>Design System</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          React Native component library, color tokens, and typography scale matching NexStep Web.
        </Text>
      </Animated.View>

      {/* Colors Showcase */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Brand Color Tokens</Text>
        <View style={styles.colorGrid}>
          {[
            { name: 'Primary Emerald', hex: Colors.primary },
            { name: 'Accent Violet', hex: Colors.accent },
            { name: 'Gold Highlight', hex: Colors.gold },
            { name: 'Danger Red', hex: Colors.danger },
          ].map((col, i) => (
            <View key={i} style={[styles.colorBox, { backgroundColor: col.hex }]}>
              <Text style={{ color: '#06110d', fontSize: FontSize.xs, fontWeight: FontWeight.extrabold }}>{col.name}</Text>
              <Text style={{ color: '#06110d', fontSize: 10 }}>{col.hex}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Components Showcase */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Button Variants</Text>
        <Button title="Primary Button" onPress={() => {}} variant="primary" />
        <Button title="Secondary Button" onPress={() => {}} variant="secondary" />
        <Button title="Outline Button" onPress={() => {}} variant="outline" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingBottom: 60, gap: Spacing.lg },
  header: { gap: Spacing.xs },
  eyebrow: { color: Colors.primary, fontSize: FontSize.xs, letterSpacing: 1.2, fontWeight: FontWeight.extrabold },
  title: { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.sm, lineHeight: 20 },
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  colorBox: { width: '48%', padding: Spacing.md, borderRadius: Radius.lg, gap: 2 },
});
