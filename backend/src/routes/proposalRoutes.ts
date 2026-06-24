import { Router } from "express";
import {
  getProposals,
  getProposalById,
  createProposal,
  getVoteTransactions,
  saveVoteTransaction,
} from "../controllers/proposalController";

const router = Router();

router.get("/", getProposals);
router.get("/:id/votes", getVoteTransactions);
router.post("/:id/votes", saveVoteTransaction);
router.get("/:id", getProposalById);
router.post("/", createProposal);

export default router;