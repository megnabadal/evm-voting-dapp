"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";
import { useState, useEffect } from "react";
import type { NetworkInfo } from "../types";
import { useWalletUI } from "../context/WalletUIContext";

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect: wagmiConnect, isPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);
  const { showMetaMaskWarning, setShowMetaMaskWarning } = useWalletUI();

  const isMetaMaskInstalled =
  typeof window !== "undefined" &&
  !!window.ethereum &&
  window.ethereum.isMetaMask === true &&
  !window.ethereum.isBraveWallet;

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handleChainChanged = () => setError(null);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const network: NetworkInfo | null = isConnected
    ? {
        chainId: chain?.id ?? 0,
        name: chain?.name ?? "Unknown Network",
        isSupported: chain?.id === sepolia.id,
      }
    : null;

  const connect = async () => {
    if (!isMetaMaskInstalled) {
      setShowMetaMaskWarning(true);
      return;
    }
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

  const switchToSepolia = () => {
    switchChain({ chainId: sepolia.id });
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
    switchToSepolia,
    showMetaMaskWarning,
    setShowMetaMaskWarning,
  };
}