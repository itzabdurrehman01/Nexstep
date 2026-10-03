import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Columns, Scale, CheckCircle2, TrendingUp, DollarSign, Clock } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';

const CAREERS_LIST = [
  { id: 'se', title: 'Software Engineer', entrySalary: 'PKR 100,000/mo', growthRate: '+25% High', workLife: '7 / 10', education: 'BS CS / SE', topSkills: 'Coding, Problem Solving, System Design' },
  { id: 'ds', title: 'Data Scientist / AI Specialist', entrySalary: 'PKR 120,000/mo', growthRate: '+32% Ultra High', workLife: '8 / 10', education: 'BS CS / Math / AI', topSkills: 'Python, Machine Learning, SQL, Statistics' },
  { id: 'doctor', title: 'Medical Doctor (MBBS)', entrySalary: 'PKR 75,000/mo (House Job)', growthRate: 'Stable / High Demand', workLife: '4 / 10 (Demanding)', education: 'MBBS + FCPS / USMLE', topSkills: 'Clinical Diagnosis, Patient Care, Biology' },
  { id: 'ca', title: 'Chartered Accountant (CA)', entrySalary: 'PKR 90,000/mo (Articles)', growthRate: '+20% High', workLife: '5 / 10 (Busy Season)', education: 'ICAP CA Qualification', topSkills: 'Financial Audit, Tax Law, IFRS Rules' },
];

export function CareerComparisonScreen() {
  const { dark, colors: c } = useTheme();
  const [careerA, setCareerA] = useState(CAREERS_LIST[0]);
  const [careerB, setCareerB] = useState(CAREERS_LIST[1]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>SIDE-BY-SIDE ANALYTICS</Text>
        <Text style={[styles.title, { color: c.text }]}>Career Comparison Tool</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Compare salary trends, growth projections, work-life balance, and required skills side by side.
        </Text>
      </Animated.View>

      {/* Selectors */}
      <View style={styles.selectorRow}>
        <Card dark={dark} style={{ flex: 1, padding: Spacing.md }}>
          <Text style={[styles.selectLabel, { color: c.muted }]}>Career 1</Text>
          <Text style={[styles.selectVal, { color: Colors.primary }]}>{careerA.title}</Text>
        </Card>
        <Card dark={dark} style={{ flex: 1, padding: Spacing.md }}>
          <Text style={[styles.selectLabel, { color: c.muted }]}>Career 2</Text>
          <Text style={[styles.selectVal, { color: Colors.accent }]}>{careerB.title}</Text>
        </Card>
      </View>

      {/* Side-by-side comparison table */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.tableTitle, { color: c.text }]}>Comparison Breakdown</Text>

        <View style={styles.row}>
          <Text style={[styles.cellHeader, { color: c.muted }]}>Metric</Text>
          <Text style={[styles.cellVal, { color: Colors.primary }]}>{careerA.title}</Text>
          <Text style={[styles.cellVal, { color: Colors.accent }]}>{careerB.title}</Text>
        </View>

        <View style={[styles.row, { backgroundColor: c.surface2 }]}>
          <Text style={[styles.cellHeader, { color: c.text }]}>💵 Entry Salary</Text>
          <Text style={[styles.cellVal, { color: c.text }]}>{careerA.entrySalary}</Text>
          <Text style={[styles.cellVal, { color: c.text }]}>{careerB.entrySalary}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.cellHeader, { color: c.text }]}>📈 Growth Rate</Text>
          <Text style={[styles.cellVal, { color: c.text }]}>{careerA.growthRate}</Text>
          <Text style={[styles.cellVal, { color: c.text }]}>{careerB.growthRate}</Text>
        </View>

        <View style={[styles.row, { backgroundColor: c.surface2 }]}>
          <Text style={[styles.cellHeader, { color: c.text }]}>⚖️ Work-Life Balance</Text>
          <Text style={[styles.cellVal, { color: c.text }]}>{careerA.workLife}</Text>
          <Text style={[styles.cellVal, { color: c.text }]}>{careerB.workLife}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.cellHeader, { color: c.text }]}>🎓 Education</Text>
          <Text style={[styles.cellVal, { color: c.text }]}>{careerA.education}</Text>
          <Text style={[styles.cellVal, { color: c.text }]}>{careerB.education}</Text>
        </View>
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
  selectorRow: { flexDirection: 'row', gap: Spacing.md },
  selectLabel: { fontSize: FontSize.xs },
  selectVal: { fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, marginTop: 2 },
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.sm },
  tableTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  row: { flexDirection: 'row', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm, borderRadius: Radius.md, alignItems: 'center' },
  cellHeader: { flex: 1, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  cellVal: { flex: 1, fontSize: FontSize.xs, textAlign: 'center' },
});
