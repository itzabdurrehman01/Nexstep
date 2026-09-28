/**
 * mobile/App.tsx
 * Root entry point for NexStep React Native app.
 *
 * ARCHITECTURE:
 *   AuthProvider wraps everything. AuthNavigator shown when unauthenticated,
 *   MainNavigator shown when authenticated. Loading spinner while restoring session.
 *
 * NO WEBVIEW IS USED. All screens are native React Native components.
 */
import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthNavigator } from './src/screens/AuthNavigator';
import { MainNavigator } from './src/screens/MainNavigator';
import { Colors } from './src/utils/theme';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';

function RootRouter() {
  const { authStatus } = useAuth();
  const { dark, colors: c } = useTheme();

  if (authStatus === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return authStatus === 'authenticated'
    ? <MainNavigator />
    : <AuthNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <RootRouter />
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
