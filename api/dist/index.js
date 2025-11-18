"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./database/data-source");
const auth_controller_1 = require("./controllers/auth.controller");
const transaction_controller_1 = require("./controllers/transaction.controller");
const auth_1 = require("./middleware/auth");
const tax_controller_1 = require("./controllers/tax.controller");
const ocr_controller_1 = require("./controllers/ocr.controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.raw({ type: "application/json" }));
// Initialize database and start server
const startServer = async () => {
    try {
        await (0, data_source_1.initializeDatabase)();
        // Controllers
        const authController = new auth_controller_1.AuthController();
        const transactionController = new transaction_controller_1.TransactionController();
        const taxController = new tax_controller_1.TaxController();
        const ocrController = new ocr_controller_1.OcrController();
        // ====== AUTH ROUTES ======
        app.post("/auth/register", (req, res) => authController.register(req, res));
        app.post("/auth/login", (req, res) => authController.login(req, res));
        app.post("/auth/refresh", (req, res) => authController.refresh(req, res));
        app.post("/auth/forgot-password", (req, res) => authController.forgotPassword(req, res));
        app.post("/auth/reset-password", (req, res) => authController.resetPassword(req, res));
        // ====== TRANSACTION ROUTES ======
        app.get("/transactions", auth_1.authMiddleware, (req, res) => transactionController.getIncomes(req, res));
        app.get("/transactions/expenses", auth_1.authMiddleware, (req, res) => transactionController.getExpenses(req, res));
        app.post("/transactions", auth_1.authMiddleware, (req, res) => transactionController.createIncome(req, res));
        app.post("/transactions/expenses", auth_1.authMiddleware, (req, res) => transactionController.createExpense(req, res));
        app.put("/transactions/:id", auth_1.authMiddleware, (req, res) => transactionController.updateIncome(req, res));
        app.put("/transactions/expenses/:id", auth_1.authMiddleware, (req, res) => transactionController.updateExpense(req, res));
        app.delete("/transactions/:id", auth_1.authMiddleware, (req, res) => transactionController.deleteIncome(req, res));
        app.delete("/transactions/expenses/:id", auth_1.authMiddleware, (req, res) => transactionController.deleteExpense(req, res));
        // ====== TAX ROUTES ======
        app.get("/tax/rules", (req, res) => taxController.getRules(req, res));
        app.get("/tax/estimate", auth_1.authMiddleware, (req, res) => taxController.getTaxEstimate(req, res));
        app.post("/tax/rules", auth_1.authMiddleware, (req, res) => taxController.createRule(req, res));
        // ====== OCR ROUTES ======
        app.post("/ocr/receipt", auth_1.authMiddleware, (req, res) => ocrController.parseReceipt(req, res));
        // ====== WHATSAPP ROUTES ======
        app.post("/whatsapp/import", auth_1.authMiddleware, (req, res) => transactionController.importWhatsApp(req, res));
        // ====== SUBSCRIPTION ROUTES ======
        app.post("/subscription/start", auth_1.authMiddleware, (req, res) => transactionController.startSubscription(req, res));
        app.post("/subscription/webhook", (req, res) => transactionController.subscriptionWebhook(req, res));
        // ====== USER ROUTES ======
        app.get("/user", auth_1.authMiddleware, (req, res) => transactionController.getUser(req, res));
        app.put("/user", auth_1.authMiddleware, (req, res) => transactionController.updateUser(req, res));
        app.delete("/user", auth_1.authMiddleware, (req, res) => transactionController.deleteUser(req, res));
        // Health check
        app.get("/health", (req, res) => res.json({ status: "ok" }));
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map