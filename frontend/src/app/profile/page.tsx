"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WalletGuard from "../../components/WalletGuard";
import { useUser } from "../../context/UserContext";
import { useAccount, useDisconnect } from "wagmi";
import { getBalance } from "../../lib/api";

function ProfileContent() {
  const { user, loading } = useUser();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    getBalance(address).then(setBalance).catch(() => setBalance(null));
  }, [address]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse"
            style={{
              animationDelay: `${i * 100}ms`,
              border: "1px solid color-mix(in srgb, var(--accent-secondary) 5%, transparent)",
              background: "color-mix(in srgb, var(--bg-secondary) 40%, transparent)",
            }}
          />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-32 text-center">
        <p
          className="mb-3 text-xl font-bold"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
            color: "color-mix(in srgb, var(--text-primary) 60%, transparent)",
          }}
        >
          No profile found
        </p>
        <p
          className="mono mb-12 text-[10px] tracking-[0.25em] uppercase"
          style={{ color: "color-mix(in srgb, var(--text-secondary) 35%, transparent)" }}
        >
          Connect a registered wallet
        </p>
      </div>
    );
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const dob = new Date(user.date_of_birth).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const copyAddress = () => { if (address) navigator.clipboard.writeText(address); };

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <div
        className="relative overflow-hidden border p-8"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 8%, transparent)",
          background: "linear-gradient(160deg, color-mix(in srgb, var(--bg-secondary) 88%, transparent) 0%, color-mix(in srgb, var(--bg-dark) 92%, transparent) 100%)",
        }}
      >
        <span
          className="pointer-events-none absolute top-0 left-0 h-6 w-6 border-t border-l"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
        />
        <span
          className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b border-r"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
        />

        <div className="mb-2 flex items-center gap-2">
          <span
            className="mono text-[9px] tracking-[0.38em] uppercase"
            style={{ color: "color-mix(in srgb, var(--accent) 50%, transparent)" }}
          >
            // IDENTITY
          </span>
        </div>

        <h2
          className="mb-1 text-3xl font-bold"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
            color: "color-mix(in srgb, var(--text-primary) 90%, transparent)",
          }}
        >
          {user.full_name}
        </h2>
        <p
          className="mono mb-6 text-[12px] tracking-[0.15em]"
          style={{ color: "color-mix(in srgb, var(--accent) 75%, transparent)" }}
        >
          @{user.username}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Wallet", content: (
              <button
                onClick={copyAddress}
                className="mono mt-1 text-[12px] transition-colors hover:text-[#4A9EFF]"
                style={{ color: "color-mix(in srgb, var(--text-primary) 75%, transparent)" }}
                title="Click to copy full address"
              >
                {shortAddress}
              </button>
            )},
            { label: "Email", content: (
              <p className="mono mt-1 text-[12px]" style={{ color: "color-mix(in srgb, var(--text-primary) 75%, transparent)" }}>
                {user.email}
              </p>
            )},
            { label: "Date of Birth", content: (
              <p className="mono mt-1 text-[12px]" style={{ color: "color-mix(in srgb, var(--text-primary) 75%, transparent)" }}>
                {dob}
              </p>
            )},
            { label: "Member Since", content: (
              <p className="mono mt-1 text-[12px]" style={{ color: "color-mix(in srgb, var(--text-primary) 75%, transparent)" }}>
                {memberSince}
              </p>
            )},
          ].map(({ label, content }) => (
            <div key={label}>
              <p
                className="mono text-[9px] tracking-[0.28em] uppercase"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 40%, transparent)" }}
              >
                {label}
              </p>
              {content}
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Balance" value={balance ? `${parseFloat(balance).toFixed(4)} ETH` : "—"} subtitle="Sepolia" />
        <StatCard label="Account Type" value="Voter" subtitle="Active" />
        <StatCard label="Status" value="Verified" subtitle="Registered" accent />
      </div>

      {/* Quick actions */}
      <div
        className="relative overflow-hidden border p-6"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-secondary) 8%, transparent)",
          background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
        }}
      >
        <p
          className="mono mb-4 text-[9px] tracking-[0.38em] uppercase"
          style={{ color: "color-mix(in srgb, var(--accent) 50%, transparent)" }}
        >
          // QUICK ACTIONS
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/proposals/create"
            className="mono inline-flex items-center border px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent)",
            }}
          >
            + Create Proposal
          </Link>
          <Link
            href="/proposals"
            className="mono inline-flex items-center border px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300"
            style={{
              borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
              color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)",
            }}
          >
            View Proposals
          </Link>
          <Link
            href="/proposals/archive"
            className="mono inline-flex items-center border px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300"
            style={{
              borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
              color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)",
            }}
          >
            Archive
          </Link>
          <button
            onClick={() => disconnect()}
            className="mono inline-flex items-center border px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[rgba(220,38,38,0.05)]"
            style={{
              borderColor: "rgba(220, 38, 38, 0.4)",
              color: "rgba(248, 113, 113, 0.85)",
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, subtitle, accent = false,
}: {
  label: string; value: string; subtitle: string; accent?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden border p-5"
      style={{
        borderColor: accent
          ? "color-mix(in srgb, var(--accent) 25%, transparent)"
          : "color-mix(in srgb, var(--accent-secondary) 8%, transparent)",
        background: accent
          ? "color-mix(in srgb, var(--accent) 5%, transparent)"
          : "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
      }}
    >
      <p
        className="mono text-[9px] tracking-[0.28em] uppercase"
        style={{ color: "color-mix(in srgb, var(--text-secondary) 45%, transparent)" }}
      >
        {label}
      </p>
      <p
        className="mt-2 text-2xl font-bold tabular-nums"
        style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
          color: accent
            ? "color-mix(in srgb, var(--accent) 90%, transparent)"
            : "color-mix(in srgb, var(--text-primary) 85%, transparent)",
        }}
      >
        {value}
      </p>
      <p
        className="mono mt-1 text-[9px] tracking-[0.2em] uppercase"
        style={{ color: "color-mix(in srgb, var(--text-secondary) 30%, transparent)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-atmospheric absolute -top-60 left-1/2 h-[700px] w-[800px] -translate-x-1/2 rounded-full blur-[180px]"
          style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}
        />
      </div>

      <Navbar />

      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 6%, transparent)" }}
      >
        <div className="fine-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent, transparent, var(--bg-primary))" }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 22%, transparent), transparent)" }}
        />

        <div className="relative mx-auto max-w-6xl px-8 pb-14 pt-16">
          <div className="animate-fade-up mb-8 flex items-center gap-4">
            <span
              className="mono text-[9px] tracking-[0.4em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
            >
              // Personal Dashboard
            </span>
            <span
              className="animate-line-extend h-px flex-1"
              style={{ background: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
            />
            <span
              className="mono text-[9px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 20%, transparent)" }}
            >
              Account
            </span>
          </div>

          <h1
            className="animate-cinema-1 font-extrabold leading-[0.85] tracking-[-0.025em]"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              color: "color-mix(in srgb, var(--text-primary) 85%, transparent)",
            }}
          >
            PROFILE
          </h1>
          <p
            className="animate-cinema-2 mono mt-4 text-[11px] tracking-[0.22em] uppercase"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 40%, transparent)" }}
          >
            Your on-chain governance identity
          </p>
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-8 py-12">
        <WalletGuard message="Connect your wallet to view your profile.">
          <ProfileContent />
        </WalletGuard>
      </main>

      <Footer />
    </div>
  );
}