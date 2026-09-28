import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart3, CalendarCheck2, GraduationCap, ShieldCheck, UsersRound } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

const ShieldIcon: React.ComponentType<any> = ShieldCheck as React.ComponentType<any>;

export function WorkspaceScreen() {
  const { user } = useAuth();
  const { dark, colors: c } = useTheme();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const [view, setView] = useState<'admin' | 'mentor'>(isAdmin ? 'admin' : 'mentor');
  const cards = useMemo(() => view === 'admin'
    ? [{ label: 'Platform analytics', value: 'Live', icon: BarChart3 }, { label: 'User management', value: 'Manage', icon: UsersRound }, { label: 'Mentor access', value: 'Enabled', icon: GraduationCap }]
    : [{ label: 'Today’s sessions', value: '0', icon: CalendarCheck2 }, { label: 'Assigned mentees', value: '0', icon: UsersRound }, { label: 'Guidance tools', value: 'Ready', icon: GraduationCap }], [view]);

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.scroll}>
      <Animated.View entering={FadeInDown.duration(360)} style={[styles.hero, { borderColor: Colors.primary + '55' }]}>
        <View style={[styles.heroOrb, { backgroundColor: Colors.primary + '22' }]} />
        <View style={styles.heroContent}>
          <View style={[styles.iconPlate, { backgroundColor: Colors.primary }]}><ShieldIcon color="#04120d" size={25} strokeWidth={2.7} /></View>
          <Text style={styles.heroEyebrow}>{isAdmin ? 'NEXSTEP CONTROL CENTER' : 'NEXSTEP MENTOR PORTAL'}</Text>
          <Text style={styles.heroTitle}>{view === 'admin' ? 'Command the platform.' : 'Guide every next step.'}</Text>
          <Text style={styles.heroText}>{isAdmin ? 'Manage the platform, then switch into the mentor experience whenever you need it.' : 'Your mentoring workspace is ready for student guidance and session planning.'}</Text>
        </View>
      </Animated.View>

      {isAdmin && <View style={[styles.switcher, { backgroundColor: c.surface2, borderColor: c.border }]}>
        {(['admin', 'mentor'] as const).map((option) => <TouchableOpacity key={option} onPress={() => setView(option)} style={[styles.switchOption, view === option && { backgroundColor: Colors.primary }]}><Text style={[styles.switchText, { color: view === option ? '#04120d' : c.muted }]}>{option === 'admin' ? 'Admin view' : 'Mentor view'}</Text></TouchableOpacity>)}
      </View>}

      <Text style={[styles.sectionTitle, { color: c.text }]}>{view === 'admin' ? 'Platform tools' : 'Mentor tools'}</Text>
      {cards.map(({ label, value, icon }, index) => {
        const Icon: React.ComponentType<any> = icon as React.ComponentType<any>;
        return <Animated.View key={label} entering={FadeInDown.delay(index * 90).duration(360)}><Card dark={dark} elevated style={styles.card}><View style={[styles.cardIcon, { backgroundColor: Colors.primary + '1a' }]}><Icon color={Colors.primary} size={21} /></View><View style={styles.cardCopy}><Text style={[styles.cardLabel, { color: c.muted }]}>{label}</Text><Text style={[styles.cardValue, { color: c.text }]}>{value}</Text></View></Card></Animated.View>;
      })}
      <Card dark={dark} style={styles.note}><Text style={[styles.noteTitle, { color: Colors.primary }]}>Role-aware access</Text><Text style={[styles.noteText, { color: c.muted }]}>{isAdmin ? 'You can move between the administrative and mentor views without signing in again.' : 'Only tools assigned to the mentor role are shown here.'}</Text></Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing['2xl'], paddingBottom: 104, gap: Spacing.lg }, hero: { overflow: 'hidden', borderRadius: Radius['2xl'], borderWidth: 1, backgroundColor: '#071f19', minHeight: 236 }, heroOrb: { position: 'absolute', width: 210, height: 210, borderRadius: 105, right: -62, top: -56 }, heroContent: { padding: Spacing['2xl'], gap: Spacing.sm }, iconPlate: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm }, heroEyebrow: { color: '#6ee7b7', fontSize: FontSize.xs, fontWeight: FontWeight.extrabold, letterSpacing: 1.1 }, heroTitle: { color: '#fff', fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold, maxWidth: 270 }, heroText: { color: '#cbd5e1', fontSize: FontSize.sm, lineHeight: 20, maxWidth: 288 }, switcher: { borderWidth: 1, borderRadius: Radius.lg, padding: 4, flexDirection: 'row' }, switchOption: { flex: 1, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center' }, switchText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold }, sectionTitle: { marginTop: Spacing.sm, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold }, card: { marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, cardIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' }, cardCopy: { gap: 2 }, cardLabel: { fontSize: FontSize.sm }, cardValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold }, note: { marginTop: Spacing.md }, noteTitle: { fontSize: FontSize.base, fontWeight: FontWeight.extrabold, marginBottom: 5 }, noteText: { fontSize: FontSize.sm, lineHeight: 20 },
});
