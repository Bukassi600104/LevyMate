import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";

import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import taxRoutes from "./routes/taxRoutes";
import ocrRoutes from "./routes/ocrRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/tax", taxRoutes);
app.use("/ocr", ocrRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/user", userRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log("✓ Database connected successfully");
    
    app.listen(PORT, () => {
      console.log(`✓ Backend server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error("✗ Database connection failed:", error);
    process.exit(1);
  });

export default app;
