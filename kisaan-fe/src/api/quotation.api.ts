import api from "./client";

export interface QuotationItem {
  id: number;
  quantity: number;
  offeredPrice: number;
  productId: number;
  product?: {
    id: number;
    title: string;
    price: number;
    unit: string;
    images: { url: string }[];
  };
}

export interface Quotation {
  id: number;
  status: "pending" | "accepted" | "rejected";
  userId: number;
  farmerId: number;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
  farmer?: { id: number; name: string };
  user?: { id: number; name: string; phone?: string };
}

export interface QuotationsResponse {
  quotations: Quotation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateQuotationParams {
  farmerId: number;
  items: {
    productId: number;
    quantity: number;
    offeredPrice: number;
  }[];
}

export const getQuotations = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) =>
  api.get<{ success: boolean; data: QuotationsResponse }>("/quotations", {
    params,
  });

export const getQuotation = (id: number) =>
  api.get<{ success: boolean; data: Quotation }>(`/quotations/${id}`);

export const createQuotation = (params: CreateQuotationParams) =>
  api.post<{ success: boolean; data: Quotation; message: string }>(
    "/quotations",
    params,
  );

export const updateQuotationStatus = (id: number, status: "accepted" | "rejected") =>
  api.patch<{ success: boolean; data: Quotation; message: string }>(
    `/quotations/${id}`,
    { status },
  );
