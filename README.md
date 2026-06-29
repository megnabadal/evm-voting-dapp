# VoteChain

> On-chain governance dApp on the Sepolia testnet — create proposals, cast votes, and view results permanently stored on the blockchain.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://evm-voting-dapp-n4o3.vercel.app)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-purple)](https://sepolia.etherscan.io/address/0x0eE97B60A88421E106e4999EBCF3D0144b479A94)

---

## What it does

VoteChain is a full-stack Web3 governance application. Users connect a MetaMask wallet, register a profile, and participate in on-chain voting. Every proposal and vote is recorded immutably on Sepolia.

**Core features:**

- **Wallet-based identity.** No passwords. Your wallet address IS your account.
- **User profiles.** Full name, username, email, date of birth (18+ required).
- **Auto-funded onboarding.** New users automatically receive 0.001 Sepolia ETH from the treasury to start voting.
- **Proposal lifecycle.** Create proposals with configurable voting windows.
- **One vote per wallet.** Enforced by the smart contract.
- **Live results.** Vote tallies update on-chain in real time.
- **Network enforcement.** App refuses to function on networks other than Sepolia.
- **Light/dark themes.** Theme preference persists across sessions.

---

## Architecture
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐

│   Frontend   │ ──read──│   Alchemy    │ ──RPC── │   Sepolia    │

│  (Next.js)   │         │     RPC      │         │  Blockchain  │

│              │ ──write─►   MetaMask   │ ──tx───►│              │

└──────┬───────┘         └──────────────┘         └──────────────┘

│

▼

┌──────────────┐         ┌──────────────┐

│   Backend    │ ──────► │     Neon     │

│  (Express)   │         │  PostgreSQL  │

└──────────────┘         └──────────────┘
```
**Writes** go: Frontend → MetaMask → Sepolia (direct, no backend involvement)
**Reads** go: Frontend → Backend → Alchemy RPC → Sepolia, merged with PostgreSQL metadata
**Vote history** is indexed in PostgreSQL because Alchemy's free tier caps event log queries at a 10-block range.

---

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Smart contract | Solidity 0.8.28, Hardhat 3 |
| Backend     | Node.js, Express, TypeScript |
| Database    | Neon PostgreSQL |
| Frontend    | Next.js 14 (App Router), React, Tailwind CSS |
| Web3        | wagmi v2, ethers.js v6, RainbowKit |
| RPC         | Alchemy (Sepolia) |
| Hosting     | Vercel (frontend), Railway (backend) |

---

## Live Deployment

- **App:** https://evm-voting-dapp-n4o3.vercel.app
- **Backend API:** https://evm-voting-dapp-production.up.railway.app
- **Contract:** [`0x0eE97B60A88421E106e4999EBCF3D0144b479A94`](https://sepolia.etherscan.io/address/0x0eE97B60A88421E106e4999EBCF3D0144b479A94) on Sepolia

To use the live app, you need Sepolia ETH. Faucets:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com)
- [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

---

## Getting Started

```bash
git clone https://github.com/megnabadal/evm-voting-dapp.git
cd evm-voting-dapp
git checkout feature/project-setup
```

See `docs/SETUP.md` for detailed local setup instructions.

---

## Documentation

| Doc | What it covers |
|-----|----------------|
| [`docs/SETUP.md`](docs/SETUP.md) | Clone, install, configure, run locally |
| [`docs/API.md`](docs/API.md) | Backend API endpoints reference |
| [`docs/SMART_CONTRACT.md`](docs/SMART_CONTRACT.md) | Voting contract functions, events, gas costs |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | How to deploy each component |

---

## Project Structure
```
evm-voting-dapp/

├── contracts/          # Solidity contracts + Hardhat config

├── backend/            # Express + TypeScript API

├── frontend/           # Next.js 14 frontend

├── ignition/           # Hardhat Ignition deployment modules

├── scripts/            # Deployment scripts

├── test/               # Smart contract tests

├── types/              # Generated TypeChain types

└── docs/               # Project documentation
```
---

## Branching Strategy

This project uses a non-standard scheme defined by the mentor:

- `main` — Documentation only
- `dev` — Documentation only
- `feature/project-setup` — All application code; deployed by Vercel and Railway

All code work happens on `feature/project-setup`. To sync docs to other branches:

```bash
git checkout main
git checkout feature/project-setup -- docs/
git commit -m "docs: sync from feature/project-setup"
git push origin main
git checkout feature/project-setup
```

---

## Status

Built as part of a 30-day software development internship. This is an educational project, not a production-grade governance protocol.

**What works:**
- Wallet connection, network enforcement, user registration
- Treasury auto-funding for new users
- Proposal creation, voting, vote tallies
- Light/dark theme toggle, mobile responsive layout

**What's intentionally minimal:**
- No token-weighted voting (every vote counts equally)
- No quorum thresholds
- No proposal cancellation or editing
- No Sybil resistance beyond email + username uniqueness

---

## License

MIT