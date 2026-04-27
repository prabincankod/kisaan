import api from "./client";

export interface FarmerStats {
  products: number;
  orders: number;
  ordersLast24h: number;
}

export interface BuyerStats {
  orders: number;
  cart: number;
}

export type Stats = FarmerStats | BuyerStats;

export const getStats = () =>
  api.get<{ success: boolean; data: Stats }>("/stats/farmer");
