"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webhook_verify_1 = require("../../middleware/webhook-verify");
const crypto_1 = __importDefault(require("crypto"));
describe("Webhook Verification", () => {
    const secret = "test-secret-key";
    const payload = { event: "charge.success", amount: 50000 };
    const payloadString = JSON.stringify(payload);
    const computeSignature = (body, key) => {
        return crypto_1.default.createHmac("sha256", key).update(body).digest("hex");
    };
    it("should verify valid webhook signature", () => {
        const signature = computeSignature(payloadString, secret);
        const res = {
            status: jest.fn(() => ({ json: jest.fn() })),
            json: jest.fn()
        };
        const next = jest.fn();
        const req = {
            headers: { "x-signature": signature },
            body: payload,
            rawBody: payloadString,
        };
        (0, webhook_verify_1.verifyWebhookSignature)(req, res, next);
        expect(next).toHaveBeenCalled();
    });
    it("should reject invalid webhook signature", () => {
        const wrongSignature = "invalid-signature";
        const res = {
            status: jest.fn(() => ({ json: jest.fn() })),
            json: jest.fn()
        };
        const next = jest.fn();
        const req = {
            headers: { "x-signature": wrongSignature },
            body: payload,
            rawBody: payloadString,
        };
        (0, webhook_verify_1.verifyWebhookSignature)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
    it("should reject missing signature header", () => {
        const res = {
            status: jest.fn(() => ({ json: jest.fn() })),
            json: jest.fn()
        };
        const next = jest.fn();
        const req = {
            headers: {},
            body: payload,
        };
        (0, webhook_verify_1.verifyWebhookSignature)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    it("should be resistant to timing attacks", () => {
        const validSignature = computeSignature(payloadString, secret);
        const attackSignature1 = validSignature.substring(0, 32);
        const res = {
            status: jest.fn(() => ({ json: jest.fn() })),
            json: jest.fn()
        };
        const next = jest.fn();
        const req = {
            headers: { "x-signature": attackSignature1 },
            body: payload,
            rawBody: payloadString,
        };
        (0, webhook_verify_1.verifyWebhookSignature)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});
//# sourceMappingURL=webhook.test.js.map