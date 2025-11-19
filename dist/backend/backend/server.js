"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const taxRoutes_1 = __importDefault(require("./routes/taxRoutes"));
const ocrRoutes_1 = __importDefault(require("./routes/ocrRoutes"));
const whatsappRoutes_1 = __importDefault(require("./routes/whatsappRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.BACKEND_PORT || 4000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/auth", authRoutes_1.default);
app.use("/transactions", transactionRoutes_1.default);
app.use("/tax", taxRoutes_1.default);
app.use("/ocr", ocrRoutes_1.default);
app.use("/whatsapp", whatsappRoutes_1.default);
app.use("/subscription", subscriptionRoutes_1.default);
app.use("/user", userRoutes_1.default);
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal server error",
    });
});
data_source_1.AppDataSource.initialize()
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
exports.default = app;
