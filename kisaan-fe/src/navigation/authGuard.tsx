import { useAuthStore } from "../store/auth.store";
import { router } from "expo-router";
import { useEffect } from "react";
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

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    } else if (user.role === "farmer") {
      router.replace("/farmer" as any);
    } else {
      router.replace("/buyer" as any);
    }
  }, [user]);
};
