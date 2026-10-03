/**
 * mobile/src/screens/LoginScreen.tsx
 * NexStep mobile login screen with 100% parity with web application:
 * - Password & One-Time Password (OTP) login modes
 * - Social Sign-In (Google, GitHub, LinkedIn)
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
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { OtpModal } from '../components/OtpModal';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { sendOtp } from '../api/auth';

interface Props {
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
}

export function LoginScreen({ onNavigateRegister, onNavigateForgot }: Props) {
  const { login, loginWithOtp } = useAuth();
  const { dark, colors: themeColors } = useTheme();

  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // OTP Login modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState('');

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (loginMethod === 'password' && !password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePasswordLogin = async () => {
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

  const handleSendOtpLogin = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address first' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await sendOtp(email.trim().toLowerCase(), 'LOGIN');
      if (res.devOtpCode) setDevOtpCode(res.devOtpCode);
      setShowOtpModal(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Failed to send OTP code. Please check your email.';
      Alert.alert('OTP Request Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLogin = async (otpCode: string) => {
    await loginWithOtp(email.trim().toLowerCase(), otpCode);
    setShowOtpModal(false);
  };

  const { bg, text, muted, border } = themeColors;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: bg }}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: bg }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>NS</Text>
          </View>
          <Text style={[styles.title, { color: text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: muted }]}>
            Sign in to NexStep AI · Career & Academic Navigator
          </Text>
        </View>

        {/* Social Authentication */}
        <SocialAuthButtons
          onError={(msg) => Alert.alert('Social Sign-In', msg)}
          disabled={loading}
        />

        {/* Method Toggle Tab */}
        <View style={[styles.methodToggle, { backgroundColor: themeColors.surface2, borderColor: border }]}>
          <TouchableOpacity
            style={[
              styles.methodBtn,
              loginMethod === 'password' && { backgroundColor: themeColors.surface },
            ]}
            onPress={() => setLoginMethod('password')}
            accessibilityRole="tab"
          >
            <Text
              style={[
                styles.methodText,
                { color: loginMethod === 'password' ? Colors.primary : muted },
              ]}
            >
              Password Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodBtn,
              loginMethod === 'otp' && { backgroundColor: themeColors.surface },
            ]}
            onPress={() => setLoginMethod('otp')}
            accessibilityRole="tab"
          >
            <Text
              style={[
                styles.methodText,
                { color: loginMethod === 'otp' ? Colors.primary : muted },
              ]}
            >
              One-Time Code (OTP)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Body */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            dark={dark}
            placeholder="you@example.com"
          />

          {loginMethod === 'password' ? (
            <>
              <Input
                label="Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                secureToggle
                error={errors.password}
                dark={dark}
                placeholder="Your password"
              />

              <TouchableOpacity
                onPress={onNavigateForgot}
                style={styles.forgotRow}
                accessibilityRole="button"
              >
                <Text style={[styles.linkText, { color: Colors.primary }]}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                label="Sign In"
                onPress={handlePasswordLogin}
                loading={loading}
                style={styles.btn}
              />
            </>
          ) : (
            <View style={styles.otpSection}>
              <Text style={[styles.otpNote, { color: muted }]}>
                We will send a secure 6-digit verification code to your email. No password needed.
              </Text>
              <Button
                label={loading ? 'Sending Code...' : 'Send Verification Code'}
                onPress={handleSendOtpLogin}
                loading={loading}
                style={styles.btn}
              />
            </View>
          )}

          <TouchableOpacity
            onPress={onNavigateRegister}
            style={styles.registerRow}
            accessibilityRole="button"
          >
            <Text style={[styles.mutedText, { color: muted }]}>Don't have an account? </Text>
            <Text style={[styles.linkText, { color: Colors.primary }]}>Create Free Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: muted }]}>
          NexStep AI · Career & Academic Navigator
        </Text>
      </ScrollView>

      {/* OTP Code Entry Modal */}
      <OtpModal
        visible={showOtpModal}
        email={email.trim().toLowerCase()}
        purpose="LOGIN"
        devOtpCode={devOtpCode}
        onVerified={handleVerifyOtpLogin}
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
  methodToggle: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  methodText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  form: {
    width: '100%',
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  otpSection: {
    gap: Spacing.md,
  },
  otpNote: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  btn: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  registerRow: {
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
