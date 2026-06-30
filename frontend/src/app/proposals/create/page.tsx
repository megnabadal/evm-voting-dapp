"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import WalletGuard from "../../../components/WalletGuard";
import Toast from "../../../components/Toast";
import { createProposal } from "../../../services/blockchainService";
import { saveProposalToDB } from "../../../services/apiService";
import { useWallet } from "../../../hooks/useWallet";
import type { ProposalCategory } from "../../../types";
import { PROPOSAL_CATEGORIES } from "../../../types";

function CreateForm() {
  const router = useRouter();
  const { address } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("1440");
  // UI-ONLY: category is held in local state but NOT sent to createProposal()
  // or saveProposalToDB(). It is not persisted anywhere.
  const [category, setCategory] = useState<ProposalCategory>("Governance");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "blockchain" | "saving" | "done">("idle");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    setToast(null);

    try {
      setStep("blockchain");
      setToast({ message: "Confirm the transaction in MetaMask…", type: "info" });

      await createProposal(title.trim(), description.trim(), Number(duration));

      setStep("saving");
      setToast({ message: "Transaction confirmed! Saving metadata…", type: "info" });

      try {
        console.log("🔵 Calling backend at:", process.env.NEXT_PUBLIC_API_URL);
        console.log("🔵 Payload:", {
          title: title.trim(),
          description: description.trim(),
          duration: Number(duration),
          creatorAddress: address,
        });

        const saved = await saveProposalToDB({
          title: title.trim(),
          description: description.trim(),
          duration: Number(duration),
          creatorAddress: address ?? undefined,
        });

        console.log("🟢 Backend save successful:", saved);
      } catch (dbErr) {
        console.error("🔴 Backend save FAILED:", dbErr);
      }

      setStep("done");
      setToast({ message: "Operation initiated successfully!", type: "success" });
      setTimeout(() => router.push("/proposals"), 1500);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "ACTION_REJECTED") {
        setToast({ message: "Transaction cancelled.", type: "error" });
      } else {
        setToast({
          message: e.message || "Failed to create proposal.",
          type: "error",
        });
      }
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const DURATION_OPTIONS = [
    { label: "1 Hour", value: "60" },
    { label: "6 Hours", value: "360" },
    { label: "24 Hours", value: "1440" },
    { label: "3 Days", value: "4320" },
    { label: "7 Days", value: "10080" },
  ];

  const stepLabel = {
    idle: "Submit Directive",
    blockchain: "Awaiting MetaMask…",
    saving: "Recording metadata…",
    done: "Operation Initiated",
  };

  const stepIndex = ["blockchain", "saving", "done"].indexOf(step);

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Title */}
      <div>
        <label
          className="mono mb-2 block text-[9px] tracking-[0.28em] uppercase"
          style={{ color: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
        >
          // Directive Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Fund community grants"
          maxLength={100}
          required
          className="mono w-full border px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:ring-1"
          style={{
            borderColor: "var(--border-subtle)",
            background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
            color: "color-mix(in srgb, var(--text-primary) 85%, transparent)",
          }}
        />
        <p
          className="mono mt-1.5 text-right text-[9px] tracking-[0.15em]"
          style={{ color: "color-mix(in srgb, var(--text-secondary) 25%, transparent)" }}
        >
          {title.length}/100
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          className="mono mb-2 block text-[9px] tracking-[0.28em] uppercase"
          style={{ color: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
        >
          // Mission Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the proposal clearly. What is being decided and why?"
          maxLength={500}
          rows={5}
          required
          className="mono w-full resize-none border px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:ring-1"
          style={{
            borderColor: "var(--border-subtle)",
            background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
            color: "color-mix(in srgb, var(--text-primary) 85%, transparent)",
          }}
        />
        <p
          className="mono mt-1.5 text-right text-[9px] tracking-[0.15em]"
          style={{ color: "color-mix(in srgb, var(--text-secondary) 25%, transparent)" }}
        >
          {description.length}/500
        </p>
      </div>

      {/* Duration */}
      <div>
        <label
          className="mono mb-3 block text-[9px] tracking-[0.28em] uppercase"
          style={{ color: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
        >
          // Operation Window
        </label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDuration(opt.value)}
              className="mono border px-4 py-2 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-200"
              style={
                duration === opt.value
                  ? {
                      borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
                      background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                      color: "var(--accent)",
                      boxShadow: "0 0 12px color-mix(in srgb, var(--accent) 12%, transparent)",
                    }
                  : {
                      borderColor: "var(--border-subtle)",
                      background: "color-mix(in srgb, var(--bg-secondary) 40%, transparent)",
                      color: "color-mix(in srgb, var(--text-secondary) 45%, transparent)",
                    }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category — UI ONLY, not yet persisted to backend or contract */}
      <div>
        <label
          className="mono mb-3 block text-[9px] tracking-[0.28em] uppercase"
          style={{ color: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
        >
          // Directive Category
        </label>
        <div className="flex flex-wrap gap-2">
          {PROPOSAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className="mono border px-4 py-2 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-200"
              style={
                category === cat
                  ? {
                      borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
                      background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                      color: "var(--accent)",
                      boxShadow: "0 0 12px color-mix(in srgb, var(--accent) 12%, transparent)",
                    }
                  : {
                      borderColor: "var(--border-subtle)",
                      background: "color-mix(in srgb, var(--bg-secondary) 40%, transparent)",
                      color: "color-mix(in srgb, var(--text-secondary) 45%, transparent)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      {loading && (
        <div
          className="relative border p-5"
          style={{
            borderColor: "var(--border-subtle)",
            background: "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
          }}
        >
          <span
            className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
          />
          <span
            className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
          />
          <div className="mb-4 flex items-center gap-3">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-t-[var(--accent)]"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)", borderTopColor: "var(--accent)" }}
            />
            <span
              className="mono text-[11px] tracking-[0.15em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent-secondary) 65%, transparent)" }}
            >
              {stepLabel[step]}
            </span>
          </div>
          <div className="flex gap-1.5">
            {["blockchain", "saving", "done"].map((s, i) => (
              <div
                key={s}
                className="h-0.5 flex-1 transition-all duration-500"
                style={
                  stepIndex >= i
                    ? {
                        background: "var(--accent)",
                        boxShadow: "0 0 6px color-mix(in srgb, var(--accent) 50%, transparent)",
                      }
                    : { background: "color-mix(in srgb, var(--accent-secondary) 6%, transparent)" }
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Pre-flight checklist */}
      {!loading && (
        <div
          className="relative border p-5"
          style={{
            borderColor: "color-mix(in srgb, var(--accent-secondary) 6%, transparent)",
            background: "color-mix(in srgb, var(--bg-primary) 40%, transparent)",
          }}
        >
          <span
            className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l"
            style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 8%, transparent)" }}
          />
          <span
            className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r"
            style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 8%, transparent)" }}
          />
          <p
            className="mono mb-3 text-[9px] font-medium tracking-[0.28em] uppercase"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 35%, transparent)" }}
          >
            // Pre-flight Checklist
          </p>
          <ul
            className="mono space-y-1.5 text-[11px] tracking-[0.08em]"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 40%, transparent)" }}
          >
            <li>
              <span style={{ color: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>›</span>{" "}
              Transaction requires Sepolia ETH for gas.
            </li>
            <li>
              <span style={{ color: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>›</span>{" "}
              Directives cannot be modified after submission.
            </li>
            <li>
              <span style={{ color: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>›</span>{" "}
              MetaMask confirmation required to proceed.
            </li>
          </ul>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !title.trim() || !description.trim()}
        className="blue-glow-btn mono w-full border py-4 text-sm font-medium tracking-[0.18em] uppercase transition-all duration-200 hover:bg-[#4A9EFF]/20 hover:border-[#4A9EFF]/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
          background: "color-mix(in srgb, var(--accent) 10%, transparent)",
          color: "var(--accent)",
        }}
      >
        {stepLabel[step]}
      </button>
    </form>
  );
}

export default function CreateProposalPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Ambient blue glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-float-slow absolute -top-48 right-1/4 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}
        />
      </div>

      <Navbar />

      <main className="relative mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <Link
            href="/proposals"
            className="mono mb-6 inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase transition-colors duration-200"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 35%, transparent)" }}
          >
            ← Back to Operations
          </Link>
          <p
            className="mono mb-2 text-[9px] tracking-[0.35em] uppercase"
            style={{ color: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
          >
            // Initiate Operation
          </p>
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              color: "color-mix(in srgb, var(--text-primary) 85%, transparent)",
            }}
          >
            New Directive
          </h1>
          <p
            className="mono mt-3 text-[11px] tracking-[0.15em] uppercase"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 40%, transparent)" }}
          >
            Submit an on-chain directive for operator consensus
          </p>
        </div>

        {/* Form card */}
        <div
          className="animate-fade-up-1 relative overflow-hidden p-7 sm:p-9"
          style={{
            background: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Blue corner brackets */}
          <span
            className="pointer-events-none absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
          />
          <span
            className="pointer-events-none absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
          />
          <span
            className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
          />
          <span
            className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
          />

          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 22%, transparent), transparent)" }}
          />

          <WalletGuard message="Connect your wallet to submit a directive.">
            <CreateForm />
          </WalletGuard>
        </div>
      </main>

      <Footer />
    </div>
  );
}