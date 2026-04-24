import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import statsController from './stats.controller.js';
import { authMiddleware } from '../../middlewares/index.js';

const router: ExpressRouter = Router();

router.get('/', authMiddleware, statsController.getStats);

export default router;
