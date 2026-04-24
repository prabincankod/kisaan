import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import orderController from './order.controller.js';
import { authMiddleware } from '../../middlewares/index.js';

const router: ExpressRouter = Router();

router.get('/', authMiddleware, orderController.getOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.post('/from-cart', authMiddleware, orderController.createOrderFromCart);
router.patch('/:id', authMiddleware, orderController.updateOrderStatus);

export default router;
