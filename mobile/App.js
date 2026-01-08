import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
/* 
 * Local Data Migration Note:
 * Firestore seeding logic has been removed as we are now using a local-first approach.
 * Student data is loaded from JSON files in services/localDataService.js.
 */

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
