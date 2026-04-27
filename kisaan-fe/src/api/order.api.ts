import api from "./client";

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  negotiatedPrice?: number | null;
  productId: number;
  product: {
    id: number;
    title: string;
    price: number;
    unit: string;
    images: { id: number; url: string }[];
  };
}

export interface Order {
  id: number;
  totalAmount: number;
  negotiatedTotal?: number | null;
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "rejected"
    | "cancelled";
  type: "buy" | "quotation";
  paymentStatus: string;
  shippingAddress: string | null;
  userId: number;
  farmerId: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  farmer?: { id: number; name: string };
  user?: { id: number; name: string };
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateOrderParams {
  farmerId: number;
  items: { productId: number; quantity: number; price: number }[];
  totalAmount: number;
  negotiatedTotal?: number;
  type?: "buy" | "quotation";
  shippingAddress?: string;
}

export const getOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) =>
  api.get<{ success: boolean; data: OrdersResponse }>("/orders", { params });

export const getFarmerOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) => getOrders(params);

export const getOrder = (id: number) =>
  api.get<{ success: boolean; data: Order }>(`/orders/${id}`);

export const createOrderFromCart = (params: CreateOrderParams) =>
  api.post<{ success: boolean; data: Order; message: string }>(
    "/orders/from-cart",
    params,
  );

export const updateOrderStatus = (id: number, status: Order["status"]) =>
  api.patch<{ success: boolean; data: Order; message: string }>(
    `/orders/${id}`,
    { status },
  );
