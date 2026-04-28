import { useAuthStore } from "../store/auth.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import {
  login as loginApi,
  register as registerApi,
  getMe,
} from "../api/auth.api";
import { Alert } from "react-native";

export const useAuth = () => {
  const navigation = useNavigation<any>();
  const { user, token, setAuth, setUser, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (response: any) => {
      const data = response.data;
      await setAuth(
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone || undefined,
          address: data.user.address || undefined,
        },
        data.token,
      );
      navigation.replace(
        data.user.role === "farmer" ? "FarmerTabs" : "BuyerTabs",
      );
    },
    onError: (error: any) => {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: async () => {
      Alert.alert(
        "Success",
        "Registration successful! Please login with your credentials.",
        [{ text: "OK", onPress: () => navigation.replace("Login") }],
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong",
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
      navigation.replace("Login");
    },
  });

  const loadUserQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return null;
      const response: any = await getMe();
      const userData = response.data;
      setUser(userData);
      return userData;
    },
    enabled: !!token && !user,
  });

  return {
    user,
    token,
    isAuthenticated: !!user,
    isLoading:
      loadUserQuery.isLoading ||
      loginMutation.isPending ||
      registerMutation.isPending,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
  };
};
