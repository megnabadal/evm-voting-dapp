import { Pool } from "pg";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Keep connections alive and reconnect when needed
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Handle pool errors so the server doesn't crash on connection drops
pool.on("error", (err) => {
  console.error("⚠️ Unexpected pool error:", err.message);
});

export default pool;