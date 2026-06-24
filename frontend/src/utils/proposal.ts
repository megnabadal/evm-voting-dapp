import type { ProposalUI } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProposalForUI(raw: any): ProposalUI {
  // Contract returns tuples with named accessors:
  // [id, title, description, creator, createdAt, deadline, yesVotes, noVotes, exists, active]
  // ethers.js Result type supports both index and name access — we use names where possible
  const id = Number(raw.id ?? raw[0]);
  const title = raw.title ?? raw[1];
  const description = raw.description ?? raw[2];
  const deadline = Number(raw.deadline ?? raw[5]);
  const yesVotes = Number(raw.yesVotes ?? raw[6]);
  const noVotes = Number(raw.noVotes ?? raw[7]);
  const active = raw.active ?? raw[9];

  const totalVotes = yesVotes + noVotes;
  const yesPercent =
    totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;

  const deadlineMs = deadline * 1000;
  const isExpired = Date.now() > deadlineMs;

  const status: ProposalUI["status"] =
    !active || isExpired ? "Closed" : "Active";

  return {
    id,
    title,
    description,
    status,
    yesPercent,
    totalVotes,
    yesVotes,
    noVotes,
    deadline,
  };
}

export function formatVoteError(err: unknown): string {
  const e = err as { code?: string; reason?: string; shortMessage?: string };
  if (e.code === "ACTION_REJECTED") return "Transaction cancelled.";
  if (e.code === "CALL_EXCEPTION") {
    const reason = e.reason ?? e.shortMessage ?? "";
    if (reason.includes("Already voted"))
      return "You have already voted on this proposal.";
    if (reason.includes("Voting has ended")) return "Voting has ended.";
    return "Transaction failed. Check the contract requirements.";
  }
  return "Something went wrong. Please try again.";
}