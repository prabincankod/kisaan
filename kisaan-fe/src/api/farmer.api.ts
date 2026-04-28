import api from "./client";

export interface Farmer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  products?: {
    id: number;
    title: string;
    price: number;
    unit: string;
    images: { url: string }[];
  }[];
}

export const getFarmers = (params?: {
  page?: number;
  limit?: number;
}) => {
  return api.get("/farmers", { params });
};

export const getFarmer = (id: number) => {
  return api.get(`/farmers/${id}`);
};
