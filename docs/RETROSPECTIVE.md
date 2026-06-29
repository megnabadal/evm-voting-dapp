# Project Retrospective

A self-review of the VoteChain internship project — what worked, what didn't, and what I'd do differently.

---

## What Went Well

### Frontend design

The frontend came together quickly and felt natural to build. Working with Next.js 14, Tailwind, and CSS variables for theming gave me a tight feedback loop — change a value, see it instantly. The cinematic dark governance aesthetic (Playfair Display headings, DM Sans body, navy/electric blue palette, Three.js particle network) ended up looking sharper than I expected for an educational project. Component composition was straightforward — `Navbar`, `WalletGuard`, `RegistrationGate`, `LowBalanceWarning`, and the proposal pages all snapped together cleanly. The dark/light theme system using CSS variables and a `data-theme` attribute on `<html>` was satisfying to implement and worked first try.

The mobile responsive work was also smoother than expected — hamburger menu, font scaling with `clamp()`, single-column layouts on small screens — all standard Tailwind patterns. Custom cursor, scroll-triggered animations via Intersection Observer, and the Three.js hero background were the polish-layer touches that took the UI from "functional" to "presentable."

### Documentation discipline

Writing docs alongside the code (API.md, SMART_CONTRACT.md, DEPLOYMENT.md, SETUP.md, FRONTEND.md) caught a lot of implicit decisions I would have forgotten otherwise. The mentor-defined branching scheme (docs on `main`, code on `feature/project-setup`) was unconventional but forced me to think about documentation as a first-class deliverable, not an afterthought.

---

## What Was Okay

### Backend

The Express + TypeScript backend was fine — not exciting, not painful. The layered architecture (routes → controllers → services → blockchain service) made sense. Neon PostgreSQL was easy to set up and the connection pooling was straightforward. The treasury service for auto-funding new users came together quickly once I understood ethers.js v6 properly.

What kept it from being "great" was that most of the backend logic was wiring — accepting a request, validating inputs, calling either Postgres or the blockchain service, returning JSON. There wasn't a lot of interesting algorithmic work happening in the backend itself.

---

## What Was Hard

### Smart contract development

Solidity was the genuinely new thing. Coming in I had zero EVM background — I didn't know what a `mapping` was, how `block.timestamp` worked, or why `require()` was different from a regular `if`. Learning the basics (structs, mappings, events, view functions, gas-free reads) took real time, and writing the `Voting.sol` contract felt slow at first.

By the end I was comfortable enough with the syntax and patterns to debug the `VoteCast` event signature mismatch (where my local file disagreed with what was actually deployed) and reason about gas costs. But this was the layer where I felt like an actual beginner the longest.

The Hardhat 3 toolchain was a separate learning curve on top of Solidity itself — the `configVariable` system for secrets, the deployment scripts, the difference between `hardhat run` and Hardhat Ignition. Useful, but a lot to absorb in the time available.

---

## What Didn't Go Well

### Frontend ↔ Backend integration gaps

The connection between the frontend and backend was the weakest part of the project. Some of this was architectural — the read/write split (writes go straight to MetaMask, reads go through the backend) is correct, but it took a while to internalize which path each operation should follow. I had moments where I was reaching for the backend when the frontend should have talked to the chain directly, and vice versa.

The integration also revealed gaps I hadn't anticipated:

- Vote transactions had to be POSTed to the backend after on-chain confirmation, but coordinating that timing (wait for confirmation → POST → refetch list) required more careful state management than I expected.
- The frontend `mapProposalForUI` helper had to use dual-access syntax (`raw.fieldName ?? raw[index]`) because ethers.js returns Solidity tuples with both index and name access, and the behavior wasn't consistent.
- API contracts between frontend and backend weren't always tight — I changed response shapes a few times mid-development, which broke the frontend in ways that weren't immediately obvious.

If I were starting over, I'd define the API contracts (request/response TypeScript types) up front and share them between frontend and backend instead of re-typing them on each side.

---

## Lessons Learned

