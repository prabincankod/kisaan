import { Router, Response } from "express";
import type { Router as ExpressRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { authMiddleware, validate } from "../../middlewares/index.js";
import { AuthenticatedRequest } from "../../types/index.js";

const router: ExpressRouter = Router();

router.post(
  "/register",
  validate(registerSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, email, password, role, phone, address } = req.body;

      console.log(req.body);
      const existingUser = await prisma.user.findUnique({ where: { email } });

      console.log(existingUser);
      if (existingUser) {
        res.status(400).json(errorResponse("Email already exists"));
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role, phone, address },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });
      console.log(user);

      res.status(201).json(successResponse(user, "Registration successful"));
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json(errorResponse("Registration failed"));
    }
  },
);

router.post(
  "/login",
  validate(loginSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password } = req.body;
      console.log(req.body)

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json(errorResponse("Invalid credentials"));
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json(errorResponse("Invalid credentials"));
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" },
      );

      console.log(token);
      res.json(
        successResponse(
          {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
          "Login successful",
        ),
      );
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json(errorResponse("Login failed"));
    }
  },
);

router.put(
  "/me",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, phone, address } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { name, phone, address },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });

      res.json(successResponse(user));
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json(errorResponse("Failed to update profile"));
    }
  },
);

router.get(
  "/me",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json(errorResponse("User not found"));
        return;
      }

      res.json(successResponse(user));
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json(errorResponse("Failed to get profile"));
    }
  },
);

export default router;
