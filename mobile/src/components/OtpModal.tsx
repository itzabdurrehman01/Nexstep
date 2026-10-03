/**
 * mobile/src/components/OtpModal.tsx
 * Modal for 6-digit OTP code entry and verification on mobile, matching web OtpVerificationModal.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';
import { sendOtp } from '../api/auth';

interface Props {
  visible: boolean;
  email: string;
  purpose?: 'REGISTER' | 'LOGIN';
  devOtpCode?: string;
  onVerified: (otpCode: string, token?: string) => Promise<void>;
  onClose: () => void;
}

export function OtpModal({
  visible,
  email,
  purpose = 'REGISTER',
  devOtpCode: initialDevOtpCode,
  onVerified,
  onClose,
}: Props) {
  const { dark, colors: c } = useTheme();

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devCode, setDevCode] = useState(initialDevOtpCode || '');
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialDevOtpCode) setDevCode(initialDevOtpCode);
  }, [initialDevOtpCode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible && countdown > 0) {
      timer = setTimeout(() => setCountdown(cd => cd - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [visible, countdown]);

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const res = await sendOtp(email, purpose);
      setCountdown(60);
      if (res.devOtpCode) setDevCode(res.devOtpCode);
      Alert.alert('Code Sent', `A fresh 6-digit code has been sent to ${email}.`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to resend code. Please wait.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onVerified(cleanCode);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Verification failed. Please check the code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          {/* Header Badge */}
          <View style={styles.header}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeText}>6</Text>
            </View>
            <Text style={[styles.title, { color: c.text }]}>Enter Verification Code</Text>
            <Text style={[styles.subtitle, { color: c.muted }]}>
              We sent a 6-digit code to{' '}
              <Text style={{ fontWeight: FontWeight.bold, color: c.text }}>{email}</Text>
            </Text>
          </View>

          {/* Dev Mode Notification */}
          {devCode ? (
            <View style={[styles.devBox, { backgroundColor: Colors.primaryLight }]}>
              <Text style={styles.devLabel}>DEV CODE FOR TESTING</Text>
              <TouchableOpacity onPress={() => setOtpCode(devCode)}>
                <Text style={styles.devCode}>{devCode} (Tap to autofill)</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Input */}
          <View style={styles.inputArea}>
            <Input
              label="6-Digit OTP Code"
              value={otpCode}
              onChangeText={(text) => {
                setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                if (error) setError('');
              }}
              keyboardType="number-pad"
              placeholder="123456"
              maxLength={6}
              dark={dark}
              error={error}
            />
          </View>

          {/* Action Button */}
          <Button
            label={loading ? 'Verifying...' : 'Verify & Continue'}
            onPress={handleVerify}
            loading={loading}
            style={styles.verifyBtn}
          />

          {/* Resend & Cooldown */}
          <View style={styles.footerRow}>
            {countdown > 0 ? (
              <Text style={[styles.resendText, { color: c.muted }]}>
                Resend code in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={[styles.resendLink, { color: Colors.primary }]}>
                  {resending ? 'Sending...' : 'Resend Verification Code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: c.muted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  devBox: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  devLabel: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 0.8,
  },
  devCode: {
    color: '#047857',
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    marginTop: 2,
  },
  inputArea: {
    marginVertical: Spacing.sm,
  },
  verifyBtn: {
    marginTop: Spacing.sm,
  },
  footerRow: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  resendLink: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.xs,
  },
  cancelText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
