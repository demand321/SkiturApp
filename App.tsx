import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/stores/authStore';
import { onAuthChange } from './src/services/auth';
import { registerForPushNotifications } from './src/services/notifications';
import { startNetworkMonitor } from './src/services/networkMonitor';
import { resumeTrackingIfNeeded } from './src/services/tracking';
import { processQueue } from './src/services/photoQueue';
import SyncStatusBar from './src/components/common/SyncStatusBar';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { COLORS } from './src/constants';

const queryClient = new QueryClient();

function RootNavigator() {
  const { user, isLoading, setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(setUser);
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    if (user?.uid) {
      registerForPushNotifications(user.uid).catch(console.warn);
      resumeTrackingIfNeeded().catch(console.warn);
      processQueue().catch(console.warn);
    }
  }, [user?.uid]);

  useEffect(() => {
    startNetworkMonitor();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <SyncStatusBar />
      {user ? <MainNavigator /> : <AuthNavigator />}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
