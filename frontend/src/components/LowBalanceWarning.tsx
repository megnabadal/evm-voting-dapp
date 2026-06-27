"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useUser } from "../context/UserContext";
import { getBalance } from "../lib/api";

const LOW_BALANCE_THRESHOLD = 0.0005;
const FAUCET_URL = "https://sepoliafaucet.com";

export default function LowBalanceWarning() {
  const { address, isConnected } = useAccount();
  const { user, needsRegistration } = useUser();
  const [balance, setBalance] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isConnected || !address || !user || needsRegistration) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const balStr = await getBalance(address);
        setBalance(parseFloat(balStr));
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [isConnected, address, user, needsRegistration]);

  // Reset dismissal when address changes
  useEffect(() => {
    setDismissed(false);
  }, [address]);

  if (
    !isConnected ||
    !user ||
    needsRegistration ||
    balance === null ||
    balance >= LOW_BALANCE_THRESHOLD ||
    dismissed
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "color-mix(in srgb, var(--bg-dark) 85%, transparent)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md p-8 text-center"
        style={{
          background: "color-mix(in srgb, var(--bg-secondary) 95%, transparent)",
          border: "1px solid rgba(255, 180, 50, 0.3)",
          boxShadow: "0 0 40px rgba(255, 180, 50, 0.08)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center text-2xl"
          style={{
            border: "1px solid rgba(255, 180, 50, 0.2)",
            background: "rgba(255, 180, 50, 0.05)",
          }}
        >
          ⚠️
        </div>

        <p
          className="mb-2 font-semibold"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
            color: "var(--text-primary)",
          }}
        >
          Low Balance
        </p>
        <p
          className="mb-2 text-sm"
          style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}
        >
          You have <span style={{ color: "var(--text-primary)" }}>{balance.toFixed(6)} Sepolia ETH</span> in your wallet.
        </p>
        <p
          className="mb-6 text-sm"
          style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}
        >
          You need more Sepolia ETH to vote or create proposals. Get free test ETH from a faucet.
        </p>

        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mono block w-full border px-6 py-3 text-sm font-medium tracking-[0.14em] uppercase transition-all duration-200"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            color: "var(--accent)",
          }}
        >
          Get Sepolia ETH
        </a>

        <button
          onClick={() => setDismissed(true)}
          className="mono mt-3 w-full border px-6 py-2 text-xs uppercase tracking-[0.12em] transition-all duration-200"
          style={{
            borderColor: "var(--border-subtle)",
            color: "color-mix(in srgb, var(--text-secondary) 50%, transparent)",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}