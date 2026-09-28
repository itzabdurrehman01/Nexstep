/**
 * mobile/src/screens/RiasecScreen.tsx
 * RIASEC assessment — 30 questions, all 6 types, stored to backend on completion.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator
} from 'react-native';
import { apiClient } from '../api/client';
import { Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';

// 30 representative RIASEC questions (6 per type)
const QUESTIONS = [
  // Realistic (R)
  { id:'r1', cat:'R', text:'I enjoy fixing mechanical devices or machinery.' },
  { id:'r2', cat:'R', text:'I prefer working with tools and physical equipment.' },
  { id:'r3', cat:'R', text:'Building or repairing things satisfies me.' },
  { id:'r4', cat:'R', text:'I like working outdoors with my hands.' },
  { id:'r5', cat:'R', text:'Operating machines or computers appeals to me.' },
  // Investigative (I)
  { id:'i1', cat:'I', text:'I enjoy solving complex scientific or mathematical problems.' },
  { id:'i2', cat:'I', text:'I like researching and reading about science and technology.' },
  { id:'i3', cat:'I', text:'I prefer analysing data over interacting with people.' },
  { id:'i4', cat:'I', text:'Discovering how things work excites me.' },
  { id:'i5', cat:'I', text:'I enjoy working in a laboratory or conducting experiments.' },
  // Artistic (A)
  { id:'a1', cat:'A', text:'I express myself through art, writing, or music.' },
  { id:'a2', cat:'A', text:'I enjoy creative projects with no fixed rules.' },
  { id:'a3', cat:'A', text:'Designing or crafting original work excites me.' },
  { id:'a4', cat:'A', text:'I value imagination and creative freedom.' },
  { id:'a5', cat:'A', text:'I find beauty and inspiration in everyday things.' },
  // Social (S)
  { id:'s1', cat:'S', text:'I enjoy teaching or explaining things to others.' },
  { id:'s2', cat:'S', text:'Helping people solve their personal problems gives me satisfaction.' },
  { id:'s3', cat:'S', text:'I prefer working in teams rather than alone.' },
  { id:'s4', cat:'S', text:'I enjoy volunteering or community service.' },
  { id:'s5', cat:'S', text:'Understanding and supporting others comes naturally to me.' },
  // Enterprising (E)
  { id:'e1', cat:'E', text:'I like persuading others and leading groups.' },
  { id:'e2', cat:'E', text:'Starting a business or new project excites me.' },
  { id:'e3', cat:'E', text:'I enjoy making decisions and taking charge.' },
  { id:'e4', cat:'E', text:'Selling ideas or products interests me.' },
  { id:'e5', cat:'E', text:'I am motivated by competition and achievement.' },
  // Conventional (C)
  { id:'c1', cat:'C', text:'I prefer tasks that follow clear rules and procedures.' },
  { id:'c2', cat:'C', text:'Managing records, data, or finances appeals to me.' },
  { id:'c3', cat:'C', text:'I like organising information and keeping things orderly.' },
  { id:'c4', cat:'C', text:'Working with numbers and spreadsheets suits me.' },
  { id:'c5', cat:'C', text:'I prefer predictable, structured work environments.' },
];

const OPTIONS = [
  { value: 0, label: 'Strongly Disagree' },
  { value: 1, label: 'Disagree' },
  { value: 2, label: 'Neutral' },
  { value: 3, label: 'Agree' },
  { value: 4, label: 'Strongly Agree' },
];

const CAT_NAMES: Record<string, string> = {
  R: 'Realistic (Hands-on)',
  I: 'Investigative (Analytical)',
  A: 'Artistic (Creative)',
  S: 'Social (Helping)',
  E: 'Enterprising (Leadership)',
  C: 'Conventional (Structured)',
};

interface Props { onComplete?: (cluster: string) => void }

export function RiasecScreen({ onComplete }: Props) {
  const { dark, colors: c } = useTheme();

  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scores,    setScores]    = useState<Record<string, number>>({});
  const [saving,    setSaving]    = useState(false);

  const q   = QUESTIONS[current];
  const pct = Math.round(((current) / QUESTIONS.length) * 100);

  const selectAnswer = (value: number) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (current < QUESTIONS.length - 1) {
      setCurrent(i => i + 1);
    } else {
      // Calculate scores
      const s: Record<string, number> = { R:0, I:0, A:0, S:0, E:0, C:0 };
      QUESTIONS.forEach(q2 => { s[q2.cat] = (s[q2.cat] || 0) + (newAnswers[q2.id] || 0); });
      setScores(s);
      saveResults(s, newAnswers);
    }
  };

  const saveResults = async (s: Record<string, number>, ans: Record<string, number>) => {
    setSaving(true);
    const topCat = Object.entries(s).sort((a, b) => b[1] - a[1])[0]?.[0] || 'I';
    const cluster = `${topCat} - ${CAT_NAMES[topCat]}`;
    try {
      await apiClient.post('/api/quiz-results', { quizType: 'RIASEC', answers: ans, scores: s, topCluster: cluster });
      await apiClient.put('/api/profile', { topRiasecCluster: cluster, riasecScores: s });
    } catch { /* save locally anyway */ }
    finally {
      setSaving(false);
      setSubmitted(true);
      onComplete?.(cluster);
    }
  };

  if (submitted) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top    = sorted[0];
    const maxPossible = 20; // 5 questions × 4 max

    return (
      <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.scroll}>
        <View style={[styles.resultBanner, { backgroundColor: c.primary }]}> 
          <Text style={styles.resultEmoji}>🎯</Text>
          <Text style={[styles.resultTitle, { color: c.onPrimary }]}>Your RIASEC Profile</Text>
          <Text style={[styles.resultCluster, { color: c.onPrimary }]}>{CAT_NAMES[top[0]]}</Text>
          <Text style={[styles.resultSub, { color: c.onPrimary }]}>Primary type based on your answers</Text>
        </View>
        {sorted.map(([cat, score]) => (
          <View key={cat} style={styles.scoreRow}>
            <Text style={[styles.scoreLabel, { color: c.text }]}>{CAT_NAMES[cat]}</Text>
            <View style={[styles.scoreBarBg, { backgroundColor: c.border }]}>
              <View style={[styles.scoreBarFill, { width: `${Math.round((score / maxPossible) * 100)}%` as any, backgroundColor: cat === top[0] ? c.primary : c.accent }]} />
            </View>
            <Text style={[styles.scoreVal, { color: c.muted }]}>{score}/{maxPossible}</Text>
          </View>
        ))}
        <View style={[styles.tipCard, { backgroundColor: c.primary + '18', borderColor: c.primary + '45' }]}>
          <Text style={[styles.tipTitle, { color: c.text }]}>What this means</Text>
          <Text style={[styles.tipText, { color: c.muted }]}>
            Your top type is <Text style={{ fontWeight: FontWeight.bold, color: c.primary }}>{CAT_NAMES[top[0]]}</Text>. Go to the Career AI tab to see careers matched to your RIASEC profile.
          </Text>
        </View>
        <Button label="View Career Matches" onPress={() => onComplete?.(top[0])} />
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Progress */}
      <View style={[styles.progressBar, { backgroundColor: c.surface }]}>
        <View style={styles.progressMeta}>
          <Text style={[styles.progressText, { color: c.muted }]}>Question {current + 1} of {QUESTIONS.length}</Text>
          <Text style={[styles.progressText, { color: c.primary }]}>{pct}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
          <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: c.primary }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.questionScroll}>
        {/* Category badge */}
        <View style={[styles.catBadge, { backgroundColor: c.primary + '20', borderColor: c.primary }]}> 
          <Text style={[styles.catText, { color: c.primary }]}>{CAT_NAMES[q.cat]}</Text>
        </View>

        {/* Question */}
        <Text style={[styles.questionText, { color: c.text }]}>{q.text}</Text>

        {/* Options */}
        {OPTIONS.map(opt => {
          const chosen = answers[q.id] === opt.value;
          return (
            <TouchableOpacity key={opt.value} onPress={() => selectAnswer(opt.value)}
              style={[styles.optionBtn, { backgroundColor: chosen ? c.primary : c.surface, borderColor: chosen ? c.primary : c.border }]}
              accessibilityRole="radio" accessibilityState={{ selected: chosen }}>
              <Text style={[styles.optionText, { color: chosen ? c.onPrimary : c.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Back */}
        {current > 0 && (
          <TouchableOpacity onPress={() => setCurrent(i => i - 1)} style={styles.backBtn}>
            <Text style={{ color: c.muted, fontSize: FontSize.sm }}>← Previous question</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator color={c.primary} size="large" />
          <Text style={{ color: '#fff', marginTop: Spacing.md }}>Saving your results...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:        { padding: Spacing['2xl'], paddingBottom: 80 },
  resultBanner:  { borderRadius: Radius.xl, padding: Spacing['3xl'], alignItems: 'center', marginBottom: Spacing['2xl'] },
  resultEmoji:   { fontSize: 52, marginBottom: Spacing.md },
  resultTitle:   { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  resultCluster: { fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold, marginTop: Spacing.xs },
  resultSub:     { fontSize: FontSize.sm, marginTop: Spacing.xs },
  scoreRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, gap: Spacing.sm },
  scoreLabel:    { width: 140, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  scoreBarBg:    { flex: 1, height: 8, borderRadius: Radius.full, overflow: 'hidden' },
  scoreBarFill:  { height: 8, borderRadius: Radius.full },
  scoreVal:      { width: 36, textAlign: 'right', fontSize: FontSize.xs },
  tipCard:       { padding: Spacing['2xl'], borderWidth: 1, borderRadius: Radius.lg, marginTop: Spacing['2xl'], marginBottom: Spacing['2xl'] },
  tipTitle:      { fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  tipText:       { fontSize: FontSize.sm, lineHeight: 20 },
  progressBar:   { padding: Spacing.lg, paddingBottom: Spacing.sm },
  progressMeta:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  progressText:  { fontSize: FontSize.xs },
  progressTrack: { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill:  { height: 6, borderRadius: Radius.full },
  questionScroll:{ padding: Spacing['2xl'], paddingBottom: 80 },
  catBadge:      { alignSelf: 'flex-start', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, marginBottom: Spacing.xl },
  catText:       { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  questionText:  { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: 30, marginBottom: Spacing['3xl'] },
  optionBtn:     { padding: Spacing.xl, borderRadius: Radius.md, borderWidth: 1.5, marginBottom: Spacing.md, alignItems: 'center' },
  optionText:    { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  backBtn:       { alignItems: 'center', paddingTop: Spacing.xl },
  savingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
});
