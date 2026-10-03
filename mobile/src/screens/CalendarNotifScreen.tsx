import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar, Bell, Clock, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';

const UPCOMING_DEADLINES = [
  { id: '1', title: 'FAST-NUCES Fall 2026 Admissions Closing', category: 'University Admissions', date: 'August 28, 2026', daysLeft: '13 Days Left', urgency: 'high' },
  { id: '2', title: 'Ehsaas Undergraduate Scholarship Application', category: 'Scholarship', date: 'October 30, 2026', daysLeft: '76 Days Left', urgency: 'normal' },
  { id: '3', title: 'NUST NET-4 Entry Test Registration', category: 'Entrance Test', date: 'September 15, 2026', daysLeft: '31 Days Left', urgency: 'normal' },
];

export function CalendarNotifScreen() {
  const { dark, colors: c } = useTheme();
  const [admissionAlerts, setAdmissionAlerts] = useState(true);
  const [scholarshipAlerts, setScholarshipAlerts] = useState(true);
  const [examReminders, setExamReminders] = useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>ACADEMIC TRACKER & NOTIFICATIONS</Text>
        <Text style={[styles.title, { color: c.text }]}>Calendar & Alerts</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Never miss an important university admission deadline, test date, or scholarship window.
        </Text>
      </Animated.View>

      {/* Deadlines list */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Upcoming Deadlines</Text>
        {UPCOMING_DEADLINES.map((item) => (
          <View key={item.id} style={[styles.deadlineRow, { backgroundColor: c.surface2 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dTitle, { color: c.text }]}>{item.title}</Text>
              <Text style={[styles.dCat, { color: c.muted }]}>{item.category} · {item.date}</Text>
            </View>
            <View style={[styles.daysBadge, { backgroundColor: item.urgency === 'high' ? Colors.danger + '20' : Colors.primary + '20' }]}>
              <Text style={{ color: item.urgency === 'high' ? Colors.danger : Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.extrabold }}>{item.daysLeft}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Notification Preferences */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Push Notification Settings</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.switchLabel, { color: c.text }]}>University Admission Reminders</Text>
            <Text style={[styles.switchDesc, { color: c.muted }]}>Alerts 3 days before cutoff</Text>
          </View>
          <Switch value={admissionAlerts} onValueChange={setAdmissionAlerts} trackColor={{ false: c.border, true: Colors.primary }} />
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.switchLabel, { color: c.text }]}>Scholarship Deadline Alerts</Text>
            <Text style={[styles.switchDesc, { color: c.muted }]}>Closing date notifications</Text>
          </View>
          <Switch value={scholarshipAlerts} onValueChange={setScholarshipAlerts} trackColor={{ false: c.border, true: Colors.primary }} />
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.switchLabel, { color: c.text }]}>Exam & ECAT Test Dates</Text>
            <Text style={[styles.switchDesc, { color: c.muted }]}>Roll number & center alerts</Text>
          </View>
          <Switch value={examReminders} onValueChange={setExamReminders} trackColor={{ false: c.border, true: Colors.primary }} />
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
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  deadlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, marginBottom: 4 },
  dTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  dCat: { fontSize: FontSize.xs, marginTop: 2 },
  daysBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.md },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  switchLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  switchDesc: { fontSize: FontSize.xs },
});
