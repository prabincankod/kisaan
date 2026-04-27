import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { useAuthStore } from './src/store/auth.store';
import { colors } from './src/theme/designSystem';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { BuyerNavigator } from './src/navigation/BuyerNavigator';
import { FarmerNavigator } from './src/navigation/FarmerNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AppContent() {
  const { user, setAuth } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token && !user) {
          const { getMe } = await import('./src/api/auth.api');
          const response: any = await getMe();
          setAuth(response.data, token);
        }
      } catch (error) {
        await SecureStore.deleteItemAsync('token');
      } finally {
        setInitializing(false);
      }
    };
    checkAuth();
  }, []);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getNavigator = () => {
    if (!user) {
      return <AuthNavigator />;
    }
    if (user.role === 'buyer') {
      return <BuyerNavigator />;
    }
    if (user.role === 'farmer') {
      return <FarmerNavigator />;
    }
    return <AuthNavigator />;
  };

  return (
    <SafeAreaProvider>

    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surfaceElevated,
          text: colors.onSurface,
          border: colors.separator,
          notification: colors.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '600' },
          heavy: { fontFamily: 'System', fontWeight: '700' },
        },
      }}
      >
      {getNavigator()}
    </NavigationContainer>
      </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={{ paddingTop : StatusBar.currentHeight}}>
<StatusBar hidden/>
      <View style={{flex: 1}}>
        
      <QueryClientProvider client={queryClient}>
        {/* <StatusBar barStyle="dark-content" backgroundColor={colors.background} /> */}
        <AppContent />
      </QueryClientProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});