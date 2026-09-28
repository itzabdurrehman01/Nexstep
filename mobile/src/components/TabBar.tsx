import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { BriefcaseBusiness, Compass, Home, LayoutGrid, Map, ShieldCheck, Sparkles, UserRound, UsersRound } from 'lucide-react-native';
import { getColors, Colors, Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

export type TabKey = string;
export type AppRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

type TabDefinition = { key: string; label: any; icon: typeof Home };
const STUDENT_TABS: TabDefinition[] = [
  { key: 'home', label: 'home', icon: Home },
  { key: 'career', label: 'career', icon: Sparkles },
  { key: 'explore', label: 'explore', icon: Compass },
  { key: 'jobs', label: 'jobs', icon: BriefcaseBusiness },
  { key: 'services', label: 'services', icon: LayoutGrid },
];
const STAFF_TABS: TabDefinition[] = [
  { key: 'home', label: 'home', icon: Home },
  { key: 'workspace', label: 'workspace', icon: UsersRound },
  { key: 'career', label: 'career', icon: Sparkles },
  { key: 'jobs', label: 'jobs', icon: BriefcaseBusiness },
  { key: 'services', label: 'services', icon: LayoutGrid },
];

interface Props { activeTab: string; onTabPress: (tab: string) => void; dark?: boolean; role?: string }

export function TabBar({ activeTab, onTabPress, dark = false, role = 'STUDENT' }: Props) {
  const c = getColors(dark);
  const { t } = useLanguage();
  const tabs = role === 'STUDENT' ? STUDENT_TABS : STAFF_TABS;

  return (
    <View style={[styles.bar, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: Platform.OS === 'ios' ? 20 : Spacing.md }]}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const Icon: React.ComponentType<any> = tab.icon as React.ComponentType<any>;
        return (
          <TouchableOpacity key={tab.key} onPress={() => onTabPress(tab.key)} style={styles.tab} activeOpacity={0.75} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={t(tab.label)}>
            {active && <Animated.View entering={FadeInDown.duration(180)} layout={Layout.springify()} style={[styles.indicator, { backgroundColor: Colors.primary }]} />}
            <Icon size={20} strokeWidth={active ? 2.6 : 1.8} color={active ? Colors.primary : c.muted} />
            <Text numberOfLines={1} style={[styles.label, { color: active ? Colors.primary : c.muted, fontWeight: active ? FontWeight.bold : FontWeight.normal }]}>{t(tab.label)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: Spacing.sm, shadowColor: '#020617', shadowOffset: { width: 0, height: -6 }, shadowRadius: 18, shadowOpacity: 0.08, elevation: 16 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 54, position: 'relative' },
  indicator: { position: 'absolute', top: -Spacing.sm, width: 28, height: 3, borderRadius: Radius.full },
  label: { fontSize: FontSize.xs, maxWidth: 68 },
});
