// Base URL for the backend API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Types matching backend response ─────────────────────────────────────────
// Backend now returns merged chain+DB data
export interface MergedProposal {
  // From blockchain
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
  // From DB
  dbId?: number;
  contractIdInDb?: number | null;
  creatorAddressInDb?: string | null;
  storedInDb: boolean;
}

// Legacy DB-only type (still used for POST response)
export interface ProposalMetadata {
  id: number;
  contract_id: number | null;
  title: string;
  description: string;
  creator_address: string | null;
  created_at: string;
  deadline: string;
  yes_votes: number;
  no_votes: number;
  is_active: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new Error(json.error || "API request failed");
  }

  return json.data;
}

// ─── GET /api/proposals — merged chain + DB data ─────────────────────────────
export const fetchAllProposals = async (): Promise<MergedProposal[]> => {
  return apiFetch<MergedProposal[]>("/api/proposals");
};

// Legacy alias for backward compatibility
export const fetchProposalsFromDB = fetchAllProposals;

// ─── GET /api/proposals/:id ──────────────────────────────────────────────────
export const fetchProposalById = async (
  id: number
): Promise<MergedProposal> => {
  return apiFetch<MergedProposal>(`/api/proposals/${id}`);
};

// Legacy alias
export const fetchProposalFromDB = fetchProposalById;

// ─── POST /api/proposals — save metadata after blockchain tx ─────────────────
export const saveProposalToDB = async (payload: {
  title: string;
  description: string;
  duration: number;
  creatorAddress?: string;
  contractId?: number;
}): Promise<ProposalMetadata> => {
  return apiFetch<ProposalMetadata>("/api/proposals", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      duration: payload.duration,
      creatorAddress: payload.creatorAddress,
      contractId: payload.contractId,
    }),
  });
};

// ─── Health check ────────────────────────────────────────────────────────────
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const json = await res.json();
    return json.status === "ok";
  } catch {
    return false;
  }
};