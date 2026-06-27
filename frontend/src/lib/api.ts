const API_BASE = "https://evm-voting-dapp-production.up.railway.app/api";

export interface User {
  wallet_address: string;
  full_name: string;
  username: string;
  email: string;
  date_of_birth: string;
  created_at: string;
}

export async function getUser(walletAddress: string): Promise<User | null> {
  const res = await fetch(`${API_BASE}/users/${walletAddress}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function registerUser(data: {
  walletAddress: string;
  fullName: string;
  username: string;
  email: string;
  dateOfBirth: string;
}): Promise<User & { treasuryTx?: { txHash: string; amount: string } | null }> {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }
  return res.json();
}

export async function getBalance(walletAddress: string): Promise<string> {
  const res = await fetch(`${API_BASE}/users/${walletAddress}/balance`);
  if (!res.ok) throw new Error("Failed to fetch balance");
  const data = await res.json();
  return data.balance;
}