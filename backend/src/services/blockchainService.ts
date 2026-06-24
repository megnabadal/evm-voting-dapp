import { votingContract } from "../config/blockchain";

export interface ChainProposal {
  id: number;
  title: string;
  description: string;
  creator: string;
  createdAt: number;
  deadline: number;
  yesVotes: number;
  noVotes: number;
  exists: boolean;
  active: boolean;
}

export interface VoteTransaction {
  txHash: string;
  voter: string;
  support: boolean;
  blockNumber: number;
}

export interface VoteTransactionResult {
  proposalId: number;
  proposalTitle: string;
  totals: { yes: number; no: number };
  yesVotes: VoteTransaction[];
  noVotes: VoteTransaction[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProposal(raw: any): ChainProposal {
  return {
    id: Number(raw.id ?? raw[0]),
    title: raw.title ?? raw[1],
    description: raw.description ?? raw[2],
    creator: raw.creator ?? raw[3],
    createdAt: Number(raw.createdAt ?? raw[4]),
    deadline: Number(raw.deadline ?? raw[5]),
    yesVotes: Number(raw.yesVotes ?? raw[6]),
    noVotes: Number(raw.noVotes ?? raw[7]),
    exists: raw.exists ?? raw[8],
    active: raw.active ?? raw[9],
  };
}

export const getAllProposalsFromChain = async (): Promise<ChainProposal[]> => {
  try {
    const rawProposals = await votingContract.getAllProposals();
    return rawProposals.map(parseProposal);
  } catch (err) {
    console.error("❌ Error fetching from chain:", err);
    throw new Error("Failed to fetch proposals from blockchain");
  }
};

export const getProposalFromChain = async (
  proposalId: number
): Promise<ChainProposal> => {
  try {
    const raw = await votingContract.getProposal(proposalId);
    return parseProposal(raw);
  } catch (err) {
    console.error("❌ Error fetching proposal from chain:", err);
    throw new Error(`Failed to fetch proposal ${proposalId} from blockchain`);
  }
};