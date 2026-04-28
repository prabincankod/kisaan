import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { authRouter } from "./modules/auth/index.js";
import { productRouter } from "./modules/product/index.js";
import { categoryRouter } from "./modules/category/index.js";
import { orderRouter } from "./modules/order/index.js";
import statsRouter from "./modules/stats/stats.routes.js";
import { farmerRouter } from "./modules/farmer/index.js";

const app: Application = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api", (_req: Request, res: Response) => {
  res.json({ message: "Kissan API is running", docs: "/api-docs" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/farmers", farmerRouter);
app.use("/api/stats", statsRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

export default app;
