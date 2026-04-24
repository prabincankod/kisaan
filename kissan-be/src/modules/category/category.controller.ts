import { Response } from 'express';
import prisma from '../../utils/prisma.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { CreateCategoryInput } from './category.validation.js';

const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body as CreateCategoryInput;

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      res.status(400).json(errorResponse('Category already exists'));
      return;
    }

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(successResponse(category, 'Category created'));
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json(errorResponse('Failed to create category'));
  }
};

const getCategories = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(successResponse(categories));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json(errorResponse('Failed to get categories'));
  }
};

export default { createCategory, getCategories };
