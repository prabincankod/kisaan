import api from "./client";

export interface Product {
  id: number;
  title: string;
  description: string | null;
  nutritionalInfo: string | null;
  unit: "kg" | "pcs";
  price: number;
  quantityAvailable: number;
  isActive: boolean;
  isDeleted: boolean;
  farmerId: number;
  farmer?: { id: number; name: string };
  images: { id: number; url: string; productId: number }[];
  categories: {
    categoryId?: number;
    category?: { id: number; name: string };
    id?: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductPayload {
  title: string;
  description?: string;
  nutritionalInfo?: string;
  unit?: "kg" | "pcs";
  price: number;
  quantityAvailable: number;
  categoryIds?: number[];
  images?: string[];
  isActive?: boolean;
}

export const getProducts = (params?: {
  page?: number;
  limit?: number;
  categoryId?: number;
  farmerId?: number;
  search?: string;
  isActive?: boolean;
}) =>
  api.get<{ success: boolean; data: ProductsResponse }>("/products", {
    params,
  });

export const getProduct = (id: number) =>
  api.get<{ success: boolean; data: Product }>(`/products/${id}`);

export const getFarmerProducts = (params?: { page?: number; limit?: number }) =>
  api.get<{ success: boolean; data: ProductsResponse }>(
    "/products/my-products",
    { params },
  );

export const createProduct = (payload: ProductPayload) =>
  api.post<{ success: boolean; data: Product; message: string }>(
    "/products",
    payload,
    { headers: { "Content-Type": "application/json" } },
  );

export const updateProduct = (id: number, payload: ProductPayload) =>
  api.put<{ success: boolean; data: Product; message: string }>(
    `/products/${id}`,
    payload,
  );

export const deleteProduct = (id: number) =>
  api.delete<{ success: boolean; message: string }>(`/products/${id}`);

export const uploadProductImages = (id: number, images: string[]) =>
  api.post<{ success: boolean; data: any; message: string }>(
    `/products/${id}/images`,
    { images },
    { headers: { "Content-Type": "application/json" } },
  );
