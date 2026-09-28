/**
 * mobile/src/screens/ProfileScreen.tsx
 * Profile management and settings screen — pure React Native.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Switch,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, updateProfile } from '../api/careers';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const STREAMS = [
  'FSc Pre-Medical', 'FSc Pre-Engineering', 'ICS (Comp Sci)',
  'ICOM (Commerce)', 'Arts/FA', 'DAE (Diploma)', 'A-Levels', 'Cambridge A-Levels',
];

const GRADE_LEVELS = ['Grade 8', 'Matric (9-10)', 'FSc / Inter (11-12)', 'University', 'Fresh Graduate'];

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { dark, colors: c, preference, setPreference } = useTheme();
  const { language, setLanguage, t, isRtl } = useLanguage();

  const [profile,  setProfile]  = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form,     setForm]     = useState<any>({});

  const loadProfile = useCallback(async () => {
    try {
      const p = await fetchProfile();
      setProfile(p);
      setForm(p ?? {});
    } catch { /* no profile yet */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setProfile(updated ?? form);
      setEditMode(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const completionPct = (() => {
    if (!profile) return 0;
    const checks = [
      !!profile.gradeLevel, !!profile.city, !!profile.preferredStream,
      !!profile.topRiasecCluster, !!profile.marks?.matricPct, !!profile.marks?.fscPct,
      !!profile.targetCareer, !!(profile.skills?.length > 0),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  if (loading) {
    return <View style={[styles.center, { backgroundColor: c.bg }]}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  const set = (k: string) => (v: string) => setForm((f: any) => ({ ...f, [k]: v }));
  const setMark = (k: string) => (v: string) => setForm((f: any) => ({ ...f, marks: { ...(f.marks ?? {}), [k]: v } }));

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.scroll}>
      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.firstName?.charAt(0) ?? 'U'}{user?.lastName?.charAt(0) ?? ''}
          </Text>
        </View>
        <Text style={[styles.userName, { color: c.text }]}>{user?.firstName} {user?.lastName}</Text>
        <Text style={[styles.userEmail, { color: c.muted }]}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }]}>
          <Text style={[styles.roleText, { color: Colors.primary }]}>{user?.role}</Text>
        </View>
      </View>

      {/* Completion bar */}
      <Card dark={dark} style={styles.completionCard}>
        <View style={styles.completionRow}>
          <Text style={[styles.completionLabel, { color: c.text }]}>Profile Completion</Text>
          <Text style={[styles.completionPct, { color: Colors.primary }]}>{completionPct}%</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: c.border }]}>
          <View style={[styles.progressFill, { width: `${completionPct}%` as any }]} />
        </View>
        <Text style={[styles.completionHint, { color: c.muted }]}>
          {completionPct < 100 ? 'Complete your profile for better career matches.' : 'Profile complete! ✓'}
        </Text>
      </Card>

      {/* Edit toggle */}
      <View style={styles.editRow}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Academic Profile</Text>
        <TouchableOpacity
          onPress={() => { if (editMode) setForm(profile ?? {}); setEditMode(e => !e); }}
          style={[styles.editBtn, { borderColor: Colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={[styles.editBtnText, { color: Colors.primary }]}>{editMode ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {editMode ? (
        <Card dark={dark} style={styles.formCard}>
          <Input label="City" value={form.city ?? ''} onChangeText={set('city')} dark={dark} placeholder="e.g. Islamabad" />
          <Input label="Province" value={form.province ?? ''} onChangeText={set('province')} dark={dark} placeholder="e.g. Punjab" />
          <Input label="Target Career" value={form.targetCareer ?? ''} onChangeText={set('targetCareer')} dark={dark} placeholder="e.g. Software Engineer" />
          <Input label="Career Goals" value={form.goals ?? ''} onChangeText={set('goals')} dark={dark} placeholder="Describe your career goals..." multiline />

          <Text style={[styles.fieldLabel, { color: c.muted }]}>Academic Marks</Text>
          <View style={styles.marksRow}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Input label="Matric %" value={String(form.marks?.matricPct ?? '')} onChangeText={setMark('matricPct')} dark={dark} keyboardType="numeric" placeholder="e.g. 82" />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Input label="FSc %" value={String(form.marks?.fscPct ?? '')} onChangeText={setMark('fscPct')} dark={dark} keyboardType="numeric" placeholder="e.g. 75" />
            </View>
          </View>
          <Input label="Entry Test Score" value={String(form.marks?.entryTestScore ?? '')} onChangeText={setMark('entryTestScore')} dark={dark} keyboardType="numeric" placeholder="NTS/NUST/MDCAT score" />

          <Button label="Save Profile" onPress={saveProfile} loading={saving} style={{ marginTop: Spacing.lg }} />
        </Card>
      ) : (
        <Card dark={dark} style={styles.infoCard}>
          {[
            { label: 'Grade Level',   value: profile?.gradeLevel     },
            { label: 'City',          value: profile?.city           },
            { label: 'Province',      value: profile?.province       },
            { label: 'Stream',        value: profile?.preferredStream },
            { label: 'RIASEC',        value: profile?.topRiasecCluster?.split(' ').slice(0,2).join(' ') },
            { label: 'Target Career', value: profile?.targetCareer   },
            { label: 'Matric %',      value: profile?.marks?.matricPct ? `${profile.marks.matricPct}%` : null },
            { label: 'FSc %',         value: profile?.marks?.fscPct   ? `${profile.marks.fscPct}%`   : null },
          ].filter(row => row.value).map(row => (
            <View key={row.label} style={[styles.infoRow, { borderBottomColor: c.border }]}>
              <Text style={[styles.infoLabel, { color: c.muted }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: c.text }]}>{row.value}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Skills */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Skills ({profile?.skills?.length ?? 0})</Text>
      <Card dark={dark} style={styles.skillsCard}>
        {profile?.skills?.length > 0 ? (
          <View style={styles.skillsWrap}>
            {profile.skills.slice(0, 8).map((sk: any, i: number) => (
              <View key={i} style={[styles.skillPill, { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }]}>
                <Text style={[styles.skillPillText, { color: Colors.primary }]}>
                  {typeof sk === 'string' ? sk : sk.name}
                </Text>
              </View>
            ))}
            {profile.skills.length > 8 && (
              <View style={[styles.skillPill, { backgroundColor: c.surface2, borderColor: c.border }]}>
                <Text style={[styles.skillPillText, { color: c.muted }]}>+{profile.skills.length - 8} more</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: c.muted }]}>No skills added yet. Update your profile on the web app to add skills.</Text>
        )}
      </Card>

      {/* Persistent appearance and language preferences */}
      <Text style={[styles.sectionTitle, { color: c.text, textAlign: isRtl ? 'right' : 'left' }]}>{t('settings')}</Text>
      <Card dark={dark} style={styles.settingsCard}>
        <Text style={[styles.settingLabel, { color: c.muted, textAlign: isRtl ? 'right' : 'left' }]}>{t('appearance')}</Text>
        <View style={styles.optionRow}>
          {(['system', 'light', 'dark'] as const).map((option) => (
            <TouchableOpacity key={option} onPress={() => setPreference(option)} style={[styles.option, { borderColor: preference === option ? Colors.primary : c.border, backgroundColor: preference === option ? Colors.primary + '18' : c.surface2 }]} accessibilityRole="radio" accessibilityState={{ selected: preference === option }}>
              <Text style={[styles.optionText, { color: preference === option ? Colors.primary : c.muted }]}>{t(option)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.settingLabel, { color: c.muted, marginTop: Spacing.lg, textAlign: isRtl ? 'right' : 'left' }]}>{t('language')}</Text>
        <View style={styles.optionRow}>
          {(['en', 'ur'] as const).map((option) => (
            <TouchableOpacity key={option} onPress={() => setLanguage(option)} style={[styles.option, { borderColor: language === option ? Colors.primary : c.border, backgroundColor: language === option ? Colors.primary + '18' : c.surface2 }]} accessibilityRole="radio" accessibilityState={{ selected: language === option }}>
              <Text style={[styles.optionText, { color: language === option ? Colors.primary : c.muted }]}>{option === 'en' ? 'English' : 'اردو'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Sign out */}
      <Button label="Sign Out" onPress={handleLogout} variant="danger" style={styles.signOutBtn} />

      <Text style={[styles.footer, { color: c.muted }]}>NexStep AI v1.0 · Air University FYP</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:           { padding: Spacing['2xl'], paddingBottom: 100 },
  avatarSection:    { alignItems: 'center', marginBottom: Spacing['3xl'] },
  avatar:           { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  avatarText:       { color: '#fff', fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold },
  userName:         { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, marginBottom: Spacing.xs },
  userEmail:        { fontSize: FontSize.sm, marginBottom: Spacing.md },
  roleBadge:        { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1 },
  roleText:         { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  completionCard:   { marginBottom: Spacing['2xl'] },
  completionRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  completionLabel:  { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  completionPct:    { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  progressBar:      { height: 8, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill:     { height: 8, borderRadius: Radius.full, backgroundColor: Colors.primary },
  completionHint:   { fontSize: FontSize.sm },
  editRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  sectionTitle:     { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  editBtn:          { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1.5 },
  editBtnText:      { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  formCard:         { marginBottom: Spacing['2xl'] },
  fieldLabel:       { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.xs },
  marksRow:         { flexDirection: 'row' },
  infoCard:         { marginBottom: Spacing['2xl'] },
  infoRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, borderBottomWidth: 1 },
  infoLabel:        { fontSize: FontSize.sm },
  infoValue:        { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  skillsCard:       { marginBottom: Spacing['2xl'] },
  settingsCard:     { marginBottom: Spacing['2xl'] },
  settingLabel:     { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  optionRow:        { flexDirection: 'row', gap: Spacing.sm },
  option:           { flex: 1, minHeight: 42, borderWidth: 1, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xs },
  optionText:       { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  skillsWrap:       { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  skillPill:        { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1 },
  skillPillText:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  emptyText:        { fontSize: FontSize.sm, lineHeight: 20 },
  signOutBtn:       { marginBottom: Spacing.xl },
  footer:           { textAlign: 'center', fontSize: FontSize.xs, marginTop: Spacing.md },
});
