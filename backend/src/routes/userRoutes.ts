import { Router } from "express";
import { getUser, registerUser } from "../controllers/userController";

const router = Router();

router.get("/:walletAddress", getUser);
router.post("/", registerUser);

export default router;