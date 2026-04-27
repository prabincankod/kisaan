import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "farmer" | "buyer";
  phone?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync("token", token);
    set({ user, token });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("token");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      set({ token });
    }
  },
}));
