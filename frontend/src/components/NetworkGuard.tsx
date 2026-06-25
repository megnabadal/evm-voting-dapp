"use client";

import { useWallet } from "../hooks/useWallet";

export default function NetworkGuard() {
  const { isConnected, network, switchToSepolia, showMetaMaskWarning, setShowMetaMaskWarning } = useWallet();

  const showNetworkModal = isConnected && network && !network.isSupported;

  if (!showMetaMaskWarning && !showNetworkModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(6, 13, 26, 0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="mx-4 max-w-sm w-full p-8 text-center"
        style={{
          background: "rgba(15, 22, 40, 0.95)",
          border: `1px solid ${showMetaMaskWarning ? "rgba(200, 216, 240, 0.15)" : "rgba(255, 180, 50, 0.3)"}`,
          boxShadow: `0 0 40px ${showMetaMaskWarning ? "rgba(74, 158, 255, 0.06)" : "rgba(255, 180, 50, 0.08)"}`,
        }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center text-2xl"
          style={{
            border: `1px solid ${showMetaMaskWarning ? "rgba(200, 216, 240, 0.1)" : "rgba(255, 180, 50, 0.2)"}`,
            background: showMetaMaskWarning ? "rgba(74, 158, 255, 0.05)" : "rgba(255, 180, 50, 0.05)",
          }}
        >
          {showMetaMaskWarning ? "🦊" : "⚠️"}
        </div>

        {showMetaMaskWarning ? (
          <>
            <p className="mb-2 font-semibold text-[#F5F0E8]/90" style={{ fontFamily: "var(--font-playfair)" }}>
              MetaMask Not Detected
            </p>
            <p className="mb-6 text-sm text-[#A8A090]/70">
              This app requires MetaMask to connect your wallet and interact with the blockchain.
            </p>
            <a
              href="https://metamask.io/download"
              target="_blank"
              rel="noopener noreferrer"
              className="mono block w-full border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-6 py-3 text-sm font-medium tracking-[0.14em] text-[#4A9EFF] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
            >
              Install MetaMask
            </a>
            <button
              onClick={() => setShowMetaMaskWarning(false)}
              className="mono mt-3 w-full border border-[rgba(200,216,240,0.1)] px-6 py-2 text-xs text-[#A8A090]/50 uppercase tracking-[0.12em] transition-all duration-200 hover:text-[#A8A090]/80"
            >
              Dismiss
            </button>
          </>
        ) : (
          <>
            <p className="mb-2 font-semibold text-[#F5F0E8]/90" style={{ fontFamily: "var(--font-playfair)" }}>
              Wrong Network
            </p>
            <p className="mb-6 text-sm text-[#A8A090]/70">
              You are connected to{" "}
              <span className="text-[#F5F0E8]/80">{network!.name}</span>. This app only works on Sepolia Testnet.
            </p>
            <button
              onClick={switchToSepolia}
              className="mono w-full border border-[#4A9EFF]/40 bg-[#4A9EFF]/10 px-6 py-3 text-sm font-medium tracking-[0.14em] text-[#4A9EFF] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
            >
              Switch to Sepolia
            </button>
          </>
        )}
      </div>
    </div>
  );
}