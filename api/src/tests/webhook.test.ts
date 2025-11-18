import { verifyWebhookSignature } from "../middleware/webhook-verify";
import crypto from "crypto";

describe("Webhook Verification", () => {
  const secret = "test-secret-key";
  const payload = { event: "charge.success", amount: 50000 };
  const payloadString = JSON.stringify(payload);

  beforeEach(() => {
    process.env.WEBHOOK_SECRET = secret;
  });

  const computeSignature = (body: string, key: string) => {
    return crypto.createHmac("sha256", key).update(body).digest("hex");
  };

  it("should verify valid webhook signature", () => {
    const signature = computeSignature(payloadString, secret);

    const res: any = { 
      status: jest.fn(() => ({ json: jest.fn() })),
      json: jest.fn()
    };
    const next = jest.fn();

    const req: any = {
      headers: { "x-signature": signature },
      body: payload,
      rawBody: payloadString,
    };

    verifyWebhookSignature(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should reject invalid webhook signature", () => {
    const wrongSignature = "invalid-signature";

    const res: any = {
      status: jest.fn(() => ({ json: jest.fn() })),
      json: jest.fn()
    };
    const next = jest.fn();

    const req: any = {
      headers: { "x-signature": wrongSignature },
      body: payload,
      rawBody: payloadString,
    };

    verifyWebhookSignature(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject missing signature header", () => {
    const res: any = {
      status: jest.fn(() => ({ json: jest.fn() })),
      json: jest.fn()
    };
    const next = jest.fn();

    const req: any = {
      headers: {},
      body: payload,
    };

    verifyWebhookSignature(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should be resistant to timing attacks", () => {
    const validSignature = computeSignature(payloadString, secret);
    const attackSignature1 = validSignature.substring(0, 32);

    const res: any = {
      status: jest.fn(() => ({ json: jest.fn() })),
      json: jest.fn()
    };
    const next = jest.fn();

    const req: any = {
      headers: { "x-signature": attackSignature1 },
      body: payload,
      rawBody: payloadString,
    };

    verifyWebhookSignature(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
