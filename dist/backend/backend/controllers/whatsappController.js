"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importWhatsApp = void 0;
const parseWhatsApp_1 = require("../../services/whatsapp/parseWhatsApp");
const importWhatsApp = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        if (req.file.mimetype !== "text/plain") {
            return res.status(400).json({ error: "Invalid file type. Only .txt files are allowed" });
        }
        const maxSize = 5 * 1024 * 1024;
        if (req.file.size > maxSize) {
            return res.status(400).json({ error: "File too large. Maximum size is 5MB" });
        }
        const content = req.file.buffer.toString("utf-8");
        const candidates = (0, parseWhatsApp_1.parseWhatsAppText)(content);
        const highConfidence = candidates.filter((c) => c.confidence >= 0.7);
        const lowConfidence = candidates.filter((c) => c.confidence < 0.7);
        return res.json({
            total: candidates.length,
            high_confidence: highConfidence.length,
            low_confidence: lowConfidence.length,
            candidates: candidates.map((c) => ({
                amount: c.amount,
                date: c.date,
                type: c.tag,
                confidence: c.confidence,
                description: c.line.substring(0, 200),
                auto_import: c.confidence >= 0.8,
            })),
        });
    }
    catch (error) {
        console.error("WhatsApp import error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.importWhatsApp = importWhatsApp;
