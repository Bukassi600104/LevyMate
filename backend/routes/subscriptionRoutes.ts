import { Router } from "express";
import { startSubscription, handleSubscriptionWebhook } from "../controllers/subscriptionController";
import { authenticate } from "../middleware/auth";
import bodyParser from "body-parser";

const router = Router();

router.post("/start", authenticate, startSubscription);
router.post("/webhook", bodyParser.raw({ type: "application/json" }), handleSubscriptionWebhook);

export default router;
