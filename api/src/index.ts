import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initializeDatabase } from "./database/data-source";
import { AuthController } from "./controllers/auth.controller";
import { TransactionController } from "./controllers/transaction.controller";
import { authMiddleware } from "./middleware/auth";
import { TaxController } from "./controllers/tax.controller";
import { OcrController } from "./controllers/ocr.controller";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: "application/json" }));

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();

    // Controllers
    const authController = new AuthController();
    const transactionController = new TransactionController();
    const taxController = new TaxController();
    const ocrController = new OcrController();

    // ====== AUTH ROUTES ======
    app.post("/auth/register", (req, res) => authController.register(req, res));
    app.post("/auth/login", (req, res) => authController.login(req, res));
    app.post("/auth/refresh", (req, res) => authController.refresh(req, res));
    app.post("/auth/forgot-password", (req, res) => authController.forgotPassword(req, res));
    app.post("/auth/reset-password", (req, res) => authController.resetPassword(req, res));

    // ====== TRANSACTION ROUTES ======
    app.get("/transactions", authMiddleware, (req, res) => transactionController.getIncomes(req, res));
    app.get("/transactions/expenses", authMiddleware, (req, res) =>
      transactionController.getExpenses(req, res)
    );
    app.post("/transactions", authMiddleware, (req, res) =>
      transactionController.createIncome(req, res)
    );
    app.post("/transactions/expenses", authMiddleware, (req, res) =>
      transactionController.createExpense(req, res)
    );
    app.put("/transactions/:id", authMiddleware, (req, res) =>
      transactionController.updateIncome(req, res)
    );
    app.put("/transactions/expenses/:id", authMiddleware, (req, res) =>
      transactionController.updateExpense(req, res)
    );
    app.delete("/transactions/:id", authMiddleware, (req, res) =>
      transactionController.deleteIncome(req, res)
    );
    app.delete("/transactions/expenses/:id", authMiddleware, (req, res) =>
      transactionController.deleteExpense(req, res)
    );

    // ====== TAX ROUTES ======
    app.get("/tax/rules", (req, res) => taxController.getRules(req, res));
    app.get("/tax/estimate", authMiddleware, (req, res) =>
      taxController.getTaxEstimate(req, res)
    );
    app.post("/tax/rules", authMiddleware, (req, res) => taxController.createRule(req, res));

    // ====== OCR ROUTES ======
    app.post("/ocr/receipt", authMiddleware, (req, res) => ocrController.parseReceipt(req, res));

    // ====== WHATSAPP ROUTES ======
    app.post("/whatsapp/import", authMiddleware, (req, res) =>
      transactionController.importWhatsApp(req, res)
    );

    // ====== SUBSCRIPTION ROUTES ======
    app.post("/subscription/start", authMiddleware, (req, res) =>
      transactionController.startSubscription(req, res)
    );
    app.post("/subscription/webhook", (req, res) =>
      transactionController.subscriptionWebhook(req, res)
    );

    // ====== USER ROUTES ======
    app.get("/user", authMiddleware, (req, res) => transactionController.getUser(req, res));
    app.put("/user", authMiddleware, (req, res) => transactionController.updateUser(req, res));
    app.delete("/user", authMiddleware, (req, res) => transactionController.deleteUser(req, res));

    // Health check
    app.get("/health", (req, res) => res.json({ status: "ok" }));

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
