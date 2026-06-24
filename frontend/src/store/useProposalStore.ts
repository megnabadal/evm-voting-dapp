import { create } from "zustand";
import type { ProposalUI } from "../types";
import { getAllProposals } from "../services/blockchainService";
import { mapProposalForUI } from "../utils/proposal";

interface ProposalState {
  proposals: ProposalUI[];
  loading: boolean;
  error: string | null;
  votingId: number | null;
  fetchProposals: () => Promise<void>;
  setVotingId: (id: number | null) => void;
}

export const useProposalStore = create<ProposalState>((set) => ({
  proposals: [],
  loading: false,
  error: null,
  votingId: null,

  fetchProposals: async () => {
    set({ loading: true, error: null });
    try {
      const raw = await getAllProposals();
      const proposals = Array.from(raw).map((p) => mapProposalForUI(p));
      set({ proposals, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch proposals.";
      set({ error: message, loading: false });
    }
  },

  setVotingId: (id) => set({ votingId: id }),
}));
