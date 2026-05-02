import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/designSystem";
import FarmerDashboard from "../screens/farmer/FarmerDashboard";
import FarmerProducts from "../screens/farmer/FarmerProducts";
import FarmerOrders from "../screens/farmer/FarmerOrders";
import FarmerQuotations from "../screens/farmer/FarmerQuotations";
import FarmerProfile from "../screens/farmer/FarmerProfile";

const Tab = createBottomTabNavigator();

export default function FarmerTabNavigator() {
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
        name="Dashboard"
        component={FarmerDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={FarmerProducts}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={FarmerOrders}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Quotations"
        component={FarmerQuotations}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={FarmerProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
