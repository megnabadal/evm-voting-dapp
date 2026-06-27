"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "../lib/wagmi";
import { useState } from "react";
import NetworkGuard from "./NetworkGuard";
import RegistrationGate from "./RegistrationGate";
import WelcomeBackToast from "./WelcomeBackToast";
import LowBalanceWarning from "./LowBalanceWarning";
import { WalletUIProvider } from "../context/WalletUIContext";
import { ThemeProvider } from "../context/ThemeContext";
import { UserProvider } from "../context/UserContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <WalletUIProvider>
            <UserProvider>
              <NetworkGuard />
              <RegistrationGate />
              <LowBalanceWarning />
              <WelcomeBackToast />
              {children}
            </UserProvider>
          </WalletUIProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}