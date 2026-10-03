/**
 * mobile/src/screens/RegisterScreen.tsx
 * NexStep mobile registration screen with 100% parity with web application:
 * - 6-Digit One-Time Password (OTP) verification before account creation
 * - Public Role selection (Student, Mentor, Recruiter)
 * - Social Sign-Up (Google, GitHub, LinkedIn)
 * - Light / Dark theme support
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { register, sendOtp } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { OtpModal } from '../components/OtpModal';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onNavigateLogin: () => void;
}

type UserRole = 'STUDENT' | 'MENTOR' | 'RECRUITER';

export function RegisterScreen({ onNavigateLogin }: Props) {
  const { refreshUser, registerWithOtp } = useAuth();
  const { dark, colors: themeColors } = useTheme();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // OTP Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState('');

  const set = (k: string) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

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

  const handleInitiateRegisterWithOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await sendOtp(form.email.trim().toLowerCase(), 'REGISTER');
      if (res.devOtpCode) setDevOtpCode(res.devOtpCode);
      setShowOtpModal(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Could not send verification code. Please try again.';
      Alert.alert('Verification Code Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async (otpCode: string) => {
    await registerWithOtp({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      confirmPassword: form.confirm,
      role,
      otpCode,
    });
    setShowOtpModal(false);
    await refreshUser();
  };

  const { bg, text, muted, border } = themeColors;

  const ROLES: { id: UserRole; label: string; icon: string; desc: string }[] = [
    { id: 'STUDENT', label: 'Student', icon: '🎓', desc: 'Find careers & degrees' },
    { id: 'MENTOR', label: 'Mentor', icon: '💼', desc: 'Guide students' },
    { id: 'RECRUITER', label: 'Recruiter', icon: '🏢', desc: 'Post opportunities' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: bg }}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: bg }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>NS</Text>
          </View>
          <Text style={[styles.title, { color: text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: muted }]}>
            Join NexStep AI · Career & Academic Navigator
          </Text>
        </View>

        {/* Social Sign Up */}
        <SocialAuthButtons
          onError={(msg) => Alert.alert('Social Sign-Up', msg)}
          disabled={loading}
        />

        <View style={styles.form}>
          {/* Role Selector */}
          <Text style={[styles.fieldLabel, { color: text }]}>I want to join as:</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: active ? (dark ? '#064e3b' : '#ecfdf5') : themeColors.surface2,
                      borderColor: active ? Colors.primary : border,
                    },
                  ]}
                  onPress={() => setRole(r.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text
                    style={[
                      styles.roleTitle,
                      { color: active ? Colors.primary : text },
                    ]}
                  >
                    {r.label}
                  </Text>
                  <Text numberOfLines={1} style={[styles.roleDesc, { color: muted }]}>
                    {r.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Input
                label="First Name"
                value={form.firstName}
                onChangeText={set('firstName')}
                error={errors.firstName}
                dark={dark}
                placeholder="Ahmed"
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Input
                label="Last Name"
                value={form.lastName}
                onChangeText={set('lastName')}
                dark={dark}
                placeholder="Khan"
              />
            </View>
          </View>

          <Input
            label="Email Address"
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            dark={dark}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            value={form.password}
            onChangeText={set('password')}
            secureToggle
            error={errors.password}
            dark={dark}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
          />

          <Input
            label="Confirm Password"
            value={form.confirm}
            onChangeText={set('confirm')}
            secureToggle
            error={errors.confirm}
            dark={dark}
            placeholder="Re-enter password"
          />

          {/* Submit with OTP */}
          <Button
            label={loading ? 'Sending Code...' : 'Verify with OTP & Sign Up'}
            onPress={handleInitiateRegisterWithOtp}
            loading={loading}
            style={styles.btn}
          />

          <TouchableOpacity
            onPress={onNavigateLogin}
            style={styles.loginRow}
            accessibilityRole="button"
          >
            <Text style={[styles.mutedText, { color: muted }]}>Already have an account? </Text>
            <Text style={[styles.linkText, { color: Colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: muted }]}>
          NexStep AI · Career & Academic Navigator
        </Text>
      </ScrollView>

      {/* OTP Code Entry Modal */}
      <OtpModal
        visible={showOtpModal}
        email={form.email.trim().toLowerCase()}
        purpose="REGISTER"
        devOtpCode={devOtpCode}
        onVerified={handleOtpVerified}
        onClose={() => setShowOtpModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#ffffff',
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  roleCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  roleTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  roleDesc: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
  },
  btn: {
    width: '100%',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  mutedText: {
    fontSize: FontSize.sm,
  },
  linkText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    marginTop: Spacing['2xl'],
  },
});
