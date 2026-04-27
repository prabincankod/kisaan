import { Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../../utils/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { AuthenticatedRequest } from "../../types/index.js";
import {
  CreateOrderFromCartInput,
  UpdateOrderStatusInput,
} from "./order.validation.js";

interface CreateOrderItem {
  productId: number;
  quantity: number;
  price: number;
}

interface CreateOrderInput {
  farmerId: number;
  items: CreateOrderItem[];
  type?: "buy" | "quotation";
  totalAmount: number;
  shippingAddress?: string;
}

const getOrders = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { page = 1, limit = 20, status, type } = req.query as any;

    const where: Prisma.OrderWhereInput =
      role === "farmer" ? { farmerId: userId } : { userId };

    if (status) where.status = status;
    if (type) where.type = type;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: {
            select: { id: true, name: true, phone: true, address: true },
          },
          farmer: {
            select: { id: true, name: true, phone: true, address: true },
          },
          items: {
            include: {
              product: { include: { images: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    res.json(
      successResponse({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      }),
    );
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json(errorResponse("Failed to get orders"));
  }
};

const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, name: true, phone: true, address: true } },
        farmer: {
          select: { id: true, name: true, phone: true, address: true },
        },
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json(errorResponse("Order not found"));
      return;
    }

    if (role === "farmer" && order.farmerId !== userId) {
      res.status(403).json(errorResponse("Forbidden"));
      return;
    }

    if (role === "buyer" && order.userId !== userId) {
      res.status(403).json(errorResponse("Forbidden"));
      return;
    }

    res.json(successResponse(order));
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json(errorResponse("Failed to get order"));
  }
};

const createOrderFromCart = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { farmerId, items, type, totalAmount, shippingAddress } =
      req.body as CreateOrderInput;

    if (!items || items.length === 0) {
      res.status(400).json(errorResponse("No items provided"));
      return;
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        res
          .status(400)
          .json(errorResponse(`Product ${item.productId} not found`));
        return;
      }

      if (type === "buy" && product.quantityAvailable < item.quantity) {
        res
          .status(400)
          .json(errorResponse(`Insufficient stock for ${product.title}`));
        return;
      }
    }

    const order = await prisma.order.create({
      data: {
        userId,
        farmerId,
        totalAmount,
        type: type || "buy",
        shippingAddress: shippingAddress || "",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: { select: { id: true, name: true } },
        farmer: { select: { id: true, name: true } },
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    if (type === "buy") {
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantityAvailable: { decrement: item.quantity } },
        });
      }
    }

    res
      .status(201)
      .json(
        successResponse(
          order,
          type === "quotation" ? "Quotation sent!" : "Order created!",
        ),
      );
  } catch (error) {
    console.error("Create order from cart error:", error);
    res.status(500).json(errorResponse("Failed to create order"));
  }
};

const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body as UpdateOrderStatusInput;

    const order = await prisma.order.findUnique({ where: { id: Number(id) } });

    if (!order) {
      res.status(404).json(errorResponse("Order not found"));
      return;
    }

    if (order.farmerId !== userId) {
      res
        .status(403)
        .json(errorResponse("Only farmer can update order status"));
      return;
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status },
      include: {
        user: { select: { id: true, name: true } },
        farmer: { select: { id: true, name: true } },
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    if (status === "confirmed" && order.type === "buy") {
      for (const item of order.items as any) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantityAvailable: { decrement: item.quantity } },
        });
      }
    }

    res.json(successResponse(updated, "Order status updated"));
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json(errorResponse("Failed to update order status"));
  }
};

export default {
  getOrders,
  getOrderById,
  createOrderFromCart,
  updateOrderStatus,
};
