import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";

export class OcrController {
  async parseReceipt(req: AuthRequest, res: Response) {
    try {
      // OCR implementation - for now return mock response
      // In production, call Python OCR service

      res.json({
        amounts: [
          { value: 5000, confidence: 0.95, merchant: "Sample Store" },
        ],
        meta: {
          ocr_count: 1,
          avg_confidence: 0.95,
          rule_version: "ocr-v1",
        },
      });
    } catch (error) {
      res.status(500).json({ error: "OCR parsing failed" });
    }
  }
}
