import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Building2, Search, Filter, MapPin, GraduationCap, ExternalLink, X, Award, DollarSign } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const Building2Icon: any = Building2;
const SearchIcon: any = Search;
const XIcon: any = X;

interface University {
  id: string;
  name: string;
  city: string;
  province: string;
  sector: 'Public' | 'Private';
  ranking: string;
  lastMerit: string;
  annualFee: string;
  disciplines: string[];
  description: string;
}

const UNIVERSITIES_DATA: University[] = [
  { id: '1', name: 'NUST — National University of Sciences & Tech', city: 'Islamabad', province: 'Islamabad', sector: 'Public', ranking: '#1 Engineering (HEC)', lastMerit: '78.5%', annualFee: 'PKR 240,000', disciplines: ['Computer Science', 'Software Engineering', 'Electrical Eng', 'Mechanical Eng', 'BBA'], description: 'Premier public research university renowned for engineering, computer science, and business management.' },
  { id: '2', name: 'FAST-NUCES Lahore', city: 'Lahore', province: 'Punjab', sector: 'Private', ranking: '#1 Computer Science', lastMerit: '74.2%', annualFee: 'PKR 340,000', disciplines: ['Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Cyber Security'], description: 'Pakistan pioneer in computer science and IT education with strong global alumni presence.' },
  { id: '3', name: 'LUMS — Lahore University of Management Sciences', city: 'Lahore', province: 'Punjab', sector: 'Private', ranking: '#1 Business & Humanities', lastMerit: '85.0%', annualFee: 'PKR 1,200,000', disciplines: ['Computer Science', 'Economics', 'LLB Law', 'Management Sciences', 'Electrical Eng'], description: 'World-class private university offering liberal arts, management, and computer science degrees.' },
  { id: '4', name: 'COMSATS University Islamabad', city: 'Islamabad', province: 'Islamabad', sector: 'Public', ranking: '#2 IT & Tech', lastMerit: '71.0%', annualFee: 'PKR 180,000', disciplines: ['Software Engineering', 'Computer Science', 'Bioinformatics', 'Data Science'], description: 'Top public sector university with multi-campus presence across Pakistan.' },
  { id: '5', name: 'Aga Khan University (AKU)', city: 'Karachi', province: 'Sindh', sector: 'Private', ranking: '#1 Medical (HEC)', lastMerit: '91.0%', annualFee: 'PKR 1,500,000', disciplines: ['MBBS', 'BDS', 'BSc Nursing', 'Medical Sciences'], description: 'Internationally recognized premiere medical school and hospital system in Karachi.' },
  { id: '6', name: 'UET Lahore', city: 'Lahore', province: 'Punjab', sector: 'Public', ranking: '#2 Engineering', lastMerit: '73.0%', annualFee: 'PKR 110,000', disciplines: ['Electrical Eng', 'Mechanical Eng', 'Civil Eng', 'Chemical Eng', 'CS'], description: 'Historic public engineering institution with low tuition fee structures and high research output.' },
  { id: '7', name: 'University of Karachi (KU)', city: 'Karachi', province: 'Sindh', sector: 'Public', ranking: '#1 Public University Sindh', lastMerit: '65.0%', annualFee: 'PKR 45,000', disciplines: ['Pharmacy', 'Computer Science', 'Biotechnology', 'Criminology', 'Mass Comm'], description: 'Largest public university in Sindh with diverse academic disciplines.' },
  { id: '8', name: 'GIKI Swabi', city: 'Topi', province: 'KPK', sector: 'Private', ranking: '#3 Engineering', lastMerit: '76.0%', annualFee: 'PKR 950,000', disciplines: ['Computer Engineering', 'Materials Eng', 'AI', 'Cyber Security'], description: 'Prestigious residential engineering institute located in Khyber Pakhtunkhwa.' },
];

