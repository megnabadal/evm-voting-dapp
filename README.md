# On-Chain Voting Web Application

a fullstack decentralized application (dApp) that enables users to participate in transparent, tamper-proof voting using their Ethereum wallet. Proposals and votes are stored directly on the blockchain, ensuring no central authority can alter results. Off-chain metadata is handled by a lightweight backend and PostgreSQL database.

---

## Tech Stack

**Frontend**

- Next.js + TypeScript
- TailwindCSS
- ethers.js

**Backend**

- Node.js + Express.js
- PostgreSQL + PGVector

**Blockchain**

- Solidity
- Hardhat
- MetaMask
- Sepolia Testnet

---

## Features

- Connect your MetaMask wallet
- Create proposals with a title, description, and deadline
- Vote yes or no on proposals
- View live vote results
- Proposals and votes are stored on-chain — no central authority

---

## Project Structure

```
/
├── frontend/          # Next.js application
├── backend/           # Express.js API server
├── blockchain/        # Hardhat + Solidity smart contracts
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js
- MetaMask browser extension
- PostgreSQL
- Git

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Blockchain

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
```

---

## Environment Variables

### Frontend `.env.local`

```
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_BACKEND_URL=
```

### Backend `.env`

```
DATABASE_URL=
PORT=
```

### Blockchain `.env`

```
PRIVATE_KEY=
SEPOLIA_RPC_URL=
BASE_SEPOLIA_RPC_URL=
```

---

## Smart Contract

The voting contract is deployed on Sepolia / Base Sepolia testnet.

**Contract Address:** coming soon

**Core Functions:**

- `createProposal(title, description, deadline)` — create a new proposal
- `vote(proposalId, voteYes)` — cast a yes or no vote
- `getProposal(proposalId)` — fetch a single proposal
- `getAllProposals()` — fetch all proposals

---

## Running Tests

```bash
cd blockchain
npx hardhat test
```

---

## Screenshots

NA 

---

## Author
Megna Badal
