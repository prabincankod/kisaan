import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/designSystem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { AuthNavigator } from './AuthNavigator';
import { BuyerNavigator } from './BuyerNavigator';
import { FarmerNavigator } from './FarmerNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export function AppNavigator() {
  const { user, setAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token && !user) {
        try {
          const { getMe } = await import('../api/auth.api');
          const response: any = await getMe();
          setAuth(response.data, token);
        } catch (error) {
          await SecureStore.deleteItemAsync('token');
        }
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
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
    <SafeAreaProvider >


    <QueryClientProvider client={queryClient}>
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
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '900' },
          },
        }}
        >
        {getNavigator()}
      </NavigationContainer>
    </QueryClientProvider>
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