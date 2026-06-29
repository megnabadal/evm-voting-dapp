# Frontend Documentation

Architecture, component structure, and state management for the VoteChain frontend.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS variables for theming
- **Web3:** wagmi v2 + ethers.js v6 + RainbowKit
- **Async data:** TanStack Query
- **State management:** React Context (theme, user, wallet UI) + Zustand (where needed)
- **3D / animations:** Three.js, Intersection Observer for scroll reveals

---

## Project Structure
```
frontend/src/

├── app/                    # Next.js App Router pages

│   ├── layout.tsx          # Root layout — fonts, Providers, CustomCursor

│   ├── page.tsx            # Homepage with hero, stats, proposals preview

│   ├── globals.css         # Theme variables, animations, utility classes

│   └── proposals/          # Proposal list, detail, and create pages

│

├── components/             # Reusable UI components

│   ├── Navbar.tsx          # Top nav with wallet, theme toggle, hamburger menu

│   ├── Footer.tsx

│   ├── ProposalCard.tsx

│   ├── ProposalDetail.tsx

│   ├── VoteTransactionList.tsx

│   ├── WalletGuard.tsx     # Gates pages behind wallet connection

│   ├── NetworkGuard.tsx    # Global modal for wrong network / MetaMask missing

│   ├── RegistrationGate.tsx # Blocks UI for unregistered wallets

│   ├── WelcomeBackToast.tsx # 3s toast for returning users

│   ├── LowBalanceWarning.tsx # Faucet prompt when balance < threshold

│   ├── ThreeHero.tsx       # Particle network canvas on hero

│   ├── CustomCursor.tsx    # Custom mouse cursor

│   ├── Loading.tsx

│   ├── ScrollReveal.tsx    # Wrapper for intersection-observer animations

│   └── Providers.tsx       # All context providers + wagmi + react-query

│

├── context/                # React Context state

│   ├── ThemeContext.tsx    # Dark/light theme + localStorage persistence

│   ├── UserContext.tsx     # User profile state, registration status

│   └── WalletUIContext.tsx # Shared MetaMask warning state

│

├── hooks/

│   └── useWallet.ts        # Wraps wagmi hooks with app-specific logic

│

├── lib/

│   ├── contract.ts         # Voting contract address + ABI (hardcoded)

│   ├── wagmi.ts            # wagmi config (Sepolia + Alchemy)

│   └── api.ts              # Backend API client (user CRUD, balance)

│

├── services/

│   └── blockchainService.ts # Read/write contract calls via ethers.js

│

└── types.ts                # Shared TypeScript types
```
---

## Theming System

Theme uses CSS variables on the `:root` element. Switching themes flips a `data-theme="light"` attribute on the `<html>` element, which swaps all variables at once.

**Dark theme (default):**
```css
--bg-primary: #0A0F1E
--text-primary: #F5F0E8
--accent: #4A9EFF
--particle-color: 200,216,240
```

**Light theme:**
```css
--bg-primary: #F0EBE0
--text-primary: #0A0F1E
--accent: #2A7EDF
--particle-color: 10,15,30
```

Components reference theme via CSS variables in inline styles using `color-mix(in srgb, var(--accent) 30%, transparent)` for transparent variants.

The Three.js particle canvas reads `--particle-color` at runtime via `getComputedStyle()` so particles automatically adapt to the active theme.

Theme state is persisted in `localStorage` under the key `votechain-theme`.

---

## Wallet & Web3 Architecture

### Read vs Write split

The frontend uses two different providers depending on the operation:

- **Reads** (`getReadProvider()` in `blockchainService.ts`) — uses a hardcoded Alchemy `JsonRpcProvider`. This ensures contract reads work even when MetaMask is on the wrong network or disconnected.
- **Writes** (`getProvider()` and `getSigner()`) — uses MetaMask's `BrowserProvider`. Requires user approval for every transaction.

This split prevents the common bug where switching MetaMask to mainnet breaks proposal reads.

### Network enforcement

`useWallet.ts` reads `useAccount().chain` (NOT `useChainId()`) because wagmi v2 returns `chain = undefined` when MetaMask is on a chain not in the wagmi config. This is the reliable signal for "wrong network." `useChainId()` returns Sepolia even when the user is actually on mainnet, which would fail silently.

The `NetworkGuard` component renders a global modal whenever:
1. MetaMask is not installed AND the user clicked Connect Wallet, OR
2. User is connected but on a non-Sepolia network

The MetaMask check excludes Brave Wallet, which spoofs `window.ethereum.isMetaMask`. The full check is:
```typescript
window.ethereum.isMetaMask === true && !window.ethereum.isBraveWallet
```

