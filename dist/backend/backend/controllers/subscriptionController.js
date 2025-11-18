"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSubscriptionWebhook = exports.startSubscription = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const crypto_1 = __importDefault(require("crypto"));
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const startSubscription = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { plan } = req.body;
        if (!plan || !["free", "pro"].includes(plan)) {
            return res.status(400).json({ error: "Invalid plan" });
        }
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (plan === "pro") {
            const paymentUrl = `https://payment-gateway.example.com/checkout?user=${userId}&plan=pro`;
            return res.json({
                message: "Redirect to payment gateway",
                payment_url: paymentUrl,
            });
        }
        user.subscription_plan = plan;
        user.subscription_expires_at = null;
        await userRepository.save(user);
        return res.json({
            message: "Subscription updated",
            subscription: {
                plan: user.subscription_plan,
                expires_at: user.subscription_expires_at,
            },
        });
    }
    catch (error) {
        console.error("Start subscription error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.startSubscription = startSubscription;
const handleSubscriptionWebhook = async (req, res) => {
    try {
        const signature = req.get("x-webhook-signature");
        const secret = process.env.WEBHOOK_SECRET || "your-secret-key";
        const body = JSON.stringify(req.body);
        const expectedSignature = crypto_1.default
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");
        if (signature !== expectedSignature) {
            return res.status(401).json({ error: "Invalid signature" });
        }
        const { event, user_id, plan, expires_at } = req.body;
        if (event === "subscription.success") {
            const user = await userRepository.findOne({ where: { id: user_id } });
            if (user) {
                user.subscription_plan = plan;
                user.subscription_expires_at = new Date(expires_at);
                await userRepository.save(user);
            }
        }
        return res.json({ status: "received" });
    }
    catch (error) {
        console.error("Subscription webhook error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.handleSubscriptionWebhook = handleSubscriptionWebhook;
