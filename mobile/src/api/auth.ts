/**
 * mobile/src/api/auth.ts
 * All authentication API calls for the mobile app.
 */
import { apiClient, storeTokens, clearTokens, getRefreshToken } from './client';

export interface LoginPayload  { email: string; password: string }
export interface RegisterPayload { firstName: string; lastName: string; email: string; password: string }
export interface User { id: string; email: string; firstName: string; lastName: string; role: string; isVerified: boolean }

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await apiClient.post('/api/auth/login-mobile', payload);
  await storeTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post('/api/auth/register', {
    email:     payload.email,
    password:  payload.password,
    firstName: payload.firstName,
    lastName:  payload.lastName,
  });
  if (data.accessToken) await storeTokens(data.accessToken, data.refreshToken ?? '');
  return data.user;
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    await apiClient.post('/api/auth/logout-mobile', { refreshToken });
  } catch { /* local tokens are still cleared below */ }
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
