/**
 * mobile/src/screens/ForgotPasswordScreen.tsx
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { forgotPassword } from '../api/auth';
import { Button } from '../components/Button';
import { Input }  from '../components/Input';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

interface Props { onBack: () => void }

export function ForgotPasswordScreen({ onBack }: Props) {
  const { dark, colors: c } = useTheme();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true); setError('');
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      // Don't reveal if email exists — show generic message
      setSent(true); // Always show success to prevent email enumeration
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: c.bg }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={{ fontSize: 48, marginBottom: Spacing.lg }}>🔐</Text>
          <Text style={[styles.title, { color: c.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: c.muted }]}>
            {sent ? 'If this email exists, you will receive a reset link shortly.' : "Enter your account email and we'll send a reset link."}
          </Text>
        </View>
        {!sent ? (
          <>
            <Input label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={error} dark={dark} placeholder="you@example.com" />
            <Button label="Send Reset Link" onPress={handleSubmit} loading={loading} />
          </>
        ) : (
          <View style={[styles.successCard, { backgroundColor: Colors.success + '15', borderColor: Colors.success }]}>
            <Text style={[styles.successText, { color: Colors.success }]}>✓ Check your email inbox (and spam folder).</Text>
          </View>
        )}
        <Button label="← Back to Sign In" onPress={onBack} variant="ghost" style={{ marginTop: Spacing['2xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:       { flexGrow: 1, padding: Spacing['3xl'], paddingTop: 80 },
  header:       { alignItems: 'center', marginBottom: Spacing['3xl'] },
  title:        { fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold, marginBottom: Spacing.sm },
  subtitle:     { fontSize: FontSize.base, textAlign: 'center', lineHeight: 22 },
  successCard:  { padding: Spacing.xl, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.xl },
  successText:  { fontSize: FontSize.base, fontWeight: FontWeight.semibold, textAlign: 'center' },
});
