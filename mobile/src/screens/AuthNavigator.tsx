/**
 * mobile/src/screens/AuthNavigator.tsx
 * Unauthenticated flow: Login → Register → ForgotPassword
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { LoginScreen }          from './LoginScreen';
import { RegisterScreen }       from './RegisterScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

type Screen = 'login' | 'register' | 'forgot';

export function AuthNavigator() {
  const [screen, setScreen] = useState<Screen>('login');

  return (
    <View style={{ flex: 1 }}>
      {screen === 'login'    && <LoginScreen    onNavigateRegister={() => setScreen('register')} onNavigateForgot={() => setScreen('forgot')} />}
      {screen === 'register' && <RegisterScreen onNavigateLogin={() => setScreen('login')} />}
      {screen === 'forgot'   && <ForgotPasswordScreen onBack={() => setScreen('login')} />}
    </View>
  );
}
