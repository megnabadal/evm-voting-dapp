"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useUser } from "../context/UserContext";
import { registerUser } from "../lib/api";

export default function RegistrationGate() {
  const { address } = useAccount();
  const { needsRegistration, refreshUser } = useUser();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!needsRegistration || !address) return null;

  const handleSubmit = async () => {
    setError(null);

    if (!fullName.trim() || !username.trim() || !email.trim() || !dateOfBirth) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({
        walletAddress: address,
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        dateOfBirth,
      });
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4"
      style={{ background: "color-mix(in srgb, var(--bg-dark) 95%, transparent)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md p-8"
        style={{
          background: "color-mix(in srgb, var(--bg-secondary) 95%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
          boxShadow: "0 0 40px color-mix(in srgb, var(--accent) 8%, transparent)",
        }}
      >
        <div className="mb-6 text-center">
          <p
            className="mono mb-2 text-[9px] tracking-[0.35em] uppercase"
            style={{ color: "color-mix(in srgb, var(--accent) 50%, transparent)" }}
          >
            // New Wallet Detected
          </p>
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              color: "var(--text-primary)",
            }}
          >
            Welcome to VoteChain
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}
          >
            Complete your profile to start voting.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="mono mb-2 block text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border bg-transparent px-4 py-3 text-sm outline-none transition-colors"
              style={{
                borderColor: "color-mix(in srgb, var(--text-secondary) 20%, transparent)",
                color: "var(--text-primary)",
              }}
              placeholder="Your full name"
              maxLength={100}
            />
          </div>

          <div>
            <label
              className="mono mb-2 block text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border bg-transparent px-4 py-3 text-sm outline-none transition-colors"
              style={{
                borderColor: "color-mix(in srgb, var(--text-secondary) 20%, transparent)",
                color: "var(--text-primary)",
              }}
              placeholder="Unique username"
              maxLength={50}
            />
          </div>

          <div>
            <label
              className="mono mb-2 block text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border bg-transparent px-4 py-3 text-sm outline-none transition-colors"
              style={{
                borderColor: "color-mix(in srgb, var(--text-secondary) 20%, transparent)",
                color: "var(--text-primary)",
              }}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              className="mono mb-2 block text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 70%, transparent)" }}
            >
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={today}
              className="w-full border bg-transparent px-4 py-3 text-sm outline-none transition-colors"
              style={{
                borderColor: "color-mix(in srgb, var(--text-secondary) 20%, transparent)",
                color: "var(--text-primary)",
                colorScheme: "dark",
              }}
            />
            <p
              className="mono mt-1 text-[9px] tracking-[0.15em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 45%, transparent)" }}
            >
              You must be 18 or older
            </p>
          </div>

          {error && (
            <p
              className="mono text-xs"
              style={{ color: "rgb(248, 113, 113)" }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mono mt-2 w-full border px-6 py-3 text-sm font-medium tracking-[0.14em] uppercase transition-all duration-200 disabled:opacity-50"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent)",
            }}
          >
            {submitting ? "Registering..." : "Complete Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}