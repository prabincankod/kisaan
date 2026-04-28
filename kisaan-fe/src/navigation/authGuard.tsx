import { useAuthStore } from "../store/auth.store";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { getMe } from "../api/auth.api";

export const useAuthGuard = () => {
  const { user, token, setAuth } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      if (!token && !user) {
        const storedToken = await SecureStore.getItemAsync("token");
        if (storedToken) {
          try {
            const response: any = await getMe();
            setAuth(response.data, storedToken);
          } catch (error) {
            await SecureStore.deleteItemAsync("token");
          }
        }
      }
    };

    loadUser();
  }, []);

  return { user, token };
};

export const useAuthRedirect = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (user === null) {
      navigation.replace("Login");
    } else if (user.role === "farmer") {
      navigation.replace("FarmerTabs");
    } else {
      navigation.replace("BuyerTabs");
    }
  }, [user, navigation]);
};
