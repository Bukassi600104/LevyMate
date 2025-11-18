"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
const verifyWebhookSignature = (req, res, next) => {
    try {
        const signature = req.headers["x-signature"];
        if (!signature) {
            return res.status(400).json({ error: "Missing signature header" });
        }
        const rawBody = req.rawBody || JSON.stringify(req.body);
        const secret = process.env.WEBHOOK_SECRET || "webhook-secret";
        const computed = crypto_1.default
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");
        // Use timingSafeEqual to prevent timing attacks
        const computedBuffer = Buffer.from(computed);
        const signatureBuffer = Buffer.from(signature);
        // Check buffers are same length before comparing
        if (computedBuffer.length !== signatureBuffer.length) {
            return res.status(401).json({ error: "Invalid signature" });
        }
        if (!crypto_1.default.timingSafeEqual(computedBuffer, signatureBuffer)) {
            return res.status(401).json({ error: "Invalid signature" });
        }
        next();
    }
    catch (error) {
        res.status(400).json({ error: "Webhook verification failed" });
    }
};
exports.verifyWebhookSignature = verifyWebhookSignature;
//# sourceMappingURL=webhook-verify.js.map