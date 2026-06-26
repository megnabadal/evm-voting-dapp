"use client";

import { createContext, useContext, useState } from "react";

interface WalletUIContextType {
  showMetaMaskWarning: boolean;
  setShowMetaMaskWarning: (val: boolean) => void;
}

const WalletUIContext = createContext<WalletUIContextType>({
  showMetaMaskWarning: false,
  setShowMetaMaskWarning: () => {},
});

export function WalletUIProvider({ children }: { children: React.ReactNode }) {
  const [showMetaMaskWarning, setShowMetaMaskWarning] = useState(false);
  return (
    <WalletUIContext.Provider value={{ showMetaMaskWarning, setShowMetaMaskWarning }}>
      {children}
    </WalletUIContext.Provider>
  );
}

export function useWalletUI() {
  return useContext(WalletUIContext);
}