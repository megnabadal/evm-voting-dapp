import pool from "../config/db";
import {
  getAllProposalsFromChain,
  getProposalFromChain,
  ChainProposal,
  VoteTransaction,
  VoteTransactionResult,
} from "./blockchainService";

export interface MergedProposal extends ChainProposal {
  dbId?: number;
  contractIdInDb?: number | null;
  creatorAddressInDb?: string | null;
  storedInDb: boolean;
}

export const getAllProposalsService = async (): Promise<MergedProposal[]> => {
  const chainProposals = await getAllProposalsFromChain();
  const dbResult = await pool.query("SELECT * FROM proposals");
  const dbProposals = dbResult.rows;

  return chainProposals.map((chainProp) => {
    const dbMatch = dbProposals.find(
      (db) =>
        db.title === chainProp.title &&
        db.description === chainProp.description
    );
    return {
      ...chainProp,
      dbId: dbMatch?.id,
      contractIdInDb: dbMatch?.contract_id,
      creatorAddressInDb: dbMatch?.creator_address,
      storedInDb: !!dbMatch,
    };
  });
};

export const getProposalByIdService = async (
  id: number
): Promise<MergedProposal | null> => {
  const chainProp = await getProposalFromChain(id);
  if (!chainProp || !chainProp.exists) return null;

  const dbResult = await pool.query(
    "SELECT * FROM proposals WHERE title = $1 AND description = $2",
    [chainProp.title, chainProp.description]
  );
  const dbMatch = dbResult.rows[0];

  return {
    ...chainProp,
    dbId: dbMatch?.id,
    contractIdInDb: dbMatch?.contract_id,
    creatorAddressInDb: dbMatch?.creator_address,
    storedInDb: !!dbMatch,
  };
};

export const createProposalService = async (
  title: string,
  description: string,
  duration: number,
  creatorAddress?: string,
  contractId?: number
) => {
  const deadline = new Date(Date.now() + duration * 60 * 1000);
  const result = await pool.query(
    `INSERT INTO proposals (contract_id, title, description, creator_address, deadline)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [contractId || null, title, description, creatorAddress || null, deadline]
  );
  return result.rows[0];
};

export const saveVoteTransactionService = async (
  proposalId: number,
  txHash: string,
  voterAddress: string,
  support: boolean,
  blockNumber: number
) => {
  const result = await pool.query(
    `INSERT INTO vote_transactions (proposal_id, tx_hash, voter_address, support, block_number)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tx_hash) DO NOTHING
     RETURNING *`,
    [proposalId, txHash, voterAddress, support, blockNumber]
  );
  return result.rows[0];
};

export const getVoteTransactionsService = async (
  proposalId: number
): Promise<VoteTransactionResult | null> => {
  const chainProp = await getProposalFromChain(proposalId);
  if (!chainProp || !chainProp.exists) return null;

  const result = await pool.query(
    `SELECT tx_hash, voter_address, support, block_number
     FROM vote_transactions
     WHERE proposal_id = $1
     ORDER BY block_number DESC`,
    [proposalId]
  );

  const yesVotes: VoteTransaction[] = [];
  const noVotes: VoteTransaction[] = [];

  for (const row of result.rows) {
    const tx: VoteTransaction = {
      txHash: row.tx_hash,
      voter: row.voter_address,
      support: row.support,
      blockNumber: row.block_number,
    };
    if (row.support) {
      yesVotes.push(tx);
    } else {
      noVotes.push(tx);
    }
  }

  return {
    proposalId,
    proposalTitle: chainProp.title,
    totals: { yes: yesVotes.length, no: noVotes.length },
    yesVotes,
    noVotes,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateProposalService = async (id: number, data: any) => {
  const result = await pool.query(
    `UPDATE proposals SET yes_votes = $1, no_votes = $2, is_active = $3 WHERE id = $4 RETURNING *`,
    [data.yesVotes, data.noVotes, data.isActive, id]
  );
  return result.rows[0];
};

export const deleteProposalService = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM proposals WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};