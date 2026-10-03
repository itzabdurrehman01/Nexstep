/**
 * mobile/src/components/SocialAuthButtons.tsx
 * Social sign-in buttons for Google, GitHub, and LinkedIn matching the web design tokens.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';

interface Props {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  disabled?: boolean;
}

export function SocialAuthButtons({ onSuccess, onError, disabled }: Props) {
  const { socialLogin } = useAuth();
  const { dark, colors: c } = useTheme();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialAuth = async (provider: 'GOOGLE' | 'GITHUB' | 'LINKEDIN') => {
    setLoadingProvider(provider);
    if (onError) onError('');

    try {
      let mockProfile: any = null;

      if (provider === 'GOOGLE') {
        mockProfile = {
          email: 'google.student@nexstep.edu.pk',
          firstName: 'Google',
          lastName: 'Scholar',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          id: 'google_oauth_mobile_' + Date.now(),
        };
      } else if (provider === 'GITHUB') {
        mockProfile = {
          email: 'github.developer@nexstep.edu.pk',
          firstName: 'GitHub',
          lastName: 'Dev',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          id: 'github_oauth_mobile_' + Date.now(),
        };
      } else if (provider === 'LINKEDIN') {
        mockProfile = {
          email: 'linkedin.professional@nexstep.edu.pk',
          firstName: 'LinkedIn',
          lastName: 'Pro',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
          id: 'linkedin_oauth_mobile_' + Date.now(),
        };
      }

      await socialLogin({
        provider,
        profile: mockProfile,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Social sign-in failed. Please try again.';
      if (onError) onError(msg);
    } finally {
      setLoadingProvider(null);
    }
  };

  const isBusy = disabled || !!loadingProvider;

  return (
    <View style={styles.container}>
      {/* Google Button */}
      <TouchableOpacity
        style={[
          styles.btnGoogle,
          {
            backgroundColor: dark ? c.surface2 : '#ffffff',
            borderColor: dark ? c.border : '#e2e8f0',
          },
          isBusy && styles.disabled,
        ]}
        onPress={() => handleSocialAuth('GOOGLE')}
        disabled={isBusy}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        {loadingProvider === 'GOOGLE' ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <View style={styles.row}>
            <View style={styles.googleIconBadge}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={[styles.btnText, { color: c.text }]}>Continue with Google</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* GitHub & LinkedIn Row */}
      <View style={styles.gridRow}>
        <TouchableOpacity
          style={[
            styles.btnGrid,
            {
              backgroundColor: dark ? c.surface2 : '#ffffff',
              borderColor: dark ? c.border : '#e2e8f0',
            },
            isBusy && styles.disabled,
          ]}
          onPress={() => handleSocialAuth('GITHUB')}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Continue with GitHub"
        >
          {loadingProvider === 'GITHUB' ? (
            <ActivityIndicator size="small" color={c.text} />
          ) : (
            <View style={styles.row}>
              <View style={[styles.brandBadge, { backgroundColor: '#24292e' }]}>
                <Text style={styles.brandBadgeText}>GH</Text>
              </View>
              <Text style={[styles.gridBtnText, { color: c.text }]}>GitHub</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.btnGrid,
            {
              backgroundColor: dark ? c.surface2 : '#ffffff',
              borderColor: dark ? c.border : '#e2e8f0',
            },
            isBusy && styles.disabled,
          ]}
          onPress={() => handleSocialAuth('LINKEDIN')}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Continue with LinkedIn"
        >
          {loadingProvider === 'LINKEDIN' ? (
            <ActivityIndicator size="small" color="#0A66C2" />
          ) : (
            <View style={styles.row}>
              <View style={[styles.brandBadge, { backgroundColor: '#0A66C2' }]}>
                <Text style={styles.brandBadgeText}>in</Text>
              </View>
              <Text style={[styles.gridBtnText, { color: c.text }]}>LinkedIn</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: dark ? c.border : '#e2e8f0' }]} />
        <Text style={[styles.dividerLabel, { color: c.muted }]}>OR CONTINUE WITH</Text>
        <View style={[styles.dividerLine, { backgroundColor: dark ? c.border : '#e2e8f0' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  btnGoogle: {
    width: '100%',
    height: 48,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btnGrid: {
    flex: 1,
    height: 44,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  gridBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  googleIconBadge: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: FontWeight.extrabold,
  },
  brandBadge: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: FontWeight.extrabold,
  },
  disabled: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    paddingHorizontal: Spacing.md,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
  },
});
