import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist } from "zustand/middleware";
import { Product } from "../api/product.api";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  farmerId: number | null;
  farmerName: string | null;
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      farmerId: null,
      farmerName: null,

      addItem: (product, quantity) => {
        const { items, farmerId } = get();
        
        if (farmerId && farmerId !== product.farmerId) {
          return;
        }

        const existingIndex = items.findIndex((item) => item.product.id === product.id);

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({
            items: [...items, { id: `${product.id}-${Date.now()}`, product, quantity }],
            farmerId: product.farmerId,
            farmerName: product.farmer?.name || "Farmer",
          });
        }
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((item) => item.product.id !== productId) });
        } else {
          const newItems = items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
          set({ items: newItems });
        }
      },

      removeItem: (productId) => {
        const { items, farmerId } = get();
        const newItems = items.filter((item) => item.product.id !== productId);
        set({
          items: newItems,
          farmerId: newItems.length > 0 ? farmerId : null,
          farmerName: newItems.length > 0 ? get().farmerName : null,
        });
      },

      clearCart: () => {
        set({ items: [], farmerId: null, farmerName: null });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );
      },
    }),
    {
      name: "kisaan-cart",
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: string) => {
          await AsyncStorage.setItem(name, value);
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);