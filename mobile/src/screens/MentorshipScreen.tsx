import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { UserCheck, Star, Calendar, Clock, CheckCircle2, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const CalendarIcon: any = Calendar;
const XIcon: any = X;

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  domain: string;
  rating: number;
  sessions: number;
  bio: string;
}

const MENTORS_DATA: Mentor[] = [
  { id: '1', name: 'Dr. Zohaib Hassan', role: 'Staff AI Engineer', company: 'Google UK (FAST Alumni)', domain: 'Software & AI', rating: 4.9, sessions: 48, bio: 'Helping Pakistani CS students navigate top tech careers, AI research, and MS scholarships in the UK/EU.' },
  { id: '2', name: 'Ayesha Khan', role: 'Senior Product Designer', company: 'Careem / Dubai', domain: 'UI/UX & Product', rating: 4.8, sessions: 35, bio: 'Specializing in portfolio reviews, product strategy, and career transitions into UX design.' },
  { id: '3', name: 'Bilal Chaudhry', role: 'Audit Manager', company: 'PwC Pakistan (ICAP CA)', domain: 'Finance & CA', rating: 5.0, sessions: 62, bio: 'Guiding Commerce & I.Com students through ICAP CA exams, articleship, and finance careers.' },
];

export function MentorshipScreen() {
  const { dark, colors: c } = useTheme();
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <FlatList
        data={MENTORS_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
            <Text style={styles.eyebrow}>EXPERT GUIDANCE</Text>
            <Text style={[styles.title, { color: c.text }]}>1-on-1 Mentorship</Text>
            <Text style={[styles.subtitle, { color: c.muted }]}>
              Book 1-on-1 career guidance sessions with verified industry professionals and university alumni.
            </Text>
          </Animated.View>
        }
        renderItem={({ item }) => (
          <Card dark={dark} elevated style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.avatar, { backgroundColor: Colors.primary + '25' }]}>
                <Text style={{ color: Colors.primary, fontWeight: FontWeight.extrabold, fontSize: FontSize.lg }}>{item.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mentorName, { color: c.text }]}>{item.name}</Text>
                <Text style={[styles.mentorRole, { color: Colors.primary, fontWeight: FontWeight.bold }]}>{item.role} @ {item.company}</Text>
                <Text style={[styles.mentorDomain, { color: c.muted }]}>{item.domain} · ⭐ {item.rating} ({item.sessions} sessions)</Text>
              </View>
            </View>

            <Text style={[styles.bioText, { color: c.muted }]}>{item.bio}</Text>

            <Button
              title="Book 1-on-1 Session"
              onPress={() => setSelectedMentor(item)}
            />
          </Card>
        )}
      />

      {/* Session Booking Modal */}
      <Modal visible={!!selectedMentor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            {selectedMentor && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: c.text }]}>Book Session with {selectedMentor.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedMentor(null)}>
                    <XIcon size={20} color={c.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.bioText, { color: c.muted }]}>Select preferred 30-minute slot:</Text>

                {['Tomorrow at 5:00 PM PKT', 'Saturday at 2:00 PM PKT', 'Sunday at 7:00 PM PKT'].map((slot, i) => (
                  <TouchableOpacity key={i} onPress={() => { Alert.alert('Session Requested!', `Your session request with ${selectedMentor.name} for ${slot} has been sent.`); setSelectedMentor(null); }} style={[styles.slotCard, { backgroundColor: c.surface2 }]}>
                    <CalendarIcon size={18} color={Colors.primary} />
                    <Text style={[styles.slotText, { color: c.text }]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
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
  header: { marginBottom: Spacing.sm },
  eyebrow: { color: Colors.primary, fontSize: FontSize.xs, letterSpacing: 1.2, fontWeight: FontWeight.extrabold },
  title: { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold },
  subtitle: { fontSize: FontSize.sm, lineHeight: 20 },
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.sm, marginBottom: Spacing.sm },
  cardTop: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  mentorName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  mentorRole: { fontSize: FontSize.xs },
  mentorDomain: { fontSize: FontSize.xs, marginTop: 2 },
  bioText: { fontSize: FontSize.xs, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], padding: Spacing['2xl'], gap: Spacing.sm },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  modalTitle: { fontSize: FontSize.base, fontWeight: FontWeight.extrabold },
  slotCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, marginVertical: 2 },
  slotText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
