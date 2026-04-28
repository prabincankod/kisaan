import { Response } from "express";
import prisma from "../../utils/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { AuthenticatedRequest } from "../../types/index.js";

const getFarmers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [farmers, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "farmer",
        },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          products: {
            select: {
              id: true,
              title: true,
              price: true,
              unit: true,
              images: {
                select: {
                  url: true,
                },
              },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          products: {
            _count: "desc",
          },
        },
      }),
      prisma.user.count({
        where: {
          role: "farmer",
        },
      }),
    ]);

    res.json(
      successResponse(
        { farmers, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }),
        "Farmers retrieved successfully",
      ),
    );
  } catch (error) {
    console.error("Get farmers error:", error);
    res.status(500).json(errorResponse("Failed to retrieve farmers"));
  }
};

const getFarmer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const farmer = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
        role: "farmer",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
      },
    });

    if (!farmer) {
      res.status(404).json(errorResponse("Farmer not found"));
      return;
    }

    res.json(successResponse(farmer, "Farmer retrieved successfully"));
  } catch (error) {
    console.error("Get farmer error:", error);
    res.status(500).json(errorResponse("Failed to retrieve farmer"));
  }
};

export default {
  getFarmers,
  getFarmer,
};
