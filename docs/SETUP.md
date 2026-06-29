# Setup Documentation

How to clone, configure, and run VoteChain locally.

---

## Prerequisites

Install these before starting:

- **Node.js** v18 or later — https://nodejs.org
- **Git** — https://git-scm.com
- **MetaMask** browser extension — https://metamask.io
- **VS Code** (recommended) — https://code.visualstudio.com

External services (free tiers work):

- **Alchemy account** for Sepolia RPC — https://alchemy.com
- **Neon account** for PostgreSQL — https://neon.tech
- **Etherscan account** for contract verification — https://etherscan.io

---

## 1. Clone the Repository

```bash
git clone https://github.com/megnabadal/evm-voting-dapp.git
cd evm-voting-dapp
git checkout feature/project-setup
```

The `feature/project-setup` branch contains all the application code. The `main` and `dev` branches contain only documentation.

---

## 2. Project Structure
evm-voting-dapp/
```
├── contracts/          # Solidity smart contracts and Hardhat config

├── backend/            # Express + TypeScript API

├── frontend/           # Next.js 14 frontend

├── ignition/           # Hardhat Ignition deployment modules

├── scripts/            # Deployment and utility scripts

├── test/               # Smart contract tests

├── types/              # Generated TypeChain types

└── docs/               # Project documentation
```
---

## 3. Smart Contract Setup

```bash
cd contracts
npm install
```

Create `contracts/.env`:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

SEPOLIA_PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY

ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```
⚠️ **Never commit `.env` files.** They are already in `.gitignore`.

### Compile contracts

```bash
npx hardhat compile
```

### Run tests

```bash
npx hardhat test
```

### Deploy to Sepolia

See `docs/DEPLOYMENT.md` for the full deployment guide.

---

## 4. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

TREASURY_PRIVATE_KEY=0xYOUR_TREASURY_WALLET_PRIVATE_KEY

TREASURY_SEND_AMOUNT=0.001

FRONTEND_URL=http://localhost:3000

PORT=5000
```
### Set up the database

On Neon, run this SQL once:

```sql
CREATE TABLE IF NOT EXISTS users (
  wallet_address VARCHAR(42) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS vote_transactions (
  tx_hash VARCHAR(66) PRIMARY KEY,
  proposal_id INTEGER NOT NULL,
  voter_address VARCHAR(42) NOT NULL,
  vote_yes BOOLEAN NOT NULL,
  block_number BIGINT NOT NULL,
  voted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vote_transactions_proposal ON vote_transactions(proposal_id);
CREATE INDEX idx_vote_transactions_voter ON vote_transactions(voter_address);
```

### Run the backend

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Verify with:
```
GET http://localhost:5000/health
```
Should return `{"status": "ok", "message": "EVM Voting API is running!"}`.

---

## 5. Frontend Setup

```bash
cd frontend
npm install
```

The frontend uses hardcoded values for the Alchemy RPC and contract address (in `frontend/src/lib/wagmi.ts` and `frontend/src/lib/contract.ts`) due to a Vercel UI issue where sensitive env var fields reset to placeholder values.

### Run the frontend

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## 6. Connect Your Wallet

1. Open `http://localhost:3000`
2. Click **Connect Wallet**
3. Approve in MetaMask
4. If on the wrong network, the "Switch to Sepolia" modal appears
5. If your wallet is not registered, fill out the registration form
6. Once registered, you can create proposals and vote

For Sepolia test ETH, use a faucet:
- https://sepoliafaucet.com (Alchemy)
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia (Google)

---

## 7. Development Workflow

### Branching

This project uses a non-standard scheme:

- `main` — Documentation only
- `dev` — Documentation only
- `feature/project-setup` — All application code

Always work on `feature/project-setup`. Standard PRs between branches will conflict because they share no history.

### Common commands

```bash
# Check status
git status

# Stage and commit
git add <file>
git commit -m "your message"

# Push
git push origin feature/project-setup

# Sync documentation to main
git checkout main
git checkout feature/project-setup -- docs/
git add docs/
git commit -m "docs: sync from feature/project-setup"
git push origin main
git checkout feature/project-setup
```

---

## 8. Troubleshooting

### `npm install` fails with permission errors on Windows

Run your terminal as administrator, or use WSL2.

### Backend can't connect to Neon

Ensure `DATABASE_URL` includes `?sslmode=require`. The connection pool also needs `ssl: { rejectUnauthorized: false }` (already configured in `backend/src/config/db.ts`).

### Frontend fails to read proposals

Check the browser console. If you see RPC errors, your Alchemy URL may be wrong or rate-limited. The frontend uses a dedicated read provider — see `frontend/src/services/blockchainService.ts`.

### "Stray character" build error on Vercel

Windows CMD copy-paste sometimes corrupts the `"use client"` directive with invisible characters. Open the file in VS Code and manually retype line 1.

### MetaMask not detected in Brave Browser

Brave injects its own wallet that spoofs `window.ethereum.isMetaMask`. The app checks `!window.ethereum.isBraveWallet` to distinguish them. If you see the "Install MetaMask" modal in Brave, disable Brave Wallet in `brave://settings/web3`.

---

## 9. Tech Stack Reference

| Layer       | Technology |
|-------------|------------|
| Smart contract | Solidity 0.8.28, Hardhat 3 |
| Backend     | Node.js, Express, TypeScript |
| Database    | Neon PostgreSQL |
| Frontend    | Next.js 14, React, TypeScript, Tailwind CSS |
| Web3        | wagmi v2, ethers.js v6, RainbowKit |
| RPC         | Alchemy (Sepolia) |
| Hosting     | Vercel (frontend), Railway (backend) |

---

## 10. Further Reading

- `docs/API.md` — Backend API reference
- `docs/SMART_CONTRACT.md` — Voting contract reference
- `docs/DEPLOYMENT.md` — How to deploy each component
- `README.md` — Project overview