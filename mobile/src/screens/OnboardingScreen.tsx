import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';

interface Props {
  onDone?: () => void;
}

export function OnboardingScreen({ onDone }: Props) {
  const { dark, colors: c } = useTheme();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [gradeLevel, setGradeLevel] = useState('Matric / 10th');
  const [preferredStream, setPreferredStream] = useState('Science (Computer)');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [monthlyIncome, setMonthlyIncome] = useState('75000');
  const [annualBudget, setAnnualBudget] = useState('200000');
  const [targetCareer, setTargetCareer] = useState('Software Engineer');
  const [skills, setSkills] = useState('Python, Problem Solving, Communication');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      Alert.alert('Profile Setup Complete!', 'Your profile preferences have been updated.', [
        { text: 'Go to Dashboard', onPress: () => onDone?.() }
      ]);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>STEP {step} OF 3</Text>
        <Text style={[styles.title, { color: c.text }]}>
          {step === 1 ? 'Academic Background' : step === 2 ? 'Location & Budget' : 'Career Goals & Skills'}
        </Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Help NexStep personalize your learning pathways, university cutoffs, and AI guidance.
        </Text>
      </Animated.View>

      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              { backgroundColor: s <= step ? Colors.primary : c.border }
            ]}
          />
        ))}
      </View>

      {step === 1 && (
        <Card dark={dark} elevated style={styles.card}>
          <Text style={[styles.label, { color: c.text }]}>Current Grade / Qualification Level</Text>
          <View style={styles.chipRow}>
            {['Grade 8', 'Matric / 10th', 'F.Sc / Inter', 'O/A Levels', 'Undergraduate'].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGradeLevel(g)}
                style={[
                  styles.chip,
                  { backgroundColor: gradeLevel === g ? Colors.primary : c.surface2 }
                ]}
              >
                <Text style={[styles.chipText, { color: gradeLevel === g ? '#06110d' : c.text }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: c.text, marginTop: Spacing.lg }]}>Preferred Academic Stream</Text>
          <View style={styles.chipRow}>
            {['Science (Computer)', 'Science (Pre-Med)', 'Pre-Engineering', 'ICS / IT', 'Commerce', 'Arts & Humanities'].map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => setPreferredStream(st)}
                style={[
                  styles.chip,
                  { backgroundColor: preferredStream === st ? Colors.primary : c.surface2 }
                ]}
              >
                <Text style={[styles.chipText, { color: preferredStream === st ? '#06110d' : c.text }]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {step === 2 && (
        <Card dark={dark} elevated style={styles.card}>
          <Text style={[styles.label, { color: c.text }]}>City</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Lahore, Karachi, Islamabad"
            placeholderTextColor={c.muted}
            style={[styles.input, { backgroundColor: c.surface2, color: c.text, borderColor: c.border }]}
          />

          <Text style={[styles.label, { color: c.text, marginTop: Spacing.md }]}>Province / Region</Text>
          <TextInput
            value={province}
            onChangeText={setProvince}
            placeholder="e.g. Punjab, Sindh, KPK"
            placeholderTextColor={c.muted}
            style={[styles.input, { backgroundColor: c.surface2, color: c.text, borderColor: c.border }]}
          />

          <Text style={[styles.label, { color: c.text, marginTop: Spacing.md }]}>Family Monthly Income (PKR)</Text>
          <TextInput
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            keyboardType="numeric"
            placeholder="e.g. 75000"
            placeholderTextColor={c.muted}
            style={[styles.input, { backgroundColor: c.surface2, color: c.text, borderColor: c.border }]}
          />

          <Text style={[styles.label, { color: c.text, marginTop: Spacing.md }]}>Annual Education Budget (PKR)</Text>
          <TextInput
            value={annualBudget}
            onChangeText={setAnnualBudget}
            keyboardType="numeric"
            placeholder="e.g. 200000"
            placeholderTextColor={c.muted}
            style={[styles.input, { backgroundColor: c.surface2, color: c.text, borderColor: c.border }]}
          />
        </Card>
      )}

      {step === 3 && (
        <Card dark={dark} elevated style={styles.card}>
          <Text style={[styles.label, { color: c.text }]}>Target Career Aspirations</Text>
          <TextInput
            value={targetCareer}
            onChangeText={setTargetCareer}
            placeholder="e.g. Data Scientist, MBBS Doctor, Chartered Accountant"
            placeholderTextColor={c.muted}
            style={[styles.input, { backgroundColor: c.surface2, color: c.text, borderColor: c.border }]}
          />

          <Text style={[styles.label, { color: c.text, marginTop: Spacing.md }]}>Key Skills & Strengths (comma-separated)</Text>
          <TextInput
            value={skills}
            onChangeText={setSkills}
            placeholder="e.g. Mathematics, Coding, Public Speaking"
            placeholderTextColor={c.muted}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textarea, { backgroundColor: c.surface2, color: c.text, borderColor: c.border }]}
          />
        </Card>
      )}

      <View style={styles.footerRow}>
        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(step - 1)} style={[styles.backBtn, { borderColor: c.border }]}>
            <Text style={{ color: c.text, fontWeight: FontWeight.bold }}>Back</Text>
          </TouchableOpacity>
        )}
        <Button
          title={step === 3 ? 'Finish Setup' : 'Continue'}
          onPress={handleNext}
          style={{ flex: 1 }}
        />
      </View>
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
  stepIndicator: { flexDirection: 'row', gap: Spacing.sm },
  stepDot: { flex: 1, height: 4, borderRadius: Radius.full },
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  chipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  input: { borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  footerRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  backBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderWidth: 1, borderRadius: Radius.xl },
});
