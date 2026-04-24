import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../types/index.js';

const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json(errorResponse('Email already exists'));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        address,
      },
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

    res.status(201).json(successResponse(user, 'Registration successful'));
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json(errorResponse('Registration failed'));
  }
};

const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json(successResponse({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Login successful'));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(errorResponse('Login failed'));
  }
};

const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      res.status(404).json(errorResponse('User not found'));
      return;
    }

    res.json(successResponse(user));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(errorResponse('Failed to get profile'));
  }
};

export default { register, login, me };
