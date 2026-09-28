/**
 * mobile/src/screens/RegisterScreen.tsx
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert,
} from 'react-native';
import { register } from '../api/auth';
import { storeTokens } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input }  from '../components/Input';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

interface Props { onNavigateLogin: () => void }

export function RegisterScreen({ onNavigateLogin }: Props) {
  const { refreshUser } = useAuth();
  const { dark, colors: themeColors } = useTheme();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Password must contain a number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim().toLowerCase(), password: form.password });
      await refreshUser();
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.response?.data?.error ?? 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { bg, text, muted } = themeColors;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: bg }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBadge}><Text style={styles.logoText}>NS</Text></View>
          <Text style={[styles.title, { color: text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: muted }]}>Start your AI-powered career journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Input label="First Name" value={form.firstName} onChangeText={set('firstName')} error={errors.firstName} dark={dark} placeholder="Ahmed" />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Input label="Last Name" value={form.lastName}  onChangeText={set('lastName')}  dark={dark} placeholder="Khan" />
            </View>
          </View>
          <Input label="Email" value={form.email}    onChangeText={set('email')}    keyboardType="email-address" autoCapitalize="none" error={errors.email}    dark={dark} placeholder="you@example.com" />
          <Input label="Password" value={form.password} onChangeText={set('password')} secureToggle error={errors.password} dark={dark} placeholder="Min 8 chars, 1 uppercase, 1 number" />
          <Input label="Confirm Password" value={form.confirm} onChangeText={set('confirm')} secureToggle error={errors.confirm} dark={dark} placeholder="Re-enter password" />

          <Button label="Create Account" onPress={handleRegister} loading={loading} style={styles.btn} />

          <TouchableOpacity onPress={onNavigateLogin} style={styles.loginRow} accessibilityRole="button">
            <Text style={[styles.mutedText, { color: muted }]}>Already have an account? </Text>
            <Text style={[styles.linkText, { color: Colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: muted }]}>NexStep AI · Air University FYP</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:    { flexGrow: 1, paddingHorizontal: Spacing['3xl'], paddingTop: 60, paddingBottom: 40 },
  header:    { alignItems: 'center', marginBottom: Spacing['3xl'] },
  logoBadge: { width: 72, height: 72, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  logoText:  { color: '#fff', fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold },
  title:     { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold, marginBottom: Spacing.xs },
  subtitle:  { fontSize: FontSize.base, textAlign: 'center' },
  form:      { width: '100%' },
  nameRow:   { flexDirection: 'row' },
  btn:       { marginTop: Spacing.sm },
  loginRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing['2xl'] },
  mutedText: { fontSize: FontSize.base },
  linkText:  { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  footer:    { textAlign: 'center', fontSize: FontSize.xs, marginTop: Spacing['3xl'] },
});
