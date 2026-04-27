import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import categoryController from "./category.controller.js";
import { authMiddleware, requireRole } from "../../middlewares/index.js";

const router: ExpressRouter = Router();

router.get("/", categoryController.getCategories);
router.post(
  "/",
  authMiddleware,
  requireRole("farmer"),
  categoryController.createCategory,
);

export default router;
