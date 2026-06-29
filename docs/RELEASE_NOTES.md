# Release Notes

## v1.0.0 — Initial Release

**Release date:** June 30, 2026
**Branch:** `feature/project-setup`
**Live demo:** https://evm-voting-dapp-n4o3.vercel.app

First production-ready release of VoteChain — an on-chain governance dApp on the Sepolia testnet.

---

## Highlights

- **Wallet-based identity.** No passwords. MetaMask connection IS the auth.
- **Auto-funded onboarding.** New users automatically receive 0.001 Sepolia ETH from the treasury on registration.
- **On-chain voting.** Every proposal and vote permanently recorded on Sepolia.
- **Live, themed UI.** Dark/light mode toggle, mobile responsive, Three.js particle background.
- **Strict network enforcement.** App refuses to function on networks other than Sepolia.

---

## Features

### Smart Contract

- Proposal creation with configurable voting windows (1 hour, 6 hours, 24 hours, 3 days, 7 days)
- One vote per wallet per proposal (enforced on-chain)
- View functions for fetching proposals and vote counts (gas-free reads)
- `VoteCast` event with `indexed` parameters for efficient off-chain filtering
- Deployed at [`0x0eE97B60A88421E106e4999EBCF3D0144b479A94`](https://sepolia.etherscan.io/address/0x0eE97B60A88421E106e4999EBCF3D0144b479A94)

### Backend (Express + TypeScript)

- `GET /api/proposals` — list all on-chain proposals
- `GET /api/proposals/:id` — single proposal details
- `GET /api/proposals/:id/votes` — vote transaction history
- `POST /api/proposals/:id/votes` — record vote in PostgreSQL after on-chain confirmation
- `GET /api/users/:walletAddress` — user profile lookup
- `POST /api/users` — register new user + auto-send Sepolia ETH from treasury
- `GET /api/users/:walletAddress/balance` — live wallet balance check
- Neon PostgreSQL for user profiles and vote history
- CORS configured for production Vercel deployments

### Frontend (Next.js 14)

- Wallet connection via wagmi v2 + RainbowKit + MetaMask detection
- Brave Wallet detection (excluded — not treated as MetaMask)
- User registration form: full name, username (unique), email, date of birth (18+)
- "Welcome back" toast for returning users (3 seconds)
- Low balance warning modal with faucet link (threshold: 0.0005 ETH)
- Wrong network modal with one-click "Switch to Sepolia" button
- Proposal list, detail, and create pages
- Real-time vote distribution charts
- Dark/light theme toggle (persisted via localStorage)
- Three.js particle network background (theme-aware)
- Mobile hamburger menu and responsive layout
- Custom cursor that overlays modals

### Infrastructure

- Frontend on Vercel (auto-deploys from `feature/project-setup`)
- Backend on Railway (auto-deploys from `feature/project-setup`)
- Database on Neon PostgreSQL
- RPC via Alchemy (Sepolia)
- Treasury wallet funds new users automatically

### Documentation

- `README.md` — project overview
- `docs/API.md` — backend API reference
- `docs/SMART_CONTRACT.md` — contract reference
- `docs/SETUP.md` — local development setup
- `docs/DEPLOYMENT.md` — deployment guide
- `docs/FRONTEND.md` — frontend architecture
- `docs/SCREENSHOTS.md` — visual reference

---

## Known Limitations

These are intentional scope decisions, not bugs:

- **No token-weighted voting.** Every wallet's vote counts equally.
- **No quorum thresholds.** Proposals pass by simple majority.
- **No Sybil resistance beyond email + username uniqueness.** A determined attacker can register multiple wallets with different emails.
- **No proposal cancellation or editing.** Once created, proposals are immutable.
- **No upgrade path for the smart contract.** Deployed contracts are final. Redeploying creates a new contract with a new address and resets all proposals.

---

## Technical Decisions & Workarounds

- **Reads via dedicated Alchemy provider** — Frontend uses a hardcoded `JsonRpcProvider` for contract reads instead of MetaMask's provider, so reads work even when MetaMask is on the wrong network.
- **Vote history indexed in PostgreSQL** — Alchemy's free tier caps `eth_getLogs` at a 10-block range, making direct on-chain event queries unreliable. Votes are saved to the database immediately after on-chain confirmation.
- **MetaMask vs Brave Wallet detection** — Brave Wallet sets `window.ethereum.isMetaMask = true` to spoof MetaMask. The app explicitly checks `!window.ethereum.isBraveWallet` to distinguish.
- **Shared UI state via `WalletUIContext`** — Multiple components call `useWallet()`, but React Context is required to share UI flags (like "show MetaMask install warning") across hook instances.
- **Hardcoded contract address in source** — A known Vercel UI bug resets sensitive env var fields. Critical values are hardcoded in `frontend/src/lib/contract.ts` and `frontend/src/lib/wagmi.ts`.

---

## Non-Standard Branching Scheme

Per mentor guidance, this project uses:

- `main` — Documentation only
- `dev` — Documentation only
- `feature/project-setup` — All application code

This is deliberate. Standard PRs between branches fail because they share no history.

---

## Acknowledgments

Built as part of a 30-day software development internship under mentor guidance. Educational project, not intended for production use without additional security review.

Mentor — review and architectural decisions

[Megna Badal](https://github.com/megnabadal) — development
