# Deployment Documentation

How to deploy VoteChain — smart contract, backend, and frontend.

---

## Overview

VoteChain has three deployable components:

| Component       | Host        | Network        |
|-----------------|-------------|----------------|
| Smart contract  | Sepolia     | Ethereum testnet |
| Backend API     | Railway     | Node.js + Express |
| Frontend        | Vercel      | Next.js 14 |

The database (Neon PostgreSQL) is provisioned separately and connected via env variable.

---

## 1. Smart Contract Deployment

### Prerequisites

- Funded Sepolia wallet (get test ETH from a faucet)
- Alchemy account with a Sepolia RPC endpoint
- Etherscan API key (for contract verification)

### Environment variables

The contract uses Hardhat 3's `configVariable` system, which reads from `.env` or Hardhat's keystore.

Set these in `contracts/.env`:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```
⚠️ **Never commit `.env` files. They are gitignored.**

### Configuration

Open `contracts/hardhat.config.ts` and check the `sepolia` network config:

```typescript
sepolia: {
  type: "http",
  chainType: "l1",
  url: configVariable("SEPOLIA_RPC_URL"),
  accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
  gasPrice: "auto",
  maxPriorityFeePerGas: 1000000000,  // 1 gwei
  maxFeePerGas: 8000000000,          // 8 gwei
}
```

Adjust gas values based on Sepolia network conditions.

### Deploy

From the `contracts/` directory:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

The deployment script outputs the new contract address and deployment block number. Save both.

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Post-deployment updates

After deployment, update the new address and block in two places:

**Frontend** — `frontend/src/lib/contract.ts`:
```typescript
export const VOTING_CONTRACT_ADDRESS = "0xNEW_ADDRESS_HERE";
```

**Backend** — the env variable on Railway:
- `CONTRACT_ADDRESS` — new address
- `CONTRACT_DEPLOY_BLOCK` — new deployment block number

Redeployment wipes all existing proposals. Database vote records become orphaned and must be cleared manually if you want a clean slate.

---

## 2. Backend Deployment (Railway)

### Prerequisites

- Railway account
- Neon PostgreSQL database with the `users`, `proposals`, and `vote_transactions` tables
- A funded Sepolia wallet for the treasury

### Environment variables (Railway)

Set these in Railway → your service → Variables:

| Variable                  | Purpose |
|---------------------------|---------|
| `DATABASE_URL`            | Neon PostgreSQL connection string |
| `ALCHEMY_URL`             | Sepolia RPC endpoint |
| `CONTRACT_ADDRESS`        | Deployed Voting contract address |
| `CONTRACT_DEPLOY_BLOCK`   | Block number when contract was deployed |
| `TREASURY_PRIVATE_KEY`    | Private key of treasury wallet that funds new users |
| `TREASURY_SEND_AMOUNT`    | Amount in ETH to send per new user (e.g., `0.001`) |
| `FRONTEND_URL`            | Vercel deployment URL (for CORS) |

⚠️ **`TREASURY_PRIVATE_KEY` is a production secret.** Anyone with access to Railway env vars can drain the treasury wallet. Only use a wallet that holds Sepolia test ETH, never your personal wallet on mainnet.

### Initial database setup

Run this SQL once on your Neon database to create the `users` table:

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
```

The `vote_transactions` and `proposals` tables are created by earlier project setup steps.

### Deploy

Railway auto-deploys from GitHub on push.

1. Connect your GitHub repo to Railway
2. Set the branch to deploy from (`feature/project-setup`)
3. Set the build command: `cd backend && npm install && npm run build`
4. Set the start command: `cd backend && npm start`
5. Push to the deployment branch — Railway picks it up automatically

Check deployment status in Railway → Deployments tab.

### Verify
```
GET https://evm-voting-dapp-production.up.railway.app/health
```
Should return `{"status": "ok", "message": "EVM Voting API is running!"}`.

---

## 3. Frontend Deployment (Vercel)

### Prerequisites

- Vercel account
- GitHub repo connected to Vercel

### Configuration

Vercel auto-detects Next.js. No manual config needed for builds.

### Environment variables (Vercel)

The frontend uses hardcoded values for the Alchemy RPC and contract address (in `frontend/src/lib/wagmi.ts` and `frontend/src/lib/contract.ts`) due to a known Vercel UI issue where sensitive env var fields reset to placeholder values.

If you redeploy the contract, update these source files directly and push — do not rely on Vercel env vars for blockchain config.

### Deploy

Vercel auto-deploys on push to the configured branch.

1. Vercel dashboard → Settings → Git
2. Set Production Branch to `feature/project-setup`
3. Push to that branch — Vercel deploys automatically

### Verify

Open the Vercel-provided URL. Connect MetaMask on Sepolia. The app should:

- Show "Sepolia Testnet · Network Operational"
- Allow wallet connection
- For new wallets: show the registration form
- For existing wallets: show "Welcome back" toast
- Allow proposal creation and voting

---

## 4. Branching Strategy (Project-Specific)

This project uses a non-standard branching scheme defined by the mentor:

- `main` — Documentation only (no code)
- `dev` — Documentation only (no code)
- `feature/project-setup` — All application code; deployed by Vercel and Railway

Standard pull requests between these branches will produce conflicts because they share no code history. To sync documentation across branches, use targeted file checkouts:

```bash
git checkout main
git checkout feature/project-setup -- docs/
git commit -m "docs: sync from feature/project-setup"
git push origin main
git checkout feature/project-setup
```

---

## 5. Troubleshooting

### Contract calls return undefined for proposals

Most likely the frontend is reading via MetaMask's provider when MetaMask is on the wrong network. The frontend uses a dedicated `getReadProvider()` (hardcoded Alchemy `JsonRpcProvider`) for reads to avoid this. See `frontend/src/services/blockchainService.ts`.

### `eth_getLogs` errors when fetching vote history

Alchemy's free tier limits `eth_getLogs` to a 10-block range. Vote history is indexed in PostgreSQL instead via the `vote_transactions` table. Do not call `queryFilter` on the live contract.

### Treasury fails to send ETH

Check:
1. `TREASURY_PRIVATE_KEY` is set correctly in Railway
2. Treasury wallet has Sepolia ETH balance
3. `ALCHEMY_URL` env var matches the network the contract is deployed on (Sepolia)

If treasury fails, user registration still succeeds. The treasury error is logged but does not block the user.

### Vercel build fails with "stray character" error on line 1

Windows CMD copy-paste sometimes corrupts the `"use client"` directive with invisible characters. Open the offending file in VS Code and manually retype line 1.