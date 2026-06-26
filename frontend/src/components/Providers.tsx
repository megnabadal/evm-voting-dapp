"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "../lib/wagmi";
import { useState } from "react";
import NetworkGuard from "./NetworkGuard";
import { WalletUIProvider } from "../context/WalletUIContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletUIProvider>
          <NetworkGuard />
          {children}
        </WalletUIProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}