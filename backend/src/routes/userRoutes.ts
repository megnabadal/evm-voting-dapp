import { Router } from "express";
import { getUser, registerUser, getBalance } from "../controllers/userController";

const router = Router();

router.get("/:walletAddress", getUser);
router.get("/:walletAddress/balance", getBalance);
router.post("/", registerUser);

export default router;