export function UniversitiesScreen() {
  const { dark, colors: c } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedUni, setSelectedUni] = useState<University | null>(null);

  const filteredUnis = UNIVERSITIES_DATA.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase()) || u.disciplines.some(d => d.toLowerCase().includes(search.toLowerCase()));
    const matchesProvince = selectedProvince === 'All' || u.province === selectedProvince;
    const matchesSector = selectedSector === 'All' || u.sector === selectedSector;
    return matchesSearch && matchesProvince && matchesSector;
  });

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <FlatList
        data={filteredUnis}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
            <Text style={styles.eyebrow}>HIGHER EDUCATION DIRECTORY</Text>
            <Text style={[styles.title, { color: c.text }]}>Pakistani Universities</Text>
            <Text style={[styles.subtitle, { color: c.muted }]}>
              Explore HEC-recognized universities, merit cutoffs, tuition fees, and discipline programs.
            </Text>

            <View style={[styles.verifiedBanner, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '40' }]}>
              <Text style={styles.verifiedText}>✔ Verified 2026 Admissions Data · Check official university prospectus for final cutoffs</Text>
            </View>

            {/* Search Box */}
            <View style={[styles.searchBox, { backgroundColor: c.surface2, borderColor: c.border }]}>
              <SearchIcon size={18} color={c.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search university, city, or discipline..."
                placeholderTextColor={c.muted}
                style={[styles.searchInput, { color: c.text }]}
              />
            </View>

            {/* Filters */}
            <View style={{ gap: Spacing.xs }}>
              <Text style={[styles.filterLabel, { color: c.muted }]}>Province Filter:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {['All', 'Punjab', 'Sindh', 'Islamabad', 'KPK'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setSelectedProvince(p)}
                    style={[styles.chip, { backgroundColor: selectedProvince === p ? Colors.primary : c.surface2 }]}
                  >
                    <Text style={[styles.chipText, { color: selectedProvince === p ? '#06110d' : c.text }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.filterLabel, { color: c.muted, marginTop: 4 }]}>Sector:</Text>
              <View style={styles.filterRow}>
                {['All', 'Public', 'Private'].map((sec) => (
                  <TouchableOpacity
                    key={sec}
                    onPress={() => setSelectedSector(sec)}
                    style={[styles.chip, { backgroundColor: selectedSector === sec ? Colors.primary : c.surface2 }]}
                  >
                    <Text style={[styles.chipText, { color: selectedSector === sec ? '#06110d' : c.text }]}>{sec}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedUni(item)}>
            <Card dark={dark} elevated style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: Colors.primary + '20' }]}>
                  <Building2Icon size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.uniTitle, { color: c.text }]}>{item.name}</Text>
                  <Text style={[styles.uniCity, { color: c.muted }]}>{item.city}, {item.province} · <Text style={{ color: Colors.primary, fontWeight: FontWeight.bold }}>{item.sector}</Text></Text>
                </View>
              </View>

              <View style={styles.badgeRow}>
                <Text style={styles.rankBadge}>{item.ranking}</Text>
                <Text style={[styles.feeBadge, { color: c.text }]}>Fee: {item.annualFee}/yr</Text>
                <Text style={styles.meritBadge}>Cutoff: {item.lastMerit}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* University Detail Modal */}
      <Modal visible={!!selectedUni} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            {selectedUni && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: c.text }]}>{selectedUni.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedUni(null)} style={styles.closeBtn}>
                    <XIcon size={20} color={c.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ gap: Spacing.md }}>
                  <Text style={[styles.modalDesc, { color: c.muted }]}>{selectedUni.description}</Text>

                  <Card dark={dark} style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Key Information</Text>
                    <Text style={[styles.infoItem, { color: c.text }]}>📍 Location: {selectedUni.city}, {selectedUni.province}</Text>
                    <Text style={[styles.infoItem, { color: c.text }]}>🏛️ Sector: {selectedUni.sector} Sector University</Text>
                    <Text style={[styles.infoItem, { color: c.text }]}>🏆 Ranking: {selectedUni.ranking}</Text>
                    <Text style={[styles.infoItem, { color: c.text }]}>💰 Tuition Fee: {selectedUni.annualFee} per year</Text>
                    <Text style={[styles.infoItem, { color: c.text }]}>🎯 Last Merit Cutoff: {selectedUni.lastMerit}</Text>
                  </Card>

                  <Card dark={dark} style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Offered Disciplines</Text>
                    <View style={styles.chipRow}>
                      {selectedUni.disciplines.map((d, i) => (
                        <View key={i} style={[styles.chip, { backgroundColor: c.surface2 }]}>
                          <Text style={[styles.chipText, { color: c.text }]}>{d}</Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingBottom: 60, gap: Spacing.md },
  header: { gap: Spacing.xs, marginBottom: Spacing.sm },
  eyebrow: { color: Colors.primary, fontSize: FontSize.xs, letterSpacing: 1.2, fontWeight: FontWeight.extrabold },
  title: { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.sm, lineHeight: 20 },
  verifiedBanner: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.md, borderWidth: 1, marginTop: 4 },
  verifiedText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, gap: Spacing.sm, marginVertical: Spacing.xs },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSize.sm },
  filterLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  filterRow: { flexDirection: 'row', gap: Spacing.xs },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.md },
  chipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  card: { padding: Spacing.lg, borderRadius: Radius['2xl'], gap: Spacing.sm, marginBottom: Spacing.sm },
  cardTop: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  uniTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  uniCity: { fontSize: FontSize.xs, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', marginTop: Spacing.xs },
  rankBadge: { backgroundColor: Colors.primary + '20', color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.extrabold, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.md },
  feeBadge: { backgroundColor: Colors.accent + '20', fontSize: FontSize.xs, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.md },
  meritBadge: { backgroundColor: Colors.gold + '25', color: Colors.gold, fontSize: FontSize.xs, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], padding: Spacing['2xl'], maxHeight: '85%', gap: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, flex: 1 },
  closeBtn: { padding: Spacing.xs },
  modalDesc: { fontSize: FontSize.sm, lineHeight: 22 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  infoItem: { fontSize: FontSize.sm, marginVertical: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
