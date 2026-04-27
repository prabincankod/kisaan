import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  nutritionalInfo: z.string().optional(),
  unit: z.enum(["kg", "pcs"]).default("kg"),
  price: z.number().positive(),
  quantityAvailable: z.number().int().min(0).default(0),
  categoryIds: z.array(z.number()).optional(),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  nutritionalInfo: z.string().optional(),
  unit: z.enum(["kg", "pcs"]).optional(),
  price: z.number().positive().optional(),
  quantityAvailable: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  categoryIds: z.array(z.number()).optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  categoryId: z.coerce.number().optional(),
  farmerId: z.coerce.number().optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
