"use client";

import { useWallet } from "../hooks/useWallet";

export default function NetworkGuard() {
  const { isConnected, network, switchToSepolia } = useWallet();

  if (!isConnected || !network || network.isSupported) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(6, 13, 26, 0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="mx-4 max-w-sm w-full p-8 text-center"
        style={{
          background: "rgba(15, 22, 40, 0.95)",
          border: "1px solid rgba(255, 180, 50, 0.3)",
          boxShadow: "0 0 40px rgba(255, 180, 50, 0.08)",
        }}
      >
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center text-2xl"
          style={{ border: "1px solid rgba(255, 180, 50, 0.2)", background: "rgba(255, 180, 50, 0.05)" }}
        >
          ⚠️
        </div>
        <p className="mb-2 font-semibold text-[#F5F0E8]/90" style={{ fontFamily: "var(--font-playfair)" }}>
          Wrong Network
        </p>
        <p className="mb-6 text-sm text-[#A8A090]/70">
          You are connected to{" "}
          <span className="text-[#F5F0E8]/80">{network.name}</span>.
          This app only works on Sepolia Testnet.
        </p>
        <button
          onClick={switchToSepolia}
          className="mono w-full border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-6 py-3 text-sm font-medium tracking-[0.14em] text-[#4A9EFF] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
        >
          Switch to Sepolia
        </button>
      </div>
    </div>
  );
}