"use client";

import { useEffect, useState } from "react";
import { useWallet } from "../hooks/useWallet";

export default function WalletGuard({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { isConnected, isMetaMaskInstalled, connect, error, network, switchToSepolia } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-20 animate-pulse"
        style={{ background: "color-mix(in srgb, var(--accent-secondary) 3%, transparent)" }}
      />
    );
  }

  if (!isMetaMaskInstalled) {
    return (
      <div
        className="p-8 text-center"
        style={{
          border: "1px solid color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
          background: "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
        }}
      >
        <p className="mb-1 font-semibold" style={{ color: "color-mix(in srgb, var(--text-primary) 80%, transparent)" }}>
          MetaMask not found
        </p>
        <p className="mb-4 text-sm" style={{ color: "color-mix(in srgb, var(--text-secondary) 60%, transparent)" }}>
          Install MetaMask to use this app.
        </p>
        <a
          href="https://metamask.io/download"
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-block border px-4 py-2 text-sm font-medium uppercase tracking-[0.12em] transition-all duration-200 hover:bg-[#4A9EFF]/20"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            color: "var(--accent)",
          }}
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div
        className="p-10 text-center"
        style={{
          background: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
          backdropFilter: "blur(24px)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center text-xl"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
          }}
        >
          🔒
        </div>
        <p className="mb-2 font-semibold" style={{ color: "color-mix(in srgb, var(--text-primary) 80%, transparent)" }}>
          Wallet not connected
        </p>
        <p className="mb-7 text-sm" style={{ color: "color-mix(in srgb, var(--text-secondary) 55%, transparent)" }}>
          {message || "Connect your wallet to continue."}
        </p>
        {error && (
          <p className="mb-4 mono text-xs" style={{ color: "color-mix(in srgb, var(--accent-secondary) 55%, transparent)" }}>
            {error}
          </p>
        )}
        <button
          onClick={connect}
          className="blue-glow-btn mono border px-6 py-3 text-sm font-medium tracking-[0.14em] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            color: "var(--accent)",
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (network && !network.isSupported) {
    return (
      <div
        className="p-8 text-center"
        style={{
          border: "1px solid color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
          background: "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center text-xl"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
          }}
        >
          ⚠️
        </div>
        <p className="mb-1 font-semibold" style={{ color: "color-mix(in srgb, var(--text-primary) 80%, transparent)" }}>
          Wrong Network
        </p>
        <p className="mb-6 text-sm" style={{ color: "color-mix(in srgb, var(--text-secondary) 55%, transparent)" }}>
          You are on{" "}
          <span style={{ color: "color-mix(in srgb, var(--text-primary) 70%, transparent)" }}>{network.name}</span>. Switch to
          Sepolia to continue.
        </p>
        <button
          onClick={switchToSepolia}
          className="mono border px-6 py-3 text-sm font-medium tracking-[0.14em] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            color: "var(--accent)",
          }}
        >
          Switch to Sepolia
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
