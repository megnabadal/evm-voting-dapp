#!/usr/bin/env node
/**
 * Driver for the VoteChain frontend (Next.js dev server + headless Chromium).
 *
 * Usage:
 *   node driver.mjs [command] [args...]
 *
 * Commands:
 *   start            Start the dev server (background, port 3001)
 *   stop             Kill the dev server
 *   screenshot <url> Navigate to URL (relative or absolute) and save a screenshot
 *   check            Verify server is responding
 *   smoke            Full smoke test: home, proposals, create pages
 *
 * Screenshots land in /tmp/votechain-shots/
 * Requires: playwright installed at /tmp/playwright-tools, libnspr4/libnss3 extracted
 */

import { spawn, spawnSync, execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { createServer } from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const FRONTEND_DIR = path.join(REPO_ROOT, 'frontend');
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;
const PID_FILE = '/tmp/votechain-dev.pid';
const LOG_FILE = '/tmp/votechain-dev.log';
const SHOTS_DIR = '/tmp/votechain-shots';
const PLAYWRIGHT_DIR = '/tmp/playwright-tools';
const LIBS_DIR = '/tmp/nspr_extracted/usr/lib/x86_64-linux-gnu';

function log(msg) { console.log(`[driver] ${msg}`); }

// ── Library setup ──────────────────────────────────────────────────────────

async function ensureLibs() {
  if (existsSync(`${LIBS_DIR}/libnspr4.so`)) return;
  log('Installing missing system libraries (libnspr4, libnss3, libasound2)...');
  mkdirSync('/tmp/nspr_extracted', { recursive: true });
  const pkgs = {
    libnspr4: null,
    libnss3: null,
    'libasound2t64': null,
  };
  for (const pkg of Object.keys(pkgs)) {
    const deb = `/tmp/${pkg}.deb`;
    execSync(`apt-get download ${pkg} -o Dir::Cache=/tmp 2>/dev/null; mv /tmp/archives/${pkg}*.deb ${deb} 2>/dev/null || true`, { stdio: 'pipe', shell: true });
    // Fallback: apt-get download puts file in CWD
    const files = execSync(`find /tmp -maxdepth 1 -name "${pkg}*.deb" 2>/dev/null`, { stdio: 'pipe', shell: true }).toString().trim();
    if (files) {
      execSync(`dpkg --extract ${files.split('\n')[0]} /tmp/nspr_extracted`, { stdio: 'pipe' });
    }
  }
}

function ldPath() {
  return `${LIBS_DIR}:${process.env.LD_LIBRARY_PATH || ''}`;
}

// ── Playwright setup ───────────────────────────────────────────────────────

async function ensurePlaywright() {
  if (!existsSync(`${PLAYWRIGHT_DIR}/node_modules/playwright`)) {
    log('Installing playwright...');
    execSync(`npm install --prefix ${PLAYWRIGHT_DIR} playwright`, { stdio: 'inherit' });
    execSync(`${PLAYWRIGHT_DIR}/node_modules/.bin/playwright install chromium`, { stdio: 'inherit' });
  }
}

async function getBrowser() {
  await ensureLibs();
  await ensurePlaywright();
  const { chromium } = await import(`${PLAYWRIGHT_DIR}/node_modules/playwright/index.mjs`);
  return chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    env: { ...process.env, LD_LIBRARY_PATH: ldPath() },
  });
}

// ── Dev server ─────────────────────────────────────────────────────────────

function isPortOpen(port) {
  return new Promise(resolve => {
    const s = createServer();
    s.once('error', () => resolve(true));   // port in use → server running
    s.once('listening', () => { s.close(); resolve(false); });
    s.listen(port);
  });
}

async function waitReady(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Dev server not ready after ${timeoutMs}ms`);
}

async function start() {
  if (await isPortOpen(PORT)) {
    log(`Port ${PORT} already in use — assuming dev server is running`);
    return;
  }
  log(`Starting Next.js dev server on port ${PORT}...`);

  // Ensure Linux SWC binary
  if (!existsSync(`${FRONTEND_DIR}/node_modules/@next/swc-linux-x64-gnu`)) {
    log('Installing @next/swc-linux-x64-gnu...');
    execSync(`cd ${FRONTEND_DIR} && npm install @next/swc-linux-x64-gnu --no-save`, { stdio: 'inherit' });
  }

  const out = require('fs').openSync(LOG_FILE, 'w');
  const proc = spawn(
    `${FRONTEND_DIR}/node_modules/.bin/next`,
    ['dev', '--port', String(PORT)],
    { cwd: FRONTEND_DIR, stdio: ['ignore', out, out], detached: true }
  );
  proc.unref();
  writeFileSync(PID_FILE, String(proc.pid));
  log(`Started PID ${proc.pid}, waiting for ready...`);
  await waitReady(90000);
  log('Dev server ready');
}

function stop() {
  if (existsSync(PID_FILE)) {
    const pid = readFileSync(PID_FILE, 'utf8').trim();
    try { process.kill(Number(pid)); } catch {}
    execSync(`rm -f ${PID_FILE}`);
    log(`Killed PID ${pid}`);
  } else {
    execSync(`pkill -f "next dev --port ${PORT}" 2>/dev/null || true`, { shell: true });
    log('Sent kill signal');
  }
}

// ── Screenshots ────────────────────────────────────────────────────────────

async function screenshot(urlArg) {
  mkdirSync(SHOTS_DIR, { recursive: true });
  const url = urlArg.startsWith('http') ? urlArg : `${BASE_URL}${urlArg}`;
  const slug = url.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').slice(-40);
  const dest = `${SHOTS_DIR}/${slug}.png`;

  const browser = await getBrowser();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: dest });
  await browser.close();
  log(`Screenshot saved: ${dest}`);
  return dest;
}

async function check() {
  try {
    const res = await fetch(BASE_URL);
    log(`Server responding: ${res.status}`);
  } catch (e) {
    log(`Server not responding: ${e.message}`);
    process.exit(1);
  }
}

async function smoke() {
  log('Running smoke test...');
  await start();
  // Pre-warm routes (Next.js compiles on first request)
  for (const path of ['/', '/proposals', '/proposals/create']) {
    await fetch(`${BASE_URL}${path}`).catch(() => {});
  }
  await new Promise(r => setTimeout(r, 3000)); // let compilation finish
  await screenshot('/');
  await screenshot('/proposals');
  await screenshot('/proposals/create');
  log(`All screenshots saved to ${SHOTS_DIR}/`);
}

// ── Main ───────────────────────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;
switch (cmd) {
  case 'start':      await start(); break;
  case 'stop':       stop(); break;
  case 'screenshot': await screenshot(args[0] || '/'); break;
  case 'check':      await check(); break;
  case 'smoke':      await smoke(); break;
  default:
    console.log('Usage: node driver.mjs [start|stop|screenshot <path>|check|smoke]');
    process.exit(1);
}
