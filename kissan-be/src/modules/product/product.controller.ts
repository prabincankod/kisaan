import { Response } from 'express';
import prisma from '../../utils/prisma.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from './product.validation.js';
import { compareSync } from 'bcryptjs';

const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, nutritionalInfo, unit, price, quantityAvailable, categoryIds } = req.body;
    let farmerId = req.user?.id;
    farmerId = Number(farmerId);

    const files = req.files as Express.Multer.File[];

    const product = await prisma.product.create({
      data: {
        title,
        description: description || undefined,
        nutritionalInfo: nutritionalInfo || undefined,
        unit: unit || 'kg',
        price: Number(price),
        quantityAvailable: Number(quantityAvailable) || 0,
        farmerId,
        images: {
          create: files?.map((f) => ({
            url: `/uploads/${f.filename}`,
          })),
        },
      },
      include: {
        categories: { include: { category: true } },
        images: true,
      },
    });

    // Create categories after product is created (to validate them first)
    if (categoryIds && Array.isArray(categoryIds)) {
      const categoryIdArray = categoryIds as any[];
      const validCategories = await prisma.category.findMany({
        where: { id: { in: categoryIdArray.map(id => Number(id)) } },
        select: { id: true }
      });
      
      if (validCategories.length > 0) {
        await prisma.productCategory.createMany({
          data: validCategories.map(c => ({ productId: product.id, categoryId: c.id })),
        });
      }
    }

    // Fetch updated product with relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        categories: { include: { category: true } },
        images: true,
      },
    });

    res.status(201).json(successResponse(updatedProduct || product, 'Product created'));
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json(errorResponse('Failed to create product'));
  }
};

const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    let { categoryIds, price, quantityAvailable, isActive, ...data } = req.body;
    if (typeof categoryIds === 'string') {
      try {
        categoryIds = JSON.parse(categoryIds);
      } catch {
        categoryIds = [];
      }
    }
    delete data.existingImageIds;
    const farmerId = req.user!.id;
    const files = req.files as Express.Multer.File[];

    const product = await prisma.product.findFirst({
      where: { id: Number(id), farmerId },
    });

    if (!product) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    // Update categories
    if (categoryIds !== undefined) {
      const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      await prisma.productCategory.deleteMany({ where: { productId: product.id } });
      
      if (ids.length > 0) {
        // Validate that all category IDs exist
        const validCategories = await prisma.category.findMany({
          where: { id: { in: ids.map((id: any) => Number(id)) } },
          select: { id: true }
        });
        const validIds = validCategories.map(c => c.id);
        
        if (validIds.length > 0) {
          await prisma.productCategory.createMany({
            data: validIds.map((cid: number) => ({ productId: product.id, categoryId: cid })),
          });
        }
      }
    }

    // Add new images if any
    if (files && files.length > 0) {
      await prisma.productImage.createMany({
        data: files.map((f) => ({
          productId: product.id,
          url: `/uploads/${f.filename}`,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {

        ...data,
        price: price ? Number(price) : undefined,
        quantityAvailable: quantityAvailable ? Number(quantityAvailable) : undefined,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
      },
      include: {
        categories: { include: { category: true } },
        images: true,
      },
    });

    res.json(successResponse(updated, 'Product updated'));
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json(errorResponse('Failed to update product'));
  }
};

const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const farmerId = req.user!.id;

    const product = await prisma.product.findFirst({
      where: { id: Number(id), farmerId },
    });

    if (!product) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { isDeleted: true },
    });

    res.json(successResponse(null, 'Product deleted'));
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json(errorResponse('Failed to delete product'));
  }
};

const getProducts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { categoryId, farmerId, search, isActive } = req.query as unknown as ProductQueryInput;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const where: any = { isDeleted: false };
    if (categoryId) where.categories = { some: { categoryId } };
    if (farmerId) where.farmerId = Number(farmerId);
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: { include: { category: true } },
          images: true,
          farmer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.product.count({ where }),

    ]);

    res.json(successResponse({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }));
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json(errorResponse('Failed to get products'));
  }
};

const getProductById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id), isDeleted: false },
      include: {
        categories: { include: { category: true } },
        images: true,
        farmer: { select: { id: true, name: true, phone: true, address: true } },
      },
    });

    if (!product) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    console.log(product)
    res.json(successResponse(product));
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json(errorResponse('Failed to get product'));
  }
};

const uploadProductImages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const farmerId = req.user!.id;
    const files = req.files as Express.Multer.File[];

    const product = await prisma.product.findFirst({
      where: { id: Number(id), farmerId },
    });

    if (!product) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    const images = await prisma.productImage.createMany({
      data: files.map((f) => ({
        url: `/uploads/${f.filename}`,
        productId: product.id,
      })),
    });

    res.json(successResponse(images, 'Images uploaded'));
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json(errorResponse('Failed to upload images'));
  }
};

const getMyProducts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const farmerId = req.user!.id;
    const { page = 1, limit = 20 } = req.query as any;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { farmerId, isDeleted: false },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          categories: { include: { category: true } },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: { farmerId, isDeleted: false } }),
    ]);

    res.json(successResponse({
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    }));
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json(errorResponse('Failed to get products'));
  }
};

export default { createProduct, updateProduct, deleteProduct, getProducts, getProductById, uploadProductImages, getMyProducts };
