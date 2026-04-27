import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function FarmerLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#22c55e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "700",
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{
            headerTitle: "My Profile",
          }}
        />
        <Stack.Screen
          name="add-product"
          options={{
            headerTitle: "Add/Edit Product",
          }}
        />
        <Stack.Screen
          name="orders/[id]"
          options={{
            headerTitle: "Order Details",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}