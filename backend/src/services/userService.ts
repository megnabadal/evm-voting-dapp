import pool from "../config/db";
export interface User {
  wallet_address: string;
  full_name: string;
  username: string;
  email: string;
  date_of_birth: string;
  created_at: string;
}

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const result = await pool.query(
    "SELECT * FROM users WHERE wallet_address = $1",
    [walletAddress.toLowerCase()]
  );
  return result.rows[0] || null;
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const result = await pool.query(
    "SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)",
    [username]
  );
  return result.rowCount! > 0;
}

export async function createUser(data: {
  walletAddress: string;
  fullName: string;
  username: string;
  email: string;
  dateOfBirth: string;
}): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (wallet_address, full_name, username, email, date_of_birth)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.walletAddress.toLowerCase(),
      data.fullName,
      data.username,
      data.email,
      data.dateOfBirth,
    ]
  );
  return result.rows[0];
}