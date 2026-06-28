# VoteChain API Documentation

Backend API for the VoteChain on-chain governance dApp.

**Base URL:** `https://evm-voting-dapp-production.up.railway.app/api`

**Content-Type:** All endpoints return JSON. POST endpoints accept JSON.

---

## Health Check

### `GET /health`

Returns server status.

**Response (200):**
```json
{
  "status": "ok",
  "message": "EVM Voting API is running!"
}
```

---

## Proposals

### `GET /api/proposals`

Returns all proposals from the smart contract.

**Response (200):** Array of proposal objects.

```json
[
  {
    "id": 0,
    "title": "Reduce Quorum Threshold",
    "description": "Lower the participation requirement...",
    "creator": "0x2c885...",
    "createdAt": 1719407123,
    "deadline": 1719493523,
    "yesVotes": 1,
    "noVotes": 0,
    "exists": true,
    "active": true
  }
]
```

---

### `GET /api/proposals/:id`

Returns a single proposal by ID.

**Path parameters:**
- `id` (number) — The proposal ID

**Response (200):** Single proposal object (same shape as above).

**Response (404):** Proposal not found.

---

### `POST /api/proposals`

Triggers proposal creation. Actual on-chain creation happens via the frontend MetaMask transaction; this endpoint exists for optional off-chain metadata caching.

---

### `GET /api/proposals/:id/votes`

Returns the list of vote transactions for a given proposal, sourced from the `vote_transactions` table.

**Path parameters:**
- `id` (number) — The proposal ID

**Response (200):**
```json
[
  {
    "tx_hash": "0xabc123...",
    "proposal_id": 0,
    "voter_address": "0x2c885...",
    "vote_yes": true,
    "block_number": 11113560,
    "voted_at": "2026-06-26T16:24:29.000Z"
  }
]
```

---

### `POST /api/proposals/:id/votes`

Records a vote transaction in the database after it's been submitted to the blockchain.

**Path parameters:**
- `id` (number) — The proposal ID

**Request body:**
```json
{
  "txHash": "0xabc123...",
  "voterAddress": "0x2c885...",
  "voteYes": true,
  "blockNumber": 11113560
}
```

**Response (201):** The created vote transaction record.

---

## Users

### `GET /api/users/:walletAddress`

Returns the registered user profile for a wallet address.

**Path parameters:**
- `walletAddress` (string) — Ethereum address (0x followed by 40 hex characters)

**Response (200):**
```json
{
  "wallet_address": "0x2c885d2e0fcdef1b62b41e08d8222b50ae3b22c3",
  "full_name": "Megna Badal",
  "username": "megnab",
  "email": "user@example.com",
  "date_of_birth": "2000-01-01",
  "created_at": "2026-06-26T16:24:29.000Z"
}
```

**Response (400):** Invalid wallet address format.
```json
{ "error": "Invalid wallet address" }
```

**Response (404):** User not registered.
```json
{ "error": "User not found" }
```

---

### `POST /api/users`

Registers a new user and auto-sends 0.001 Sepolia ETH from the treasury wallet.

**Request body:**
```json
{
  "walletAddress": "0x2c885d2e0fcdef1b62b41e08d8222b50ae3b22c3",
  "fullName": "Megna Badal",
  "username": "megnab",
  "email": "user@example.com",
  "dateOfBirth": "2000-01-01"
}
```

**Validation rules:**
- All fields required
- `walletAddress` — Valid Ethereum address format
- `fullName` — 2-100 characters
- `username` — 3-50 characters, alphanumeric + underscore only, must be unique
- `email` — Valid email format
- `dateOfBirth` — User must be 18 or older

**Response (201):**
```json
{
  "wallet_address": "0x2c885...",
  "full_name": "Megna Badal",
  "username": "megnab",
  "email": "user@example.com",
  "date_of_birth": "2000-01-01",
  "created_at": "2026-06-26T16:24:29.000Z",
  "treasuryTx": {
    "txHash": "0xdef456...",
    "amount": "0.001"
  }
}
```

`treasuryTx` may be `null` if the treasury transfer fails. The user is still created.

**Response (400):** Validation error.
```json
{ "error": "Username must be 3-50 characters" }
```

**Response (409):** Conflict — wallet or username already exists.
```json
{ "error": "Wallet address already registered" }
```
```json
{ "error": "Username already taken" }
```

---

### `GET /api/users/:walletAddress/balance`

Returns the current Sepolia ETH balance of a wallet.

**Path parameters:**
- `walletAddress` (string) — Ethereum address

**Response (200):**
```json
{
  "balance": "0.022325534861497065"
}
```

Balance is returned in ETH (not wei) as a string to preserve precision.

**Response (400):** Invalid wallet address format.

---

## CORS

Allowed origins:
- `http://localhost:3000` (development)
- `https://evm-voting-dapp*.vercel.app` (Vercel deployments)

Allowed methods: `GET`, `POST`, `PUT`, `DELETE`.

Allowed headers: `Content-Type`, `Authorization`.

---

## Error Handling

All errors return JSON with an `error` field.

| Status | Meaning |
|--------|---------|
| 200    | Success |
| 201    | Resource created |
| 400    | Bad request / validation error |
| 404    | Resource not found |
| 409    | Conflict (duplicate) |
| 500    | Internal server error |

---

## Architecture Notes

- **Reads** (`GET /api/proposals`) fetch data from the Sepolia blockchain via Alchemy RPC.
- **Vote transactions** are stored in PostgreSQL because Alchemy's free tier caps `eth_getLogs` block range, making direct on-chain queries unreliable for historical votes.
- **Users** are stored in PostgreSQL with wallet address as the primary key. The wallet is the identity — there are no passwords.
- **Treasury** sends 0.001 Sepolia ETH to new users on registration, funded from a dedicated wallet whose private key is stored in Railway environment variables.

---

## Tech Stack

- **Runtime:** Node.js + Express + TypeScript
- **Database:** Neon PostgreSQL
- **RPC Provider:** Alchemy (Sepolia testnet)
- **Hosting:** Railway
- **Blockchain Library:** ethers.js v6