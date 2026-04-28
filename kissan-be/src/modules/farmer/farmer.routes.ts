import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import farmerController from "./farmer.controller.js";

const router: ExpressRouter = Router();

router.get("/", farmerController.getFarmers);
router.get("/:id", farmerController.getFarmer);

export default router;
