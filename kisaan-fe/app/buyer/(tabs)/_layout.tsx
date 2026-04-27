import { Tabs } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "../../../src/store/auth.store";
import { colors } from "@/src/theme/designSystem";

export default function BuyerTabsLayout() {
  const user = useAuthStore((state) => state.user);

  const HeaderRight = () => (
    <TouchableOpacity 
      onPress={() => router.push("/buyer/profile")} 
      style={{ marginRight: 16, padding: 4 }}
    >
      <View style={{ 
        width: 34, 
        height: 34, 
        borderRadius: 17, 
        backgroundColor: colors.accent, 
        justifyContent: "center", 
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.text,
      }}>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <Tabs screenOptions={{
        headerRight: () => <HeaderRight />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { 
          height: 70, 
          paddingBottom: 10, 
          paddingTop: 10, 
          borderTopWidth: 1, 
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
        headerTitleStyle: { fontWeight: "700" },
      }}>
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: "Home", 
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>🌿</Text>, 
            headerTitle: "Kisaan" 
          }} 
        />
        <Tabs.Screen 
          name="categories" 
          options={{ 
            title: "Categories", 
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>🥕</Text>, 
            headerTitle: "Categories" 
          }} 
        />
        <Tabs.Screen 
          name="cart" 
          options={{ 
            title: "Cart", 
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>🧺</Text>, 
            headerTitle: "Cart" 
          }} 
        />
        <Tabs.Screen 
          name="orders" 
          options={{ 
            title: "Orders", 
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text>, 
            headerTitle: "Orders" 
          }} 
        />
      </Tabs>
    </SafeAreaProvider>
  );
}