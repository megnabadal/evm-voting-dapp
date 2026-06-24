import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import proposalRoutes from "./routes/proposalRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
    ];
    const vercelPreview = /https:\/\/evm-voting-dapp-xaoc.*\.vercel\.app$/;

    if (!origin) return callback(null, true);
    if (allowed.includes(origin) || vercelPreview.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "EVM Voting API is running!" });
});

app.use("/api/proposals", proposalRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;