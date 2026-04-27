import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import productController from "./product.controller.js";
import { authMiddleware, requireRole } from "../../middlewares/index.js";

const router: ExpressRouter = Router();

router.get("/", productController.getProducts);
router.get(
  "/my-products",
  authMiddleware,
  requireRole("farmer"),
  productController.getMyProducts,
);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  authMiddleware,
  requireRole("farmer"),
  productController.createProduct,
);
router.put(
  "/:id",
  authMiddleware,
  requireRole("farmer"),
  productController.updateProduct,
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("farmer"),
  productController.deleteProduct,
);
router.post(
  "/:id/images",
  authMiddleware,
  requireRole("farmer"),
  productController.uploadProductImages,
);

export default router;
