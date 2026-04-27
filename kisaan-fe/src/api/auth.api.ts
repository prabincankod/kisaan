import api from "./client";

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
  role: "farmer" | "buyer";
  phone?: string;
  address?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "farmer" | "buyer";
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const login = (params: LoginParams) =>
  api.post<{ success: boolean; data: AuthResponse; message: string }>("/auth/login", params);

export const register = (params: RegisterParams) =>
  api.post<{ success: boolean; data: User; message: string }>("/auth/register", params);

export const getMe = () =>
  api.get<{ success: boolean; data: User }>("/auth/me");
