import { ethers } from "ethers";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

// ─── ABI matching your Voting.sol contract ────────────────────────────
export const VOTING_CONTRACT_ABI = [
  {
    name: "createProposal",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_durationInMinutes", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "vote",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_proposalId", type: "uint256" },
      { name: "_voteYes", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "getProposal",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_proposalId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "yesVotes", type: "uint256" },
          { name: "noVotes", type: "uint256" },
          { name: "exists", type: "bool" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getAllProposals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "yesVotes", type: "uint256" },
          { name: "noVotes", type: "uint256" },
          { name: "exists", type: "bool" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
];

// ─── Provider & Contract ──────────────────────────────────────────────
const RPC_URL = process.env.ALCHEMY_URL || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

if (!RPC_URL) console.warn("⚠️ ALCHEMY_URL not set in .env");
if (!CONTRACT_ADDRESS) console.warn("⚠️ CONTRACT_ADDRESS not set in .env");

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const votingContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  VOTING_CONTRACT_ABI,
  provider
);

console.log("✅ Blockchain config loaded");