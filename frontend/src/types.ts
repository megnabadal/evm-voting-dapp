export type ProposalStatus = "Active" | "Closed" | "Pending";

export interface NetworkInfo {
  chainId: number;
  name: string;
  isSupported: boolean;
}

export interface ProposalUI {
  id: number;
  title: string;
  description: string;
  status: ProposalStatus;
  yesPercent: number;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  deadline: number;
}

// ─── Proposal Categories (UI-ONLY placeholder — not yet persisted to backend or contract) ──
export type ProposalCategory =
  | "Governance"
  | "Treasury"
  | "Technical"
  | "Community"
  | "Other";

export const PROPOSAL_CATEGORIES: ProposalCategory[] = [
  "Governance",
  "Treasury",
  "Technical",
  "Community",
  "Other",
];