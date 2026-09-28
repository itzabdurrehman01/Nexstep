/**
 * mobile/src/screens/LoginScreen.tsx
 * NexStep mobile login screen.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input }  from '../components/Input';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

interface Props { onNavigateRegister: () => void; onNavigateForgot: () => void }

export function LoginScreen({ onNavigateRegister, onNavigateForgot }: Props) {
  const { login } = useAuth();
  const { dark, colors: themeColors } = useTheme();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password)         e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const { bg, text, muted, border } = themeColors;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: bg }]} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>NS</Text>
          </View>
          <Text style={[styles.title, { color: text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: muted }]}>Sign in to your NexStep account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            dark={dark}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureToggle
            error={errors.password}
            dark={dark}
            placeholder="Your password"
          />

          <TouchableOpacity onPress={onNavigateForgot} style={styles.forgotRow} accessibilityRole="button">
            <Text style={[styles.linkText, { color: Colors.primary }]}>Forgot password?</Text>
          </TouchableOpacity>

          <Button label="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: border }]} />
            <Text style={[styles.dividerText, { color: muted }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: border }]} />
          </View>

          <TouchableOpacity onPress={onNavigateRegister} style={styles.registerRow} accessibilityRole="button">
            <Text style={[styles.mutedText, { color: muted }]}>Don't have an account? </Text>
            <Text style={[styles.linkText, { color: Colors.primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: muted }]}>
          NexStep AI · Air University FYP
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:      { flexGrow: 1, paddingHorizontal: Spacing['3xl'], paddingTop: 60, paddingBottom: 40 },
  header:      { alignItems: 'center', marginBottom: Spacing['4xl'] },
  logoBadge:   { width: 72, height: 72, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  logoText:    { color: '#fff', fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold },
  title:       { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold, marginBottom: Spacing.sm },
  subtitle:    { fontSize: FontSize.base, textAlign: 'center' },
  form:        { width: '100%' },
  forgotRow:   { alignSelf: 'flex-end', marginTop: -Spacing.sm, marginBottom: Spacing.xl },
  btn:         { marginTop: Spacing.sm },
  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing['2xl'] },
  divider:     { flex: 1, height: 1 },
  dividerText: { marginHorizontal: Spacing.md, fontSize: FontSize.sm },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  mutedText:   { fontSize: FontSize.base },
  linkText:    { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  footer:      { textAlign: 'center', fontSize: FontSize.xs, marginTop: Spacing['3xl'] },
});
