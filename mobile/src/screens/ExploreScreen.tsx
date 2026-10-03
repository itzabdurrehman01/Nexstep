import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BookOpenCheck, Building2, GraduationCap, Compass, Wrench, Globe, Briefcase, Scale, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';

const ArrowRightIcon: any = ArrowRight;

interface Props {
  onNavigate?: (route: string) => void;
}

const EXPLORE_HUBS = [
  { id: 'grade8Matric', title: 'Grade 8 & Matric Evaluator', desc: 'Subject group analyzer (Bio, CS, Arts) & BISE board cutoff aggregate calculator.', icon: BookOpenCheck, color: Colors.primary },
  { id: 'fscMapper', title: 'F.Sc & Inter Pathway Mapper', desc: 'Pre-Medical, Pre-Eng, ICS, I.Com, FA eligibility & university degree mapping.', icon: Compass, color: Colors.accent },
  { id: 'universities', title: 'Pakistani Universities Directory', desc: 'HEC-recognized public & private universities, fees, rankings, and cutoffs.', icon: Building2, color: Colors.info },
  { id: 'scholarships', title: 'Scholarship & Financial Aid Finder', desc: 'Ehsaas, PEEF, HEC, and international scholarships catalog.', icon: GraduationCap, color: Colors.gold },
  { id: 'tevtaIt', title: 'TEVTA & IT Skill Diplomas', desc: 'Vocational trade diplomas, DAE engineering, and NAVTTC bootcamps.', icon: Wrench, color: Colors.warning },
  { id: 'transnational', title: 'Foreign Degrees in Pakistan (TNE)', desc: 'UK, US, and Australian degrees delivered locally at partner campuses.', icon: Globe, color: Colors.accent },
  { id: 'degreeCareer', title: 'Degree to Career Matrix', desc: 'Connect university degrees to job roles, starting salaries, and demand growth.', icon: Briefcase, color: Colors.primary },
  { id: 'careerComparison', title: 'Side-by-Side Career Comparison', desc: 'Compare 2-3 careers on salary, growth rate, work-life balance, and skills.', icon: Scale, color: Colors.gold },
];

export function ExploreScreen({ onNavigate }: Props) {
  const { dark, colors: c } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>ACADEMIC & CAREER GUIDANCE HUB</Text>
        <Text style={[styles.title, { color: c.text }]}>Explore Pathways</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Discover verified Pakistani educational institutions, scholarships, vocational diplomas, and career alignment tools.
        </Text>
      </Animated.View>

      <View style={styles.grid}>
        {EXPLORE_HUBS.map((hub, index) => {
          const IconComp: any = hub.icon;
          return (
            <Animated.View key={hub.id} entering={FadeInDown.delay(index * 60).duration(300)}>
              <TouchableOpacity onPress={() => onNavigate?.(hub.id)} activeOpacity={0.8}>
                <Card dark={dark} elevated style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: hub.color + '20' }]}>
                      <IconComp size={22} color={hub.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: c.text }]}>{hub.title}</Text>
                    </View>
                  </View>
                  <Text style={[styles.cardDesc, { color: c.muted }]}>{hub.desc}</Text>
                  <View style={styles.actionRow}>
                    <Text style={[styles.actionText, { color: hub.color }]}>Explore Pathway</Text>
                    <ArrowRightIcon size={14} color={hub.color} />
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingBottom: 80, gap: Spacing.lg },
  header: { gap: Spacing.xs },
  eyebrow: { color: Colors.primary, fontSize: FontSize.xs, letterSpacing: 1.2, fontWeight: FontWeight.extrabold },
  title: { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.sm, lineHeight: 20 },
  grid: { gap: Spacing.md },
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  cardDesc: { fontSize: FontSize.xs, lineHeight: 18 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  actionText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
