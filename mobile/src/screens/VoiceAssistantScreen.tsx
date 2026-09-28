import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Mic, Volume2, Sparkles } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { Card } from '../components/Card';

const MicIcon: any = Mic;
const Volume2Icon: any = Volume2;
const SparklesIcon: any = Sparkles;

export function VoiceAssistantScreen() {
  const { dark, colors: c } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Press the microphone to ask NexStep Voice Assistant...');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const toggleListen = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('Listening... "Tell me about top IT courses after Matric"');
      setTimeout(() => {
        setIsListening(false);
        setAiResponse('After Matric, TEVTA offers 1-year DIT (Diploma in Information Technology) and NAVTTC offers 6-month full-stack web and cloud computing bootcamps with monthly stipends.');
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={styles.eyebrow}>SPEECH & INTERACTIVE VOICE</Text>
        <Text style={[styles.title, { color: c.text }]}>Voice Career Assistant</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Speak naturally in English or Urdu to get instant career guidance and university advice.
        </Text>
      </Animated.View>

      <Card dark={dark} elevated style={styles.voiceCard}>
        <TouchableOpacity
          onPress={toggleListen}
          style={[
            styles.micBtn,
            { backgroundColor: isListening ? Colors.danger : Colors.primary }
          ]}
        >
          <MicIcon size={36} color="#06110d" />
        </TouchableOpacity>
        <Text style={[styles.micStatus, { color: c.text }]}>{isListening ? 'Listening...' : 'Tap to Speak'}</Text>
        <Text style={[styles.transcriptText, { color: c.muted }]}>{transcript}</Text>
      </Card>

      {aiResponse && (
        <Card dark={dark} elevated style={styles.card}>
          <View style={styles.respHeader}>
            <Volume2Icon size={20} color={Colors.primary} />
            <Text style={[styles.respTitle, { color: c.text }]}>AI Voice Response</Text>
          </View>
          <Text style={[styles.respText, { color: c.text }]}>{aiResponse}</Text>
        </Card>
      )}

      {/* Voice Commands Cheat Sheet */}
      <Card dark={dark} elevated style={styles.card}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Sample Voice Commands</Text>
        {['"What is the merit cutoff for NUST CS?"', '"List top need-based scholarships in Punjab"', '"Suggest careers for Science Computer group"', '"How to prepare for ECAT entrance test?"'].map((cmd, i) => (
          <TouchableOpacity key={i} onPress={() => { setTranscript(cmd); setAiResponse('Processing voice query: ' + cmd); }} style={[styles.cmdRow, { backgroundColor: c.surface2 }]}>
            <SparklesIcon size={16} color={Colors.primary} />
            <Text style={[styles.cmdText, { color: c.text }]}>{cmd}</Text>
          </TouchableOpacity>
        ))}
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
  voiceCard: { padding: Spacing['3xl'], borderRadius: Radius['2xl'], alignItems: 'center', gap: Spacing.md },
  micBtn: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  micStatus: { fontSize: FontSize.base, fontWeight: FontWeight.extrabold },
  transcriptText: { fontSize: FontSize.sm, textAlign: 'center' },
  card: { padding: Spacing.xl, borderRadius: Radius['2xl'], gap: Spacing.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  respHeader: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  respTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  respText: { fontSize: FontSize.sm, lineHeight: 22 },
  cmdRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, marginTop: 4 },
  cmdText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
});
