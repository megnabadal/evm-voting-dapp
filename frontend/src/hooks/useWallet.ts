"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";
import { useState, useEffect } from "react";
import type { NetworkInfo } from "../types";

const SUPPORTED_NETWORKS: Record<number, string> = {
  [sepolia.id]: "Sepolia",
};

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect: wagmiConnect, isPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const wagmiChainId = useChainId();
  const [error, setError] = useState<string | null>(null);

  const isMetaMaskInstalled =
    typeof window !== "undefined" && !!window.ethereum;

  // Auto switch to Sepolia whenever connected on wrong network
  useEffect(() => {
    if (isConnected && wagmiChainId !== sepolia.id) {
      switchChain({ chainId: sepolia.id });
    }
  }, [isConnected, wagmiChainId, switchChain]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handleChainChanged = () => {
      setError(null);
    };
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const network: NetworkInfo | null = wagmiChainId
    ? {
        chainId: wagmiChainId,
        name: SUPPORTED_NETWORKS[wagmiChainId] ?? `Chain ${wagmiChainId}`,
        isSupported: !!SUPPORTED_NETWORKS[wagmiChainId],
      }
    : null;

  const connect = async () => {
    try {
      setError(null);
      wagmiConnect({ connector: injected() });
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e.code === 4001) {
        setError("Connection rejected. Please approve in MetaMask.");
      } else {
        setError("Failed to connect wallet.");
      }
    }
  };

  const disconnect = () => {
    wagmiDisconnect();
    setError(null);
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return {
    address: address ?? null,
    shortAddress,
    isConnected,
    isMetaMaskInstalled,
    isConnecting: isPending,
    network,
    error,
    connect,
    disconnect,
  };
}