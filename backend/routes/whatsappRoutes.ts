import { Router } from "express";
import { importWhatsApp } from "../controllers/whatsappController";
import { authenticate } from "../middleware/auth";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/import", authenticate, upload.single("file"), importWhatsApp);

export default router;
