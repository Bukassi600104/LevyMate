import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-signature"] as string;

    if (!signature) {
      return res.status(400).json({ error: "Missing signature header" });
    }

    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const secret = process.env.WEBHOOK_SECRET || "webhook-secret";

    const computed = crypto
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

    if (!crypto.timingSafeEqual(computedBuffer, signatureBuffer)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    next();
  } catch (error) {
    res.status(400).json({ error: "Webhook verification failed" });
  }
};
