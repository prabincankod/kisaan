import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../src/store/auth.store";
import * as SecureStore from "expo-secure-store";

const queryClient = new QueryClient();

export default function RootLayoutNav() {
  const { user, setAuth } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token && !user) {
        try {
          const { getMe } = await import("../src/api/auth.api");
          const response: any = await getMe();
          setAuth(response.data, token);
        } catch (error) {
          await SecureStore.deleteItemAsync("token");
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#22c55e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="farmer" options={{ headerShown: false }} />
        <Stack.Screen name="buyer" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </QueryClientProvider>
  );
}
