import { Request, Response, NextFunction } from "express";
import { getUserByWallet, createUser, isUsernameTaken } from "../services/userService";

function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const walletAddress = req.params.walletAddress as string;
    if (!isValidEthAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }
    const user = await getUserByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { walletAddress, fullName, username, email, dateOfBirth } = req.body;

    if (!walletAddress || !fullName || !username || !email || !dateOfBirth) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!isValidEthAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (fullName.trim().length < 2 || fullName.length > 100) {
      return res.status(400).json({ error: "Full name must be 2-100 characters" });
    }
    if (username.trim().length < 3 || username.length > 50) {
      return res.status(400).json({ error: "Username must be 3-50 characters" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
    }
    if (calculateAge(dateOfBirth) < 18) {
      return res.status(400).json({ error: "You must be 18 or older to register" });
    }

    const existing = await getUserByWallet(walletAddress);
    if (existing) {
      return res.status(409).json({ error: "Wallet address already registered" });
    }
    if (await isUsernameTaken(username)) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const user = await createUser({ walletAddress, fullName, username, email, dateOfBirth });
    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}