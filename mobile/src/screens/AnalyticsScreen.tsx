import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart3, TrendingUp, Award, CheckCircle2, Zap } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';

export function AnalyticsScreen() {
  const { dark, colors: c } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>PROGRESS & PERFORMANCE REPORT</Text>
        <Text style={[styles.title, { color: c.text }]}>Career Analytics</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Track your skill growth, RIASEC Holland Code breakdown, and job market readiness index.
        </Text>
      </Animated.View>

      {/* Main Readiness Card */}
      <Card dark={dark} elevated style={styles.card}>
        <View style={styles.readinessHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Career Readiness Score</Text>
            <Text style={[styles.cardSub, { color: c.muted }]}>Based on skills, marks, and RIASEC assessment</Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: Colors.primary + '25' }]}>
            <Text style={[styles.scoreVal, { color: Colors.primary }]}>82%</Text>
          </View>
        </View>
      </Card>

      {/* RIASEC Profile Breakdown */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>RIASEC Holland Code Profile</Text>

        {[
          { code: 'Investigative (I)', pct: '88%', barColor: Colors.primary },
          { code: 'Realistic (R)', pct: '76%', barColor: Colors.accent },
          { code: 'Artistic (A)', pct: '65%', barColor: Colors.gold },
          { code: 'Social (S)', pct: '60%', barColor: Colors.info },
          { code: 'Enterprising (E)', pct: '70%', barColor: Colors.warning },
          { code: 'Conventional (C)', pct: '55%', barColor: c.muted },
        ].map((item, i) => (
          <View key={i} style={styles.riasecRow}>
            <View style={styles.riasecLabelRow}>
              <Text style={[styles.riasecText, { color: c.text }]}>{item.code}</Text>
              <Text style={[styles.riasecPct, { color: item.barColor }]}>{item.pct}</Text>
            </View>
            <View style={[styles.barBg, { backgroundColor: c.surface2 }]}>
              <View style={[styles.barFill, { width: item.pct as any, backgroundColor: item.barColor }]} />
            </View>
          </View>
        ))}
      </Card>

      {/* Application Stats */}
      <View style={styles.grid2}>
        <Card dark={dark} elevated style={{ flex: 1, padding: Spacing.lg, gap: 4 }}>
          <Text style={[styles.statNum, { color: Colors.primary }]}>14</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Courses Completed</Text>
        </Card>
        <Card dark={dark} elevated style={{ flex: 1, padding: Spacing.lg, gap: 4 }}>
          <Text style={[styles.statNum, { color: Colors.accent }]}>6</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Job Applications</Text>
        </Card>
      </View>
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
  readinessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  cardSub: { fontSize: FontSize.xs, marginTop: 2 },
  scoreBadge: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  scoreVal: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  riasecRow: { gap: 4, marginVertical: 2 },
  riasecLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  riasecText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  riasecPct: { fontSize: FontSize.xs, fontWeight: FontWeight.extrabold },
  barBg: { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: Radius.full },
  grid2: { flexDirection: 'row', gap: Spacing.md },
  statNum: { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
