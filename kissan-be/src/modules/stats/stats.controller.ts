import { Response } from 'express';
import prisma from '../../utils/prisma.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../types/index.js';

const getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    if (role === 'farmer') {
      const [productCount, pendingQuotations, activeOrders] = await Promise.all([
        prisma.product.count({ where: { farmerId: userId, isDeleted: false } }),
        prisma.quotation.count({ where: { farmerId: userId, status: 'pending' } }),
        prisma.order.count({ where: { farmerId: userId, status: { in: ['pending', 'confirmed', 'shipped'] } } }),
      ]);

      res.json(successResponse({
        products: productCount,
        quotations: pendingQuotations,
        orders: activeOrders,
      }));
    } else {
      const [orderCount, activeQuotations, cartItems] = await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.quotation.count({ where: { userId, status: 'pending' } }),
        prisma.cartItem.count({ where: { cart: { userId } } }),
      ]);

      res.json(successResponse({
        orders: orderCount,
        quotations: activeQuotations,
        cart: cartItems,
      }));
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json(errorResponse('Failed to get statistics'));
  }
};

export default { getStats };
