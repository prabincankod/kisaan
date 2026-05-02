import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import quotationController from "./quotation.controller.js";
import { authMiddleware } from "../../middlewares/index.js";

const router: ExpressRouter = Router();

router.get("/", authMiddleware, quotationController.getQuotations);
router.get("/:id", authMiddleware, quotationController.getQuotationById);
router.patch("/:id/respond", authMiddleware, quotationController.respondToQuotation);

export default router;
