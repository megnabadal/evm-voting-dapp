import pool from "./db";

const createSchema = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        creator_address VARCHAR(42),
        created_at TIMESTAMP DEFAULT NOW(),
        deadline TIMESTAMP,
        yes_votes INTEGER DEFAULT 0,
        no_votes INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      );
    `);
    console.log("Schema created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Schema creation failed:", err);
    process.exit(1);
  }
};

createSchema();
