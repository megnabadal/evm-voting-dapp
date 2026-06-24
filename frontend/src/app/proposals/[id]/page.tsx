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
  const accentText = isYes ? "text-[#4A9EFF]" : "text-[#A8A090]/65";
  const accentBorder = isYes
    ? "border-[rgba(74,158,255,0.12)]"
    : "border-[rgba(200,216,240,0.06)]";
  const accentDot = isYes
    ? "bg-[#4A9EFF] shadow-[0_0_6px_rgba(74,158,255,0.7)]"
    : "bg-[#A8A090]/40";
  const label = isYes ? "FOR" : "AGAINST";
  const displayedVotes = expanded ? votes.slice(0, page * PAGE_SIZE) : [];
  const hasMore = page * PAGE_SIZE < votes.length;

  return (
    <div
      className={`relative overflow-hidden border bg-[rgba(10,15,30,0.5)] transition-all duration-300 ${accentBorder} hover:bg-[rgba(15,22,40,0.65)]`}
    >
      {/* Blue top edge if yes */}
      {isYes && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/30 to-transparent" />
      )}
      <span
        className={`pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l ${
          isYes ? "border-[#4A9EFF]/22" : "border-[rgba(200,216,240,0.08)]"
        }`}
      />
      <span
        className={`pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r ${
          isYes ? "border-[#4A9EFF]/22" : "border-[rgba(200,216,240,0.08)]"
        }`}
      />

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[rgba(74,158,255,0.02)]"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className={`h-1.5 w-1.5 rounded-full ${accentDot}`} />
          <span className={`mono text-[10px] font-medium tracking-[0.28em] uppercase ${accentText}`}>
            {label} VOTES
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span
            className={`text-2xl font-bold tabular-nums ${accentText}`}
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
          >
            {total.toLocaleString()}
          </span>
          <svg
            className="text-[#A8A090]/30 transition-transform duration-300"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
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
        <div className="border-t border-[rgba(200,216,240,0.05)]">
          {votes.length === 0 ? (
            <p className="mono px-6 py-6 text-[11px] tracking-[0.15em] text-[#A8A090]/28 uppercase">
              No {label.toLowerCase()} votes on record.
            </p>
          ) : (
            <>
              <div
                className="mono grid px-6 py-2.5 text-[9px] font-medium tracking-[0.25em] text-[#A8A090]/22 uppercase"
                style={{ gridTemplateColumns: "1fr 1fr auto" }}
              >
                <span>TX Hash</span>
                <span>Address</span>
                <span>Block</span>
              </div>

              <div className="divide-y divide-[rgba(200,216,240,0.035)]">
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
                      className={`mono group flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-75 ${accentText}`}
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
                      className="mono truncate pr-4 text-[12px] text-[#A8A090]/38"
                      title={vote.voter}
                    >
                      {truncate(vote.voter, 6, 4)}
                    </span>
                    <span className="mono text-[11px] tabular-nums text-[#A8A090]/28">
                      #{vote.blockNumber.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="border-t border-[rgba(200,216,240,0.04)] px-6 py-3">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="mono text-[10px] tracking-[0.18em] text-[#A8A090]/28 uppercase transition-colors hover:text-[#4A9EFF]/55"
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${id}/votes`
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${id}/votes`,
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
      <div className="relative border border-[rgba(74,158,255,0.14)] bg-[rgba(74,158,255,0.04)] p-5">
        <span className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l border-[#4A9EFF]/30" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#4A9EFF]/30" />
        <p className="mono text-sm text-[#C8D8F0]/65">{error}</p>
      </div>
    );
  if (!proposal) return null;

  const noPercent = 100 - proposal.yesPercent;
  const deadline = new Date(proposal.deadline * 1000);

  const statusCfg =
    proposal.status === "Active"
      ? {
          text: "text-emerald-400",
          dot: "bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]",
          border: "border-emerald-500/18",
          label: "ACTIVE",
        }
      : proposal.status === "Pending"
      ? {
          text: "text-[#C8D8F0]/70",
          dot: "bg-[#C8D8F0]/55",
          border: "border-[rgba(200,216,240,0.10)]",
          label: "PENDING",
        }
      : {
          text: "text-[#A8A090]/48",
          dot: "bg-[#A8A090]/28",
          border: "border-[rgba(200,216,240,0.06)]",
          label: "CLOSED",
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
          background: "linear-gradient(160deg, rgba(15, 22, 40, 0.90) 0%, rgba(6, 13, 26, 0.95) 100%)",
          border: "1px solid rgba(200, 216, 240, 0.07)",
        }}
      >
        {/* Blue top accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/45 to-transparent" />

        {/* Corner frames */}
        <span className="pointer-events-none absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-[#4A9EFF]/22" />
        <span className="pointer-events-none absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-[#4A9EFF]/22" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-[#4A9EFF]/22" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-[#4A9EFF]/22" />

        {/* Atmospheric inner glow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4A9EFF]/[0.02] to-transparent" />

        <div className="relative p-8 sm:p-12">
          {/* Classification strip */}
          <div className="mb-8 flex items-center gap-3 border-b border-[rgba(200,216,240,0.05)] pb-5">
            <span className="mono text-[9px] tracking-[0.42em] text-[#4A9EFF]/38 uppercase">
              // Proposal
            </span>
            <span className="h-px flex-1 bg-[rgba(200,216,240,0.04)]" />
            <span className="mono text-[9px] tracking-[0.28em] text-[#A8A090]/22 uppercase">
              OP-{String(proposal.id).padStart(3, "0")}
            </span>
          </div>

          {/* Status + deadline */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <span
              className={`mono inline-flex items-center gap-2.5 border px-3.5 py-1.5 text-[9px] font-medium tracking-[0.28em] uppercase ${statusCfg.border} ${statusCfg.text}`}
            >
              <span className={`relative flex h-1.5 w-1.5`}>
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${proposal.status === "Active" ? "animate-ping bg-emerald-400" : ""}`} />
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
              </span>
              {statusCfg.label}
            </span>
            <span className="mono text-[9px] tracking-[0.2em] text-[#A8A090]/28 uppercase">
              Deadline:{" "}
              <span className="text-[#A8A090]/48">{deadline.toLocaleString()}</span>
            </span>
          </div>

          {/* Title */}
          <h1
            className="mb-6 font-bold leading-tight tracking-[-0.02em] text-[#F5F0E8]/90"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
            }}
          >
            {proposal.title}
          </h1>

          {/* Description */}
          <p className="mb-12 text-[14px] leading-[1.85] text-[#A8A090]/60">
            {proposal.description}
          </p>

          {/* Vote distribution panel */}
          <div
            className="relative p-7"
            style={{
              border: "1px solid rgba(200, 216, 240, 0.05)",
              background: "rgba(6, 13, 26, 0.55)",
            }}
          >
            <span className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l border-[rgba(200,216,240,0.08)]" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[rgba(200,216,240,0.08)]" />

            <p className="mono mb-6 text-[9px] tracking-[0.38em] text-[#4A9EFF]/32 uppercase">
              // Vote Distribution
            </p>

            {/* Labels */}
            <div className="mb-3 flex items-center justify-between">
              <span className="mono text-[13px] font-semibold tabular-nums tracking-[0.10em] text-[#4A9EFF]/85 uppercase">
                {proposal.yesPercent}% For
              </span>
              <span className="mono text-[13px] font-semibold tabular-nums tracking-[0.10em] text-[#A8A090]/52 uppercase">
                {noPercent}% Against
              </span>
            </div>

            {/* Vote bar — thick and dramatic */}
            <div className="mb-5 h-2 w-full overflow-hidden bg-[rgba(200,216,240,0.04)]">
              <div className="flex h-full w-full">
                {proposal.yesPercent > 0 && (
                  <div
                    className="h-full animate-bar-slide"
                    style={{
                      width: `${proposal.yesPercent}%`,
                      background: "linear-gradient(90deg, rgba(74,158,255,0.28) 0%, rgba(74,158,255,0.88) 100%)",
                    }}
                  />
                )}
                {noPercent > 0 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${noPercent}%`,
                      background: "linear-gradient(90deg, rgba(168,160,144,0.10) 0%, rgba(168,160,144,0.35) 100%)",
                    }}
                  />
                )}
              </div>
            </div>

            <p className="mono text-[10px] tracking-[0.18em] text-[#A8A090]/28 uppercase">
              {proposal.totalVotes.toLocaleString()} total ·{" "}
              <span className="text-[#4A9EFF]/52">{proposal.yesVotes} for</span> ·{" "}
              <span className="text-[#A8A090]/38">{proposal.noVotes} against</span>
            </p>
          </div>

          {/* Vote buttons */}
          {proposal.status === "Active" && (
            <div className="mt-8">
              <p className="mono mb-4 text-[9px] tracking-[0.38em] text-[#4A9EFF]/28 uppercase">
                // Cast Your Vote
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(true)}
                  disabled={voting}
                  className="group mono relative flex-1 border border-[#4A9EFF]/18 bg-[#4A9EFF]/[0.06] py-4 text-[11px] font-medium tracking-[0.2em] text-[#4A9EFF]/78 uppercase transition-all duration-300 hover:border-[#4A9EFF]/42 hover:bg-[#4A9EFF]/[0.12] hover:text-[#4A9EFF] hover:shadow-[0_0_40px_rgba(74,158,255,0.10)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <span className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l border-[#4A9EFF]/25 transition-all duration-300 group-hover:h-3 group-hover:w-3" />
                  <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#4A9EFF]/25 transition-all duration-300 group-hover:h-3 group-hover:w-3" />
                  {voting ? "Transmitting…" : "✓  Vote For"}
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={voting}
                  className="mono flex-1 border border-[rgba(200,216,240,0.07)] bg-[rgba(15,22,40,0.42)] py-4 text-[11px] font-medium tracking-[0.2em] text-[#A8A090]/52 uppercase transition-all duration-300 hover:border-[rgba(200,216,240,0.14)] hover:bg-[rgba(15,22,40,0.62)] hover:text-[#A8A090]/78 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-25"
                >
                  {voting ? "Transmitting…" : "✗  Vote Against"}
                </button>
              </div>
            </div>
          )}

          {proposal.status === "Closed" && (
            <div
              className="mt-8 py-5 text-center"
              style={{ border: "1px solid rgba(200, 216, 240, 0.05)" }}
            >
              <span className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l border-[rgba(200,216,240,0.06)]" />
              <p className="mono text-[9px] tracking-[0.48em] text-[#A8A090]/22 uppercase">
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
            background: "linear-gradient(160deg, rgba(15, 22, 40, 0.84) 0%, rgba(6, 13, 26, 0.90) 100%)",
            border: "1px solid rgba(200, 216, 240, 0.06)",
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,216,240,0.055)] to-transparent" />
          <span className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t border-l border-[rgba(200,216,240,0.07)]" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-[rgba(200,216,240,0.07)]" />

          <div className="mb-7 flex items-center gap-3">
            <p className="mono text-[9px] font-medium tracking-[0.38em] text-[#A8A090]/28 uppercase">
              // On-Chain Audit Trail
            </p>
            <span className="h-px flex-1 bg-[rgba(200,216,240,0.04)]" />
            <span className="mono text-[9px] tracking-[0.22em] text-[#A8A090]/16 uppercase">
              Immutable Records
            </span>
          </div>

          {voteLoading && (
            <p className="mono text-[11px] tracking-[0.18em] text-[#A8A090]/28 uppercase">
              Retrieving records…
            </p>
          )}

          {voteError && !voteLoading && (
            <p className="mono text-[12px] text-[#C8D8F0]/52">{voteError}</p>
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
    <div className="flex min-h-screen flex-col bg-[#0A0F1E] text-[#F5F0E8]">
      {/* Ambient atmospheric glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-atmospheric absolute -top-60 left-1/2 h-[600px] w-[700px] -translate-x-1/2 rounded-full bg-[#4A9EFF]/[0.05] blur-[180px]" />
        <div className="animate-atmospheric-slow absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-[#4A9EFF]/[0.028] blur-[150px]" />
      </div>

      <Navbar />

      {/* Cinematic page header */}
      <div className="relative overflow-hidden border-b border-[rgba(200,216,240,0.05)]">
        <div className="fine-grid pointer-events-none absolute inset-0 opacity-38" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/16 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0F1E]" />
        {/* Atmospheric depth glow */}
        <div className="pointer-events-none absolute right-1/4 top-0 h-[180px] w-[300px] rounded-full bg-[#4A9EFF]/[0.04] blur-[80px]" />

        <div className="relative mx-auto max-w-3xl px-8 pb-10 pt-12">
          <Link
            href="/proposals"
            className="animate-fade-up mono mb-8 inline-flex items-center gap-2 text-[10px] tracking-[0.32em] text-[#A8A090]/28 uppercase transition-colors duration-300 hover:text-[#C8D8F0]/55"
          >
            ← All Proposals
          </Link>

          <div className="animate-cinema-1">
            <p className="mono text-[9px] tracking-[0.42em] text-[#4A9EFF]/32 uppercase">
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
