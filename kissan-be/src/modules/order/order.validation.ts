import { z } from 'zod';

export const createOrderFromCartSchema = z.object({
  shippingAddress: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered']),
});

export type CreateOrderFromCartInput = z.infer<typeof createOrderFromCartSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
