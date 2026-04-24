import { Response } from 'express';
import prisma from '../../utils/prisma.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AddToCartInput, UpdateCartItemInput } from './cart.validation.js';

const getCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        farmer: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              include: {
                images: true,
                categories: { include: { category: true } },
              },
            },
          },
        },
      },
    });

    const totalAmount = cart?.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    ) || 0;

    console.log({ cart, totalAmount })

    res.json(successResponse({ cart, totalAmount }));
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json(errorResponse('Failed to get cart'));
  }
};

const addToCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body as AddToCartInput;

    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, isDeleted: false },
    });

    if (!product) {
      res.status(404).json(errorResponse('Product not found'));
      return;
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, farmerId: product.farmerId },
      });
    } else if (cart.farmerId !== product.farmerId) {
      res.status(400).json(errorResponse('Cart can only contain one farmer\'s products. Please clear your cart first.'));
      return;
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        farmer: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              include: {
                images: true,
                categories: { include: { category: true } },
              },
            },
          },
        },
      },
    });

    const totalAmount = updatedCart?.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    ) || 0;

    res.json(successResponse({ cart: updatedCart, totalAmount }, 'Added to cart'));
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json(errorResponse('Failed to add to cart'));
  }
};

const updateCartItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body as UpdateCartItemInput;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      res.status(404).json(errorResponse('Cart not found'));
      return;
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: Number(itemId), cartId: cart.id },
    });

    if (!item) {
      res.status(404).json(errorResponse('Cart item not found'));
      return;
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    res.json(successResponse(null, 'Cart item updated'));
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json(errorResponse('Failed to update cart item'));
  }
};

const removeFromCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      res.status(404).json(errorResponse('Cart not found'));
      return;
    }

    await prisma.cartItem.deleteMany({
      where: { id: Number(itemId), cartId: cart.id },
    });

    res.json(successResponse(null, 'Item removed from cart'));
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json(errorResponse('Failed to remove from cart'));
  }
};

const clearCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.json(successResponse(null, 'Cart cleared'));
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json(errorResponse('Failed to clear cart'));
  }
};

export default { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
