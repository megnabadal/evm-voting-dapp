import { Request, Response } from "express";
import {
  getAllProposalsService,
  getProposalByIdService,
  createProposalService,
  getVoteTransactionsService,
  saveVoteTransactionService,
} from "../services/proposalService";

const successResponse = (res: Response, data: any, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

const errorResponse = (res: Response, message: string, statusCode = 500) => {
  console.error("API Error:", message);
  return res.status(statusCode).json({ success: false, error: message });
};

export const getProposals = async (req: Request, res: Response) => {
  try {
    const proposals = await getAllProposalsService();
    successResponse(res, proposals);
  } catch (err: any) {
    errorResponse(res, err.message);
  }
};

export const getProposalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proposal = await getProposalByIdService(Number(id));
    if (!proposal) return errorResponse(res, "Proposal not found", 404);
    successResponse(res, proposal);
  } catch (err: any) {
    errorResponse(res, err.message);
  }
};

export const createProposal = async (req: Request, res: Response) => {
  try {
    console.log("📩 Incoming proposal:", req.body);
    const { title, description, duration, creatorAddress, contractId } = req.body;

    if (!title || !description || !duration) {
      return errorResponse(res, "Title, description and duration are required", 400);
    }
    if (typeof title !== "string" || title.length > 255) {
      return errorResponse(res, "Title must be a string under 255 characters", 400);
    }
    if (typeof duration !== "number" || duration <= 0) {
      return errorResponse(res, "Duration must be a positive number", 400);
    }

    const proposal = await createProposalService(
      title, description, duration, creatorAddress, contractId
    );

    console.log("✅ Saved to DB:", proposal);
    successResponse(res, proposal, 201);
  } catch (err: any) {
    console.error("❌ Create proposal error:", err);
    errorResponse(res, err.message);
  }
};

export const getVoteTransactions = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id < 0) return errorResponse(res, "Invalid proposal ID", 400);

    const result = await getVoteTransactionsService(id);
    if (!result) return errorResponse(res, "Proposal not found", 404);

    successResponse(res, result);
  } catch (err: any) {
    errorResponse(res, err.message);
  }
};

export const saveVoteTransaction = async (req: Request, res: Response) => {
  try {
    const proposalId = Number(req.params.id);
    if (isNaN(proposalId) || proposalId < 0) {
      return errorResponse(res, "Invalid proposal ID", 400);
    }

    const { txHash, voterAddress, support, blockNumber } = req.body;

    if (!txHash || !voterAddress || support === undefined || !blockNumber) {
      return errorResponse(res, "txHash, voterAddress, support and blockNumber are required", 400);
    }
    if (typeof txHash !== "string" || !txHash.startsWith("0x")) {
      return errorResponse(res, "Invalid transaction hash", 400);
    }
    if (typeof voterAddress !== "string" || !voterAddress.startsWith("0x")) {
      return errorResponse(res, "Invalid voter address", 400);
    }

    const saved = await saveVoteTransactionService(
      proposalId, txHash, voterAddress, support, blockNumber
    );

    successResponse(res, saved ?? { message: "Already recorded" }, 201);
  } catch (err: any) {
    errorResponse(res, err.message);
  }
};