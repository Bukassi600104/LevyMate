import { Router } from "express";
import { processReceipt } from "../controllers/ocrController";
import { authenticate } from "../middleware/auth";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/receipt", authenticate, upload.single("file"), processReceipt);

export default router;
