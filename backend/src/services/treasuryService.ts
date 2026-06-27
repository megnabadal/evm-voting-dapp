import { ethers } from "ethers";

const ALCHEMY_URL = process.env.ALCHEMY_URL;
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
const TREASURY_SEND_AMOUNT = process.env.TREASURY_SEND_AMOUNT || "0.001";

if (!ALCHEMY_URL) {
  console.error("⚠️ ALCHEMY_URL not set in environment");
}
if (!TREASURY_PRIVATE_KEY) {
  console.error("⚠️ TREASURY_PRIVATE_KEY not set in environment");
}

export interface TreasuryResult {
  txHash: string;
  amount: string;
}

export async function sendInitialFunds(recipientAddress: string): Promise<TreasuryResult> {
  if (!ALCHEMY_URL || !TREASURY_PRIVATE_KEY) {
    throw new Error("Treasury not configured");
  }

  const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
  const wallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

  const amountWei = ethers.parseEther(TREASURY_SEND_AMOUNT);

  // Check treasury has enough balance
  const balance = await provider.getBalance(wallet.address);
  if (balance < amountWei) {
    throw new Error("Treasury wallet has insufficient funds");
  }

  const tx = await wallet.sendTransaction({
    to: recipientAddress,
    value: amountWei,
  });

  console.log(`Treasury sent ${TREASURY_SEND_AMOUNT} ETH to ${recipientAddress}, tx: ${tx.hash}`);

  // Wait for confirmation (don't block forever)
  await tx.wait(1);

  return {
    txHash: tx.hash,
    amount: TREASURY_SEND_AMOUNT,
  };
}

export async function getWalletBalance(walletAddress: string): Promise<string> {
  if (!ALCHEMY_URL) {
    throw new Error("Alchemy URL not configured");
  }
  const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
  const balance = await provider.getBalance(walletAddress);
  return ethers.formatEther(balance);
}