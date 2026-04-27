import api from "./client";

export interface Category {
  id: number;
  name: string;
  products: number;
}

export const getCategories = () =>
  api.get<{ success: boolean; data: Category[] }>("/categories");

export const createCategory = (name: string) =>
  api.post<{ success: boolean; data: Category; message: string }>(
    "/categories",
    { name },
  );
