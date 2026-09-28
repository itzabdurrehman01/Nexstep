/**
 * mobile/src/screens/DashboardScreen.tsx
 * Home dashboard — shows readiness score, quick stats, and shortcuts.
 * Pure React Native — no WebView.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../api/careers';
import { Card } from '../components/Card';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

interface QuickAction { label: string; icon: string; route: string; color: string }

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Career AI',      icon: '🤖', route: 'career',        color: '#059669' },
  { label: 'Roadmap',        icon: '🗺️', route: 'roadmap',       color: '#2563eb' },
  { label: 'Grade 8/Matric', icon: '📚', route: 'grade8Matric',  color: '#10b981' },
  { label: 'F.Sc Mapper',    icon: '🧭', route: 'fscMapper',     color: '#7c3aed' },
  { label: 'Universities',   icon: '🏛️', route: 'universities',  color: '#0284c7' },
  { label: 'Scholarships',   icon: '🎓', route: 'scholarships',  color: '#f59e0b' },
  { label: 'Skill Gap',      icon: '📊', route: 'skillGap',      color: '#7c3aed' },
  { label: 'Resume AI',      icon: '📄', route: 'resume',        color: '#0891b2' },
  { label: 'Mock Interview', icon: '🎯', route: 'mockInterview', color: '#dc2626' },
  { label: 'AI Chatbot',     icon: '💬', route: 'chatbot',       color: '#10b981' },
  { label: 'All Services',   icon: '⚡', route: 'services',      color: '#7c3aed' },
];

interface Props { onNavigate: (route: string) => void }

export function DashboardScreen({ onNavigate }: Props) {
  const { user } = useAuth();
  const { dark, colors: c } = useTheme();

  const [profile,     setProfile]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const loadData = useCallback(async () => {
    try {
      const p = await fetchProfile();
      setProfile(p);
    } catch { /* use null profile */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Deterministic readiness score from profile completeness
  const readiness = (() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.preferredStream)    score += 20;
    if (profile.topRiasecCluster)   score += 20;
    if (profile.marks?.matricPct)   score += 15;
    if (profile.marks?.fscPct)      score += 15;
    if (profile.skills?.length > 0) score += 20;
    if (profile.targetCareer)       score += 10;
    return Math.min(100, score);
  })();

  const firstName = user?.firstName ?? 'Student';
  const quickActions = QUICK_ACTIONS;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return <View style={[styles.center, { backgroundColor: c.bg }]}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.primary} />}
    >
      {/* Header greeting */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: c.muted }]}>{greeting},</Text>
          <Text style={[styles.name, { color: c.text }]}>{firstName} 👋</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: c.surface2, borderColor: c.border }]}>
          <Text style={[styles.roleText, { color: Colors.primary }]}>{user?.role ?? 'STUDENT'}</Text>
        </View>
      </View>

      {/* Career Readiness Ring Card */}
      <Card style={styles.ringCard} dark={dark} elevated>
        <View style={styles.ringRow}>
          {/* SVG ring replaced with a simple circular progress using border */}
          <View style={styles.ringWrapper}>
            <View style={[styles.ringOuter, { borderColor: c.border }]}>
              <View style={[styles.ringInner, {
                borderColor: readiness >= 70 ? Colors.primary : readiness >= 40 ? Colors.warning : Colors.danger,
                // Simple arc approximation using border partial rendering
                borderTopColor:   Colors.primary,
                borderRightColor: readiness > 25  ? Colors.primary : c.border,
                borderBottomColor: readiness > 50 ? Colors.primary : c.border,
                borderLeftColor:  readiness > 75  ? Colors.primary : c.border,
              }]} />
            </View>
            <View style={styles.ringCenter}>
              <Text style={[styles.ringPct, { color: c.text }]}>{readiness}%</Text>
              <Text style={[styles.ringLabel, { color: c.muted }]}>Ready</Text>
            </View>
          </View>
          <View style={styles.ringInfo}>
            <Text style={[styles.ringTitle, { color: c.text }]}>Career Readiness</Text>
            <Text style={[styles.ringSubtitle, { color: c.muted }]}>
              {readiness >= 80 ? 'Excellent profile — ready to apply!'
                : readiness >= 50 ? 'Good progress — keep building skills'
                : 'Complete your profile to improve score'}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: c.border }]}>
              <View style={[styles.progressFill, { width: `${readiness}%` as any, backgroundColor: Colors.primary }]} />
            </View>
          </View>
        </View>
      </Card>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Stream',   value: profile?.preferredStream ? profile.preferredStream.split(' ').slice(0,2).join(' ') : '—' },
          { label: 'RIASEC',   value: profile?.topRiasecCluster ? profile.topRiasecCluster.split(' ')[0] : '—' },
          { label: 'Skills',   value: String(profile?.skills?.length ?? 0) },
          { label: 'Matric',   value: profile?.marks?.matricPct ? `${profile.marks.matricPct}%` : '—' },
        ].map(s => (
          <Card key={s.label} style={styles.statCard} dark={dark}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: c.muted }]}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map(a => (
          <TouchableOpacity
            key={a.route}
            style={[styles.actionCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => onNavigate(a.route)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={a.label}
          >
            <Text style={styles.actionIcon}>{a.icon}</Text>
            <Text style={[styles.actionLabel, { color: c.text }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tip card */}
      <Card style={[styles.tipCard, { borderLeftColor: Colors.primary }]} dark={dark}>
        <Text style={[styles.tipTitle, { color: Colors.primary }]}>💡 Daily Tip</Text>
        <Text style={[styles.tipText, { color: c.muted }]}>
          {readiness < 40
            ? 'Complete the RIASEC quiz to unlock personalised career recommendations.'
            : readiness < 70
            ? 'Add your skills in Profile to improve your career match accuracy.'
            : 'Practice a mock interview today to boost your confidence.'}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:        { padding: Spacing['2xl'], paddingBottom: 100 },
  headerRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing['2xl'] },
  greeting:      { fontSize: FontSize.sm },
  name:          { fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold },
  roleBadge:     { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1 },
  roleText:      { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  ringCard:      { marginBottom: Spacing['2xl'] },
  ringRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing['2xl'] },
  ringWrapper:   { position: 'relative', width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  ringOuter:     { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 8, borderColor: '#e2e8f0' },
  ringInner:     { width: 90, height: 90, borderRadius: 45, borderWidth: 8 },
  ringCenter:    { position: 'absolute', alignItems: 'center' },
  ringPct:       { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  ringLabel:     { fontSize: FontSize.xs },
  ringInfo:      { flex: 1 },
  ringTitle:     { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  ringSubtitle:  { fontSize: FontSize.sm, marginBottom: Spacing.md, lineHeight: 18 },
  progressBar:   { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill:  { height: 6, borderRadius: Radius.full },
  statsRow:      { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing['2xl'] },
  statCard:      { flex: 1, alignItems: 'center', padding: Spacing.md },
  statValue:     { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  statLabel:     { fontSize: FontSize.xs, marginTop: 2 },
  sectionTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.lg },
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing['2xl'] },
  actionCard:    { width: '30.5%', alignItems: 'center', padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1 },
  actionIcon:    { fontSize: 26, marginBottom: Spacing.xs },
  actionLabel:   { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textAlign: 'center' },
  tipCard:       { borderLeftWidth: 3, paddingLeft: Spacing.lg },
  tipTitle:      { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  tipText:       { fontSize: FontSize.sm, lineHeight: 20 },
});
