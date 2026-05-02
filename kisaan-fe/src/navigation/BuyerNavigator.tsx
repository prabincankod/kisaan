import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/auth.store";
import { colors } from "../theme/designSystem";

import BuyerTabNavigator from "./BuyerTabNavigator";
import BuyerProductDetail from "../screens/buyer/BuyerProductDetail";
import BuyerOrderDetail from "../screens/buyer/BuyerOrderDetail";
import BuyerCategories from "../screens/buyer/BuyerCategories";
import BuyerCart from "../screens/buyer/BuyerCart";
import BuyerProfile from "../screens/buyer/BuyerProfile";
import BuyerOrders from "../screens/buyer/BuyerOrders";
import BuyerFarmerDetail from "../screens/buyer/BuyerFarmerDetail";

export type BuyerStackParamList = {
  Home: undefined;
  BuyerProductDetail: { productId: number };
  BuyerOrderDetail: { orderId: number };
  BuyerFarmerDetail: { farmerId: number };
};

const Stack = createNativeStackNavigator<BuyerStackParamList>();

export function BuyerNavigator() {
  const { user } = useAuthStore();

  if (!user || user.role !== "buyer") {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "600", color: colors.onSurface },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Home"
        component={BuyerTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BuyerProductDetail"
        component={BuyerProductDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BuyerOrderDetail"
        component={BuyerOrderDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BuyerFarmerDetail"
        component={BuyerFarmerDetail}
        options={{ title: "Farmer" }}
      />
    </Stack.Navigator>
  );
}
