"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhook = verifyWebhook;
const crypto_1 = __importDefault(require("crypto"));
const SIGNATURE_HEADER_KEYS = [
    'x-signature',
    'x-paystack-signature',
    'x-flw-signature'
];
function getSignatureHeader(req) {
    for (const key of SIGNATURE_HEADER_KEYS) {
        const value = req.headers[key];
        if (typeof value === 'string')
            return value;
        if (Array.isArray(value))
            return value[0];
    }
    return undefined;
}
function verifyWebhook(req, res, next) {
    try {
        // Express must be configured to expose raw body to req.rawBody
        const signatureHeader = getSignatureHeader(req);
        if (!signatureHeader)
            return res.status(400).send('Missing signature header');
        // rawBody should be the raw buffer string
        const raw = req.rawBody ?? JSON.stringify(req.body);
        const secret = process.env.WEBHOOK_SECRET ?? '';
        const computed = crypto_1.default.createHmac('sha256', secret).update(raw).digest('hex');
        const computedBuf = Buffer.from(computed, 'utf8');
        const signatureBuf = Buffer.from(signatureHeader, 'utf8');
        if (computedBuf.length !== signatureBuf.length) {
            // timingSafeEqual requires same length — compare using hash of both to avoid length leak
            const comp = crypto_1.default.createHmac('sha256', secret).update(raw).digest();
            const sig = Buffer.from(signatureHeader, 'hex');
            if (comp.length === sig.length && crypto_1.default.timingSafeEqual(comp, sig)) {
                return next();
            }
            return res.status(401).send('Invalid signature length');
        }
        if (!crypto_1.default.timingSafeEqual(computedBuf, signatureBuf)) {
            return res.status(401).send('Invalid signature');
        }
        next();
    }
    catch (err) {
        console.error('Webhook verify error:', err);
        res.status(500).send('Webhook verification failed');
    }
}
