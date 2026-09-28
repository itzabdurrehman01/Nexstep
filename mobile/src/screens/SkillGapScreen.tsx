import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Target, CheckCircle2, AlertCircle, ArrowRight, BookOpen, Sparkles } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const SparklesIcon: any = Sparkles;

interface SkillItem {
  name: string;
  category: string;
  status: 'acquired' | 'missing' | 'in_progress';
}

const TARGET_ROLES = [
  {
    title: 'Full-Stack Software Engineer',
    matchPct: 72,
    skills: [
      { name: 'JavaScript / TypeScript', category: 'Programming Language', status: 'acquired' },
      { name: 'React.js & React Native', category: 'Frontend', status: 'acquired' },
      { name: 'Node.js / Express API', category: 'Backend', status: 'acquired' },
      { name: 'Docker & Kubernetes', category: 'DevOps & Cloud', status: 'missing' },
      { name: 'PostgreSQL & Redis', category: 'Database', status: 'in_progress' },
      { name: 'System Design & Architecture', category: 'Core CS', status: 'missing' },
    ] as SkillItem[],
    recommendations: [
      'Complete Docker & Containerization 3-hour micro-course.',
      'Practice PostgreSQL indexing and query optimization exercises.',
      'Build a distributed caching side project using Redis.',
    ]
  },
  {
    title: 'AI / Machine Learning Engineer',
    matchPct: 58,
    skills: [
      { name: 'Python Programming', category: 'Core', status: 'acquired' },
      { name: 'PyTorch & TensorFlow', category: 'Deep Learning', status: 'missing' },
      { name: 'Linear Algebra & Calculus', category: 'Mathematics', status: 'acquired' },
      { name: 'MLops & Model Deployment', category: 'DevOps', status: 'missing' },
      { name: 'Scikit-Learn & Pandas', category: 'Data Analysis', status: 'in_progress' },
    ] as SkillItem[],
    recommendations: [
      'Enroll in Andrew Ng Deep Learning Specialization.',
      'Train and deploy a fine-tuned LLM on Hugging Face.',
    ]
  }
];

export function SkillGapScreen() {
  const { dark, colors: c } = useTheme();
  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>AI-POWERED MATCHING</Text>
        <Text style={[styles.title, { color: c.text }]}>Skill Gap Analyzer</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Benchmark your current skills against industry standard target job requirements.
        </Text>
      </Animated.View>

      {/* Target Role Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {TARGET_ROLES.map((r, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setSelectedRole(r)}
            style={[styles.chip, { backgroundColor: selectedRole.title === r.title ? Colors.primary : c.surface2 }]}
          >
            <Text style={[styles.chipText, { color: selectedRole.title === r.title ? '#06110d' : c.text }]}>{r.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Score Readiness Gauge */}
      <Card dark={dark} elevated style={styles.card}>
        <View style={styles.scoreRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Job Readiness Score</Text>
            <Text style={[styles.scoreDesc, { color: c.muted }]}>Match score for {selectedRole.title}</Text>
          </View>
          <View style={[styles.scoreCircle, { backgroundColor: Colors.primary + '25' }]}>
            <Text style={[styles.scoreNumber, { color: Colors.primary }]}>{selectedRole.matchPct}%</Text>
          </View>
        </View>

        <Text style={[styles.sectionHeading, { color: c.text }]}>Required Skill Matrix</Text>
        {selectedRole.skills.map((sk, index) => (
          <View key={index} style={[styles.skillRow, { backgroundColor: c.surface2 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.skillName, { color: c.text }]}>{sk.name}</Text>
              <Text style={[styles.skillCat, { color: c.muted }]}>{sk.category}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: sk.status === 'acquired' ? Colors.success + '20' : sk.status === 'in_progress' ? Colors.warning + '20' : Colors.danger + '20',
              }
            ]}>
              <Text style={{
                color: sk.status === 'acquired' ? Colors.success : sk.status === 'in_progress' ? Colors.warning : Colors.danger,
                fontSize: FontSize.xs,
                fontWeight: FontWeight.extrabold,
                textTransform: 'capitalize'
              }}>
                {sk.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Action Plan */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Recommended Action Plan</Text>
        {selectedRole.recommendations.map((rec, i) => (
          <View key={i} style={styles.actionRow}>
            <SparklesIcon size={16} color={Colors.primary} />
            <Text style={[styles.actionText, { color: c.text }]}>{rec}</Text>
          </View>
        ))}
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
  chipRow: { flexDirection: 'row', gap: Spacing.xs },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.md },
  chipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.sm },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  scoreDesc: { fontSize: FontSize.xs },
  scoreCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  scoreNumber: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  sectionHeading: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
  skillRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, marginBottom: 4 },
  skillName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  skillCat: { fontSize: FontSize.xs },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginTop: 4 },
  actionText: { fontSize: FontSize.xs, flex: 1, lineHeight: 18 },
});
