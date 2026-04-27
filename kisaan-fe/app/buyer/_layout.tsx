import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function BuyerLayout() {
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
        <Stack.Screen  name="(tabs)" options={{ headerShown: false, title:"Home" }} />
        <Stack.Screen
          name="profile"
          options={{
            headerTitle: "My Profile",
          }}
        />
        <Stack.Screen
          name="products"
          options={{
            headerTitle: "All Products",
          }}
        />
        <Stack.Screen
          name="products/[id]"
          options={{
            headerTitle: "Product Details",
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
