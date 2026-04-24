import { z } from 'zod';

export const createQuotationSchema = z.object({
  farmerId: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    offeredPrice: z.number().positive(),
  })).min(1),
});

export const updateQuotationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
