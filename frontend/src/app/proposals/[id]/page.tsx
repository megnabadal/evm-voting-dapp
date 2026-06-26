"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Loading from "../../../components/Loading";
import Toast from "../../../components/Toast";
import WalletGuard from "../../../components/WalletGuard";
import ScrollReveal from "../../../components/ScrollReveal";
import { getProposal, castVote } from "../../../services/blockchainService";
import { mapProposalForUI, formatVoteError } from "../../../utils/proposal";
import type { ProposalUI } from "../../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VoteTransaction {
  txHash: string;
  voter: string;
  blockNumber: number;
}

interface VoteData {
  proposalId: number;
  totals: { yes: number; no: number };
  yesVotes: VoteTransaction[];
  noVotes: VoteTransaction[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEPOLIA_TX_URL = "https://sepolia.etherscan.io/tx/";
const PAGE_SIZE = 10;

function truncate(hash: string, start = 10, end = 8): string {
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

// ─── Vote Transaction List ────────────────────────────────────────────────────

function VoteTransactionList({
  direction,
  votes,
  total,
}: {
  direction: "yes" | "no";
  votes: VoteTransaction[];
  total: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);

  const isYes = direction === "yes";
  const displayedVotes = expanded ? votes.slice(0, page * PAGE_SIZE) : [];
  const hasMore = page * PAGE_SIZE < votes.length;
  const label = isYes ? "FOR" : "AGAINST";

  return (
    <div
      className="relative overflow-hidden transition-all duration-300"
      style={{
        border: `1px solid ${isYes ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "color-mix(in srgb, var(--accent-secondary) 6%, transparent)"}`,
        background: "color-mix(in srgb, var(--bg-primary) 50%, transparent)",
      }}
    >
      {/* Blue top edge if yes */}
      {isYes && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 30%, transparent), transparent)" }}
        />
      )}
      <span
        className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l"
        style={{ borderColor: isYes ? "color-mix(in srgb, var(--accent) 22%, transparent)" : "color-mix(in srgb, var(--accent-secondary) 8%, transparent)" }}
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r"
        style={{ borderColor: isYes ? "color-mix(in srgb, var(--accent) 22%, transparent)" : "color-mix(in srgb, var(--accent-secondary) 8%, transparent)" }}
      />

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors"
        style={{ background: "transparent" }}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={
              isYes
                ? { background: "var(--accent)", boxShadow: "0 0 6px color-mix(in srgb, var(--accent) 70%, transparent)" }
                : { background: "color-mix(in srgb, var(--text-secondary) 40%, transparent)" }
            }
          />
          <span
            className="mono text-[10px] font-medium tracking-[0.28em] uppercase"
            style={{ color: isYes ? "var(--accent)" : "color-mix(in srgb, var(--text-secondary) 65%, transparent)" }}
          >
            {label} VOTES
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              color: isYes ? "var(--accent)" : "color-mix(in srgb, var(--text-secondary) 65%, transparent)",
            }}
          >
            {total.toLocaleString()}
          </span>
          <svg
            className="transition-transform duration-300"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              color: "color-mix(in srgb, var(--text-secondary) 30%, transparent)",
            }}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div
          className="border-t"
          style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
        >
          {votes.length === 0 ? (
            <p
              className="mono px-6 py-6 text-[11px] tracking-[0.15em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
            >
              No {label.toLowerCase()} votes on record.
            </p>
          ) : (
            <>
              <div
                className="mono grid px-6 py-2.5 text-[9px] font-medium tracking-[0.25em] uppercase"
                style={{
                  gridTemplateColumns: "1fr 1fr auto",
                  color: "color-mix(in srgb, var(--text-secondary) 22%, transparent)",
                }}
              >
                <span>TX Hash</span>
                <span>Address</span>
                <span>Block</span>
              </div>

              <div
                className="divide-y"
                style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 3.5%, transparent)" }}
              >
                {displayedVotes.map((vote) => (
                  <div
                    key={vote.txHash}
                    className="grid items-center px-6 py-3 transition-colors hover:bg-[rgba(74,158,255,0.018)]"
                    style={{ gridTemplateColumns: "1fr 1fr auto" }}
                  >
                    <a
                      href={`${SEPOLIA_TX_URL}${vote.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono group flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-75"
                      style={{ color: isYes ? "var(--accent)" : "color-mix(in srgb, var(--text-secondary) 65%, transparent)" }}
                      title={vote.txHash}
                    >
                      {truncate(vote.txHash)}
                      <svg
                        className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-50"
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M8 1h3m0 0v3m0-3L5 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                    <span
                      className="mono truncate pr-4 text-[12px]"
                      style={{ color: "color-mix(in srgb, var(--text-secondary) 38%, transparent)" }}
                      title={vote.voter}
                    >
                      {truncate(vote.voter, 6, 4)}
                    </span>
                    <span
                      className="mono text-[11px] tabular-nums"
                      style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
                    >
                      #{vote.blockNumber.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div
                  className="border-t px-6 py-3"
                  style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
                >
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="mono text-[10px] tracking-[0.18em] uppercase transition-colors hover:text-[#4A9EFF]/55"
                    style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
                  >
                    Load more ({votes.length - page * PAGE_SIZE} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Proposal Detail ──────────────────────────────────────────────────────────

function ProposalDetail({ id }: { id: number }) {
  const [proposal, setProposal] = useState<ProposalUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voting, setVoting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [voteData, setVoteData] = useState<VoteData | null>(null);
  const [voteLoading, setVoteLoading] = useState(true);
  const [voteError, setVoteError] = useState<string | null>(null);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      setError("");
      const raw = await getProposal(id);
      setProposal(mapProposalForUI(raw));
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to load proposal.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteTransactions = async () => {
    try {
      setVoteLoading(true);
      setVoteError(null);
      const res = await fetch(
        `${"https://evm-voting-dapp-production.up.railway.app"}/api/proposals/${id}/votes`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVoteData(data.data);
    } catch (err: unknown) {
      const e = err as Error;
      setVoteError(e.message || "Failed to load vote transactions.");
    } finally {
      setVoteLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
    fetchVoteTransactions();
  }, [id]);

  const handleVote = async (voteYes: boolean) => {
    setVoting(true);
    setToast(null);
    try {
      const receipt = await castVote(id, voteYes);

      await fetch(
        `${"https://evm-voting-dapp-production.up.railway.app"}/api/proposals/${id}/votes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash: receipt.hash,
            voterAddress: receipt.from,
            support: voteYes,
            blockNumber: receipt.blockNumber,
          }),
        }
      );

      setToast({ message: "Vote submitted!", type: "success" });
      await fetchProposal();
      await fetchVoteTransactions();
    } catch (err) {
      setToast({ message: formatVoteError(err), type: "error" });
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <Loading message="Loading proposal…" />;
  if (error)
    return (
      <div
        className="relative border p-5"
        style={{
          border: "1px solid color-mix(in srgb, var(--accent) 14%, transparent)",
          background: "color-mix(in srgb, var(--accent) 4%, transparent)",
        }}
      >
        <span
          className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
        />
        <span
          className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
        />
        <p
          className="mono text-sm"
          style={{ color: "color-mix(in srgb, var(--accent-secondary) 65%, transparent)" }}
        >
          {error}
        </p>
      </div>
    );
  if (!proposal) return null;

  const noPercent = 100 - proposal.yesPercent;
  const deadline = new Date(proposal.deadline * 1000);

  const statusCfg =
    proposal.status === "Active"
      ? {
          textStyle: { color: "rgb(52 211 153)" },
          dotClass: "bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]",
          borderStyle: { borderColor: "rgba(16,185,129,0.18)" },
          label: "ACTIVE",
          ping: true,
        }
      : proposal.status === "Pending"
      ? {
          textStyle: { color: "color-mix(in srgb, var(--accent-secondary) 70%, transparent)" },
          dotClass: "",
          borderStyle: { borderColor: "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" },
          label: "PENDING",
          ping: false,
        }
      : {
          textStyle: { color: "color-mix(in srgb, var(--text-secondary) 48%, transparent)" },
          dotClass: "",
          borderStyle: { borderColor: "color-mix(in srgb, var(--accent-secondary) 6%, transparent)" },
          label: "CLOSED",
          ping: false,
        };

  return (
    <div className="space-y-4 animate-fade-up">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Mission Brief card ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, color-mix(in srgb, var(--bg-secondary) 90%, transparent) 0%, color-mix(in srgb, var(--bg-dark) 95%, transparent) 100%)",
          border: "1px solid color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
        }}
      >
        {/* Blue top accent */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 45%, transparent), transparent)" }}
        />

        {/* Corner frames */}
        <span
          className="pointer-events-none absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 22%, transparent)" }}
        />
        <span
          className="pointer-events-none absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 22%, transparent)" }}
        />
        <span
          className="pointer-events-none absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 22%, transparent)" }}
        />
        <span
          className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 22%, transparent)" }}
        />

        {/* Atmospheric inner glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom right, color-mix(in srgb, var(--accent) 2%, transparent), transparent)" }}
        />

        <div className="relative p-8 sm:p-12">
          {/* Classification strip */}
          <div
            className="mb-8 flex items-center gap-3 border-b pb-5"
            style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
          >
            <span
              className="mono text-[9px] tracking-[0.42em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 38%, transparent)" }}
            >
              // Proposal
            </span>
            <span
              className="h-px flex-1"
              style={{ background: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
            />
            <span
              className="mono text-[9px] tracking-[0.28em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 22%, transparent)" }}
            >
              OP-{String(proposal.id).padStart(3, "0")}
            </span>
          </div>

          {/* Status + deadline */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <span
              className="mono inline-flex items-center gap-2.5 border px-3.5 py-1.5 text-[9px] font-medium tracking-[0.28em] uppercase"
              style={{ ...statusCfg.borderStyle, ...statusCfg.textStyle }}
            >
              <span className="relative flex h-1.5 w-1.5">
                {statusCfg.ping && (
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${statusCfg.dotClass}`} />
                )}
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusCfg.ping ? statusCfg.dotClass : ""}`}
                  style={!statusCfg.ping && proposal.status === "Closed"
                    ? { background: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }
                    : !statusCfg.ping && proposal.status === "Pending"
                    ? { background: "color-mix(in srgb, var(--accent-secondary) 55%, transparent)" }
                    : {}
                  }
                />
              </span>
              {statusCfg.label}
            </span>
            <span
              className="mono text-[9px] tracking-[0.2em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
            >
              Deadline:{" "}
              <span style={{ color: "color-mix(in srgb, var(--text-secondary) 48%, transparent)" }}>
                {deadline.toLocaleString()}
              </span>
            </span>
          </div>

          {/* Title */}
          <h1
            className="mb-6 font-bold leading-tight tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
              color: "color-mix(in srgb, var(--text-primary) 90%, transparent)",
            }}
          >
            {proposal.title}
          </h1>

          {/* Description */}
          <p
            className="mb-12 text-[14px] leading-[1.85]"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 60%, transparent)" }}
          >
            {proposal.description}
          </p>

          {/* Vote distribution panel */}
          <div
            className="relative p-7"
            style={{
              border: "1px solid color-mix(in srgb, var(--accent-secondary) 5%, transparent)",
              background: "color-mix(in srgb, var(--bg-dark) 55%, transparent)",
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
              className="mono mb-6 text-[9px] tracking-[0.38em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 32%, transparent)" }}
            >
              // Vote Distribution
            </p>

            {/* Labels */}
            <div className="mb-3 flex items-center justify-between">
              <span
                className="mono text-[13px] font-semibold tabular-nums tracking-[0.10em] uppercase"
                style={{ color: "color-mix(in srgb, var(--accent) 85%, transparent)" }}
              >
                {proposal.yesPercent}% For
              </span>
              <span
                className="mono text-[13px] font-semibold tabular-nums tracking-[0.10em] uppercase"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 52%, transparent)" }}
              >
                {noPercent}% Against
              </span>
            </div>

            {/* Vote bar */}
            <div
              className="mb-5 h-2 w-full overflow-hidden"
              style={{ background: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
            >
              <div className="flex h-full w-full">
                {proposal.yesPercent > 0 && (
                  <div
                    className="h-full animate-bar-slide"
                    style={{
                      width: `${proposal.yesPercent}%`,
                      background: "linear-gradient(90deg, color-mix(in srgb, var(--accent) 28%, transparent) 0%, color-mix(in srgb, var(--accent) 88%, transparent) 100%)",
                    }}
                  />
                )}
                {noPercent > 0 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${noPercent}%`,
                      background: "linear-gradient(90deg, color-mix(in srgb, var(--text-secondary) 10%, transparent) 0%, color-mix(in srgb, var(--text-secondary) 35%, transparent) 100%)",
                    }}
                  />
                )}
              </div>
            </div>

            <p
              className="mono text-[10px] tracking-[0.18em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
            >
              {proposal.totalVotes.toLocaleString()} total ·{" "}
              <span style={{ color: "color-mix(in srgb, var(--accent) 52%, transparent)" }}>{proposal.yesVotes} for</span> ·{" "}
              <span style={{ color: "color-mix(in srgb, var(--text-secondary) 38%, transparent)" }}>{proposal.noVotes} against</span>
            </p>
          </div>

          {/* Vote buttons */}
          {proposal.status === "Active" && (
            <div className="mt-8">
              <p
                className="mono mb-4 text-[9px] tracking-[0.38em] uppercase"
                style={{ color: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
              >
                // Cast Your Vote
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(true)}
                  disabled={voting}
                  className="group mono relative flex-1 border py-4 text-[11px] font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#4A9EFF]/[0.12] hover:border-[#4A9EFF]/42 hover:shadow-[0_0_40px_rgba(74,158,255,0.10)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-25"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                    background: "color-mix(in srgb, var(--accent) 6%, transparent)",
                    color: "color-mix(in srgb, var(--accent) 78%, transparent)",
                  }}
                >
                  <span
                    className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l transition-all duration-300 group-hover:h-3 group-hover:w-3"
                    style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
                  />
                  <span
                    className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r transition-all duration-300 group-hover:h-3 group-hover:w-3"
                    style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
                  />
                  {voting ? "Transmitting…" : "✓  Vote For"}
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={voting}
                  className="mono flex-1 border py-4 text-[11px] font-medium tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-25"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)",
                    background: "color-mix(in srgb, var(--bg-secondary) 42%, transparent)",
                    color: "color-mix(in srgb, var(--text-secondary) 52%, transparent)",
                  }}
                >
                  {voting ? "Transmitting…" : "✗  Vote Against"}
                </button>
              </div>
            </div>
          )}

          {proposal.status === "Closed" && (
            <div
              className="mt-8 py-5 text-center"
              style={{ border: "1px solid color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
            >
              <p
                className="mono text-[9px] tracking-[0.48em] uppercase"
                style={{ color: "color-mix(in srgb, var(--text-secondary) 22%, transparent)" }}
              >
                Voting Concluded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── On-Chain Audit Trail ── */}
      <ScrollReveal delay={100}>
        <div
          className="relative overflow-hidden p-7 sm:p-9"
          style={{
            background: "linear-gradient(160deg, color-mix(in srgb, var(--bg-secondary) 84%, transparent) 0%, color-mix(in srgb, var(--bg-dark) 90%, transparent) 100%)",
            border: "1px solid color-mix(in srgb, var(--accent-secondary) 6%, transparent)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-secondary) 5.5%, transparent), transparent)" }}
          />
          <span
            className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t border-l"
            style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)" }}
          />
          <span
            className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r"
            style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 7%, transparent)" }}
          />

          <div className="mb-7 flex items-center gap-3">
            <p
              className="mono text-[9px] font-medium tracking-[0.38em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
            >
              // On-Chain Audit Trail
            </p>
            <span
              className="h-px flex-1"
              style={{ background: "color-mix(in srgb, var(--accent-secondary) 4%, transparent)" }}
            />
            <span
              className="mono text-[9px] tracking-[0.22em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 16%, transparent)" }}
            >
              Immutable Records
            </span>
          </div>

          {voteLoading && (
            <p
              className="mono text-[11px] tracking-[0.18em] uppercase"
              style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
            >
              Retrieving records…
            </p>
          )}

          {voteError && !voteLoading && (
            <p
              className="mono text-[12px]"
              style={{ color: "color-mix(in srgb, var(--accent-secondary) 52%, transparent)" }}
            >
              {voteError}
            </p>
          )}

          {voteData && !voteLoading && (
            <div className="flex flex-col gap-2.5">
              <VoteTransactionList
                direction="yes"
                votes={voteData.yesVotes}
                total={voteData.totals.yes}
              />
              <VoteTransactionList
                direction="no"
                votes={voteData.noVotes}
                total={voteData.totals.no}
              />
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProposalDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Ambient atmospheric glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-atmospheric absolute -top-60 left-1/2 h-[600px] w-[700px] -translate-x-1/2 rounded-full blur-[180px]"
          style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}
        />
        <div
          className="animate-atmospheric-slow absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full blur-[150px]"
          style={{ background: "color-mix(in srgb, var(--accent) 2.8%, transparent)" }}
        />
      </div>

      <Navbar />

      {/* Cinematic page header */}
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in srgb, var(--accent-secondary) 5%, transparent)" }}
      >
        <div className="fine-grid pointer-events-none absolute inset-0 opacity-38" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 16%, transparent), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent, var(--bg-primary))" }}
        />
        {/* Atmospheric depth glow */}
        <div
          className="pointer-events-none absolute right-1/4 top-0 h-[180px] w-[300px] rounded-full blur-[80px]"
          style={{ background: "color-mix(in srgb, var(--accent) 4%, transparent)" }}
        />

        <div className="relative mx-auto max-w-3xl px-8 pb-10 pt-12">
          <Link
            href="/proposals"
            className="animate-fade-up mono mb-8 inline-flex items-center gap-2 text-[10px] tracking-[0.32em] uppercase transition-colors duration-300"
            style={{ color: "color-mix(in srgb, var(--text-secondary) 28%, transparent)" }}
          >
            ← All Proposals
          </Link>

          <div className="animate-cinema-1">
            <p
              className="mono text-[9px] tracking-[0.42em] uppercase"
              style={{ color: "color-mix(in srgb, var(--accent) 32%, transparent)" }}
            >
              // Proposal Detail
            </p>
          </div>
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-8 py-10">
        <WalletGuard message="Connect your wallet to view this proposal.">
          <ProposalDetail id={id} />
        </WalletGuard>
      </main>

      <Footer />
    </div>
  );
}
