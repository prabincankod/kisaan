import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/auth.store";
import { colors } from "../theme/designSystem";

import BuyerTabNavigator from "./BuyerTabNavigator";
import BuyerProductDetail from "../screens/buyer/BuyerProductDetail";
import BuyerOrderDetail from "../screens/buyer/BuyerOrderDetail";
import BuyerFarmerDetail from "../screens/buyer/BuyerFarmerDetail";
import EditProfile from "../screens/common/EditProfile";

export type BuyerStackParamList = {
  Home: undefined;
  BuyerProductDetail: { productId: number };
  BuyerOrderDetail: { orderId: number };
  BuyerFarmerDetail: { farmerId: number };
  EditProfile: undefined;
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ title: "Edit Profile" }}
      />
    </Stack.Navigator>
  );
}
