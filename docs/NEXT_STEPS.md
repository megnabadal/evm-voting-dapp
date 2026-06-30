# Next Steps

Short-term action items for VoteChain after the internship ends. Distinct from the long-term `Future Improvements` section in `RELEASE_NOTES.md` — these are concrete tasks for the next few weeks.

---

## Immediate (next 1-2 weeks)

### Code hygiene

- **Reconcile `Voting.sol` with deployed bytecode.** The local contract file uses `VoteCast(uint256 proposalId, address voter, bool vote)`, but the deployed contract emits `VoteCast(uint256 indexed poolId, address indexed participant, bool accept)`. Update the local file to match the deployment so future redeployments don't drift.
- **Remove hardcoded secrets workaround.** Critical values (Alchemy URL, contract address) are currently hardcoded in `frontend/src/lib/wagmi.ts` and `frontend/src/lib/contract.ts` due to a Vercel env var UI bug. Revisit whether the Vercel issue has been fixed and migrate back to environment variables if possible.
- **Audit for `console.log` leftovers.** Search the entire codebase and remove any debugging logs before treating this as a portfolio-quality project.
- **Run a linter pass.** `npm run lint` on frontend and backend. Fix any warnings.

### Testing

- **Write smart contract tests.** The `test/` folder has minimal coverage. At a minimum, add tests for: proposal creation with valid/invalid inputs, double-voting prevention, deadline enforcement, vote tally accuracy.
- **Add backend integration tests.** Test the full register → fund → vote → record flow end-to-end against a local Hardhat node and a test Postgres instance.
- **Add a frontend smoke test.** Even a single Playwright test that loads the homepage, connects a wallet mock, and asserts the proposals list renders would catch a class of regressions.

### Documentation cleanup

- **Verify all screenshots are current.** If the UI has changed since they were captured, update them.
- **Add a `CONTRIBUTING.md`** if the repo is going public. Cover the branching scheme, commit message format, and how to run tests.
- **Link the demo video** in `README.md` once it's uploaded to YouTube or wherever it lives.

---

## Short-term (next 1-2 months)

### Stability and observability

- **Add error tracking** — Sentry, Bugsnag, or LogRocket on the frontend so production errors are visible without users having to report them.
- **Add structured logging** to the backend. Currently logs are unstructured `console.log` strings. Migrate to `pino` or `winston` with JSON output so Railway logs are searchable.
- **Add a status endpoint** to the backend that checks: Postgres connectivity, Alchemy RPC reachability, treasury wallet balance. Useful for monitoring uptime.
- **Set up uptime monitoring.** UptimeRobot or Better Stack pinging the `/health` endpoint every 5 minutes. Free tier is sufficient.

### Code quality

- **Share TypeScript types between frontend and backend.** Move shared interfaces (User, Proposal, VoteTransaction) into a `packages/types` workspace or copy them deliberately and document the contract.
- **Add a pre-commit hook** with Husky that runs lint + format + type-check before commits land.
- **Refactor `mapProposalForUI`** to use a single access pattern instead of dual access (`raw.fieldName ?? raw[index]`). Now that the contract signature is locked, the ambiguity can be resolved at the type level.

### Smart contract

- **Add NatSpec comments** to all functions in `Voting.sol`. Etherscan will display them on the verified contract page, making the contract self-documenting.
- **Get a security audit.** Even a free community audit from MythX or Slither would catch obvious issues before any consideration of mainnet.

---

## Medium-term (next 3-6 months)

### If the project evolves into something more serious

- **Token-weighted voting** — Replace one-wallet-one-vote with stake-weighted votes via an ERC-20 token. This is the single biggest change that would move VoteChain toward real governance utility.
- **Move to an L2** — Deploying to Base, Arbitrum, or Optimism brings gas fees to fractions of a cent per vote. Mainnet Ethereum is too expensive for routine governance participation.
- **Quorum thresholds** — Add a minimum participation requirement for proposals to pass.
- **Delegation** — Let token holders delegate voting power to representatives without transferring tokens.
- **Sybil resistance** — Integrate Worldcoin or Gitcoin Passport for proof-of-personhood verification.

### Tooling

- **Migrate from Hardhat 3 to Foundry** for testing. Foundry's Solidity-native test framework is significantly faster than JavaScript-based testing.
- **Add a subgraph** (The Graph protocol) for event indexing. This replaces the Postgres vote-transaction workaround with a proper decentralized indexer.

---

## Personal Learning Goals

Items I want to learn next, motivated by gaps surfaced during this project:

1. **Foundry** — Modern smart contract development tooling. Faster tests, better debugging, written in Rust.
2. **EIP-712 typed data signing** — For gasless interactions and off-chain consent.
3. **ERC-4337 account abstraction** — How dApps can sponsor user gas fees, eliminating the need for users to hold ETH at all.
4. **Solidity assembly (Yul)** — For gas optimization and understanding what high-level Solidity compiles to.
5. **Formal verification basics** — Tools like Certora or Slither for proving contract properties.
6. **Indexer architecture** — How The Graph, Goldsky, and similar services actually work under the hood.

---

## What This Project Won't Become

For honesty:

- This is **not** moving to mainnet. The security and compliance work required is out of scope for a learning project.
- This is **not** a real DAO. Real governance requires legal entity backing, token mechanics, and a community — none of which exist here.
- This **is** a portfolio piece and a working reference implementation of a Web3 voting dApp that demonstrates fullstack competency across Solidity, Node.js, and Next.js.

The honest goal post-internship is to keep this repo working, refine it for portfolio review, and apply the lessons to the next project.