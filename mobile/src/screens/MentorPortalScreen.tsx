import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { UserCheck, Calendar, Clock, MessageSquare, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function MentorPortalScreen() {
  const { dark, colors: c } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>MENTOR MANAGEMENT DASHBOARD</Text>
        <Text style={[styles.title, { color: c.text }]}>Mentor Portal</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Manage upcoming 1-on-1 counseling sessions, review student questions, and update availability.
        </Text>
      </Animated.View>

      <View style={styles.grid2}>
        <Card dark={dark} elevated style={{ flex: 1, padding: Spacing.lg }}>
          <Text style={[styles.statNum, { color: Colors.primary }]}>5</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Upcoming Sessions</Text>
        </Card>
        <Card dark={dark} elevated style={{ flex: 1, padding: Spacing.lg }}>
          <Text style={[styles.statNum, { color: Colors.gold }]}>4.9</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Student Rating</Text>
        </Card>
      </View>

      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Upcoming Student Sessions</Text>

        {[
          { student: 'Usman Ghani', topic: 'F.Sc Pre-Eng to BS CS Transition', time: 'Tomorrow at 5:00 PM PKT' },
          { student: 'Maham Tariq', topic: 'Scholarship Application Review', time: 'Saturday at 2:00 PM PKT' },
        ].map((s, i) => (
          <View key={i} style={[styles.sessRow, { backgroundColor: c.surface2 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sStudent, { color: c.text }]}>{s.student}</Text>
              <Text style={[styles.sTopic, { color: Colors.primary, fontWeight: FontWeight.bold }]}>{s.topic}</Text>
              <Text style={[styles.sTime, { color: c.muted }]}>⏰ {s.time}</Text>
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
  sessRow: { padding: Spacing.md, borderRadius: Radius.lg, marginBottom: 4 },
  sStudent: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  sTopic: { fontSize: FontSize.xs, marginTop: 2 },
  sTime: { fontSize: FontSize.xs, marginTop: 2 },
});
