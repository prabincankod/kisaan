import { Response } from "express";
import prisma from "../../utils/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { AuthenticatedRequest } from "../../types/index.js";

const getStats = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    if (role === "farmer") {
      const productCount = await prisma.product.count({
        where: { farmerId: userId, isDeleted: false },
      });

      const activeOrders = await prisma.order.count({
        where: {
          farmerId: userId,
          status: { in: ["pending", "confirmed", "shipped"] },
        },
      });

      const ordersLast24h = await prisma.order.count({
        where: {
          farmerId: userId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      res.json(
        successResponse({
          products: productCount,
          orders: activeOrders,
          ordersLast24h,
        }),
      );
    } else {
      const orderCount = await prisma.order.count({ where: { userId } });
      const cartItems = await prisma.cartItem.count({
        where: { cart: { userId } },
      });

      res.json(
        successResponse({
          orders: orderCount,
          cart: cartItems,
        }),
      );
    }
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json(errorResponse("Failed to get statistics"));
  }
};

export default { getStats };
