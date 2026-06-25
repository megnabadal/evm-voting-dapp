import { ethers } from "ethers";
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from "../lib/contract";

const ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/_-N3uej4LaYmJhRTG-Ci0";

// Read-only provider (always Sepolia via Alchemy)
export const getReadProvider = (): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(ALCHEMY_URL);
};

// Browser provider (MetaMask) for writes
export const getProvider = (): ethers.BrowserProvider => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Ethereum provider found. Please install MetaMask.");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async (): Promise<ethers.JsonRpcSigner> => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

// Read-only contract uses Alchemy
export const getContract = async (): Promise<ethers.Contract> => {
  const provider = getReadProvider();
  return new ethers.Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_CONTRACT_ABI,
    provider
  );
};

export const getContractWithSigner = async (): Promise<ethers.Contract> => {
  const signer = await getSigner();
  return new ethers.Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_CONTRACT_ABI,
    signer
  );
};

export const getAllProposals = async () => {
  const contract = await getContract();
  const proposals = await contract.getAllProposals();
  return proposals;
};

export const getProposal = async (proposalId: number) => {
  const contract = await getContract();
  return contract.getProposal(proposalId);
};

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