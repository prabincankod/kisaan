import { z } from "zod";

export const createOrderFromCartSchema = z.object({
  farmerId: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1),
    price: z.number().positive(),
  })),
  totalAmount: z.number().positive(),
  negotiatedTotal: z.number().positive().optional(),
  type: z.enum(["buy", "quotation"]).default("buy"),
  shippingAddress: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered"]),
});

export type CreateOrderFromCartInput = z.infer<
  typeof createOrderFromCartSchema
>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
