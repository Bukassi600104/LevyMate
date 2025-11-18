import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getUser);
router.put("/", updateUser);
router.delete("/", deleteUser);

export default router;
