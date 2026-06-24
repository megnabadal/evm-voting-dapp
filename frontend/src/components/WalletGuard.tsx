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
  const { isConnected, isMetaMaskInstalled, connect, error, network } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-20 animate-pulse bg-[rgba(200,216,240,0.03)]" />;
  }

  if (!isMetaMaskInstalled) {
    return (
      <div
        className="p-8 text-center"
        style={{ border: "1px solid rgba(200, 216, 240, 0.1)", background: "rgba(15, 22, 40, 0.6)" }}
      >
        <p className="mb-1 font-semibold text-[#F5F0E8]/80">MetaMask not found</p>
        <p className="mb-4 text-sm text-[#A8A090]/60">Install MetaMask to use this app.</p>
        <a
          href="https://metamask.io/download"
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-block border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-4 py-2 text-sm font-medium text-[#4A9EFF] uppercase tracking-[0.12em] transition-all duration-200 hover:bg-[#4A9EFF]/20"
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
          background: "rgba(15, 22, 40, 0.8)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(200, 216, 240, 0.08)",
        }}
      >
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-[rgba(200,216,240,0.08)] bg-[rgba(15,22,40,0.6)] text-xl">
          🔒
        </div>
        <p className="mb-2 font-semibold text-[#F5F0E8]/80">
          Wallet not connected
        </p>
        <p className="mb-7 text-sm text-[#A8A090]/55">
          {message || "Connect your wallet to continue."}
        </p>
        {error && (
          <p className="mb-4 mono text-xs text-[#C8D8F0]/55">{error}</p>
        )}
        <button
          onClick={connect}
          className="blue-glow-btn mono border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-6 py-3 text-sm font-medium tracking-[0.14em] text-[#4A9EFF] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
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
        style={{ border: "1px solid rgba(200, 216, 240, 0.1)", background: "rgba(15, 22, 40, 0.6)" }}
      >
        <p className="mb-1 font-semibold text-[#F5F0E8]/80">Wrong Network</p>
        <p className="text-sm text-[#A8A090]/55">
          Switch to Sepolia in MetaMask to continue.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
