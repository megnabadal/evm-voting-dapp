"use client";

import { useWallet } from "../hooks/useWallet";

export default function NetworkGuard() {
  const { isConnected, network, switchToSepolia, showMetaMaskWarning, setShowMetaMaskWarning } = useWallet();

  const showNetworkModal = isConnected && network && !network.isSupported;

  if (!showMetaMaskWarning && !showNetworkModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "color-mix(in srgb, var(--bg-dark) 85%, transparent)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="mx-4 max-w-sm w-full p-8 text-center"
        style={{
          background: "color-mix(in srgb, var(--bg-secondary) 95%, transparent)",
          border: `1px solid ${showMetaMaskWarning ? "color-mix(in srgb, var(--accent-secondary) 15%, transparent)" : "rgba(255, 180, 50, 0.3)"}`,
          boxShadow: `0 0 40px ${showMetaMaskWarning ? "color-mix(in srgb, var(--accent) 6%, transparent)" : "rgba(255, 180, 50, 0.08)"}`,
        }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center text-2xl"
          style={{
            border: `1px solid ${showMetaMaskWarning ? "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" : "rgba(255, 180, 50, 0.2)"}`,
            background: showMetaMaskWarning ? "color-mix(in srgb, var(--accent) 5%, transparent)" : "rgba(255, 180, 50, 0.05)",
          }}
        >
          {showMetaMaskWarning ? "🦊" : "⚠️"}
        </div>

        {showMetaMaskWarning ? (
          <>
            <p
              className="mb-2 font-semibold"
              style={{ fontFamily: "var(--font-playfair)", color: "color-mix(in srgb, var(--text-primary) 90%, transparent)" }}
            >
              MetaMask Not Detected
            </p>
            <p className="mb-6 text-sm" style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}>
              This app requires MetaMask to connect your wallet and interact with the blockchain.
            </p>
            <a
              href="https://metamask.io/download"
              target="_blank"
              rel="noopener noreferrer"
              className="mono block w-full border px-6 py-3 text-sm font-medium tracking-[0.14em] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
                background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                color: "var(--accent)",
              }}
            >
              Install MetaMask
            </a>
            <button
              onClick={() => setShowMetaMaskWarning(false)}
              className="mono mt-3 w-full border px-6 py-2 text-xs uppercase tracking-[0.12em] transition-all duration-200"
              style={{
                borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)",
                color: "color-mix(in srgb, var(--text-secondary) 50%, transparent)",
              }}
            >
              Dismiss
            </button>
          </>
        ) : (
          <>
            <p
              className="mb-2 font-semibold"
              style={{ fontFamily: "var(--font-playfair)", color: "color-mix(in srgb, var(--text-primary) 90%, transparent)" }}
            >
              Wrong Network
            </p>
            <p className="mb-6 text-sm" style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}>
              You are connected to{" "}
              <span style={{ color: "color-mix(in srgb, var(--text-primary) 80%, transparent)" }}>{network!.name}</span>. This app only works on Sepolia Testnet.
            </p>
            <button
              onClick={switchToSepolia}
              className="mono w-full border px-6 py-3 text-sm font-medium tracking-[0.14em] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.97]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
                background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                color: "var(--accent)",
              }}
            >
              Switch to Sepolia
            </button>
          </>
        )}
      </div>
    </div>
  );
}
