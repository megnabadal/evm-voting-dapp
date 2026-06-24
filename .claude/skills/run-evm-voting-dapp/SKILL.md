---
name: run-evm-voting-dapp
description: Build, run, and drive the VoteChain dApp. Use when asked to start the frontend, take a screenshot, run the app, or interact with the running Next.js UI.
---

VoteChain is a Next.js 14 App Router frontend (port 3001). Drive it via `.claude/skills/run-evm-voting-dapp/driver.mjs`, which manages the dev server and headless Chromium screenshots.

All paths below are relative to the repo root.

## Prerequisites

The `frontend/node_modules/` was installed on Windows; the Linux SWC binary is missing. Install it before first run:

```bash
cd frontend
npm install @next/swc-linux-x64-gnu --no-save
```

Playwright's Chromium needs system libraries not present in this container. Download and extract them:

```bash
mkdir -p /tmp/nspr_extracted
for pkg in libnspr4 libnss3 libasound2t64; do
  apt-get download $pkg
  dpkg --extract ${pkg}*.deb /tmp/nspr_extracted
done
rm -f *.deb
```

Install playwright and its Chromium binary:

```bash
npm install --prefix /tmp/playwright-tools playwright
/tmp/playwright-tools/node_modules/.bin/playwright install chromium
```

## Setup

Source files live in `frontend/src/`. Config files (`next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`) are in `frontend/`. The `.env.local` is in `frontend/` with the deployed contract address.

No build step needed — `next dev` compiles on demand.

## Run (agent path)

```bash
# Start dev server in background (first request compiles each route — takes ~30–60s each)
node .claude/skills/run-evm-voting-dapp/driver.mjs start

# Take a screenshot of any page
node .claude/skills/run-evm-voting-dapp/driver.mjs screenshot /
node .claude/skills/run-evm-voting-dapp/driver.mjs screenshot /proposals
node .claude/skills/run-evm-voting-dapp/driver.mjs screenshot /proposals/create

# Full smoke test (start + three pages)
node .claude/skills/run-evm-voting-dapp/driver.mjs smoke

# Stop the server
node .claude/skills/run-evm-voting-dapp/driver.mjs stop
```

Screenshots land in `/tmp/votechain-shots/<slug>.png`.

| Command | What it does |
|---|---|
| `start` | Starts `next dev --port 3001` in background, waits until ready |
| `stop` | Kills the dev server process |
| `screenshot <path>` | Navigates headless Chromium to that path, saves PNG |
| `check` | Verifies the server is responding |
| `smoke` | Start + pre-warm all routes + screenshot `/`, `/proposals`, `/proposals/create` |

## Run (human path)

```bash
cd frontend && npm run dev   # → http://localhost:3000. Stop with Ctrl-C.
```

## Test

```bash
# Smart contract tests (run from repo root)
npx hardhat test

# Run a single test
npx hardhat test --grep "createProposal"
```

## Gotchas

- **`next start` fails** — the `.next/` directory contains a dev build, not a production build. Always use `next dev`, never `next start`.

- **First route compile takes 30–60s** — Next.js compiles each route on first request. The driver pre-warms routes with `fetch` before driving Chromium. If screenshots timeout, pre-warm manually with `curl -s http://localhost:3001/proposals >/dev/null` and wait 10s before trying again.

- **`@next/swc-linux-x64-gnu` not installed** — the `node_modules/` was created on Windows. The Linux SWC compiler binary is missing. The `start` command installs it automatically; do it manually with `npm install @next/swc-linux-x64-gnu --no-save` in `frontend/`.

- **Proposals and Create pages show "MetaMask not found"** — this is correct behavior in headless mode. `WalletGuard` detects no injected wallet provider and shows this error. The page structure still renders correctly.

- **`pino-pretty` missing warning** — non-fatal. wagmi's WalletConnect provider depends on pino-pretty for dev logging. It produces a webpack warning but the app runs fine.

- **Google Fonts download failures during dev** — the dev server retries font downloads in the background. The app renders with fallback fonts.

- **LD_LIBRARY_PATH must be set before launching Chromium** — the driver sets it automatically. If running playwright directly (not via the driver), prepend: `LD_LIBRARY_PATH=/tmp/nspr_extracted/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH`.

## Troubleshooting

- **`Failed to load SWC binary`**: Install the Linux binary: `cd frontend && npm install @next/swc-linux-x64-gnu --no-save`

- **`libnspr4.so: cannot open shared object file`**: Run the library extraction steps in Prerequisites above.

- **`Timeout 30000ms exceeded` on page navigation**: The route hasn't compiled yet. Pre-warm with curl first: `curl -s http://localhost:3001/proposals >/dev/null && sleep 10`.

- **`EADDRINUSE`**: A previous server is still running. Stop it: `node .claude/skills/run-evm-voting-dapp/driver.mjs stop` or `pkill -f "next dev"`.
