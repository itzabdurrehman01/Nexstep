/**
 * mobile/src/api/auth.ts
 * All authentication API calls for the mobile app, with full parity to the web application:
 * - Email & Password Login / Register
 * - One-Time Password (OTP) verification & registration flow
 * - Passwordless OTP Login
 * - Social Login (Google, GitHub, LinkedIn)
 * - Forgot / Reset Password
 */
import { apiClient, storeTokens, clearTokens, getRefreshToken } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'STUDENT' | 'MENTOR' | 'RECRUITER';
}

export interface RegisterWithOtpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: 'STUDENT' | 'MENTOR' | 'RECRUITER';
  verificationToken?: string;
  otpCode?: string;
}

export interface SocialLoginPayload {
  provider: 'GOOGLE' | 'GITHUB' | 'LINKEDIN';
  idToken?: string;
  accessToken?: string;
  profile: {
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    avatarUrl?: string;
    picture?: string;
    id?: string;
    sub?: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: string;
  isVerified: boolean;
  avatarUrl?: string;
}

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await apiClient.post('/api/auth/login-mobile', payload);
  await storeTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post('/api/auth/register', {
    email: payload.email,
    password: payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role || 'STUDENT',
  });
  if (data.accessToken) await storeTokens(data.accessToken, data.refreshToken ?? '');
  return data.user;
}

export async function sendOtp(email: string, purpose = 'REGISTER', phone?: string): Promise<{ success: boolean; message: string; devOtpCode?: string }> {
  const { data } = await apiClient.post('/api/auth/otp/send', {
    email,
    purpose,
    phone,
  });
  return data;
}

export async function verifyOtp(email: string, otpCode: string, purpose = 'REGISTER'): Promise<{ success: boolean; verified: boolean; verificationToken: string; message: string }> {
  const { data } = await apiClient.post('/api/auth/otp/verify', {
    email,
    otpCode,
    purpose,
  });
  return data;
}

export async function registerWithOtp(payload: RegisterWithOtpPayload): Promise<User> {
  const { data } = await apiClient.post('/api/auth/register-with-otp', payload);
  if (data.accessToken) await storeTokens(data.accessToken, data.refreshToken ?? '');
  return data.user;
}

export async function loginWithOtp(email: string, otpCode: string): Promise<User> {
  const { data } = await apiClient.post('/api/auth/otp/login', {
    email,
    otpCode,
  });
  if (data.accessToken) await storeTokens(data.accessToken, data.refreshToken ?? '');
  return data.user;
}

export async function socialLogin(payload: SocialLoginPayload): Promise<User> {
  const { data } = await apiClient.post('/api/auth/social-login', payload);
  if (data.accessToken) await storeTokens(data.accessToken, data.refreshToken ?? '');
  return data.user;
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    await apiClient.post('/api/auth/logout-mobile', { refreshToken });
  } catch {
    /* local tokens are still cleared below */
  }
  await clearTokens();
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/api/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiClient.post('/api/auth/reset-password', { token, password });
}

export async function getMe(): Promise<User | null> {
  try {
    const { data } = await apiClient.get('/api/auth/me');
    return data;
  } catch {
    return null;
  }
}
