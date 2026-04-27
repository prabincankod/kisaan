import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/designSystem';

import FarmerTabNavigator from './FarmerTabNavigator';
import FarmerAddProduct from '../screens/farmer/FarmerAddProduct';
import FarmerOrderDetail from '../screens/farmer/FarmerOrderDetail';

export type FarmerStackParamList = {
  FarmerTabs: undefined;
  FarmerAddProduct: { productId?: number };
  FarmerOrderDetail: { orderId: number };
};

const Stack = createNativeStackNavigator<FarmerStackParamList>();

export function FarmerNavigator() {
  const { user } = useAuthStore();

  if (!user || user.role !== 'farmer') {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.onSurface },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="FarmerTabs" 
        component={FarmerTabNavigator}
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="FarmerAddProduct" 
        component={FarmerAddProduct}
        options={{ title: 'Add Product' }}
      />
      <Stack.Screen 
        name="FarmerOrderDetail" 
        component={FarmerOrderDetail}
        options={{ title: 'Order Details' }}
      />
    </Stack.Navigator>
  );
}