1. **Search for "obvious" bugs before assuming the platform is broken.** The wagmi v2 `useChainId()` vs `useAccount().chain` issue cost me real time. I assumed wagmi was working correctly because the type signature looked right; the actual behavior was different. Reading the source and testing edge cases (what does it return for unsupported networks?) would have caught it faster than staring at the docs.

2. **Free-tier infrastructure has real limits — design around them.** Alchemy's 10-block `eth_getLogs` cap is the kind of constraint that doesn't show up in documentation summaries. The proper fix wasn't to call `queryFilter` more carefully; it was to give up on `queryFilter` entirely and index vote events in Postgres myself. The architectural decision was forced by the constraint, but it ended up being the right one.

3. **Verify the deployed state, not the local file.** The `VoteCast` event signature on Etherscan didn't match my local `Voting.sol`. The deployed bytecode is the source of truth, period. I started checking Etherscan first whenever the chain behaved unexpectedly.

4. **Spoofing is a real concern, even for friendly tools.** Brave Wallet sets `isMetaMask = true` to maintain compatibility with dApps that only check for MetaMask. Defending against benign spoofing (`!isBraveWallet`) is a real engineering concern, not a paranoid one.

5. **React Context exists for a reason.** When two components calling the same hook need to share UI state, Context isn't optional — it's the answer. I tried lifting state via props and prop-drilling first, which got ugly fast. `WalletUIContext` solved it cleanly.

6. **Windows CMD copy-paste can corrupt source files.** Invisible characters before `"use client"` directives broke Vercel builds with cryptic errors. Once I knew to look for it, the fix was trivial; before that, it was hours of confused debugging.

7. **Documentation while building > documentation after building.** Writing `API.md` while the endpoints were fresh in my head was much faster and more accurate than trying to reconstruct it later. The same was true for the smart contract reference.

8. **The mentor was right about the branching strategy, even when it felt weird.** The docs-on-main scheme caused some confusion early on, but it forced a clean separation between "what the project is" (main, dev) and "how the project is built" (feature/project-setup) that made the final state much easier to navigate.

---

## What I Would Do Differently

1. **Share types between frontend and backend.** A common `types/` package or workspace would have caught at least three breaking API changes I introduced mid-development.

2. **Define the API contract before implementing it.** Writing the OpenAPI spec or even a markdown doc of all endpoints before touching the code would have prevented the response-shape churn that broke the frontend twice.

3. **Write smart contract tests earlier.** I left contract testing until later than I should have. Hardhat's testing framework is fast and would have caught the `VoteCast` event signature mismatch immediately.

4. **Use a real environment management strategy from day one.** Hardcoding values in source files to work around the Vercel env var bug was a pragmatic fix, but it left secrets adjacent to public code. A proper secret-management approach (encrypted env files, Vercel CLI for env management) would have been cleaner.

5. **Plan the read/write architecture before writing components.** I refactored the read provider (`getReadProvider()` using a dedicated Alchemy `JsonRpcProvider`) after the fact when MetaMask network state started breaking proposal reads. Designing the split up front would have saved a refactor.

---

## Internship Process Reflection

What worked well from a process standpoint:

- **Daily progress commits** — kept momentum and made progress visible
- **Weekly milestone checkpoints** — gave clear boundaries between learning phases
- **Mentor feedback loops** — caught misconceptions before they compounded
- **Sprint board for the final week** — turned the "polish and ship" phase into discrete, completable tasks

What I'd refine:

- **More upfront design time** — I jumped into implementation faster than I should have on the backend and integration layers
- **Earlier integration testing** — testing the full frontend → backend → chain flow earlier would have surfaced the gaps I described above sooner

---

## Closing

The goal of this internship wasn't to ship a production governance protocol. It was to learn fullstack development, Git workflows, blockchain fundamentals, and how the pieces connect.

By that standard, the project worked. I built and deployed something functional, learned a new programming language (Solidity), debugged real production issues, made architectural decisions and lived with the consequences, and documented the result. The dApp isn't a real DAO, and it shouldn't be — but it's a working demonstration of every layer of a modern Web3 application, and I can reason about each of those layers in ways I couldn't 30 days ago.