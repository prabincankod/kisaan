import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import cartController from './cart.controller.js';
import { authMiddleware, requireRole } from '../../middlewares/index.js';

const router: ExpressRouter = Router();

router.get('/', authMiddleware, requireRole('buyer'), cartController.getCart);
router.post('/', authMiddleware, requireRole('buyer'), cartController.addToCart);
router.patch('/:itemId', authMiddleware, requireRole('buyer'), cartController.updateCartItem);
router.delete('/:itemId', authMiddleware, requireRole('buyer'), cartController.removeFromCart);
router.delete('/', authMiddleware, requireRole('buyer'), cartController.clearCart);

export default router;
