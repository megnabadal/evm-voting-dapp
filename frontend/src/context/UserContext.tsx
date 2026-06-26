"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { getUser, type User } from "../lib/api";

interface UserContextType {
  user: User | null;
  loading: boolean;
  needsRegistration: boolean;
  showWelcomeBack: boolean;
  refreshUser: () => Promise<void>;
  dismissWelcome: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  needsRegistration: false,
  showWelcomeBack: false,
  refreshUser: async () => {},
  dismissWelcome: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [lastCheckedAddress, setLastCheckedAddress] = useState<string | null>(null);

  const checkUser = useCallback(async (walletAddress: string) => {
    setLoading(true);
    try {
      const fetched = await getUser(walletAddress);
      if (fetched) {
        setUser(fetched);
        setNeedsRegistration(false);
        if (lastCheckedAddress !== walletAddress) {
          setShowWelcomeBack(true);
          setTimeout(() => setShowWelcomeBack(false), 3000);
        }
      } else {
        setUser(null);
        setNeedsRegistration(true);
      }
      setLastCheckedAddress(walletAddress);
    } catch (err) {
      console.error("Failed to check user:", err);
    } finally {
      setLoading(false);
    }
  }, [lastCheckedAddress]);

  useEffect(() => {
    if (isConnected && address) {
      checkUser(address);
    } else {
      setUser(null);
      setNeedsRegistration(false);
      setShowWelcomeBack(false);
      setLastCheckedAddress(null);
    }
  }, [isConnected, address, checkUser]);

  const refreshUser = useCallback(async () => {
    if (address) await checkUser(address);
  }, [address, checkUser]);

  const dismissWelcome = () => setShowWelcomeBack(false);

  return (
    <UserContext.Provider
      value={{ user, loading, needsRegistration, showWelcomeBack, refreshUser, dismissWelcome }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}