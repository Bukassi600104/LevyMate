"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController");
const auth_1 = require("../middleware/auth");
const body_parser_1 = __importDefault(require("body-parser"));
const router = (0, express_1.Router)();
router.post("/start", auth_1.authenticate, subscriptionController_1.startSubscription);
router.post("/webhook", body_parser_1.default.raw({ type: "application/json" }), subscriptionController_1.handleSubscriptionWebhook);
exports.default = router;
