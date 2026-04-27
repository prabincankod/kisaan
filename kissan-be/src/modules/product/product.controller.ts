import { Response } from 'express';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import prisma from '../../utils/prisma.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from './product.validation.js';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

function saveBase64Image(base64Data: string): string | null {
  try {
    if (!base64Data || !base64Data.startsWith('data:image/')) {
      return null;
    }
    
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return null;
    
    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    
    if (!existsSync(UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    
    const filepath = join(UPLOADS_DIR, filename);
    writeFileSync(filepath, buffer);
    
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
}

const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    let { title, description, nutritionalInfo, unit, price, quantityAvailable, categoryIds, images } = req.body;
    
    console.log('Received body:', JSON.stringify(req.body).substring(0, 500));
    
    // Parse JSON strings if needed
    if (typeof categoryIds === 'string') {
      try { categoryIds = JSON.parse(categoryIds); } catch { categoryIds = []; }
    }
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = []; }
    }
    if (typeof price === 'string') price = Number(price);
    if (typeof quantityAvailable === 'string') quantityAvailable = Number(quantityAvailable);
    
    const farmerId = req.user!.id;

    const product = await prisma.product.create({
      data: {
        title,
        description: description || undefined,
        nutritionalInfo: nutritionalInfo || undefined,
        unit: unit || 'kg',
        price: Number(price),
        quantityAvailable: Number(quantityAvailable) || 0,
        farmerId: Number(farmerId),
        images: {
          create: images && Array.isArray(images) 
            ? images
                .filter((img: string) => img && img.startsWith('data:image/'))
                .map((img: string) => saveBase64Image(img))
                .filter((url): url is string => url !== null)
                .map((url: string) => ({ url }))
            : []
        },
      },
      include: {
        categories: { include: { category: true } },
        images: true,
      },
    });

    if (categoryIds) {
      const ids = Array.isArray(categoryIds) ? categoryIds : JSON.parse(categoryIds);
      if (ids.length > 0) {
        const validCategories = await prisma.category.findMany({
          where: { id: { in: ids.map((id: any) => Number(id)) } },
          select: { id: true }
        });
        if (validCategories.length > 0) {
          await prisma.productCategory.createMany({
            data: validCategories.map(c => ({ productId: product.id, categoryId: c.id })),
          });
        }
      }
    }

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
    let { categoryIds, price, quantityAvailable, isActive, images, removeImageIds, ...data } = req.body;
    const farmerId = req.user!.id;

    // Parse JSON strings if needed
    if (typeof categoryIds === 'string') {
      try { categoryIds = JSON.parse(categoryIds); } catch { categoryIds = []; }
    }
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = []; }
    }
    if (typeof removeImageIds === 'string') {
      try { removeImageIds = JSON.parse(removeImageIds); } catch { removeImageIds = []; }
    }
    if (typeof price === 'string') price = Number(price);
    if (typeof quantityAvailable === 'string') quantityAvailable = Number(quantityAvailable);

    const product = await prisma.product.findFirst({
      where: { id: Number(id), farmerId: Number(farmerId) },
    });

    if (!product) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    // Remove deleted images
    if (removeImageIds && Array.isArray(removeImageIds) && removeImageIds.length > 0) {
      await prisma.productImage.deleteMany({
        where: { id: { in: removeImageIds.map((id: any) => Number(id)) } }
      });
    }

    if (categoryIds && Array.isArray(categoryIds)) {
      await prisma.productCategory.deleteMany({ where: { productId: product.id } });
      const validCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds.map((id: any) => Number(id)) } },
        select: { id: true }
      });
      if (validCategories.length > 0) {
        await prisma.productCategory.createMany({
          data: validCategories.map(c => ({ productId: product.id, categoryId: c.id })),
        });
      }
    }

    if (images && Array.isArray(images)) {
      const newImages = images
        .filter((img: string) => img && img.startsWith('data:image/'))
        .map((img: string) => saveBase64Image(img))
        .filter((url): url is string => url !== null)
        .map((url: string) => ({ productId: product.id, url }));
      
      if (newImages.length > 0) {
        await prisma.productImage.createMany({ data: newImages });
      }
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
      where: { id: Number(id), farmerId: Number(farmerId) },
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
    if (categoryId) where.categories = { some: { categoryId: Number(categoryId) } };
    if (farmerId) where.farmerId = Number(farmerId);
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = String(isActive) === 'true';

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
    const { images } = req.body;

    const product = await prisma.product.findFirst({
      where: { id: Number(id), farmerId: Number(farmerId) },
    });

    if (!product) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    if (images && Array.isArray(images)) {
      const newImages = images
        .filter((img: string) => img && img.startsWith('data:image/'))
        .map((img: string) => ({ url: saveBase64Image(img) }))
        .filter(Boolean)
        .map(url => ({ productId: product.id, url: url! }));
      
      if (newImages.length > 0) {
        await prisma.productImage.createMany({ data: newImages });
      }
    }

    const updatedImages = await prisma.productImage.findMany({
      where: { productId: product.id }
    });

    res.json(successResponse(updatedImages, 'Images uploaded'));
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
        where: { farmerId: Number(farmerId), isDeleted: false },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          categories: { include: { category: true } },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: { farmerId: Number(farmerId), isDeleted: false } }),
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