import { ethers } from "ethers";
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from "../lib/contract";

// ─── Provider (read-only) ────────────────────────────────────────────────────
export const getProvider = (): ethers.BrowserProvider => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Ethereum provider found. Please install MetaMask.");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

// ─── Signer (read + write) ───────────────────────────────────────────────────
export const getSigner = async (): Promise<ethers.JsonRpcSigner> => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

// ─── Contract (read-only) ────────────────────────────────────────────────────
export const getContract = async (): Promise<ethers.Contract> => {
  const provider = getProvider();
  return new ethers.Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_CONTRACT_ABI,
    provider
  );
};

// ─── Contract with signer (read + write) ────────────────────────────────────
export const getContractWithSigner = async (): Promise<ethers.Contract> => {
  const signer = await getSigner();
  return new ethers.Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_CONTRACT_ABI,
    signer
  );
};

// ─── Read: get all proposals ─────────────────────────────────────────────────
export const getAllProposals = async () => {
  const contract = await getContract();
  const proposals = await contract.getAllProposals();
  return proposals;
};

// ─── Read: get single proposal ───────────────────────────────────────────────
export const getProposal = async (proposalId: number) => {
  const contract = await getContract();
  return contract.getProposal(proposalId);
};

// ─── Write: create proposal ──────────────────────────────────────────────────
export const createProposal = async (
  title: string,
  description: string,
  durationInMinutes: number
) => {
  const contract = await getContractWithSigner();
  const tx = await contract.createProposal(title, description, durationInMinutes);
  console.log("Transaction pending:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed:", receipt);
  return receipt;
};

// ─── Write: cast vote ────────────────────────────────────────────────────────
export const castVote = async (
  proposalId: number,
  voteYes: boolean
): Promise<ethers.TransactionReceipt> => {
  const contract = await getContractWithSigner();
  const tx = await contract.vote(proposalId, voteYes);
  console.log("Transaction pending:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed:", receipt);
  return receipt;
};
