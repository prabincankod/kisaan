import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/designSystem";
import BuyerDashboard from "../screens/buyer/BuyerDashboard";
import BuyerCart from "../screens/buyer/BuyerCart";
import BuyerOrders from "../screens/buyer/BuyerOrders";
import BuyerProfile from "../screens/buyer/BuyerProfile";

const Tab = createBottomTabNavigator();

export default function BuyerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={BuyerDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={BuyerCart}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={BuyerOrders}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={BuyerProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