### Shared UI state

`useWallet` is called in multiple components (`Navbar`, `NetworkGuard`, `WalletGuard`). Each call creates an isolated React hook instance, so UI flags like "show MetaMask install warning" need to be lifted into a shared `WalletUIContext`. This is what allows clicking the Connect Wallet button in `Navbar` to trigger a modal in `NetworkGuard`.

---

## User Profile Flow
```
User connects wallet
UserContext fires GET /api/users/:walletAddress

3a. If 404 → RegistrationGate modal blocks the UI

User fills name, username, email, DOB

POST /api/users

Backend creates user + auto-sends 0.001 ETH from treasury

3b. If user exists → WelcomeBackToast shows for 3 seconds
LowBalanceWarning polls /api/users/:address/balance every 30s

If balance < 0.0005 ETH, modal appears with faucet link
```
`UserContext` exposes:
- `user` — the registered profile or `null`
- `loading` — true while fetching
- `needsRegistration` — true when wallet is connected but unregistered
- `showWelcomeBack` — controls the welcome toast
- `refreshUser()` — manually re-fetch
- `dismissWelcome()` — hide the toast

---

## Page Routing

| Route | Page | Auth required |
|-------|------|---------------|
| `/` | Homepage with hero, stats, preview proposals | No |
| `/proposals` | List of all proposals | No (read-only) |
| `/proposals/:id` | Proposal detail + vote interface | Yes (gated by WalletGuard) |
| `/proposals/create` | Create proposal form | Yes (gated by WalletGuard) |

Pages that require a wallet wrap their content in `<WalletGuard>`, which renders fallback UIs for: MetaMask not installed, wallet not connected, wrong network.

---

## Animations

The site uses several animation systems:

1. **CSS keyframes** — Defined in `globals.css` (`fade-up`, `glow-pulse`, `scan-line`, etc.) and applied via utility classes
2. **Intersection Observer** — `ScrollReveal` component triggers reveal animations when elements enter the viewport
3. **Three.js particle network** — Hero background, theme-aware via CSS variable
4. **Page transitions** — Implicit via Next.js App Router

Scroll-triggered animations have a 500ms initialization delay (`useEffect` setTimeout) because dynamically imported components need time to mount before the IntersectionObserver can observe `.reveal` elements.

---

## Mobile Responsiveness

- **Hamburger menu** in `Navbar` for screens below `sm` breakpoint (640px)
- **Hero font size** uses `clamp(3rem, 15vw, 15rem)` — scales smoothly on small screens
- **Touch-friendly tap targets** for buttons and form inputs
- **Single-column layouts** for proposal cards on mobile

---

## State Management Patterns

| State type | Tool used |
|-----------|-----------|
| Theme (persistent) | `ThemeContext` + localStorage |
| User profile (per session) | `UserContext` |
| Cross-component UI flags | `WalletUIContext` |
| Wallet connection / network | wagmi v2 hooks |
| Server data caching | TanStack Query (via wagmi) |
| Form state (local) | `useState` |
| Animation triggers (local) | `useRef`, `useEffect`, IntersectionObserver |

No Redux. The app is small enough that Context + wagmi covers everything.

---

## Known Constraints & Workarounds

### Vercel env var UI bug

Sensitive env var fields in Vercel reset to placeholder values after save. The fix is to hardcode critical values (Alchemy RPC URL, contract address) directly in source files (`wagmi.ts`, `contract.ts`).

### Alchemy free tier `eth_getLogs` cap

Alchemy limits `eth_getLogs` to a 10-block range on the free tier, which makes querying historical vote events directly from the contract unreliable. Instead, vote transactions are recorded in PostgreSQL via the backend immediately after the frontend receives confirmation. The frontend reads vote history from `/api/proposals/:id/votes`.

### Mapping ethers.js tuple returns

When ethers.js returns a Solidity tuple, the result has both index access (`raw[0]`) and name access (`raw.fieldName`). The `mapProposalForUI` helper in `blockchainService.ts` uses dual access (`raw.fieldName ?? raw[index]`) so it works regardless of how ethers.js decodes the return value.

### Stray character on `"use client"` directive

Windows CMD copy-paste sometimes prepends an invisible character before `"use client";` in `.tsx` files, causing Vercel builds to fail with `Expected ';' '}' or <eof>`. Fix: open the file in VS Code, retype line 1 manually.

---

## Build & Deploy

The frontend deploys automatically to Vercel on every push to `feature/project-setup`. Local development:

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

See `docs/DEPLOYMENT.md` for full deployment instructions.