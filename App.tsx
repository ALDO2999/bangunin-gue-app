import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { setupAlarm } from './src/services/alarm';

export default function App() {
  // Create notification channels and request permission once at startup.
  useEffect(() => {
    setupAlarm();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
