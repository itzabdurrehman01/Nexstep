import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Briefcase, Users, Plus, CheckCircle2, Search } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function RecruiterPortalScreen() {
  const { dark, colors: c } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>EMPLOYER & RECRUITER SUITE</Text>
        <Text style={[styles.title, { color: c.text }]}>Recruiter Portal</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Post job opportunities, evaluate candidate skill match scores, and hire top Pakistani graduate talent.
        </Text>
      </Animated.View>

      {/* Recruiter Stats */}
      <View style={styles.grid2}>
        <Card dark={dark} elevated style={{ flex: 1, padding: Spacing.lg }}>
          <Text style={[styles.statNum, { color: Colors.primary }]}>8</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Active Job Listings</Text>
        </Card>
        <Card dark={dark} elevated style={{ flex: 1, padding: Spacing.lg }}>
          <Text style={[styles.statNum, { color: Colors.accent }]}>42</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Applicants Received</Text>
        </Card>
      </View>

      {/* Quick Action */}
      <Button
        title="Post New Job Opportunity"
        onPress={() => Alert.alert('Post Job', 'Opening job creation modal.')}
      />

      {/* Applicants Management */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Recent Applicants</Text>

        {[
          { name: 'Ali Raza', role: 'Junior React Native Developer', match: '94% Skill Match', exp: 'FAST-NUCES BS CS' },
          { name: 'Fatima Noor', role: 'Frontend Web Developer', match: '88% Skill Match', exp: 'NUST BS SE' },
          { name: 'Zainab Bibi', role: 'Data Analyst Intern', match: '82% Skill Match', exp: 'COMSATS BS CS' },
        ].map((app, i) => (
          <View key={i} style={[styles.appRow, { backgroundColor: c.surface2 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appName, { color: c.text }]}>{app.name}</Text>
              <Text style={[styles.appRole, { color: c.muted }]}>{app.role} · {app.exp}</Text>
            </View>
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{app.match}</Text>
            </View>
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
  grid2: { flexDirection: 'row', gap: Spacing.md },
  statNum: { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  appRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, marginBottom: 4 },
  appName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  appRole: { fontSize: FontSize.xs, marginTop: 2 },
  matchBadge: { backgroundColor: Colors.primary + '25', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.md },
  matchText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.extrabold },
});
