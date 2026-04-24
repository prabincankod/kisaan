import { Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { CreateQuotationInput, UpdateQuotationInput } from './quotation.validation.js';

const createQuotation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { farmerId, items } = req.body as CreateQuotationInput;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId, isActive: true, isDeleted: false },
      });
      if (!product || product.farmerId !== farmerId) {
        res.status(400).json(errorResponse('Invalid product or product does not belong to farmer'));
        return;
      }
    }

    const quotation = await prisma.quotation.create({
      data: {
        userId,
        farmerId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            offeredPrice: item.offeredPrice,
          })),
        },
      },
      include: {
        user: { select: { id: true, name: true } },
        farmer: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
    });

    res.status(201).json(successResponse(quotation, 'Quotation created'));
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json(errorResponse('Failed to create quotation'));
  }
};

const getQuotations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { page = 1, limit = 20, status } = req.query as any;

    const where: Prisma.QuotationWhereInput = role === 'farmer'
      ? { farmerId: userId }
      : { userId };

    if (status) where.status = status;

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true, phone: true, address: true } },
          farmer: { select: { id: true, name: true, phone: true, address: true } },
          items: { include: { product: { include: { images: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quotation.count({ where }),
    ]);

    res.json(successResponse({
      quotations,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    }));
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json(errorResponse('Failed to get quotations'));
  }
};

const getQuotationById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const quotation = await prisma.quotation.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, name: true, phone: true, address: true } },
        farmer: { select: { id: true, name: true, phone: true, address: true } },
        items: { include: { product: { include: { images: true } } } },
      },
    });

    if (!quotation) {
      res.status(404).json(errorResponse('Quotation not found'));
      return;
    }

    if (role === 'farmer' && quotation.farmerId !== userId) {
      res.status(403).json(errorResponse('Forbidden'));
      return;
    }

    if (role === 'buyer' && quotation.userId !== userId) {
      res.status(403).json(errorResponse('Forbidden'));
      return;
    }

    res.json(successResponse(quotation));
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json(errorResponse('Failed to get quotation'));
  }
};

const updateQuotationStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body as UpdateQuotationInput;

    const quotation = await prisma.quotation.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!quotation) {
      res.status(404).json(errorResponse('Quotation not found'));
      return;
    }

    if (quotation.farmerId !== userId) {
      res.status(403).json(errorResponse('Only farmer can update quotation status'));
      return;
    }

    if (quotation.status !== 'pending') {
      res.status(400).json(errorResponse('Can only update pending quotations'));
      return;
    }

    const updated = await prisma.quotation.update({
      where: { id: quotation.id },
      data: { status },
      include: {
        user: { select: { id: true, name: true } },
        farmer: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
    });

    if (status === 'accepted') {
      const totalAmount = updated.items.reduce(
        (sum, item) => sum + Number(item.offeredPrice) * item.quantity,
        0
      );

      await prisma.order.create({
        data: {
          userId: quotation.userId,
          farmerId: quotation.farmerId,
          totalAmount,
          source: 'quotation',
          items: {
            create: updated.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.offeredPrice,
            })),
          },
        },
      });

      for (const item of updated.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantityAvailable: { decrement: item.quantity } },
        });
      }
    }

    res.json(successResponse(updated, `Quotation ${status}`));
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json(errorResponse('Failed to update quotation'));
  }
};

export default { createQuotation, getQuotations, getQuotationById, updateQuotationStatus };
