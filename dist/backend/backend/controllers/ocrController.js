"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReceipt = void 0;
const axios_1 = __importDefault(require("axios"));
const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://localhost:8000/ocr";
const processReceipt = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: "Invalid file type. Only JPEG and PNG are allowed" });
        }
        const maxSize = 10 * 1024 * 1024;
        if (req.file.size > maxSize) {
            return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
        }
        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("file", blob, req.file.originalname);
        const ocrResponse = await axios_1.default.post(OCR_SERVICE_URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 30000,
        });
        const { amounts, confidence, text, auto_import } = ocrResponse.data;
        return res.json({
            amounts,
            confidence,
            text,
            auto_import,
            ocr_meta: {
                original_filename: req.file.originalname,
                processed_at: new Date().toISOString(),
                confidence,
            },
        });
    }
    catch (error) {
        console.error("OCR processing error:", error);
        if (axios_1.default.isAxiosError(error)) {
            if (error.code === "ECONNREFUSED") {
                return res.status(503).json({ error: "OCR service unavailable" });
            }
            if (error.response) {
                return res.status(error.response.status).json({
                    error: error.response.data?.error || "OCR processing failed"
                });
            }
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.processReceipt = processReceipt;
