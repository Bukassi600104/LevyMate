import { Router } from "express";
import { getTaxRules, createTaxRule, estimateTax } from "../controllers/taxController";
import { authenticate, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/rules", optionalAuth, getTaxRules);
router.post("/rules", authenticate, createTaxRule);
router.get("/estimate", authenticate, estimateTax);

export default router;
