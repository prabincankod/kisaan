import { Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../../utils/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { AuthenticatedRequest } from "../../types/index.js";

const getQuotations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { page = 1, limit = 20, status } = req.query as any;

    const where: Prisma.OrderWhereInput = {
      type: "quotation",
      ...(role === "farmer" ? { farmerId: userId } : { userId }),
    };

    if (status) where.status = status;

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
        quotations: orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      }),
    );
  } catch (error) {
    console.error("Get quotations error:", error);
    res.status(500).json(errorResponse("Failed to get quotations"));
  }
};

const getQuotationById = async (
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
      res.status(404).json(errorResponse("Quotation not found"));
      return;
    }

    if (order.type !== "quotation") {
      res.status(400).json(errorResponse("This is not a quotation"));
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
    console.error("Get quotation error:", error);
    res.status(500).json(errorResponse("Failed to get quotation"));
  }
};

const respondToQuotation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body as { status: "accepted" | "rejected" };

    const quotation = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!quotation) {
      res.status(404).json(errorResponse("Quotation not found"));
      return;
    }

    if (quotation.type !== "quotation") {
      res.status(400).json(errorResponse("This is not a quotation"));
      return;
    }

    if (quotation.farmerId !== userId) {
      res.status(403).json(errorResponse("Only the farmer can respond to quotations"));
      return;
    }

    if (quotation.status !== "pending") {
      res.status(400).json(errorResponse("Quotation has already been responded to"));
      return;
    }

    if (status === "accepted") {
      const updated = await prisma.order.update({
        where: { id: quotation.id },
        data: {
          type: "buy",
          status: "pending",
          items: {
            update: quotation.items.map((item) => ({
              where: { id: item.id },
              data: { negotiatedPrice: item.price },
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

      res.json(successResponse(updated, "Quotation accepted! Order created."));
    } else {
      const updated = await prisma.order.update({
        where: { id: quotation.id },
        data: { status: "rejected" },
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

      res.json(successResponse(updated, "Quotation rejected."));
    }
  } catch (error) {
    console.error("Respond to quotation error:", error);
    res.status(500).json(errorResponse("Failed to respond to quotation"));
  }
};

export default {
  getQuotations,
  getQuotationById,
  respondToQuotation,
};
